# ENVIRONMENT ACTIVATION SCRIPT FOR COMMERCE CLOUD

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeDir = "C:\Users\Ahmad\.gemini\antigravity\scratch\nodejs\node-v20.18.0-win-x64"

if (Test-Path "$nodeDir\node.exe") {
    $env:PATH = "$nodeDir;$env:PATH"
    Write-Host "Commerce Cloud Environment Loaded:" -ForegroundColor Green
    Write-Host "  Node.js: $(node -v)" -ForegroundColor Cyan
    Write-Host "  pnpm:    $(pnpm -v)" -ForegroundColor Cyan
} else {
    Write-Error "Portable Node directory not found at $nodeDir"
}
