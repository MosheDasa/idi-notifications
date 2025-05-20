!include "MUI2.nsh"

!macro customInstall
  ExecWait 'node "$INSTDIR\resources\app\scripts\install.js"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "IDI Notifications" "$INSTDIR\IDI Notifications.exe --background"
!macroend

!macro customUnInstall
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "IDI Notifications"
!macroend 