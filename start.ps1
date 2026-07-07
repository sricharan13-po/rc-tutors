# Start TutorKids app (run from tutoring-app\ directory)

Write-Host "Starting TutorKids backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python -m uvicorn main:app --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host "Starting TutorKids frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`nApp starting:" -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  -> http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs -> http://localhost:8000/docs" -ForegroundColor White
