# Register the studio's scheduled jobs in Windows Task Scheduler under the folder \OSB\ (operations-proposal §4-4, approved 2026-11-13).
# Runs as the signed-in user and only while signed in (Interactive), so Chrome with the channel accounts is open.
#   powershell -ExecutionPolicy Bypass -File motion/studio/jobs/register.ps1          (re-run after changing a job)
#   remove: Unregister-ScheduledTask -TaskPath '\OSB\' -TaskName daily-comments -Confirm:$false
# 2026-11-26 (관리자: "데이터분석이랑 댓글관리 정상적으로 돌게 … 새벽 3시 4시에 각각"): analysis moved from a session cron to \OSB\analysis
# (Mon/Thu 03:00), daily-comments 19:12 → 04:00; both wake the PC (WakeToRun) and may run 2 h.
$ps = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$root = 'C:\Project\one-scroll-bible\motion\studio\jobs'
$jobs = @(
  @{ name = 'analysis'; file = 'analysis.ps1'; at = '03:00'; days = @('Monday', 'Thursday'); hours = 2; wake = $true }   # was the session cron `23 10 * * 1,4`
  @{ name = 'daily-comments'; file = 'daily-comments.ps1'; at = '04:00'; days = $null; hours = 1; wake = $true }       # every day (was 19:12)
  @{ name = 'queue'; file = 'queue.ps1'; at = '17:10'; days = $null; hours = 1; wake = $false }                        # the 17:00 queue right after the quota reset — operations-proposal §4-8
  @{ name = 'health'; file = 'health.ps1'; at = '23:40'; days = $null; hours = 1; wake = $false }                      # nightly check, node only (Monday = full) — operations-proposal §4-7
)
foreach ($j in $jobs) {
  $action = New-ScheduledTaskAction -Execute $ps -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\$($j.file)`"" -WorkingDirectory 'C:\Project\one-scroll-bible'
  $trigger = if ($j.days) { New-ScheduledTaskTrigger -Weekly -DaysOfWeek $j.days -At $j.at } else { New-ScheduledTaskTrigger -Daily -At $j.at }
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours $j.hours) -MultipleInstances IgnoreNew -WakeToRun:$j.wake -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
  $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive
  Register-ScheduledTask -TaskPath '\OSB\' -TaskName $j.name -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
  $t = Get-ScheduledTask -TaskPath '\OSB\' -TaskName $j.name; $i = $t | Get-ScheduledTaskInfo
  "{0}: {1}, next run {2}" -f $j.name, $t.State, $i.NextRunTime
}
