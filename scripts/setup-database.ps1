param(
  [string]$PostgresPassword
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$sql = Join-Path $PSScriptRoot "init-db.sql"
$envFile = Join-Path $root ".env.postgres"

if (-not (Test-Path $psql)) {
  throw "psql not found at $psql. Update the path in setup-database.ps1 for your PostgreSQL version."
}

if ($PostgresPassword) {
  $env:PGPASSWORD = $PostgresPassword
} elseif (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*POSTGRES_PASSWORD\s*=\s*(.+)\s*$') {
      $env:PGPASSWORD = $matches[1].Trim().Trim('"').Trim("'")
    }
  }
}

if (-not $env:PGPASSWORD) {
  $secure = Read-Host "Enter your postgres superuser password (set during PostgreSQL install)" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
}

$psqlArgs = @("-U", "postgres", "-h", "127.0.0.1", "-p", "5432", "-v", "ON_ERROR_STOP=1")

Write-Host "Creating veloire user..."
& $psql @psqlArgs -d postgres -f $sql
if ($LASTEXITCODE -ne 0) { throw "User setup failed." }

$dbExists = (& $psql @psqlArgs -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'veloire'").Trim()
if ($dbExists -ne "1") {
  Write-Host "Creating veloire database..."
  & $psql @psqlArgs -d postgres -c "CREATE DATABASE veloire OWNER veloire;"
  if ($LASTEXITCODE -ne 0) { throw "Database creation failed." }
} else {
  Write-Host "Database veloire already exists."
}

& $psql @psqlArgs -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE veloire TO veloire;"

Write-Host "Done. User: veloire | Database: veloire | Password: veloire_secret"
