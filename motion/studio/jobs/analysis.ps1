# Windows Task Scheduler job \OSB\analysis — the Monday/Thursday analysis (motion/youtube/ROUTINES.md "정기 분석"), run by Claude Code without a window.
# 2026-11-26 (관리자: "데이터분석이랑 댓글관리 정상적으로 돌게 … 새벽 3시"): it was a session cron (CronCreate), which only fires while one
# Claude session stays open and expires after 7 days. Now it is a Task Scheduler job like daily-comments. Prompt: analysis.prompt.txt.
# Output: motion/studio/logs/<date>-analysis.log (gitignored); the analysis itself is committed to the work branch by the run.
$ErrorActionPreference = 'Continue'
Set-Location 'C:\Project\one-scroll-bible'
. "$PSScriptRoot\job-common.ps1"
$code = Invoke-ClaudeJob -Name 'analysis' -Prompt 'motion/studio/jobs/analysis.prompt.txt 파일을 Read로 읽고 그 지시를 처음부터 끝까지 그대로 한다. 그 파일에 없는 게시·삭제·수정은 하지 않는다.' `
  -Tools @('Bash(node motion/*)', 'Bash(git add *)', 'Bash(git commit *)', 'Bash(git push origin *)', 'Bash(git status*)', 'Bash(git log*)', 'Bash(git diff*)',
           'mcp__claude-in-chrome__*', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'PushNotification')
exit $code
