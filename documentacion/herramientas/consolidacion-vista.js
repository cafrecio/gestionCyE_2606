const report = JSON.parse(document.getElementById('report-data').textContent);
const $ = id => document.getElementById(id);
const labels = {yes:'Sí: usar', no:'No: excluir', review:'Por definir', excel:'Sólo Excel', unknown:'Sin selección'};
function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function detail(title, children) {
  const element = node('details');
  element.append(node('summary', title));
  const body = node('div', undefined, 'detail');
  body.append(...children);
  element.append(body);
  return element;
}
document.querySelector('.notice').replaceChildren(
  node('strong', 'Fuentes consolidadas.'),
  node('p', 'No quedan decisiones sin exportar, según tu confirmación. La selección de campos operativos sigue pendiente: usar un dato en Excel no equivale a aprobarlo para la app.')
);
$('stats').replaceChildren(...[
  [report.counts.queries,'consultas Excel'],
  [report.counts.initial,'fuentes de la pantalla'],
  [report.counts.yes,'campos con Sí guardado'],
  [report.counts.no,'campos con No guardado']
].map(([count,label]) => {
  const element = node('div');
  element.append(node('strong',count),document.createTextNode(label));
  return element;
}));
$('rules').replaceChildren(...report.rules.map(text=>node('li',text)));
$('decision').replaceChildren(...[['','Todas'],...Object.entries(labels)].map(([value,label])=>{
  const option=node('option',label);option.value=value;return option;
}));
function populateEntities() {
  const previous=$('entity').value;
  const list=report.endpoints.filter(e=>$('scope').value==='Todos'||e.scope===$('scope').value);
  $('entity').replaceChildren(...[['','Todas'],...list.map(e=>[e.path,e.title])].map(([value,label])=>{
    const option=node('option',label);option.value=value;return option;
  }));
  if(list.some(e=>e.path===previous))$('entity').value=previous;
}
function render() {
  const list=report.endpoints.filter(e=>($('scope').value==='Todos'||e.scope===$('scope').value)&&(!$('entity').value||e.path===$('entity').value));
  const output=[];
  for(const e of list) {
    const search=$('search').value.toLowerCase().trim();
    const rows=e.rows.filter(f=>(!$('decision').value||f.state===$('decision').value)&&(!search||[e.title,e.path,f.name,f.purpose,f.notes,...f.excel.map(x=>x.alias)].join(' ').toLowerCase().includes(search)));
    if(!rows.length)continue;
    const article=node('article',undefined,'endpoint');
    const heading=node('div',undefined,'endpoint-head');
    heading.append(node('h3',e.title),node('code',e.path),node('p',rows.length+' campos · '+e.scope,'muted'));
    const table=node('table');
    const thead=node('thead'), header=node('tr'), tbody=node('tbody');
    header.append(...['Campo ISIS','Decisión','Excel','Origen y observaciones'].map(t=>node('th',t)));
    thead.append(header);
    for(const f of rows) {
      const row=node('tr'),field=node('td'),state=node('td'),excel=node('td'),notes=node('td');
      field.append(node('code',f.name),node('small',f.type));
      state.append(node('span',f.label,'pill '+f.state));
      if(!f.excel.length)excel.textContent='Sin uso final';
      else for(const x of f.excel)excel.append(node('div',x.query),node('small',x.alias));
      for(const text of [f.purpose,f.notes])if(text)notes.append(node('div',text));
      notes.append(node('small',f.source||'Sin decisión exportada'));
      if(f.warning)notes.append(node('small',f.warning));
      row.append(field,state,excel,notes);tbody.append(row);
    }
    table.append(thead,tbody);
    const scroll=node('div',undefined,'table-scroll');scroll.append(table);
    article.append(heading,scroll,detail('Parámetros de consulta ('+e.parameters.length+')',e.parameters.map(p=>{
      const entry=node('p');entry.append(node('code',p.name),document.createTextNode(' · '+(labels[p.decision]||'Por definir')));
      for(const text of [p.purpose,p.notes])if(text)entry.append(node('small',text));
      return entry;
    })));
    if(e.savedMetadata)article.append(detail('Notas y mediciones guardadas',[
      node('p','Antecedentes del respaldo '+e.savedMetadata.source+'. No son pruebas nuevas.'),
      node('pre',JSON.stringify(e.savedMetadata,null,2))
    ]));
    output.push(article);
  }
  $('endpoints').replaceChildren(...(output.length?output:[node('p','No hay campos con estos filtros.','empty')]));
}
populateEntities();
$('entity').value='/api/ISIS_PedidoClteCab_VW';
$('scope').addEventListener('change',()=>{populateEntities();render();});
for(const id of ['entity','decision','search'])$(id).addEventListener('input',render);
render();
$('relations').replaceChildren(...report.relations.map(r=>{
  const row=node('tr');row.append(...r.map(text=>node('td',text)));return row;
}));
$('queries').replaceChildren(...report.queries.map(q=>detail(q.name+' · '+(q.endpoint||q.external.join(', ')||'Combinación local'),[
  node('p',q.derived?'Consulta combinada: ver claves y transformaciones en la fórmula.':q.fields.length+' campos originales conservados; las columnas calculadas están en la fórmula.'),
  node('pre',q.formula)
])));
$('correction-list').replaceChildren(...report.corrections.map(c=>detail(c[0],[node('p',c[1])])));
$('pending').replaceChildren(...report.unresolved.map(p=>{
  const item=node('li');item.append(node('strong',p.title),node('p',p.detail));return item;
}));
$('sources').replaceChildren(...report.sources.map(s=>{
  const item=node('li');item.append(node('strong',s.id),node('p',s.kind));return item;
}));
