$url = "http://localhost:3000/api/feedback"
$body = @{
    message = "Test feedback from PowerShell"
    language = "es"
} | ConvertTo-Json

Write-Host "🧪 Probando API de feedback..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "📊 Status:" $response.StatusCode -ForegroundColor Green
    Write-Host "📄 Response:" $response.Content -ForegroundColor Yellow

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ ¡Feedback enviado exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al enviar feedback" -ForegroundColor Red
    }
} catch {
    Write-Host "💥 Error:" $_.Exception.Message -ForegroundColor Red
}
