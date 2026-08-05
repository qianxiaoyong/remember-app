Set-StrictMode -Version Latest

function Get-DockerExecutable {
  $command = Get-Command docker -ErrorAction SilentlyContinue
  if ($null -ne $command) {
    return $command.Source
  }

  throw 'DOCKER_CLI_NOT_FOUND'
}

function Read-EnvFileValue {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Key
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "ENV_FILE_NOT_FOUND: $Path"
  }

  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()
    if ($trimmed.Length -eq 0) {
      continue
    }

    if ($trimmed -match "^\s*$([regex]::Escape($Key))\s*=\s*(.*)$") {
      return $matches[1].Trim()
    }

    # Tolerate corrupted lines where KEY=value was appended to a comment.
    if ($trimmed.StartsWith('#') -and $trimmed -match "$([regex]::Escape($Key))\s*=\s*([^#\s]+)") {
      return $matches[1].Trim()
    }
  }

  throw "ENV_KEY_MISSING: $Key"
}

function Get-ComposeContext {
  param(
    [string]$ScriptRoot,
    [string]$EnvFile,
    [string]$ComposeFile,
    [string]$ProjectName
  )

  $resolvedEnvFile = if ([string]::IsNullOrWhiteSpace($EnvFile)) {
    Join-Path $ScriptRoot '.env'
  } else {
    $EnvFile
  }
  $resolvedComposeFile = if ([string]::IsNullOrWhiteSpace($ComposeFile)) {
    Join-Path $ScriptRoot 'compose.yaml'
  } else {
    $ComposeFile
  }

  $resolvedProjectName = if (-not [string]::IsNullOrWhiteSpace($ProjectName)) {
    $ProjectName
  } else {
    Read-EnvFileValue -Path $resolvedEnvFile -Key 'COMPOSE_PROJECT_NAME'
  }

  $postgresUser = Read-EnvFileValue -Path $resolvedEnvFile -Key 'POSTGRES_USER'
  $postgresDb = Read-EnvFileValue -Path $resolvedEnvFile -Key 'POSTGRES_DB'

  $docker = Get-DockerExecutable
  $composeArgs = @(
    'compose',
    '--project-name', $resolvedProjectName,
    '--env-file', $resolvedEnvFile,
    '--file', $resolvedComposeFile
  )

  return [PSCustomObject]@{
    Docker = $docker
    ComposeArgs = $composeArgs
    EnvFile = $resolvedEnvFile
    ComposeFile = $resolvedComposeFile
    ProjectName = $resolvedProjectName
    PostgresUser = $postgresUser
    PostgresDb = $postgresDb
  }
}

function Invoke-Docker {
  param(
    [Parameter(Mandatory = $true)][string]$Docker,
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )

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

function Invoke-Compose {
  param(
    [Parameter(Mandatory = $true)]$Context,
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )

  return Invoke-Docker -Docker $Context.Docker -Arguments ($Context.ComposeArgs + $Arguments)
}

function Get-PostgresServiceName {
  param(
    [Parameter(Mandatory = $true)]$Context
  )

  $formatArgs = $Context.ComposeArgs + @('ps', '--services', '--filter', 'status=running')
  $services = Invoke-Docker -Docker $Context.Docker -Arguments $formatArgs
  if ($services -contains 'postgres') {
    return 'postgres'
  }
  throw 'POSTGRES_SERVICE_NOT_RUNNING'
}

function Get-CommerceCountSql {
  @"
SELECT 'orders' AS table_name, count(*)::text AS row_count FROM orders
UNION ALL SELECT 'payment_events', count(*)::text FROM payment_events
UNION ALL SELECT 'pack_access', count(*)::text FROM pack_access
ORDER BY table_name;
"@
}

function Write-CommerceCounts {
  param(
    [Parameter(Mandatory = $true)]$Context,
    [Parameter(Mandatory = $true)][string]$Label
  )

  $sql = Get-CommerceCountSql
  Write-Host "=== $Label ==="
  Invoke-Compose -Context $Context -Arguments @(
    'exec', '-T', 'postgres',
    'psql', '-U', $Context.PostgresUser, '-d', $Context.PostgresDb, '-c', $sql
  ) | ForEach-Object { Write-Host $_ }
}
