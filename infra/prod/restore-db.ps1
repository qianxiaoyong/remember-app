[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $true)][string]$DumpPath,
  [string]$EnvFile,
  [string]$ComposeFile,
  [string]$ProjectName,
  [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not $Force -and -not $PSCmdlet.ShouldProcess($DumpPath, 'Restore PostgreSQL from custom-format dump')) {
  return
}

if (-not (Test-Path -LiteralPath $DumpPath -PathType Leaf)) {
  throw "DUMP_NOT_FOUND: $DumpPath"
}

$ScriptRoot = $PSScriptRoot
. (Join-Path $ScriptRoot 'compose-env.ps1')

$Context = Get-ComposeContext -ScriptRoot $ScriptRoot -EnvFile $EnvFile -ComposeFile $ComposeFile -ProjectName $ProjectName
$null = Get-PostgresServiceName -Context $Context

Write-Host "Stopping api before restore (project=$($Context.ProjectName))..."
Invoke-Compose -Context $Context -Arguments @('stop', 'api') | Out-Null

$containerDumpPath = '/tmp/remember-restore.dump'
Write-Host "Copying dump into postgres container..."
Invoke-Compose -Context $Context -Arguments @(
  'cp', $DumpPath, "postgres:$containerDumpPath"
) | Out-Null

Write-Host "Running pg_restore --clean --exit-on-error ..."
Invoke-Compose -Context $Context -Arguments @(
  'exec', '-T', 'postgres',
  'pg_restore', '--clean', '--if-exists', '--exit-on-error',
  '-U', $Context.PostgresUser,
  '-d', $Context.PostgresDb,
  $containerDumpPath
) | ForEach-Object { Write-Host $_ }

Invoke-Compose -Context $Context -Arguments @(
  'exec', '-T', 'postgres', 'rm', '-f', $containerDumpPath
) | Out-Null

Write-CommerceCounts -Context $Context -Label 'restored counts'

Write-Host 'Starting api...'
Invoke-Compose -Context $Context -Arguments @('start', 'api') | Out-Null
Write-Host 'OK: restore completed'
