# PostgreSQL backup and restore guardrails

`scripts/backup-postgres.ps1` produces a timestamped PostgreSQL custom-format
dump and a SHA-256 checksum. It only reads the configured database.

`scripts/restore-postgres.ps1` is deliberately blocked unless `-Apply` is
supplied, requires an explicit target URL, and stops at the first restore error.
Use a verified backup and a non-production restore target for recovery drills.

These scripts do not store credentials, create databases, or delete data.
