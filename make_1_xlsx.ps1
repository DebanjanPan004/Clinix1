$ErrorActionPreference = 'Stop'

$template = 'E:\Clinix1\Clinix1\Functional Test case Template.xlsx'
$out = 'E:\Clinix1\Clinix1\1.xlsx'

$rows = @(
@('Authentication','Valid Patient Login',"Open login page`nEnter valid patient credentials`nClick login",'Login successful, redirect to patient dashboard','Login successful','Pass','Token stored, role = patient'),
@('Authentication','Valid Doctor Login','Enter valid doctor credentials','Redirect to doctor dashboard','Success','Pass','Role-based routing works'),
@('Authentication','Invalid Login','Enter wrong password','Error message','Error shown','Pass','No token stored'),
@('Authentication','Empty Fields Login',"Leave fields empty`nClick login",'Validation error','Error shown','Pass','Frontend validation'),
@('Registration','Register Patient','Fill form + select patient','Account created','Success','Pass','users + patients table updated'),
@('Registration','Register Doctor','Fill form + select doctor','Account created','Success','Pass','users + doctors table updated'),
@('Authentication','Unauthorized Route Access','Try accessing /doctor-dashboard as patient','Redirect or deny access','Redirected','Pass','Role guard working'),

@('Dashboard','Load Dashboard','Login as patient','Dashboard loads','Loaded','Pass','API calls successful'),
@('Dashboard','View Upcoming Appointments','Open dashboard','Show upcoming appointments','Displayed','Pass',''),
@('Dashboard','View Empty State','No appointments exist','Show empty message','Message shown','Pass',''),
@('Dashboard','Sidebar Navigation','Click different sections','Navigate correctly','Works','Pass',''),

@('Appointment','Doctor Search','Search by specialization','Filtered doctors','Displayed','Pass',''),
@('Appointment','Slot Availability Check','Select doctor + slot','Show available/unavailable','Correct response','Pass',''),
@('Appointment','Book Appointment','Select slot + confirm','Appointment created','Success','Pass',''),
@('Appointment','Double Booking Prevention','Book same slot twice','Reject second booking','Prevented','Pass',''),
@('Appointment','Cancel Appointment','Cancel appointment','Status = cancelled','Updated','Pass',''),
@('Appointment','Past Date Booking','Select past date','Not allowed','Prevented','Pass',''),

@('Reminder','Add Reminder','Add medicine details','Reminder created','Success','Pass',''),
@('Reminder','View Reminder List','Open reminders','Show list','Displayed','Pass',''),
@('Reminder','Toggle Reminder Status','Mark complete','Status updated','Updated','Pass',''),

@('Reports','Upload Report','Upload file','Stored + listed','Success','Pass',''),
@('Reports','View Reports','Open reports section','Show report list','Displayed','Pass',''),
@('Reports','Invalid File Upload','Upload unsupported file','Error','Error shown','Pass',''),

@('Doctor Dashboard','Load Dashboard','Login as doctor','Dashboard loads','Loaded','Pass',''),
@('Doctor Dashboard','View Appointments','Open dashboard','Appointment list','Displayed','Pass',''),
@('Doctor Dashboard','No-Show Risk Display','Open dashboard','Risk labels shown','Displayed','Pass',''),
@('Doctor Dashboard','AI Fallback Logic','Simulate AI failure','Use fallback logic','Works','Pass',''),
@('Doctor Dashboard','Send Reminder','Click send reminder','Notification created','Success','Pass',''),
@('Doctor Dashboard','View Patient Summary','Click summary','Patient details shown','Displayed','Pass',''),
@('Doctor Dashboard','Mark Notification Read','Mark notification','Status updated','Updated','Pass',''),

@('Session','Logout','Click logout','Session cleared','Cleared','Pass',''),
@('Session','Access Without Login','Open protected route','Redirect to login','Redirected','Pass','')
)

Copy-Item $template $out -Force

$excel = $null
$wb = $null
$ws = $null
try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  $wb = $excel.Workbooks.Open($out)
  $ws = $wb.Worksheets.Item(1)

  $ws.Cells.Item(3,4).Value2 = 'ClinixOne Functional Test Case'
  $ws.Range('B5:H500').ClearContents()

  $r = 5
  foreach ($item in $rows) {
    $ws.Cells.Item($r,2).Value2 = $item[0]
    $ws.Cells.Item($r,3).Value2 = $item[1]
    $ws.Cells.Item($r,4).Value2 = $item[2]
    $ws.Cells.Item($r,5).Value2 = $item[3]
    $ws.Cells.Item($r,6).Value2 = $item[4]
    $ws.Cells.Item($r,7).Value2 = $item[5]
    $ws.Cells.Item($r,8).Value2 = $item[6]
    $ws.Rows.Item($r).RowHeight = 86
    $r++
  }

  $wb.Save()
  $wb.Close($true)

  Write-Output "Created: $out"
  Write-Output "Rows written: $($rows.Count)"
}
finally {
  if ($ws -ne $null) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($ws) }
  if ($wb -ne $null) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) }
  if ($excel -ne $null) {
    $excel.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
