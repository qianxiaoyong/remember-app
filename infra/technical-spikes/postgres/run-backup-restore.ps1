[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ProjectName = 'remember-technical-spikes-postgres'
$ScriptRoot = $PSScriptRoot
$ComposeFile = Join-Path $ScriptRoot 'compose.yaml'
$SqlRoot = Join-Path $ScriptRoot 'sql'
$ArtifactsRoot = Join-Path $ScriptRoot 'artifacts'
$DumpPath = Join-Path $ArtifactsRoot 'spike.dump'

function Get-DockerExecutable {
  $command = Get-Command docker -ErrorAction SilentlyContinue
  if ($null -ne $command) {
    return $command.Source
  }

  $registryPaths = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Docker Desktop',
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Docker Desktop'
  )
  foreach ($registryPath in $registryPaths) {
    $installation = Get-ItemProperty -LiteralPath $registryPath -ErrorAction SilentlyContinue
    if ($null -eq $installation -or [string]::IsNullOrWhiteSpace([string]$installation.InstallLocation)) {
      continue
    }

    $candidate = Join-Path $installation.InstallLocation 'resources\bin\docker.exe'
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      return $candidate
    }
  }

  throw 'DOCKER_CLI_NOT_FOUND'
}

$Docker = Get-DockerExecutable
$DockerBin = Split-Path -Parent $Docker
$env:PATH = $DockerBin + [IO.Path]::PathSeparator + $env:PATH

$hasProcessPassword = -not [string]::IsNullOrWhiteSpace(
  [Environment]::GetEnvironmentVariable('POSTGRES_PASSWORD', 'Process')
)
$hasIgnoredEnvFile = Test-Path -LiteralPath (Join-Path $ScriptRoot '.env') -PathType Leaf
if (-not $hasProcessPassword -and -not $hasIgnoredEnvFile) {
  throw 'POSTGRES_PASSWORD_MISSING: use process scope or an ignored .env file; the value will not be printed'
}

$ComposeArgs = @(
  'compose',
  '--project-name', $ProjectName,
  '--file', $ComposeFile
)

function Invoke-Docker([string[]]$Arguments) {
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $output = & $Docker @Arguments 2>&1
    $exitCode = $LASTEXITCODE
  }
  finally {
    $ErrorActionPreference = $previousPreference
  }
  if ($exitCode -ne 0) {
    throw "DOCKER_COMMAND_FAILED: exit=$exitCode`n$($output -join [Environment]::NewLine)"
  }
  return @($output)
}

function Get-ProjectResources {
  $label = "com.docker.compose.project=$ProjectName"
  $expectedContainerNames = @(
    "$ProjectName-source-db-1",
    "$ProjectName-restore-db-1"
  )
  $expectedVolumeNames = @(
    "$($ProjectName)_source-data",
    "$($ProjectName)_restore-data"
  )
  $expectedNetworkNames = @("$($ProjectName)_default")

  $labeledContainerIds = @(
    (Invoke-Docker @('ps', '-a', '--filter', "label=$label", '--format', '{{.ID}}')) |
      Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
  )
  $namedContainerIds = @(
    (Invoke-Docker @('ps', '-a', '--format', '{{.ID}}|{{.Names}}')) |
      ForEach-Object {
        $parts = ([string]$_).Split('|', 2)
        if ($parts.Count -eq 2 -and $expectedContainerNames -contains $parts[1]) { $parts[0] }
      }
  )
  $containerIds = @(($labeledContainerIds + $namedContainerIds) | Select-Object -Unique)

  $labeledVolumeNames = @(
    (Invoke-Docker @('volume', 'ls', '--filter', "label=$label", '--quiet')) |
      Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
  )
  $namedVolumeNames = @(
    (Invoke-Docker @('volume', 'ls', '--quiet')) |
      Where-Object { $expectedVolumeNames -contains [string]$_ }
  )
  $volumeNames = @(($labeledVolumeNames + $namedVolumeNames) | Select-Object -Unique)

  $labeledNetworkIds = @(
    (Invoke-Docker @('network', 'ls', '--filter', "label=$label", '--quiet')) |
      Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
  )
  $namedNetworkIds = @(
    (Invoke-Docker @('network', 'ls', '--format', '{{.ID}}|{{.Name}}')) |
      ForEach-Object {
        $parts = ([string]$_).Split('|', 2)
        if ($parts.Count -eq 2 -and $expectedNetworkNames -contains $parts[1]) { $parts[0] }
      }
  )
  $networkIds = @(($labeledNetworkIds + $namedNetworkIds) | Select-Object -Unique)

  foreach ($containerId in $containerIds) {
    $labelsJson = (Invoke-Docker @('inspect', '--format={{json .Config.Labels}}', [string]$containerId) | Out-String).Trim()
    $labels = $labelsJson | ConvertFrom-Json
    $actual = $labels.'com.docker.compose.project'
    if ($actual -ne $ProjectName) {
      throw "RESOURCE_SCOPE_MISMATCH: container=$containerId"
    }
  }

  foreach ($volumeName in $volumeNames) {
    $labelsJson = (Invoke-Docker @('volume', 'inspect', '--format={{json .Labels}}', [string]$volumeName) | Out-String).Trim()
    $labels = $labelsJson | ConvertFrom-Json
    $actual = $labels.'com.docker.compose.project'
    if ($actual -ne $ProjectName) {
      throw "RESOURCE_SCOPE_MISMATCH: volume=$volumeName"
    }
  }

  foreach ($networkId in $networkIds) {
    $labelsJson = (Invoke-Docker @('network', 'inspect', '--format={{json .Labels}}', [string]$networkId) | Out-String).Trim()
    $labels = $labelsJson | ConvertFrom-Json
    $actual = $labels.'com.docker.compose.project'
    if ($actual -ne $ProjectName) {
      throw "RESOURCE_SCOPE_MISMATCH: network=$networkId"
    }
  }

  return @{
    Containers = $containerIds.Count
    Volumes = $volumeNames.Count
    Networks = $networkIds.Count
  }
}

function Invoke-Compose([string[]]$Arguments) {
  return Invoke-Docker ($ComposeArgs + $Arguments)
}

function Invoke-Sql(
  [string]$Service,
  [string]$Database,
  [string]$FileName,
  [hashtable]$Variables = @{},
  [string]$ExpectedOutputPattern = '',
  [switch]$ExpectConflict
) {
  $sqlPath = Join-Path $SqlRoot $FileName
  if (-not (Test-Path -LiteralPath $sqlPath -PathType Leaf)) {
    throw "SQL_FILE_NOT_FOUND:$FileName"
  }

  $psqlArgs = @('exec', '-T', $Service, 'psql', '-U', 'postgres', '-d', $Database, '-v', 'ON_ERROR_STOP=1')
  foreach ($name in ($Variables.Keys | Sort-Object)) {
    $psqlArgs += @('-v', "${name}=$($Variables[$name])")
  }

  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $output = Get-Content -Raw -Encoding UTF8 -LiteralPath $sqlPath |
      & $Docker @($ComposeArgs + $psqlArgs) 2>&1
    $exitCode = $LASTEXITCODE
  }
  finally {
    $ErrorActionPreference = $previousPreference
  }
  $text = ($output | Out-String).Trim()

  if ($ExpectConflict) {
    if ($exitCode -eq 0 -or $text -notmatch 'PAYMENT_NOTIFICATION_CONFLICT') {
      throw "EXPECTED_PAYMENT_NOTIFICATION_CONFLICT: exit=$exitCode output=$text"
    }
    return $exitCode
  }

  if ($exitCode -ne 0) {
    throw "SQL_COMMAND_FAILED:$FileName exit=$exitCode`n$text"
  }
  if (-not [string]::IsNullOrWhiteSpace($ExpectedOutputPattern) -and $text -notmatch $ExpectedOutputPattern) {
    throw "SQL_OUTPUT_MISMATCH:$FileName pattern=$ExpectedOutputPattern output=$text"
  }
  return $exitCode
}

function Invoke-ScalarSql([string]$Service, [string]$Database, [string]$Sql) {
  $output = Invoke-Compose @('exec', '-T', $Service, 'psql', '-U', 'postgres', '-d', $Database, '-Atqc', $Sql)
  return ($output | Out-String).Trim()
}

function Get-BusinessSnapshot([string]$Service, [string]$Database) {
  $sql = @"
SELECT md5(concat(
  (SELECT coalesce(jsonb_agg(to_jsonb(o) ORDER BY id)::text, '[]') FROM orders o),
  (SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY id)::text, '[]') FROM payment_events e),
  (SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY id)::text, '[]') FROM pack_access a)
));
"@
  return Invoke-ScalarSql $Service $Database $sql
}

function Invoke-NormalReplaySuite(
  [string]$Service,
  [string]$Database,
  [ValidateSet('true', 'false')]
  [string]$ExpectedFirstResult = 'true'
) {
  $variables = @{
    notification_id = 'notification-001'
    transaction_id = 'transaction-001'
    order_id = 'order-001'
    processed_at = '2026-07-26 08:00:00+00'
  }
  $beforeFirst = Get-BusinessSnapshot $Service $Database
  $firstExit = Invoke-Sql $Service $Database '003-process-payment-notification.sql' $variables "SPIKE_PROCESSED=$ExpectedFirstResult"
  $afterFirst = Get-BusinessSnapshot $Service $Database
  if ($ExpectedFirstResult -eq 'false' -and $beforeFirst -ne $afterFirst) {
    throw "REPLAY_CHANGED_BUSINESS_SNAPSHOT: before=$beforeFirst after=$afterFirst"
  }
  $secondExit = Invoke-Sql $Service $Database '003-process-payment-notification.sql' $variables 'SPIKE_PROCESSED=false'
  $afterReplay = Get-BusinessSnapshot $Service $Database
  if ($afterFirst -ne $afterReplay) {
    throw "REPLAY_CHANGED_BUSINESS_SNAPSHOT: before=$afterFirst after=$afterReplay"
  }
  Invoke-Sql $Service $Database '004-verify-business-effect.sql' | Out-Null
  return @{ FirstExit = $firstExit; SecondExit = $secondExit }
}

function Invoke-ConflictSuite([string]$Service, [string]$Database) {
  $transactionConflict = Invoke-Sql $Service $Database '005-reject-conflicting-notification.sql' @{
    transaction_id = 'transaction-conflict'
    order_id = 'order-001'
  } -ExpectConflict
  Invoke-Sql $Service $Database '004-verify-business-effect.sql' | Out-Null

  $orderConflict = Invoke-Sql $Service $Database '005-reject-conflicting-notification.sql' @{
    transaction_id = 'transaction-001'
    order_id = 'order-002'
  } -ExpectConflict
  Invoke-Sql $Service $Database '004-verify-business-effect.sql' | Out-Null
  return @{ TransactionExit = $transactionConflict; OrderExit = $orderConflict }
}

$previousResources = Get-ProjectResources
Invoke-Compose @('down', '--volumes', '--remove-orphans') | Out-Null

New-Item -ItemType Directory -Path $ArtifactsRoot -Force | Out-Null
if (Test-Path -LiteralPath $DumpPath -PathType Leaf) {
  Remove-Item -LiteralPath $DumpPath -Force
}

Invoke-Compose @('up', '-d', '--wait') | Out-Null
Invoke-Sql 'source-db' 'spike_source' '001-create-spike-schema.sql' | Out-Null
Invoke-Sql 'source-db' 'spike_source' '002-seed-order.sql' | Out-Null
$sourceReplay = Invoke-NormalReplaySuite 'source-db' 'spike_source'
$sourceConflicts = Invoke-ConflictSuite 'source-db' 'spike_source'

$backupTimer = [Diagnostics.Stopwatch]::StartNew()
Invoke-Compose @('exec', '-T', 'source-db', 'pg_dump', '-U', 'postgres', '-d', 'spike_source', '-Fc', '-f', '/tmp/spike.dump') | Out-Null
$sourceContainer = (Invoke-Compose @('ps', '-q', 'source-db') | Out-String).Trim()
Invoke-Docker @('cp', "${sourceContainer}:/tmp/spike.dump", $DumpPath) | Out-Null
$backupTimer.Stop()

$businessTableSql = "SELECT count(*) FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename IN ('orders', 'payment_events', 'pack_access');"
$restorePreTableCount = Invoke-ScalarSql 'restore-db' 'spike_restore' $businessTableSql
if ($restorePreTableCount -ne '0') {
  throw "RESTORE_DATABASE_NOT_EMPTY: business_tables=$restorePreTableCount"
}

$restoreContainer = (Invoke-Compose @('ps', '-q', 'restore-db') | Out-String).Trim()
Invoke-Docker @('cp', $DumpPath, "${restoreContainer}:/tmp/spike.dump") | Out-Null
$restoreTimer = [Diagnostics.Stopwatch]::StartNew()
Invoke-Compose @('exec', '-T', 'restore-db', 'pg_restore', '--exit-on-error', '-U', 'postgres', '-d', 'spike_restore', '/tmp/spike.dump') | Out-Null
$restoreTimer.Stop()

Invoke-Sql 'restore-db' 'spike_restore' '006-verify-restored-data.sql' | Out-Null
$restoreReplay = Invoke-NormalReplaySuite 'restore-db' 'spike_restore' 'false'
$restoreConflicts = Invoke-ConflictSuite 'restore-db' 'spike_restore'

$postgresVersion = Invoke-ScalarSql 'source-db' 'spike_source' 'SHOW server_version;'
$dump = Get-Item -LiteralPath $DumpPath
$dumpHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $DumpPath).Hash.ToLowerInvariant()
$sourceCounts = Invoke-ScalarSql 'source-db' 'spike_source' "SELECT concat((SELECT count(*) FROM orders), '/', (SELECT count(*) FROM payment_events), '/', (SELECT count(*) FROM pack_access));"
$restoreCounts = Invoke-ScalarSql 'restore-db' 'spike_restore' "SELECT concat((SELECT count(*) FROM orders), '/', (SELECT count(*) FROM payment_events), '/', (SELECT count(*) FROM pack_access));"

$summary = [ordered]@{
  STATUS = 'PASS'
  POSTGRES_VERSION = $postgresVersion
  IMAGE = 'postgres:18.4-bookworm'
  COMPOSE_PROJECT = $ProjectName
  CLEANED_CONTAINERS = $previousResources.Containers
  CLEANED_VOLUMES = $previousResources.Volumes
  CLEANED_NETWORKS = $previousResources.Networks
  RESTORE_PRE_BUSINESS_TABLES = $restorePreTableCount
  DUMP_BYTES = $dump.Length
  DUMP_SHA256 = $dumpHash
  BACKUP_MILLISECONDS = $backupTimer.ElapsedMilliseconds
  RESTORE_MILLISECONDS = $restoreTimer.ElapsedMilliseconds
  SOURCE_REPLAY_EXITS = "$($sourceReplay.FirstExit),$($sourceReplay.SecondExit)"
  SOURCE_CONFLICT_EXITS = "$($sourceConflicts.TransactionExit),$($sourceConflicts.OrderExit)"
  SOURCE_COUNTS = $sourceCounts
  RESTORE_REPLAY_EXITS = "$($restoreReplay.FirstExit),$($restoreReplay.SecondExit)"
  RESTORE_CONFLICT_EXITS = "$($restoreConflicts.TransactionExit),$($restoreConflicts.OrderExit)"
  RESTORE_COUNTS = $restoreCounts
}
$summary.GetEnumerator() | ForEach-Object { "{0}={1}" -f $_.Key, $_.Value }
