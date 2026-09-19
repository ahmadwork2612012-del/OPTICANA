param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not $Apply) {
  throw "Restore is intentionally dry-run by default. Re-run with -Apply only after verifying the target and backup."
}
if (-not (Test-Path -LiteralPath $BackupFile -PathType Leaf)) { throw "Backup file not found." }
if (-not (Get-Command pg_restore -ErrorAction SilentlyContinue)) { throw "pg_restore was not found. Install PostgreSQL client tools on the restore runner." }

# Existing production data is never overwritten silently: pg_restore stops on
# the first error and requires an explicitly supplied target database URL.
& pg_restore --verbose --no-owner --no-privileges --exit-on-error --dbname $DatabaseUrl $BackupFile
if ($LASTEXITCODE -ne 0) { throw "pg_restore failed." }
