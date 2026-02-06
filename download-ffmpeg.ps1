# Download and Install FFmpeg
# This script automatically downloads and sets up FFmpeg for voice input

Write-Host "=== FFmpeg Installer ===" -ForegroundColor Cyan
Write-Host ""

# Check if FFmpeg is already installed
try {
    $existing = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "FFmpeg is already installed!" -ForegroundColor Green
    Write-Host "  $existing" -ForegroundColor Gray
    Write-Host ""
    Write-Host "No need to install. You're all set!" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "FFmpeg not found. Installing..." -ForegroundColor Yellow
}

# Download URL
$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$downloadPath = "$env:TEMP\ffmpeg.zip"
$extractPath = "C:\ffmpeg"

Write-Host ""
Write-Host "Step 1: Downloading FFmpeg..." -ForegroundColor Yellow
Write-Host "  URL: $ffmpegUrl" -ForegroundColor Gray
Write-Host "  Size: ~80MB (this may take a few minutes)" -ForegroundColor Gray

try {
    # Download with progress
    $ProgressPreference = "SilentlyContinue"
    Invoke-WebRequest -Uri $ffmpegUrl -OutFile $downloadPath -UseBasicParsing
    $ProgressPreference = "Continue"
    Write-Host "  Download complete" -ForegroundColor Green
}
catch {
    Write-Host "  Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor White
    Write-Host "2. Download: ffmpeg-release-essentials.zip" -ForegroundColor White
    Write-Host "3. Extract to C:\ffmpeg" -ForegroundColor White
    Write-Host "4. Add C:\ffmpeg\bin to PATH" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Step 2: Extracting..." -ForegroundColor Yellow

try {
    # Remove old installation if exists
    if (Test-Path $extractPath) {
        Write-Host "  Removing old installation..." -ForegroundColor Gray
        Remove-Item -Path $extractPath -Recurse -Force
    }

    # Extract
    Expand-Archive -Path $downloadPath -DestinationPath "$env:TEMP\ffmpeg_temp" -Force
    
    # Find the extracted folder (it has a version number in the name)
    $extractedFolder = Get-ChildItem -Path "$env:TEMP\ffmpeg_temp" -Directory | Select-Object -First 1
    
    # Move to C:\ffmpeg
    Move-Item -Path $extractedFolder.FullName -Destination $extractPath -Force
    
    Write-Host "  Extracted to $extractPath" -ForegroundColor Green
}
catch {
    Write-Host "  Extraction failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    # Cleanup
    if (Test-Path $downloadPath) {
        Remove-Item -Path $downloadPath -Force
    }
    if (Test-Path "$env:TEMP\ffmpeg_temp") {
        Remove-Item -Path "$env:TEMP\ffmpeg_temp" -Recurse -Force
    }
}

Write-Host ""
Write-Host "Step 3: Adding to PATH..." -ForegroundColor Yellow

try {
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    # Check if already in PATH
    if ($currentPath -notlike "*$extractPath\bin*") {
        # Add to user PATH
        $newPath = "$currentPath;$extractPath\bin"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        
        # Also add to current session
        $env:PATH += ";$extractPath\bin"
        
        Write-Host "  Added to PATH" -ForegroundColor Green
    }
    else {
        Write-Host "  Already in PATH" -ForegroundColor Green
    }
}
catch {
    Write-Host "  Could not add to PATH automatically" -ForegroundColor Yellow
    Write-Host "  Please add manually: $extractPath\bin" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 4: Verifying installation..." -ForegroundColor Yellow

try {
    # Refresh PATH for current session
    $env:PATH = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    $version = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "  FFmpeg installed successfully!" -ForegroundColor Green
    Write-Host "  $version" -ForegroundColor Gray
}
catch {
    Write-Host "  FFmpeg installed but not in PATH yet" -ForegroundColor Yellow
    Write-Host "  Please restart PowerShell and try: ffmpeg -version" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Installation Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "FFmpeg is now installed at: $extractPath" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart PowerShell (to refresh PATH)" -ForegroundColor White
Write-Host "2. Verify: ffmpeg -version" -ForegroundColor White
Write-Host "3. Start backend: .\start-backend-fixed.ps1" -ForegroundColor White
Write-Host "4. Test voice input in the app!" -ForegroundColor White
Write-Host ""
Write-Host "Note: You may need to restart PowerShell for PATH changes to take effect." -ForegroundColor Yellow
