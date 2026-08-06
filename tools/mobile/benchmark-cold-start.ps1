param(
  [Parameter(Mandatory = $true)]
  [string[]]$ApkPaths,
  [int]$Runs = 3,
  [string]$PackageName = "com.remember.app"
)

$ErrorActionPreference = "Stop"

function Measure-ColdStartMs {
  param([string]$ApkPath)
  if (-not (Test-Path $ApkPath)) {
    throw "APK not found: $ApkPath"
  }

  Write-Host "`n==> Install $ApkPath" -ForegroundColor Cyan
  adb uninstall $PackageName 2>$null | Out-Null
  adb install $ApkPath | Out-Null

  $samples = @()
  for ($i = 1; $i -le $Runs; $i++) {
    adb shell am force-stop $PackageName | Out-Null
    Start-Sleep -Seconds 2
    $output = adb shell am start -W -n "$PackageName/.MainActivity" 2>&1 | Out-String
    if ($output -match "TotalTime:\s+(\d+)") {
      $ms = [int]$Matches[1]
      $samples += $ms
      Write-Host "  run $i : ${ms}ms"
    } else {
      throw "Could not parse TotalTime from adb output:`n$output"
    }
    Start-Sleep -Seconds 3
  }

  $avg = [math]::Round(($samples | Measure-Object -Average).Average)
  $min = ($samples | Measure-Object -Minimum).Minimum
  $max = ($samples | Measure-Object -Maximum).Maximum
  return [pscustomobject]@{
    Apk = $ApkPath
    Runs = $Runs
    SamplesMs = $samples
    AvgMs = $avg
    MinMs = $min
    MaxMs = $max
  }
}

$results = @()
foreach ($apk in $ApkPaths) {
  $results += Measure-ColdStartMs -ApkPath $apk
}

Write-Host "`n=== Cold start summary ===" -ForegroundColor Green
$results | Format-Table Apk, AvgMs, MinMs, MaxMs, Runs -AutoSize

if ($results.Count -eq 2) {
  $delta = $results[1].AvgMs - $results[0].AvgMs
  $pct = if ($results[0].AvgMs -gt 0) { [math]::Round(100 * $delta / $results[0].AvgMs, 1) } else { 0 }
  Write-Host ("Delta (2nd vs 1st avg): {0}ms ({1}%)" -f $delta, $pct)
}
