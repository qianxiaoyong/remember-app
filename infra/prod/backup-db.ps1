[CmdletBinding()]
param(
  [string]$EnvFile,
  [string]$ComposeFile,
  [string]$ProjectName,
  [switch]$UploadToCos
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ScriptRoot = $PSScriptRoot
. (Join-Path $ScriptRoot 'compose-env.ps1')

$Context = Get-ComposeContext -ScriptRoot $ScriptRoot -EnvFile $EnvFile -ComposeFile $ComposeFile -ProjectName $ProjectName
$null = Get-PostgresServiceName -Context $Context

$ArtifactsRoot = Join-Path $ScriptRoot 'artifacts'
New-Item -ItemType Directory -Force -Path $ArtifactsRoot | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$DumpPath = Join-Path $ArtifactsRoot "remember-$timestamp.dump"

Write-Host "Backing up $($Context.PostgresDb) (project=$($Context.ProjectName)) -> $DumpPath"

$containerDumpPath = "/tmp/remember-$timestamp.dump"
Invoke-Compose -Context $Context -Arguments @(
  'exec', '-T', 'postgres',
  'pg_dump', '-Fc', '-U', $Context.PostgresUser, '-f', $containerDumpPath, $Context.PostgresDb
) | Out-Null

Invoke-Compose -Context $Context -Arguments @(
  'cp', "postgres:$containerDumpPath", $DumpPath
) | Out-Null

Invoke-Compose -Context $Context -Arguments @(
  'exec', '-T', 'postgres', 'rm', '-f', $containerDumpPath
) | Out-Null
$hash = (Get-FileHash -LiteralPath $DumpPath -Algorithm SHA256).Hash
$sizeBytes = (Get-Item -LiteralPath $DumpPath).Length

Write-Host "OK: backup written"
Write-Host "  path: $DumpPath"
Write-Host "  sizeBytes: $sizeBytes"
Write-Host "  sha256: $hash"

Write-CommerceCounts -Context $Context -Label 'source counts'

if ($UploadToCos) {
  Write-Host ''
  Write-Host 'COS upload is manual in MVP. Upload this file to bucket prefix backups/postgres/{date}/remember.dump'
  Write-Host 'See docs/runbooks/postgres-backup-restore.md'
}
