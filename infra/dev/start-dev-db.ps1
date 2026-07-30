# 一键启动本地开发 PostgreSQL（Compose 项目名：remember-dev）
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$composeFile = Join-Path $repoRoot 'infra/dev/compose.yaml'
$envFile = Join-Path $repoRoot 'infra/dev/.env'

if (-not (Test-Path $envFile)) {
  Write-Error "缺少 infra/dev/.env。请复制 infra/dev/.env.example 并设置 POSTGRES_PASSWORD。"
}

Push-Location $repoRoot
try {
  docker compose --project-name remember-dev --env-file $envFile --file $composeFile up -d
  docker compose --project-name remember-dev --env-file $envFile --file $composeFile ps
  Write-Host ''
  Write-Host 'PostgreSQL 就绪。请在 apps/api/.env 配置 DATABASE_URL（用户 remember，库 remember_dev，端口 5432）。'
} finally {
  Pop-Location
}
