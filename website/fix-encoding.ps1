# Fix mojibake: file was read as Windows-1252 and re-saved as UTF-8
# Strategy: read UTF-8 -> re-encode each char as Latin-1 byte -> re-decode as UTF-8

$filePath = "C:\Users\gonca\Desktop\crossers\index.html"

$utf8   = [System.Text.Encoding]::UTF8
$latin1 = [System.Text.Encoding]::GetEncoding(28591)  # ISO-8859-1

# Read the corrupted file as UTF-8 text
$corruptText = [System.IO.File]::ReadAllText($filePath, $utf8)

# Convert back: encode as Latin-1 (undoing the wrong read), then decode as UTF-8
$latin1Bytes = $latin1.GetBytes($corruptText)
$fixedText   = $utf8.GetString($latin1Bytes)

# Save without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($filePath, $fixedText, $utf8NoBom)

Write-Output "Done. File size: $(([System.IO.FileInfo]$filePath).Length) bytes"
Write-Output "Sample check:"
$sample = $fixedText.Substring(0, [Math]::Min(500, $fixedText.Length))
Write-Output $sample
