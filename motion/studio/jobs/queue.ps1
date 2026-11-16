# Windows Task Scheduler job \OSB\queue (operations-proposal §4-8): run the 17:00 queue right after the daily quota reset — node only.
# Jobs are put in by a desk with `studio.mjs queue add` (only after the maintainer's OK for anything that changes a video); this runs
# the ones that are due and fit the quota, in order. Output: motion/studio/logs/<date>-queue.log (gitignored); results in queue.json "done".
$ErrorActionPreference = 'Continue'
Set-Location 'C:\Project\one-scroll-bible'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
foreach ($k in 'YT_CLIENT_ID','YT_CLIENT_SECRET','YT_REFRESH_TOKEN','YT_REFRESH_TOKEN_GLOBAL','YT_CLIENT_ID_GLOBAL','YT_CLIENT_SECRET_GLOBAL') { $v = [Environment]::GetEnvironmentVariable($k,'User'); if ($v) { Set-Item "env:$k" $v } }
$d = Get-Date -Format 'yyyy-MM-dd'
New-Item -ItemType Directory -Force 'motion\studio\logs' | Out-Null
"=== $(Get-Date -Format s) queue run" | Out-File "motion\studio\logs\$d-queue.log" -Append -Encoding utf8
& node motion/studio/studio.mjs queue run 2>&1 | Out-File "motion\studio\logs\$d-queue.log" -Append -Encoding utf8
