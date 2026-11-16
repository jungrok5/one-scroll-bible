# Register the studio's scheduled jobs in Windows Task Scheduler under the folder \OSB\ (operations-proposal §4-4, approved 2026-11-13).
# Runs as the signed-in user and only while signed in (Interactive), so Chrome with the channel accounts is open.
#   powershell -ExecutionPolicy Bypass -File motion/studio/jobs/register.ps1          (re-run after changing a job)
#   remove: Unregister-ScheduledTask -TaskPath '\OSB\' -TaskName daily-comments -Confirm:$false
$ps = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$root = 'C:\Project\one-scroll-bible\motion\studio\jobs'
$jobs = @(
  @{ name = 'daily-comments'; file = 'daily-comments.ps1'; at = '19:12'; days = $null }   # every day 19:12 KST (was a session cron, motion/youtube/ROUTINES.md)
  @{ name = 'queue'; file = 'queue.ps1'; at = '17:10'; days = $null }                    # the 17:00 queue right after the quota reset — operations-proposal §4-8
  @{ name = 'health'; file = 'health.ps1'; at = '23:40'; days = $null }                   # nightly check, node only (Monday = full) — operations-proposal §4-7
)
foreach ($j in $jobs) {
  $action = New-ScheduledTaskAction -Execute $ps -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\$($j.file)`"" -WorkingDirectory 'C:\Project\one-scroll-bible'
  $trigger = New-ScheduledTaskTrigger -Daily -At $j.at
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew
  $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive
  Register-ScheduledTask -TaskPath '\OSB\' -TaskName $j.name -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
  $t = Get-ScheduledTask -TaskPath '\OSB\' -TaskName $j.name; $i = $t | Get-ScheduledTaskInfo
  "{0}: {1}, next run {2}" -f $j.name, $t.State, $i.NextRunTime
}
