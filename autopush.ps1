# Automatic Git Push Script
$folder = Get-Location
$filter = '*.*'

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $folder
$watcher.Filter = $filter
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

Write-Host "🚀 Auto-Push Active! Notepad mein Save karte hi GitHub par push ho jayega..." -ForegroundColor Green

$action = {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -notlike "*\.git\*") {
        Write-Host "⚡ Change detected! Pushing to GitHub..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        git add .
        git commit -m "Auto update via autopush script"
        git push origin main
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    }
}

Register-ObjectEvent $watcher 'Changed' -Action $action
Register-ObjectEvent $watcher 'Created' -Action $action

while ($true) { Start-Sleep -Seconds 5 }