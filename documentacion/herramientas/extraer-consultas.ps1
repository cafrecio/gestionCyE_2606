$ErrorActionPreference = 'Stop'
$root = 'C:\xampp\htdocs\gestionCyE_2606\documentacion'
$out = Join-Path $root 'fuentes-consolidacion'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$path = 'Z:\Gestion CyE\10 ISIS\GestionCyEBase 2604_v1.22.xlsm'
function Get-SharedHash([string]$file) {
  $stream = [IO.File]::Open($file, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
  $sha = [Security.Cryptography.SHA256]::Create()
  try { return [Convert]::ToHexString($sha.ComputeHash($stream)) }
  finally { $sha.Dispose(); $stream.Dispose() }
}
$before = Get-SharedHash $path
$xl = New-Object -ComObject Excel.Application
$book = $null
try {
  $xl.Visible = $false
  $xl.DisplayAlerts = $false
  $xl.EnableEvents = $false
  $xl.AutomationSecurity = 3
  $xl.AskToUpdateLinks = $false
  $book = $xl.Workbooks.Open($path, 0, $true)
  $queries = @()
  foreach ($query in $book.Queries) {
    $formula = [string]$query.Formula
    $endpoints = @([regex]::Matches($formula, 'https://[^"\s]+') | ForEach-Object { $_.Value })
    $formula = [regex]::Replace($formula, '(?im)^.*(?:X-API-KEY|Authorization|api[_-]?key).*$',
      '    Origen = FUENTE_API_SIN_CREDENCIALES,')
    if ($formula -match '(?i)\b[0-9a-f]{48,}\b') { throw 'Posible secreto restante en consulta; extraccion detenida.' }
    $queries += [pscustomobject]@{name=$query.Name; endpoints=$endpoints; formula=$formula}
  }
  $tables = @()
  foreach ($sheet in $book.Worksheets) {
    foreach ($table in $sheet.ListObjects) {
      $headers = @()
      for ($c=1; $c -le $table.ListColumns.Count; $c++) { $headers += [string]$table.ListColumns.Item($c).Name }
      $tables += [pscustomobject]@{sheet=$sheet.Name;name=$table.Name;rows=$table.ListRows.Count;columns=$headers}
    }
  }
  $result = [pscustomobject]@{
    source=$path; sha256=$before; extractedAt=(Get-Date).ToString('o')
    queries=$queries; tables=$tables; sheetCount=$book.Worksheets.Count
    note='Solo consultas y metadatos. Sin credenciales ni filas comerciales. Sin refrescar conexiones.'
  }
  $result | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $out 'excel-consultas-sin-credenciales.json') -Encoding utf8
} finally {
  if ($null -ne $book) { $book.Close($false) }
  $xl.Quit()
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($xl)
}
$after=Get-SharedHash $path
if ($before -ne $after) { throw 'El hash del Excel cambio durante la lectura.' }
[pscustomobject]@{Queries=$queries.Count;Tables=$tables.Count;WorkbookUnchanged=($before -eq $after)} | ConvertTo-Json
