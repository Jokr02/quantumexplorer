---
description: Create a timestamped backup of the project
---

1. Execute the following PowerShell script to create a backup.

```powershell
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$source = "D:\Gemini\QuantumExplorer"
$dest = "D:\Gemini\QuantumExplorer\backups\backup_$timestamp"

Write-Host "Creating backup at $dest..."

# Create destination directory
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Use Robocopy for efficient copying
# /E : Copy subdirectories, including empty ones.
# /XD : Exclude directories (node_modules, .git, backups, dist, .gemini)
# /XF : Exclude files (optional, e.g., *.log)
# /NFL /NDL /NJH /NJS : Reduce output noise (No File List, No Dir List, No Job Header, No Job Summary) - allows only errors to show, or remove for verbose
# Robocopy returns exit codes that are not standard (1 means success), so we check generally.

robocopy $source $dest /E /XD "node_modules" ".git" "backups" "dist" ".gemini" ".vs" /R:0 /W:0

if ($LASTEXITCODE -lt 8) {
    Write-Host "Backup completed successfully to: $dest"
} else {
    Write-Host "Backup completed with errors. Exit Code: $LASTEXITCODE"
}
```
