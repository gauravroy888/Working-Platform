param([string]$DocPath)

Add-Type -AssemblyName System.IO.Compression.FileSystem
$TempPath = "$env:TEMP\docx_extract_temp"

if (Test-Path $TempPath) { Remove-Item -Recurse -Force $TempPath }
New-Item -ItemType Directory -Path $TempPath | Out-Null

[System.IO.Compression.ZipFile]::ExtractToDirectory($DocPath, $TempPath)

$XmlPath = Join-Path $TempPath "word\document.xml"
$Xml = [xml](Get-Content $XmlPath)

$NamespaceManager = New-Object System.Xml.XmlNamespaceManager($Xml.NameTable)
$NamespaceManager.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$Nodes = $Xml.SelectNodes("//w:t", $NamespaceManager)
foreach ($Node in $Nodes) {
    Write-Output $Node.InnerText
}
