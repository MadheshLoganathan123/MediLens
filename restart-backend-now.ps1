# Emergency Backend Restart Script

Write-Host "=" -NoNewline -ForegroundColor Red
Write-Host "=" * 50 -ForegroundColor Red
Write-Host "RESTARTING BACKEND NOW" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Red
Write-Host ""

# Kill any existing Python/Uvicorn processes
Write-Host "1. Stopping old backend processes..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✓ Old processes stopped" -ForegroundColor Green
Write-Host ""

# Start new backend
Write-Host "2. Starting fresh backend..." -ForegroundColor Cyan
Write-Host "   Server will start at: http://127.0.0.1:5000" -ForegroundColor Gray
Write-Host "   API Docs at: http://127.0.0.1:5000/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "   Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 5000 --reload
