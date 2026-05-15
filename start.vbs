Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

currentFolder = fso.GetParentFolderName(WScript.ScriptFullName)

WshShell.Run "cmd /c cd /d """ & currentFolder & """ && node index.js", 0, False
