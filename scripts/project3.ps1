<#
  project3.ps1 - Mantiene el GitHub Project 3 (jarvinc3/personal-os) en sync.
  Uso:
    pwsh scripts/project3.ps1 check                                   # audita el tablero; exit 1 si hay desajustes
    pwsh scripts/project3.ps1 new   -Repo back -Number 460 -Priority Medium -Size S   # issue nuevo -> Todo
    pwsh scripts/project3.ps1 start -Repo web  -Number 474 [-Pr 491]  # In Progress + Start date (hoy, UTC-4)
    pwsh scripts/project3.ps1 done  -Repo web  -Number 474 [-Pr 491]  # cerrado: Done (+ PR Done); not planned: Cancelado
  Repo: back | web (o el nombre completo personal-os-back / personal-os-web).
  Solo toca campos del tablero. No cierra, reabre ni edita issues.
  El estado Cancelado se busca por nombre; si la opción no existe, check avisa sin fallar.
#>
param(
  [Parameter(Mandatory = $true, Position = 0)][ValidateSet('check', 'new', 'start', 'done')][string]$Action,
  [string]$Repo,
  [int]$Number,
  [int]$Pr,
  [ValidateSet('High', 'Medium', 'Low')][string]$Priority,
  [ValidateSet('S', 'M', 'L')][string]$Size
)
$ErrorActionPreference = 'Stop'
$Owner = 'jarvinc3'
$ProjectNumber = 3
$ProjectId = 'PVT_kwHOCEz1bc4Bfrj8'
$F = @{ Status = 'PVTSSF_lAHOCEz1bc4Bfrj8zhZ8v54'; Priority = 'PVTSSF_lAHOCEz1bc4Bfrj8zhZ8wKE'; Size = 'PVTSSF_lAHOCEz1bc4Bfrj8zhZ8wKI'; Start = 'PVTF_lAHOCEz1bc4Bfrj8zhZ8wKQ' }
$O = @{
  Status   = @{ Backlog = 'b070983b'; Todo = '8e44795f'; 'In Progress' = '52bf9d38'; 'In review' = 'c2e740b7'; Done = 'f4ab08c7' }
  Priority = @{ High = '54221f4c'; Medium = '76acede5'; Low = 'f0f54546' }
  Size     = @{ S = 'fa801935'; M = '30acb7ee'; L = 'd412f5d6' }
}
$Repos = @('personal-os-back', 'personal-os-web')
function Resolve-Repo([string]$r) { switch ($r) { 'back' { 'personal-os-back' } 'web' { 'personal-os-web' } default { $r } } }
function Today { (Get-Date).ToString('yyyy-MM-dd') }   # la PC está en UTC-4

function Invoke-Gql([string]$query, [hashtable]$vars = @{}) {
  $tmp = New-TemporaryFile
  Set-Content -Path $tmp -Value $query -Encoding ascii
  $a = @('api', 'graphql', '-F', "query=@$tmp")
  foreach ($k in $vars.Keys) { if ($vars[$k] -is [int]) { $a += @('-F', "$k=$($vars[$k])") } else { $a += @('-f', "$k=$($vars[$k])") } }
  $out = & gh @a
  Remove-Item $tmp
  if ($LASTEXITCODE -ne 0) { throw "gh api graphql falló" }
  $out | ConvertFrom-Json
}

$ItemFields = @'
id
status: fieldValueByName(name:"Status"){... on ProjectV2ItemFieldSingleSelectValue{name}}
prio: fieldValueByName(name:"Priority"){... on ProjectV2ItemFieldSingleSelectValue{name}}
size: fieldValueByName(name:"Size"){... on ProjectV2ItemFieldSingleSelectValue{name}}
start: fieldValueByName(name:"Start date"){... on ProjectV2ItemFieldDateValue{date}}
'@

# Devuelve el item del Project 3 de un issue o PR; si no está en el proyecto, lo agrega.
function Get-ProjectItem([string]$repo, [int]$n) {
  $q = "query(`$o:String!,`$r:String!,`$n:Int!){ repository(owner:`$o,name:`$r){ issueOrPullRequest(number:`$n){ __typename ... on Issue{ state stateReason url projectItems(first:20){nodes{ project{number} $ItemFields }} } ... on PullRequest{ state url projectItems(first:20){nodes{ project{number} $ItemFields }} } } } }"
  $res = (Invoke-Gql $q @{ o = $Owner; r = $repo; n = $n }).data.repository.issueOrPullRequest
  if (-not $res) { throw "$repo#$n no existe" }
  $item = $res.projectItems.nodes | Where-Object { $_.project.number -eq $ProjectNumber } | Select-Object -First 1
  if (-not $item) {
    $added = gh project item-add $ProjectNumber --owner $Owner --url $res.url --format json | ConvertFrom-Json
    $item = [pscustomobject]@{ id = $added.id; status = $null; prio = $null; size = $null; start = $null }
    Write-Host "Agregado al Project 3: $repo#$n"
  }
  [pscustomobject]@{ Kind = $res.__typename; State = $res.state; Reason = $res.stateReason; Item = $item }
}
function Set-Select([string]$itemId, [string]$field, [string]$value) {
  gh project item-edit --project-id $ProjectId --id $itemId --field-id $F[$field] --single-select-option-id $O[$field][$value] | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "No se pudo poner $field=$value" }
}
function Set-Start([string]$itemId, [string]$date) {
  gh project item-edit --project-id $ProjectId --id $itemId --field-id $F.Start --date $date | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "No se pudo poner Start date" }
}
function Set-Status([string]$itemId, [string]$optionId) {
  gh project item-edit --project-id $ProjectId --id $itemId --field-id $F.Status --single-select-option-id $optionId | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "No se pudo poner Status" }
}
# El id de Cancelado no se fija en el script: la opción se creó después que las
# demás y puede no existir todavía. Se busca por nombre y, si falta, se avisa.
function Get-CancelStatusId {
  $q = 'query($id:ID!){ node(id:$id){ ... on ProjectV2 { field(name:"Status"){ ... on ProjectV2SingleSelectField { options { id name } } } } } }'
  $options = (Invoke-Gql $q @{ id = $ProjectId }).data.node.field.options
  $option = $options | Where-Object { $_.name -eq 'Cancelado' } | Select-Object -First 1
  if ($option) { return $option.id }
  Write-Warning "El estado 'Cancelado' no existe todavía en el Project 3; los issues cerrados como not planned no se pueden mover ni validar."
  return $null
}
function Need-Number { if (-not $Repo -or -not $Number) { throw "Falta -Repo y -Number" } }

switch ($Action) {
  'new' {
    Need-Number; if (-not $Priority -or -not $Size) { throw "Un issue nuevo necesita -Priority y -Size" }
    $r = Get-ProjectItem (Resolve-Repo $Repo) $Number
    Set-Select $r.Item.id Status 'Todo'; Set-Select $r.Item.id Priority $Priority; Set-Select $r.Item.id Size $Size
    Write-Host "OK $Repo#$Number -> Todo / $Priority / $Size"
  }
  'start' {
    Need-Number
    $r = Get-ProjectItem (Resolve-Repo $Repo) $Number
    if ($r.State -ne 'OPEN') { throw "$Repo#$Number no está abierto" }
    if ($Priority) { Set-Select $r.Item.id Priority $Priority } elseif (-not $r.Item.prio) { throw "Sin Priority: pásala con -Priority (ver docs/issue-conventions.md)" }
    if ($Size) { Set-Select $r.Item.id Size $Size } elseif (-not $r.Item.size) { throw "Sin Size: pásala con -Size (ver docs/issue-conventions.md)" }
    Set-Select $r.Item.id Status 'In Progress'
    if (-not $r.Item.start) { Set-Start $r.Item.id (Today) }
    if ($Pr) { $p = Get-ProjectItem (Resolve-Repo $Repo) $Pr; Set-Select $p.Item.id Status 'In Progress' }
    Write-Host "OK $Repo#$Number -> In Progress"
  }
  'done' {
    Need-Number
    $r = Get-ProjectItem (Resolve-Repo $Repo) $Number
    if ($r.State -ne 'CLOSED') { throw "Cierra antes el issue: gh issue close $Number -R $Owner/$(Resolve-Repo $Repo) -c '<cómo se verificó / PR>'" }
    if ($r.Reason -eq 'NOT_PLANNED') {
      $cancelId = Get-CancelStatusId
      if (-not $cancelId) { Write-Host "OK $Repo#$Number sigue cerrado como not planned; el tablero no tiene el estado Cancelado"; exit 0 }
      Set-Status $r.Item.id $cancelId
      Write-Host "OK $Repo#$Number -> Cancelado (not planned)"
      exit 0
    }
    if (-not $r.Item.start) { Set-Start $r.Item.id (Today) }
    Set-Select $r.Item.id Status 'Done'
    if ($Pr) { $p = Get-ProjectItem (Resolve-Repo $Repo) $Pr; Set-Select $p.Item.id Status 'Done' }
    Write-Host "OK $Repo#$Number -> Done (la fecha de cierre la pone GitHub en el campo Closed)"
  }
  'check' {
    $cancelId = Get-CancelStatusId
    $q = "query(`$c:String){ node(id:`"$ProjectId`"){ ... on ProjectV2{ items(first:100, after:`$c){ pageInfo{hasNextPage endCursor} nodes{ type $ItemFields content{ ... on Issue{ number state stateReason repository{name} } ... on PullRequest{ number state repository{name} } } } } } } }"
    $items = @(); $c = $null
    do {
      $v = @{}; if ($c) { $v.c = $c }
      $page = (Invoke-Gql $q $v).data.node.items
      $items += $page.nodes; $c = $page.pageInfo.endCursor
    } while ($page.pageInfo.hasNextPage)
    $problems = New-Object System.Collections.Generic.List[string]
    $inProject = @{}
    foreach ($i in $items) {
      $ct = $i.content; if (-not $ct) { continue }
      $id = "$($ct.repository.name)#$($ct.number)"; $inProject[$id] = $true
      $st = $i.status.name
      if ($i.type -eq 'ISSUE') {
        if (-not $i.prio) { $problems.Add("$id sin Priority") }
        if (-not $i.size) { $problems.Add("$id sin Size") }
        if (-not $st) { $problems.Add("$id sin Status") }
        if ($ct.state -eq 'CLOSED' -and $ct.stateReason -eq 'NOT_PLANNED') {
          if ($cancelId -and $st -ne 'Cancelado') { $problems.Add("$id cerrado como not planned pero en '$st' (debe ser Cancelado)") }
        } elseif ($ct.state -eq 'CLOSED' -and $st -ne 'Done') { $problems.Add("$id cerrado pero en '$st' (debe ser Done)") }
        if ($ct.state -eq 'OPEN' -and ($st -eq 'Done' -or ($cancelId -and $st -eq 'Cancelado'))) { $problems.Add("$id en '$st' pero sigue abierto (ciérralo o vuelve a In Progress)") }
        if ($st -eq 'In Progress' -and -not $i.start) { $problems.Add("$id In Progress sin Start date") }
      } elseif ($i.type -eq 'PULL_REQUEST') {
        if ($ct.state -eq 'MERGED' -and $st -ne 'Done') { $problems.Add("PR $id fusionado pero en '$st' (debe ser Done)") }
        if ($ct.state -eq 'OPEN' -and $st -ne 'In Progress') { $problems.Add("PR $id abierto pero en '$st' (debe ser In Progress)") }
      }
    }
    foreach ($r in $Repos) {
      $open = gh issue list -R "$Owner/$r" --state open --limit 500 --json number | ConvertFrom-Json
      foreach ($o in $open) { if (-not $inProject["$r#$($o.number)"]) { $problems.Add("$r#$($o.number) abierto y fuera del Project 3") } }
    }
    if ($problems.Count -eq 0) { Write-Host "Project 3 en orden ($($items.Count) items)"; exit 0 }
    Write-Host "Project 3: $($problems.Count) desajustes"; $problems | ForEach-Object { Write-Host " - $_" }
    exit 1
  }
}
