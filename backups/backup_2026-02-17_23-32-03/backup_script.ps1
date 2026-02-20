$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$source = "D:\Gemini\QuantumExplorer"
$dest = "D:\Gemini\QuantumExplorer\backups\backup_$timestamp"

Write-Host "Creating backup at $dest..."

# Create destination directory
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Use Robocopy
robocopy $source $dest /E /XD "node_modules" ".git" "backups" "dist" ".gemini" ".vs" /R:0 /W:0

if ($LASTEXITCODE -lt 8) {
    Write-Host "Backup completed successfully to: $dest"
} else {
    Write-Host "Backup completed with errors. Exit Code: $LASTEXITCODE"
}
