!include LogicLib.nsh
!include nsDialogs.nsh
!include WinMessages.nsh
!include FileFunc.nsh
!include x64.nsh

ManifestDPIAware true

Var /GLOBAL openOllamaPage
Var /GLOBAL checkboxControl

!define OLLAMA_URL "https://ollama.com/download"

!macro customInit
  StrCpy $openOllamaPage 0
!macroend

!macro customFinishPage
  Page custom OllamaPageShow OllamaPageLeave
!macroend

Function OllamaPageShow
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  # Group box to frame the section
  ${NSD_CreateGroupBox} 0 0 100% 140u "Ollama Setup"
  Pop $1

  # Title
  ${NSD_CreateLabel} 10u 10u 100% 15u "✅ Installation completed Successfully!"
  Pop $2

  # Info text
  ${NSD_CreateLabel} 10u 30u 90% 20u "Ollama is required to run MindWell locally. It provides AI models for inference."
  Pop $3

  ${NSD_CreateLabel} 10u 48u 90% 20u "Would you like to launch the Ollama installer now?"
  Pop $4

  # Checkbox
  ${NSD_CreateCheckbox} 10u 70u 90% 12u "✔ Run Ollama Setup (Recommended)"
  Pop $checkboxControl
  ${NSD_SetState} $checkboxControl ${BST_CHECKED}

  # Footer note about manual install
  ${NSD_CreateLabel} 10u 88u 90% 20u "You can also run the setup manually later from the Program Files folder."
  Pop $5

  # ⚠️ Warning about model download
  ${NSD_CreateLabel} 10u 108u 90% 24u "Note: A ~2GB AI model will be downloaded during the first run. Additional models may be downloaded later."
  Pop $6

  # Red text on light yellow background for more emphasis
  SetCtlColors $6 0xFF0000 0xFFFFE0

  CreateFont $R0 "MS Shell Dlg" 8 700  ; 700 = bold weight
  SendMessage $6 ${WM_SETFONT} $R0 0

  nsDialogs::Show
FunctionEnd

Function OllamaPageLeave
  ${NSD_GetState} $checkboxControl $openOllamaPage

  ${If} $openOllamaPage == "1"
    DetailPrint "🚀 Running Ollama Setup..."
    ExecShell "open" "$INSTDIR\resources\assets\OllamaSetup.exe"
  ${Else}
    DetailPrint "🛑 User chose not to run Ollama Setup."
  ${EndIf}
FunctionEnd
