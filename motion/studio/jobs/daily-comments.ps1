# Windows Task Scheduler job (motion/studio/operations-proposal.html §4-4, 1-week trial approved 2026-11-13):
# the daily comment routine run by Claude Code without a window. Registered by motion/studio/jobs/register.ps1 as \OSB\daily-comments.
# The prompt is daily-comments.prompt.txt (edit it there, not here). Output: motion/studio/logs/<date>-daily.log (gitignored).
# 2026-11-26 (관리자: "댓글관리 왜 계속 안 돌지? … 새벽 4시"): moved 19:12 → 04:00; the job now exits with Claude's exit code, so a
# failed run (11/18, 11/25: weekly usage limit) shows as a failure in Task Scheduler and studio.mjs status instead of "성공";
# Chrome is started if it is not running (the run needs the extension).
$ErrorActionPreference = 'Continue'
Set-Location 'C:\Project\one-scroll-bible'
. "$PSScriptRoot\job-common.ps1"
$code = Invoke-ClaudeJob -Name 'daily' -Prompt 'motion/studio/jobs/daily-comments.prompt.txt 파일을 Read로 읽고 그 지시를 처음부터 끝까지 그대로 한다. 그 파일에 없는 게시·삭제·수정은 하지 않는다.' `
  -Tools @('Bash(node motion/youtube/routine.mjs daily)', 'Bash(node motion/youtube/*)', 'mcp__claude-in-chrome__*', 'Read', 'Glob', 'Grep', 'PushNotification')
exit $code
