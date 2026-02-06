# Install OpenAI Dependencies
# This script installs all required dependencies for the OpenAI integration

Write-Host "=== Installing OpenAI Dependencies ===" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".venv")) {
    Write-Host "✗ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install -r backend/requirements.txt

# Verify installations
Write-Host ""
Write-Host "Verifying installations..." -ForegroundColor Yellow

$packages = @("openai", "opencv-python", "numpy", "fastapi", "uvicorn")
$allInstalled = $true

foreach ($package in $packages) {
    try {
        $version = pip show $package 2>$null | Select-String "Version:" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
        if ($version) {
            Write-Host "  ✓ $package ($version)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $package not found" -ForegroundColor Red
            $allInstalled = $false
        }
    } catch {
        Write-Host "  ✗ $package not found" -ForegroundColor Red
        $allInstalled = $false
    }
}

Write-Host ""
if ($allInstalled) {
    Write-Host "=== Installation Complete ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Set your OpenAI API key in backend\.env" -ForegroundColor White
    Write-Host "   OPENAI_API_KEY='sk-your-key-here'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Restart the backend:" -ForegroundColor White
    Write-Host "   .\restart-backend-now.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Test the integration:" -ForegroundColor White
    Write-Host "   .\test-openai-integration.ps1" -ForegroundColor Gray
} else {
    Write-Host "=== Installation Failed ===" -ForegroundColor Red
    Write-Host "Some packages failed to install. Please check the errors above." -ForegroundColor Yellow
    exit 1
}
