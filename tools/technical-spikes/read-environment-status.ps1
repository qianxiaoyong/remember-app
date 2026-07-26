[CmdletBinding()]
param(
  [string]$ProjectRoot,
  [switch]$SelfTest
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-JsonFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    return $null
  }

  try {
    return Get-Content -Raw -Encoding UTF8 -LiteralPath $Path | ConvertFrom-Json
  }
  catch {
    return $null
  }
}

function Get-ObjectProperty($Object, [string]$Name) {
  if ($null -eq $Object) {
    return $null
  }

  $property = $Object.PSObject.Properties[$Name]
  if ($null -eq $property) {
    return $null
  }

  return $property.Value
}

function Get-ApplicationIdStatus([string]$Root) {
  $config = Get-JsonFile (Join-Path $Root 'apps/mobile/app.json')
  $expo = Get-ObjectProperty $config 'expo'
  $android = Get-ObjectProperty $expo 'android'
  $packageName = Get-ObjectProperty $android 'package'
  if (-not [string]::IsNullOrWhiteSpace([string]$packageName)) {
    return 'CONFIGURED'
  }

  return 'MISSING'
}

function Get-ReleaseBuildProfileStatus([string]$Root) {
  $config = Get-JsonFile (Join-Path $Root 'eas.json')
  $build = Get-ObjectProperty $config 'build'
  $release = Get-ObjectProperty $build 'release'
  if ($null -ne $release) {
    return 'CONFIGURED'
  }

  return 'MISSING'
}

function Get-ReleaseSigningStatus([string]$Root) {
  $appDirectory = Join-Path $Root 'apps/mobile/android/app'
  $gradlePath = @(
    (Join-Path $appDirectory 'build.gradle'),
    (Join-Path $appDirectory 'build.gradle.kts')
  ) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1

  if ($null -eq $gradlePath) {
    return 'MANUAL_CHECK_REQUIRED'
  }

  $gradle = Get-Content -Raw -Encoding UTF8 -LiteralPath $gradlePath
  $hasReleaseBinding = $gradle -match '(?s)release\s*\{.*?signingConfig(?:\s*=)?\s*signingConfigs[.\[]release'
  if (-not $hasReleaseBinding) {
    return 'MISSING'
  }

  $storeMatch = [regex]::Match($gradle, 'storeFile\s*(?:=\s*)?file\(["'']([^"'']+)["'']\)')
  if (-not $storeMatch.Success) {
    return 'MANUAL_CHECK_REQUIRED'
  }

  $storePath = Join-Path $appDirectory $storeMatch.Groups[1].Value
  if (Test-Path -LiteralPath $storePath -PathType Leaf) {
    return 'CONFIGURED'
  }

  return 'MISSING'
}

function Get-ConfiguredStatus([string]$Value) {
  if ([string]::IsNullOrWhiteSpace($Value)) {
    return 'MISSING'
  }

  return 'CONFIGURED'
}

function Invoke-VersionCommand([string]$Name, [string[]]$Arguments) {
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -eq $command) {
    return @{ IsAvailable = $false; Output = '' }
  }

  $output = & $command.Source @Arguments 2>&1 | Out-String
  return @{ IsAvailable = ($LASTEXITCODE -eq 0); Output = $output.Trim() }
}

function Get-MatchedVersion([hashtable]$Result, [string]$Pattern) {
  if (-not $Result.IsAvailable) {
    return 'MISSING'
  }

  $match = [regex]::Match([string]$Result.Output, $Pattern)
  if ($match.Success) {
    return $match.Groups[1].Value
  }

  return 'CONFIGURED'
}

function Get-AndroidDeviceStatus([hashtable]$AdbResult) {
  if (-not $AdbResult.IsAvailable) {
    return @{ Count = 'NOT_APPLICABLE'; ApiLevels = 'NOT_APPLICABLE' }
  }

  $deviceOutput = & adb devices 2>&1
  if ($LASTEXITCODE -ne 0) {
    return @{ Count = 'NOT_APPLICABLE'; ApiLevels = 'NOT_APPLICABLE' }
  }

  $devices = @($deviceOutput | Where-Object { $_ -match '^([^\s]+)\s+device$' } | ForEach-Object {
      [regex]::Match([string]$_, '^([^\s]+)\s+device$').Groups[1].Value
    })
  $apiLevels = @()
  foreach ($device in $devices) {
    $apiLevel = (& adb -s $device shell getprop ro.build.version.sdk 2>$null | Out-String).Trim()
    if ($LASTEXITCODE -eq 0 -and $apiLevel -match '^\d+$') {
      $apiLevels += $apiLevel
    }
  }

  return @{
    Count = [string]$devices.Count
    ApiLevels = if ($apiLevels.Count -eq 0) { 'NOT_APPLICABLE' } else { $apiLevels -join ',' }
  }
}

function Assert-Equal([string]$Name, [string]$Expected, [string]$Actual) {
  if ($Expected -ne $Actual) {
    throw "SELF_TEST_FAILED:$Name expected=$Expected actual=$Actual"
  }
}

function Invoke-SelfTest {
  $testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("remember-environment-status-{0}" -f [guid]::NewGuid())
  try {
    New-Item -ItemType Directory -Path (Join-Path $testRoot 'apps/mobile') -Force | Out-Null
    Set-Content -Encoding UTF8 -LiteralPath (Join-Path $testRoot 'apps/mobile/app.json') -Value '{"expo":{"android":{}}}'
    Assert-Equal 'application-id-missing' 'MISSING' (Get-ApplicationIdStatus $testRoot)
    Set-Content -Encoding UTF8 -LiteralPath (Join-Path $testRoot 'apps/mobile/app.json') -Value '{"expo":{"android":{"package":"example.test"}}}'
    Assert-Equal 'application-id-configured' 'CONFIGURED' (Get-ApplicationIdStatus $testRoot)

    Assert-Equal 'release-profile-missing' 'MISSING' (Get-ReleaseBuildProfileStatus $testRoot)
    Set-Content -Encoding UTF8 -LiteralPath (Join-Path $testRoot 'eas.json') -Value '{"build":{"release":{"distribution":"internal"}}}'
    Assert-Equal 'release-profile-configured' 'CONFIGURED' (Get-ReleaseBuildProfileStatus $testRoot)
    Assert-Equal 'signing-manual' 'MANUAL_CHECK_REQUIRED' (Get-ReleaseSigningStatus $testRoot)

    $androidApp = Join-Path $testRoot 'apps/mobile/android/app'
    New-Item -ItemType Directory -Path $androidApp -Force | Out-Null
    $gradle = "signingConfigs { release { storeFile file('release.keystore') } }`nbuildTypes { release { signingConfig signingConfigs.release } }"
    Set-Content -Encoding UTF8 -LiteralPath (Join-Path $androidApp 'build.gradle') -Value $gradle
    Assert-Equal 'signing-file-missing' 'MISSING' (Get-ReleaseSigningStatus $testRoot)
    Set-Content -Encoding UTF8 -LiteralPath (Join-Path $androidApp 'release.keystore') -Value 'self-test-only'
    Assert-Equal 'signing-configured' 'CONFIGURED' (Get-ReleaseSigningStatus $testRoot)
    Assert-Equal 'secret-missing' 'MISSING' (Get-ConfiguredStatus '')
    Assert-Equal 'secret-configured' 'CONFIGURED' (Get-ConfiguredStatus 'present')
    Write-Output 'SELF_TEST_OK'
  }
  finally {
    if (Test-Path -LiteralPath $testRoot) {
      Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
  }
}

if ($SelfTest) {
  Invoke-SelfTest
  exit 0
}

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
  $ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
}
$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)

$node = Invoke-VersionCommand 'node' @('--version')
$pnpm = Invoke-VersionCommand 'pnpm' @('--version')
$java = Invoke-VersionCommand 'java' @('-version')
$adb = Invoke-VersionCommand 'adb' @('version')
$docker = Invoke-VersionCommand 'docker' @('version', '--format', '{{.Server.Version}}')
$compose = Invoke-VersionCommand 'docker' @('compose', 'version', '--short')
$devices = Get-AndroidDeviceStatus $adb
$javaVersion = Get-MatchedVersion $java 'version[ ="]+([0-9]+(?:\.[0-9._]+)?)'
if ($javaVersion -ne 'MISSING' -and $javaVersion -ne 'CONFIGURED' -and -not $javaVersion.StartsWith('17.')) {
  $javaVersion = 'MISSING'
}

$report = [ordered]@{
  NODE = Get-MatchedVersion $node 'v?([0-9]+(?:\.[0-9]+){2})'
  PNPM = Get-MatchedVersion $pnpm '([0-9]+(?:\.[0-9]+){2})'
  JDK_17 = $javaVersion
  JAVA_HOME = Get-ConfiguredStatus ([Environment]::GetEnvironmentVariable('JAVA_HOME', 'Process'))
  ANDROID_SDK = Get-ConfiguredStatus ([Environment]::GetEnvironmentVariable('ANDROID_HOME', 'Process'))
  ADB = Get-MatchedVersion $adb 'Android Debug Bridge version ([0-9]+(?:\.[0-9]+){2})'
  ANDROID_DEVICE_COUNT = $devices.Count
  ANDROID_DEVICE_API_LEVELS = $devices.ApiLevels
  DOCKER_ENGINE = Get-MatchedVersion $docker '([0-9]+(?:\.[0-9]+){2})'
  DOCKER_COMPOSE = Get-MatchedVersion $compose 'v?([0-9]+(?:\.[0-9]+){2})'
  ANDROID_APPLICATION_ID = Get-ApplicationIdStatus $ProjectRoot
  RELEASE_BUILD_PROFILE = Get-ReleaseBuildProfileStatus $ProjectRoot
  RELEASE_SIGNING_STATUS = Get-ReleaseSigningStatus $ProjectRoot
  WECHAT_APP_ID = Get-ConfiguredStatus ([Environment]::GetEnvironmentVariable('EXPO_PUBLIC_WECHAT_APP_ID', 'Process'))
  WECHAT_MERCHANT_ID = Get-ConfiguredStatus ([Environment]::GetEnvironmentVariable('WECHAT_PAY_MCH_ID', 'Process'))
}

foreach ($entry in $report.GetEnumerator()) {
  Write-Output ("{0}={1}" -f $entry.Key, $entry.Value)
}
