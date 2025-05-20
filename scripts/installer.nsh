!include "MUI2.nsh"

!macro customInstall
  ExecWait 'node "$INSTDIR\resources\app\scripts\install.js"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "IDI Notifications" "$INSTDIR\IDI Notifications.exe --background"
!macroend

!macro customUnInstall
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "IDI Notifications"
!macroend

!macro CreateConfigFile
  ; Get the USERNAME environment variable
  ReadEnvStr $0 USERNAME
  
  ; Create the config directory if it doesn't exist
  CreateDirectory "C:\Users\$0\idi-notifications-config"
  
  ; Create the config.json file
  FileOpen $1 "C:\Users\$0\idi-notifications-config\config.json" w
  FileWrite $1 '{\r\n'
  FileWrite $1 '  "API_URL": "http://localhost:8083",\r\n'
  FileWrite $1 '  "API_POLLING_INTERVAL": 10000,\r\n'
  FileWrite $1 '  "LOG": false,\r\n'
  FileWrite $1 '  "USER_ID": "$0",\r\n'
  FileWrite $1 '  "USER_NAME": "$0",\r\n'
  FileWrite $1 '  "OPEN_DEV_TOOLS": false\r\n'
  FileWrite $1 '}'
  FileClose $1
!macroend 