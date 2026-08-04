# Pack Editor 一键启动（Windows）
# 双击 start.bat，或在仓库根目录：powershell -File tools/pack-editor/start.ps1

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $RepoRoot

Write-Host ''
Write-Host '  记得 · Pack Editor（本地学习包内容编辑）' -ForegroundColor White
Write-Host '  http://127.0.0.1:5174' -ForegroundColor DarkGray
Write-Host ''

Write-Host '==> 加载中心词库鉴权（apps/api/.env）...' -ForegroundColor Cyan
$ApiEnvPath = Join-Path $RepoRoot 'apps\api\.env'
if (Test-Path $ApiEnvPath) {
  Get-Content $ApiEnvPath | ForEach-Object {
    if ($_ -match '^\s*ADMIN_BOOTSTRAP_PASSWORD=(.+)$' -and -not $env:LEXICON_ADMIN_PASSWORD) {
      $env:LEXICON_ADMIN_PASSWORD = $Matches[1].Trim()
    }
    if ($_ -match '^\s*ADMIN_BOOTSTRAP_LOGIN_NAME=(.+)$' -and -not $env:LEXICON_ADMIN_LOGIN) {
      $env:LEXICON_ADMIN_LOGIN = $Matches[1].Trim()
    }
  }
}
$PackEditorEnvPath = Join-Path $PSScriptRoot '.env'
if (Test-Path $PackEditorEnvPath) {
  Get-Content $PackEditorEnvPath | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '^\s*([A-Z0-9_]+)=(.*)$') { return }
    $name = $Matches[1]
    $value = $Matches[2].Trim()
    if (-not (Get-Item "Env:$name" -ErrorAction SilentlyContinue)) {
      Set-Item -Path "Env:$name" -Value $value
    }
  }
}
if (-not $env:LEXICON_API_BASE_URL) {
  $env:LEXICON_API_BASE_URL = 'http://127.0.0.1:3000'
}

Write-Host '==> 编译 pack-builder（打包 CLI 依赖）...' -ForegroundColor Cyan
pnpm --filter @remember/pack-builder build
if ($LASTEXITCODE -ne 0) {
  throw 'pack-builder 编译失败'
}

Write-Host '==> 启动开发服务器（Ctrl+C 退出）...' -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList '/c', 'timeout /t 2 /nobreak >nul && start http://127.0.0.1:5174' -WindowStyle Hidden | Out-Null

pnpm dev:pack-editor
if ($LASTEXITCODE -ne 0) {
  throw 'Pack Editor 启动失败'
}
