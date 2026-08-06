param(
  [string]$SourceRoot = "D:\AIcoder\remember-app",
  [string]$BuildRoot = "D:\r\b",
  [string]$OutputApk = "dist\remember-standalone-release.apk",
  [string]$SigningProperties = ""
)

# Build offline Android release APK (no Metro / DevSupport, __DEV__=false).

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host "==> $Message" -ForegroundColor Cyan
}

if (-not $SigningProperties) {
  $SigningProperties = $env:REMEMBER_ANDROID_SIGNING_PROPERTIES
}
if (-not $SigningProperties) {
  $SigningProperties = "D:\AIcoder\remember-secrets\signing.properties"
}
if (-not (Test-Path $SigningProperties)) {
  throw "Signing properties not found: $SigningProperties. Set REMEMBER_ANDROID_SIGNING_PROPERTIES."
}
$env:REMEMBER_ANDROID_SIGNING_PROPERTIES = $SigningProperties

Write-Step "Mirror source -> $BuildRoot (exclude node_modules, android, .expo)"
New-Item -ItemType Directory -Force -Path $BuildRoot | Out-Null
robocopy $SourceRoot $BuildRoot /MIR /XD node_modules "apps\mobile\android" "apps\mobile\.expo" ".gradle" /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) {
  throw "robocopy failed with exit code $LASTEXITCODE"
}

$envFile = Join-Path $SourceRoot "apps\mobile\.env"
if (Test-Path $envFile) {
  Copy-Item $envFile (Join-Path $BuildRoot "apps\mobile\.env") -Force
  Write-Step "Copied apps/mobile/.env"
}

Push-Location $BuildRoot
try {
  Write-Step "pnpm install"
  pnpm install | Out-Null

  Write-Step "pnpm build:packages"
  pnpm build:packages

  $mobileDir = Join-Path $BuildRoot "apps\mobile"
  $androidDir = Join-Path $mobileDir "android"

  if (Test-Path $androidDir) {
    Write-Step "Remove stale android/"
    Remove-Item -Recurse -Force $androidDir
  }

  Push-Location $mobileDir
  try {
    Write-Step "expo prebuild --platform android --clean"
    pnpm exec expo prebuild --platform android --clean

    Write-Step "Ensure native splash is color-only (logo only in JS overlay)"
    $stylesFile = Join-Path $androidDir "app\src\main\res\values\styles.xml"
    if (Test-Path $stylesFile) {
      $stylesContent = Get-Content $stylesFile -Raw -Encoding UTF8
      $stylesContent = [regex]::Replace(
        $stylesContent,
        '\s*<item name="windowSplashScreenAnimatedIcon">[^<]+</item>\s*',
        "`n"
      )
      $stylesContent = $stylesContent.Replace(
        "<item name=`"windowSplashScreenBackground`">@drawable/splashscreen</item>",
        "<item name=`"windowSplashScreenBackground`">@color/splashscreen_background</item>"
      )
      $stylesContent = $stylesContent.Replace(
        "android:windowSplashScreenBehavior`">icon_preferred",
        "android:windowSplashScreenBehavior`">default"
      )
      [System.IO.File]::WriteAllText($stylesFile, $stylesContent, [System.Text.UTF8Encoding]::new($false))
    }

    $colorsFile = Join-Path $androidDir "app\src\main\res\values\colors.xml"
    if (Test-Path $colorsFile) {
      $colorsContent = Get-Content $colorsFile -Raw -Encoding UTF8
      if ($colorsContent -match "<root>") {
        Write-Step "Fix invalid colors.xml (<root> wrapper from expo prebuild)"
        $resourcesMatch = [regex]::Match($colorsContent, "<resources>[\s\S]*?</resources>")
        if (-not $resourcesMatch.Success) {
          throw "colors.xml: could not extract <resources> block"
        }
        [System.IO.File]::WriteAllText(
          $colorsFile,
          ($resourcesMatch.Value + "`n"),
          [System.Text.UTF8Encoding]::new($false)
        )
      }
    }

    $gradlePropsFile = Join-Path $androidDir "gradle.properties"
    if (Test-Path $gradlePropsFile) {
      $gradleProps = Get-Content $gradlePropsFile -Raw
      $gradleProps = $gradleProps -replace "reactNativeArchitectures=.*", "reactNativeArchitectures=arm64-v8a"
      Set-Content -Path $gradlePropsFile -Value $gradleProps -NoNewline
      Write-Step "Limited APK to arm64-v8a"
    }

    $gradleFile = Join-Path $androidDir "app\build.gradle"
    $gradle = Get-Content $gradleFile -Raw
    if ($gradle -notmatch "rememberReleaseSigningFromProperties") {
      throw "build.gradle missing release signing config; set REMEMBER_ANDROID_SIGNING_PROPERTIES"
    }

    if (-not (Select-String -Path (Join-Path $androidDir "app\src\main\AndroidManifest.xml") -Pattern "usesCleartextTraffic" -Quiet)) {
      throw "AndroidManifest missing usesCleartextTraffic"
    }

    Push-Location $androidDir
    try {
      Write-Step "gradlew assembleRelease"
      .\gradlew.bat --stop | Out-Null
      Start-Sleep -Seconds 2
      .\gradlew.bat assembleRelease
    } finally {
      Pop-Location
    }
  } finally {
    Pop-Location
  }

  $builtApk = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
  if (-not (Test-Path $builtApk)) {
    throw "APK not found: $builtApk"
  }

  $dest = Join-Path $SourceRoot $OutputApk
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Copy-Item $builtApk $dest -Force
  $apkSizeMb = [math]::Round((Get-Item $dest).Length / 1MB, 1)
  Write-Step "APK -> $dest ($apkSizeMb MB)"
} finally {
  Pop-Location
}

Write-Host "BUILD OK" -ForegroundColor Green
