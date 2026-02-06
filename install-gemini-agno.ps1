# Install Gemini with agno library Dependencies

Write-Host "=== Installing Gemini + agno Dependencies ===" -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install agno google-generativeai opencv-python numpy pillow

Write-Host ""
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart backend: .\restart-backend-now.ps1" -ForegroundColor White
Write-Host "2. Test integration: .\test-gemini-agno-integration.ps1" -ForegroundColor White
