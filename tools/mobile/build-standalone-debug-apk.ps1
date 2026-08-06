# 构建可离线安装的 Android debug APK（内嵌 JS bundle）
# 用途：真机联调，不依赖 Metro。每次必须 prebuild --clean，避免复用过期 android/ 目录。
param(
  [string]$SourceRoot = 'D:\AIcoder\remember-app',
  [string]$BuildRoot = 'D:\r\b',
  [string]$OutputApk = 'dist\remember-standalone-debug.apk'
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

    Write-Step 'Patch splash styles (full-bleed background, no centered icon)'
    $stylesFile = Join-Path $androidDir 'app\src\main\res\values\styles.xml'
    if (Test-Path $stylesFile) {
      $stylesContent = Get-Content $stylesFile -Raw
      $stylesContent = $stylesContent -replace '<item name="windowSplashScreenBackground">@color/splashscreen_background</item>', '<item name="windowSplashScreenBackground">@drawable/splashscreen</item>'
      $stylesContent = $stylesContent -replace '(?s)\s*<item name="windowSplashScreenAnimatedIcon">@drawable/splashscreen_logo</item>\s*', "`n"
      $stylesContent = $stylesContent.Replace(
        'android:windowSplashScreenBehavior">icon_preferred',
        'android:windowSplashScreenBehavior">default'
      )
      Set-Content -Path $stylesFile -Value $stylesContent -NoNewline
    }

    $gradleFile = Join-Path $androidDir 'app\build.gradle'
    $gradle = Get-Content $gradleFile -Raw
    if ($gradle -notmatch 'bundleJsInDebugForStandaloneApk' -or $gradle -notmatch 'debuggableVariants = \[\]') {
      throw "build.gradle missing debug bundle config; check plugins/with-android-bundle-in-debug.js"
    }
    Write-Step 'Verified debuggableVariants = [] in build.gradle'

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
