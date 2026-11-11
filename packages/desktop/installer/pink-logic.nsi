; Pink Logic 2.0.0 — instalador Windows (NSIS)
; Fallback/alternativa ao electron-builder: compila-se com makensis nativo
; (apt install nsis) a partir do win-unpacked já construído.
; NÃO apaga os dados do utilizador (%APPDATA%\Pink Logic) ao desinstalar,
; para os rascunhos sobreviverem a atualizações.
;
; Compilar:  makensis installer/pink-logic.nsi
; Saída:     release/Pink-Logic-Setup-2.0.0.exe

; --- Modo de instalação: escolha por utilizador / todos os utilizadores ---
; (estes defines TÊM de vir ANTES do !include "MultiUser.nsh")
!define MULTIUSER_EXECUTIONLEVEL Highest
!define MULTIUSER_INSTALLMODE_DEFAULT_CURRENTUSER
!define MULTIUSER_INSTALLMODE_64BIT
!define MULTIUSER_MUI

!include "MUI2.nsh"
!include "MultiUser.nsh"
!include "FileFunc.nsh"

!define APP_NAME "Pink Logic"
!define APP_VERSION "2.0.0"
!define APP_PUBLISHER "Pink Logic"
!define APP_URL "https://pink-logic.vercel.app"
!define APP_EXE "Pink Logic.exe"
!define APP_ID "com.pinklogic.app"

Name "${APP_NAME} ${APP_VERSION}"
OutFile "..\release\Pink-Logic-Setup-2.0.0.exe"
InstallDir "$LOCALAPPDATA\Programs\${APP_NAME}"
InstallDirRegKey HKCU "Software\${APP_NAME}" "InstallDir"
Icon "..\build\icon.ico"
UninstallIcon "..\build\icon.ico"
RequestExecutionLevel Highest
SetCompressor /SOLID lzma

; --- Modo de instalação: escolha por utilizador / todos os utilizadores ---
!insertmacro MULTIUSER_PAGE_INSTALLMODE

; --- Páginas do assistente ---
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXE}"
!define MUI_FINISHPAGE_RUN_TEXT "Abrir o ${APP_NAME}"
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Portuguese"
!insertmacro MUI_LANGUAGE "English"

Section "Pink Logic (obrigatório)" SecMain
  SectionIn RO
  SetOutPath "$INSTDIR"
  ; Copia a aplicação empacotada (win-unpacked). Exclui o próprio desinstalador antigo.
  File /r /x "Uninstall.exe" "..\release\win-unpacked\*.*"

  ; Atalho no menu Iniciar (sempre)
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}" 0
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\Desinstalar ${APP_NAME}.lnk" "$INSTDIR\Uninstall.exe"

  ; Registo para Adicionar/Remover Programas
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayName" "${APP_NAME} ${APP_VERSION}"
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayIcon" "$INSTDIR\${APP_EXE}"
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "URLInfoAbout" "${APP_URL}"
  WriteRegDWORD SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "NoModify" 1
  WriteRegDWORD SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "NoRepair" 1
  WriteRegStr SHCTX "Software\${APP_NAME}" "InstallDir" "$INSTDIR"

  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Atalho no ambiente de trabalho" SecDesktop
  CreateShortcut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}" 0
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir /r "$INSTDIR"
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Desinstalar ${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\${APP_NAME}"
  Delete "$DESKTOP\${APP_NAME}.lnk"
  DeleteRegKey SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}"
  DeleteRegKey SHCTX "Software\${APP_NAME}"
  ; NOTA: $APPDATA\${APP_NAME} (rascunhos e dados do utilizador) é
  ; deliberadamente PRESERVADO na desinstalação.
SectionEnd
