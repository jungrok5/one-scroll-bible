# Windows Task Scheduler job \OSB\health (operations-proposal §4-7): the nightly check — node only, no Claude, no browser.
# Registered by motion/studio/jobs/register.ps1 (23:40 KST, after the 17:00 quota reset). Monday = full run (caption tracks, ≈1,100 units).
# Output: motion/studio/health.json (studio.mjs status reads it) + motion/studio/logs/<date>-health.log (both gitignored).
$ErrorActionPreference = 'Continue'
Set-Location 'C:\Project\one-scroll-bible'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
foreach ($k in 'YT_CLIENT_ID','YT_CLIENT_SECRET','YT_REFRESH_TOKEN','YT_REFRESH_TOKEN_GLOBAL','YT_CLIENT_ID_GLOBAL','YT_CLIENT_SECRET_GLOBAL') { $v = [Environment]::GetEnvironmentVariable($k,'User'); if ($v) { Set-Item "env:$k" $v } }
$full = @(); if ((Get-Date).DayOfWeek -eq 'Monday') { $full = @('--full') }
& node motion/studio/studio.mjs health @full @args
