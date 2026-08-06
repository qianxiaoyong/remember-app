# 构建可离线安装的 Android debug APK（内嵌 JS bundle）
# 用途：真机联调，不依赖 Metro。每次必须 prebuild --clean，避免复用过期 android/ 目录。
param(
  [string]$SourceRoot = 'D:\AIcoder\remember-app',
  [string]$BuildRoot = 'D:\r\b',
  [string]$OutputApk = 'dist\remember-standalone-debug.apk',
  [switch]$SkipApiHealthCheck
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
  Write-Host "==> $Message" -ForegroundColor Cyan
}

Write-Step "Mirror source -> $BuildRoot (exclude node_modules, android, .expo)"
New-Item -ItemType Directory -Force -Path $BuildRoot | Out-Null
robocopy $SourceRoot $BuildRoot /MIR /XD node_modules 'apps\mobile\android' 'apps\mobile\.expo' '.gradle' /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) {
  throw "robocopy failed with exit code $LASTEXITCODE"
}

$envFile = Join-Path $SourceRoot 'apps\mobile\.env'
if (Test-Path $envFile) {
  Copy-Item $envFile (Join-Path $BuildRoot 'apps\mobile\.env') -Force
  Write-Step "Copied apps/mobile/.env"
  $envText = Get-Content $envFile -Raw
  if ($envText -match 'EXPO_PUBLIC_API_BASE_URL=(.+)' ) {
    $apiUrl = $Matches[1].Trim()
    Write-Host "API base URL in .env: $apiUrl"
    $lanIp = (Get-NetIPAddress -AddressFamily IPv4 |
      Where-Object { $_.IPAddress -like '192.168.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
      Select-Object -First 1 -ExpandProperty IPAddress)
    if ($lanIp -and $apiUrl -notmatch [regex]::Escape($lanIp)) {
      Write-Warning "apps/mobile/.env API URL may not match current LAN IP ($lanIp). Update .env and rebuild APK."
    }
    $healthUrl = "$($apiUrl.TrimEnd('/'))/api/v1/health"
    if ($SkipApiHealthCheck) {
      Write-Warning "Skipping API health check (-SkipApiHealthCheck). APK will still embed EXPO_PUBLIC_API_BASE_URL=$apiUrl"
    } else {
      Write-Step "Verify API connectivity -> $healthUrl"
      try {
        $healthResponse = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 8 -UseBasicParsing
        if ($healthResponse.StatusCode -ne 200) {
          throw "HTTP $($healthResponse.StatusCode)"
        }
        Write-Host "API connectivity OK: $($healthResponse.Content)" -ForegroundColor Green
      } catch {
        throw "Cannot reach API at $apiUrl before building APK. Start the API server, fix apps/mobile/.env, or pass -SkipApiHealthCheck. $($_.Exception.Message)"
      }
    }
  }
} else {
  Write-Warning "apps/mobile/.env not found; set EXPO_PUBLIC_* before prebuild"
}

Push-Location $BuildRoot
try {
  Write-Step 'pnpm install'
  pnpm install | Out-Null

  Write-Step 'pnpm build:packages'
  pnpm build:packages

  $mobileDir = Join-Path $BuildRoot 'apps\mobile'
  $androidDir = Join-Path $mobileDir 'android'

  if (Test-Path $androidDir) {
    Write-Step 'Remove stale android/ (robocopy 不会覆盖，必须删)'
    Remove-Item -Recurse -Force $androidDir
  }

  Push-Location $mobileDir
  try {
    Write-Step 'expo prebuild --platform android --clean'
    pnpm exec expo prebuild --platform android --clean

    Write-Step 'Ensure native splash is color-only (logo only in JS overlay)'
    node (Join-Path $BuildRoot 'tools\mobile\patch-android-native-splash.cjs') $androidDir
    if ($LASTEXITCODE -ne 0) {
      throw "patch-android-native-splash.cjs failed with exit code $LASTEXITCODE"
    }

    $colorsFile = Join-Path $androidDir 'app\src\main\res\values\colors.xml'
    if (Test-Path $colorsFile) {
      $colorsContent = Get-Content $colorsFile -Raw -Encoding UTF8
      if ($colorsContent -match '<root>') {
        Write-Step 'Fix invalid colors.xml (<root> wrapper from expo prebuild)'
        $resourcesMatch = [regex]::Match($colorsContent, '<resources>[\s\S]*?</resources>')
        if (-not $resourcesMatch.Success) {
          throw 'colors.xml: could not extract <resources> block'
        }
        [System.IO.File]::WriteAllText(
          $colorsFile,
          ($resourcesMatch.Value + "`n"),
          [System.Text.UTF8Encoding]::new($false)
        )
      }
    }

    $gradlePropsFile = Join-Path $androidDir 'gradle.properties'
    if (Test-Path $gradlePropsFile) {
      $gradleProps = Get-Content $gradlePropsFile -Raw
      $gradleProps = $gradleProps -replace 'reactNativeArchitectures=.*', 'reactNativeArchitectures=arm64-v8a'
      Set-Content -Path $gradlePropsFile -Value $gradleProps -NoNewline
      Write-Step 'Limited APK to arm64-v8a for faster cold start on device'
    }

    $gradleFile = Join-Path $androidDir 'app\build.gradle'
    $gradle = Get-Content $gradleFile -Raw
    if ($gradle -notmatch 'bundleJsInDebugForStandaloneApk' -or $gradle -notmatch 'debuggableVariants = \[\]') {
      throw "build.gradle missing debug bundle config; check plugins/with-android-bundle-in-debug.js"
    }
    Write-Step 'Verified debuggableVariants = [] in build.gradle'

    $mainAppFile = Join-Path $androidDir 'app\src\main\java\com\remember\app\MainApplication.kt'
    if (-not (Test-Path $mainAppFile)) {
      throw "MainApplication.kt not found: $mainAppFile"
    }
    $mainAppContent = Get-Content $mainAppFile -Raw -Encoding UTF8
    if ($mainAppContent -notmatch 'useDevSupport\s*=\s*false' -or $mainAppContent -notmatch 'standaloneDebugNoMetro') {
      Write-Step 'Patch MainApplication: disable Metro/DevSupport for standalone debug'
      $mainAppContent = $mainAppContent -replace '(ExpoReactHostFactory\.getDefaultReactHost\(\s*\r?\n\s*context = applicationContext,)', @'
ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      useDevSupport = false, // standaloneDebugNoMetro,
'@
      [System.IO.File]::WriteAllText($mainAppFile, $mainAppContent, [System.Text.UTF8Encoding]::new($false))
    }
    Write-Step 'Verified useDevSupport = false in MainApplication.kt'

    if (-not (Select-String -Path (Join-Path $androidDir 'app\src\main\AndroidManifest.xml') -Pattern 'usesCleartextTraffic' -Quiet)) {
      throw 'AndroidManifest missing usesCleartextTraffic'
    }

    Push-Location $androidDir
    try {
      Write-Step 'gradlew assembleDebug'
      .\gradlew.bat --stop | Out-Null
      Start-Sleep -Seconds 2
      .\gradlew.bat assembleDebug
    } finally {
      Pop-Location
    }
  } finally {
    Pop-Location
  }

  $builtApk = Join-Path $androidDir 'app\build\outputs\apk\debug\app-debug.apk'
  if (-not (Test-Path $builtApk)) {
    throw "APK not found: $builtApk"
  }

  Write-Step 'Verify JS bundle inside APK'
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::OpenRead($builtApk)
  try {
    $bundleEntries = $zip.Entries | Where-Object {
      $_.FullName -match 'assets/.*\.(bundle|hbc)$' -or $_.FullName -match 'index\.android\.bundle'
    }
    if (-not $bundleEntries) {
      throw 'APK has no embedded JS bundle; would show Unable to load script on device'
    }
    Write-Host "Bundle entries: $($bundleEntries.FullName -join ', ')"
  } finally {
    $zip.Dispose()
  }

  $dest = Join-Path $SourceRoot $OutputApk
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Copy-Item $builtApk $dest -Force
  $apkSizeMb = [math]::Round((Get-Item $dest).Length / 1MB, 1)
  Write-Step "APK -> $dest ($apkSizeMb MB)"
} finally {
  Pop-Location
}

Write-Host 'BUILD OK' -ForegroundColor Green
