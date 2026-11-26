# Shared by the Claude jobs in \OSB\ (daily-comments.ps1, analysis.ps1): YT_* variables, UTF-8 console, Chrome running, one log per run,
# and the exit code passed back to Task Scheduler (2026-11-26: the old job always ended "성공" even when Claude stopped on the usage limit).
function Invoke-ClaudeJob([string]$Name, [string]$Prompt, [string[]]$Tools) {
  foreach ($k in [Environment]::GetEnvironmentVariables('User').Keys) { if ($k -like 'YT_*') { Set-Item "env:$k" ([Environment]::GetEnvironmentVariable($k, 'User')) } }
  # 2026-11-16: claude prints UTF-8; PowerShell 5.1 read it as CP949. The prompt is one line without quotes (5.1 breaks native args at quotes).
  [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
  $d = Get-Date -Format 'yyyy-MM-dd'
  New-Item -ItemType Directory -Force 'motion\studio\logs' | Out-Null
  $log = "motion\studio\logs\$d-$Name.log"
  "=== $(Get-Date -Format s) start" | Out-File $log -Append -Encoding utf8
  # The run drives the channel Chrome through the extension: start Chrome if it is closed (it reopens the last profile), then give it time to connect.
  if (-not (Get-Process chrome -ErrorAction SilentlyContinue)) {
    $chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
    if (Test-Path $chrome) { Start-Process $chrome; "chrome started" | Out-File $log -Append -Encoding utf8; Start-Sleep -Seconds 45 }
  }
  & 'C:\Users\jungrok5\.local\bin\claude.exe' -p $Prompt --chrome --output-format text --allowedTools @Tools 2>&1 | Out-File $log -Append -Encoding utf8
  $code = $LASTEXITCODE
  "=== $(Get-Date -Format s) end (exit $code)" | Out-File $log -Append -Encoding utf8
  return $code
}
