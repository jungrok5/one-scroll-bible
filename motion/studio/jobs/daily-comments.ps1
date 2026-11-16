# Windows Task Scheduler job (motion/studio/operations-proposal.html §4-4, 1-week trial approved 2026-11-13):
# the daily comment routine run by Claude Code without a window. Registered by motion/studio/jobs/register.ps1 as \OSB\daily-comments.
# The prompt is daily-comments.prompt.txt (edit it there, not here). Output: motion/studio/logs/<date>-daily.log (gitignored).
$ErrorActionPreference = 'Continue'
Set-Location 'C:\Project\one-scroll-bible'
foreach ($k in 'YT_CLIENT_ID','YT_CLIENT_SECRET','YT_REFRESH_TOKEN','YT_REFRESH_TOKEN_GLOBAL') { Set-Item "env:$k" ([Environment]::GetEnvironmentVariable($k,'User')) }
$d = Get-Date -Format 'yyyy-MM-dd'
New-Item -ItemType Directory -Force 'motion\studio\logs' | Out-Null
$log = "motion\studio\logs\$d-daily.log"
$prompt = Get-Content 'motion\studio\jobs\daily-comments.prompt.txt' -Raw -Encoding UTF8
"=== $(Get-Date -Format s) start" | Out-File $log -Encoding utf8
& 'C:\Users\jungrok5\.local\bin\claude.exe' -p $prompt --chrome --output-format text `
  --allowedTools 'Bash(node motion/youtube/routine.mjs daily)' 'Bash(node motion/youtube/*)' 'mcp__claude-in-chrome__*' 'Read' 'Glob' 'Grep' 2>&1 |
  Out-File $log -Append -Encoding utf8
"=== $(Get-Date -Format s) end (exit $LASTEXITCODE)" | Out-File $log -Append -Encoding utf8
