param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$DestinationDirectory
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  throw "pg_dump was not found. Install PostgreSQL client tools on the backup runner."
}

$destination = [System.IO.Path]::GetFullPath($DestinationDirectory)
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $destination "opticana-$stamp.dump"

# Custom format is compressed and is intended for pg_restore. No database
# writes occur during backup; DATABASE_URL is supplied only at execution time.
& pg_dump --format=custom --no-owner --no-privileges --file $backupFile $DatabaseUrl
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed." }

Get-FileHash -Algorithm SHA256 $backupFile |
  ForEach-Object { "$($_.Hash)  $($_.Path)" } |
  Set-Content -LiteralPath "$backupFile.sha256" -Encoding utf8

Write-Output $backupFile
