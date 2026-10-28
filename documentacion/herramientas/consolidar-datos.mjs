import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const root = 'C:/xampp/htdocs/gestionCyE_2606/documentacion';
const sourcesDir = path.join(root, 'fuentes-consolidacion');
const read = p => fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const json = p => JSON.parse(read(p));
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe = v => {
  const s=typeof v==='string'?v:JSON.stringify(v);
  if (/\b[a-f0-9]{48,}\b/i.test(s.replace(/"sha256"\s*:\s*"[^"]*"/g,''))) throw Error('Posible secreto en contenido; no se publica.');
};
const sourceRecords=[];
function source(p, kind) {
  const id=path.basename(p);
  if(!sourceRecords.some(s=>s.path===p))sourceRecords.push({id,path:p,kind,sha256:hash(p)});
  return id;
}
const workbook=json(path.join(sourcesDir,'excel-consultas-sin-credenciales.json'));
source(path.join(sourcesDir,'excel-consultas-sin-credenciales.json'),'Excel sanitizado');
const htmlPath=path.join(root,'analisis-api-isis.html');
source(htmlPath,'Catálogo HTML; sus valores por defecto no son decisiones del usuario');
const catalogText=read(htmlPath).match(/const catalog\s*=\s*(\[[\s\S]*?\]);/)[1];
const catalog=JSON.parse(JSON.stringify(vm.runInNewContext('('+catalogText+')',{}, {timeout:1000})));
const swFiles=['isis-swagger-current.json','isis-swagger-v1.json'];
const swagger=swFiles.map(n=>{source(path.join(root,n),'Esquema local; no prueba de API en vivo');return {name:n,data:json(path.join(root,n))};});
const docs=['04-modulo-1-seguimiento-comercial-operativo.md','06-evaluacion-endpoints-isis.md','07-relevamiento-excel-gestion-base.md','08-estructura-isis-primeras-pantallas.md','ARQUITECTURA.md','CONTEXTO_IA.md','SPRINTS.md'];
docs.forEach(n=>source(path.join(root,n),'Documento de contexto'));
source(path.join(root,'relevamiento-campos-isis-articulos-stock.xlsx'),'Planilla inicial revisada: sin decisiones; CSV dentro de columna A');
source(path.join(root,'Ejemplo basico pantalla principal.xlsx'),'Referencia de pantalla; datos de ejemplo, no decisiones de campos');
const backupPaths=[
 ...fs.readdirSync(path.join(root,'respaldos-api-isis')).filter(n=>n.endsWith('.json')).map(n=>path.join(root,'respaldos-api-isis',n)),
 ...fs.readdirSync('C:/Users/cafre/Downloads').filter(n=>/^analisis-api-isis.*\.json$/.test(n)).map(n=>path.join('C:/Users/cafre/Downloads',n))
];
const seen=new Set();
const backups=backupPaths.map(p=>({p,data:json(p),sha256:hash(p)}))
 .filter(b=>{if(seen.has(b.sha256))return false;seen.add(b.sha256);return true;})
 .sort((a,b)=>String(a.data.exportedAt).localeCompare(String(b.data.exportedAt)));
for(const b of backups){
  // Backup objects contain decisions, not API headers. Check before copying.
  safe(b.data);
  const dest=path.join(sourcesDir,path.basename(b.p));
  if(path.resolve(dest)!==path.resolve(b.p))fs.copyFileSync(b.p,dest);
  b.source=source(dest,'Respaldo de decisiones');
}
const latest=backups.at(-1);
const pendingBrowser=false; // Aclaracion final del usuario: no quedaron cambios sin exportar.
const decisions={};
for(const b of backups){
 for(const [id,ep] of Object.entries(b.data.decisions||{})){
  decisions[id] ||= {fields:{},parameters:{},history:[]};
  const d=decisions[id];d.status=ep.status;d.source=b.source;
  for(const key of ['area','purpose','metrics','update','notes'])if(ep[key]!==undefined)d[key]=ep[key];
  d.history.push({source:b.source,exportedAt:b.data.exportedAt,status:ep.status});
  for(const group of ['fields','parameters'])for(const [name,value] of Object.entries(ep[group]||{})){
   const prev=d[group][name];
   d[group][name]={...value,source:b.source,history:[...(prev?.history||[]),{source:b.source,...value}]};
  }
 }
}

// Small structural reader for the M operations present in this workbook.
// It does not execute formulas or connect to ISIS.
function skipString(s,i){
 i++;while(i<s.length){if(s[i]==='"'){if(s[i+1]==='"'){i+=2;continue;}return i+1;}i++;}throw Error('Cadena M incompleta');
}
function splitTop(s){
 const out=[];let start=0,depth=0;
 for(let i=0;i<s.length;i++){
  if(s[i]==='"'){i=skipString(s,i)-1;continue;}
  if('({['.includes(s[i]))depth++;
  if(')}]'.includes(s[i]))depth--;
  if(s[i]===','&&depth===0){out.push(s.slice(start,i).trim());start=i+1;}
 }
 out.push(s.slice(start).trim());return out;
}
function stripComments(s){
 let out='';
 for(let i=0;i<s.length;){
  if(s[i]==='"'){const end=skipString(s,i);out+=s.slice(i,end);i=end;}
  else if(s.slice(i,i+2)==='//'){const end=s.indexOf('\n',i);i=end<0?s.length:end;}
  else if(s.slice(i,i+2)==='/*'){const end=s.indexOf('*/',i+2);i=end<0?s.length:end+2;}
  else out+=s[i++];
 }return out;
}
function mValue(s){
 s=s.trim();
 if(s[0]==='{')return splitTop(s.slice(1,-1)).filter(Boolean).map(mValue);
 if(s[0]==='"')return s.slice(1,-1).replace(/""/g,'"');
 return s;
}
function tableCalls(formula){
 const text=stripComments(formula);const re=/Table\.([A-Za-z]+)\s*\(/g;let m;const calls=[];
 while((m=re.exec(text))){
  let end=re.lastIndex,depth=1;
  for(;end<text.length;end++){if(text[end]==='"'){end=skipString(text,end)-1;continue;}if(text[end]==='(')depth++;if(text[end]===')'&&--depth===0)break;}
  calls.push({op:m[1],args:splitTop(text.slice(re.lastIndex,end)),text:text.slice(m.index,end+1)});
  re.lastIndex=end+1;
 }return calls;
}
const queryAnalyses=workbook.queries.map(q=>{
 const ep=(q.endpoints||[]).find(e=>e.includes('/api/'));
 const map=new Map(), expanded=[],usedFilters=[],ops=tableCalls(q.formula);
 for(const {op,args,text} of ops){
  if(op==='ExpandRecordColumn'){
   const src=mValue(args[2]),dst=args[3]?mValue(args[3]):src;
   if(!Array.isArray(src)||!Array.isArray(dst))continue;
   src.forEach((f,i)=>{map.set(dst[i],f);expanded.push(f);});
  }
  if(op==='SelectColumns'){
   const keep=mValue(args[1]);if(Array.isArray(keep))for(const k of map.keys())if(!keep.includes(k))map.delete(k);
  }
  if(op==='RemoveColumns'){const drop=mValue(args[1]);for(const k of Array.isArray(drop)?drop:[drop])map.delete(k);}
  if(op==='RenameColumns'){
   const pairs=mValue(args[1]);if(Array.isArray(pairs))for(const [a,b] of pairs){if(map.has(a)){const v=map.get(a);map.delete(a);map.set(b,v);}}
  }
  if(op==='SelectRows')usedFilters.push(text);
 }
 const fields=[...map].map(([local,original])=>({original,local}));
 return {name:q.name,endpoint:ep?new URL(ep).pathname:null,external:(q.endpoints||[]).filter(u=>!u.includes('/api/')),fields,expanded:[...new Set(expanded)],filters:usedFilters,formula:q.formula,
   derived:!ep&&(q.endpoints||[]).length===0,joins:ops.filter(c=>c.op==='NestedJoin').map(c=>c.text),
   calculatedColumns:ops.filter(c=>c.op==='AddColumn').map(c=>({name:mValue(c.args[1]),expression:c.args[2]}))};
});
const mainPaths=[
'/api/ISIS_PedidoClteCab_VW','/api/ISIS_PedidoClteDet_VW','/api/ISIS_VentasCabecera_VW','/api/ISIS_VentasDetalle_VW','/api/ISIS_VentasDetalLeFCAnti_VW',
'/api/ISIS_RemitoClienteCabecera_VW','/api/ISIS_RemitoClienteDetalle_VW','/api/ISIS_OperacionesClienteImputacion_VW',
'/api/ISIS_Articulo_VW','/api/ISIS_ArticuloStock_VW','/api/ISIS_Cliente_VW','/api/ISIS_Vendedor_VW'];
const referencePaths=['/api/ISIS_CondicionPago_VW','/api/ISIS_ListaPrecios_VW','/api/ISIS_Moneda_VW','/api/ISIS_API_Comprobantes'];
const pathNames={
ISIS_PedidoClteCab_VW:'Pedidos · cabecera',ISIS_PedidoClteDet_VW:'Pedidos · líneas',
ISIS_VentasCabecera_VW:'Facturas · cabecera',ISIS_VentasDetalle_VW:'Facturas · detalle normal',
ISIS_VentasDetalLeFCAnti_VW:'Facturas anticipadas · detalle',ISIS_RemitoClienteCabecera_VW:'Remitos · cabecera',
ISIS_RemitoClienteDetalle_VW:'Remitos · detalle',ISIS_OperacionesClienteImputacion_VW:'Recibos · imputaciones',
ISIS_Articulo_VW:'Artículos',ISIS_ArticuloStock_VW:'Stock',ISIS_Cliente_VW:'Clientes',ISIS_Vendedor_VW:'Vendedores',
ISIS_CondicionPago_VW:'Condiciones de pago',ISIS_ListaPrecios_VW:'Listas de precios',ISIS_Moneda_VW:'Monedas',ISIS_API_Comprobantes:'Tipos de comprobante'};
const rules=[
'Primera entrega: pantalla de pedidos activos y sus líneas. FC, REM y RC vienen de ISIS; Taller y Entrega son manuales.',
'Terminado = tiene al menos una FC + al menos un REM + al menos un RC relacionado + entrega completa confirmada. Taller no agrega condición.',
'El pedido terminado sale de la lista activa con todas sus líneas y conserva historial. No se requiere calcular saldos ni cobertura de cantidades en esta etapa.',
'Empresa 1 y depósito operativo 1. Se excluye depósito 80 (Reserva), según el respaldo de Stock. Un punto de venta.',
'Los documentos se sincronizan automáticamente en segundo plano. Maestros: barrido nocturno y altas puntuales automáticas si un documento los referencia; cambios de maestros existentes bajo demanda.',
'No duplicar nombres de vendedores en cada entidad como maestro paralelo; relacionar por código. Las descripciones documentales y del artículo pueden tener valor histórico distinto del maestro.',
'CUIT válido para clientes y proveedores; códigos ISIS visibles. La depuración de CUIT duplicados sigue pendiente. No fusionar códigos destruyendo trazabilidad.',
'Contactos y sucursales serán locales. No son requisitos adicionales de la primera pantalla acotada. OT, logística automática, compras, certificados, avisos y cotizaciones quedan para después.',
'Un documento puede relacionarse con varios pedidos y viceversa. No multiplicar líneas por combinar todos los documentos; no inventar una relación de línea sólo por código de artículo.',
'No confundir cantidad de stock con reserva o disponibilidad futura. cantCompra y cantVenta no se usarán como pendientes.',
'Los Sí/No de respaldos se preservan. Un campo seleccionado en Excel no queda automáticamente aprobado para GestionCyE. Una propuesta de otra IA tampoco es una aprobación.',
'Las mediciones existentes son antecedentes de 2026, no nuevas pruebas de esta consolidación. No se consultó la API durante la tarea 1.'
];
const corrections=[
['El borrador 08 reducía Artículos a 9 campos','El último respaldo disponible tiene 23 Sí, 38 No y 5 Revisar. Se conservan todos, aunque algunos sean para etapas futuras.'],
['Clientes del borrador incluía descrCondiPago y omitía otros Sí','Preservar 14 Sí del respaldo, incluidos fechaUltimoRecCli y codProveAsociado. descrCondiPago está marcado No en cliente; se obtiene del catálogo.'],
['El relevamiento registraba 19 consultas','El archivo actual tiene 23: incorporó remCab, remDet, remCom y rcBase. Las mediciones históricas se conservan fechadas.'],
['Se afirmó que Excel quitaba flete y destino del remito','remCab conserva codigoFlete, razonSocialFlete y lugarEntrega. Corregido en esta consolidación.'],
['Se descartaba el vínculo de remito por falta de cabecera anticipada','El detalle remito.regis_FCAntiDet permite intentar el cruce con detalle anticipado y desde allí con pedido. Pendiente de prueba real.'],
['Se proponía obtener recibos nuevos en VentasCabecera','Es una hipótesis sin prueba. No es una estrategia validada ni un requisito de selección de campos.'],
['IVACondicion reaparece en respaldos antiguos','Se conserva como decisión descartada por el usuario, sin reintroducirla al alcance.'],
['Moneda se describía como código y descripción','El catálogo HTML/Swagger debe verificarse: no inventar un ID cuando sólo publica descripción y signo.'],
['Filtro de Excel pedCab acepta empresa 4','Para GestionCyE prevalece empresa 1, confirmada por el usuario.'],
['Regla de cierre se confundía con saldo cancelado','Para esta pantalla rige presencia de FC, REM, RC y entrega manual. Los importes no bloquean la trazabilidad.']
];
const unresolved=[
{kind:'Siguiente tarea',title:'Selección de campos operativos',detail:'Pedidos, facturas, remitos e imputaciones tienen evidencia de uso en Excel, no una selección explícita para la app. Revisarlos por entidad con el usuario, sin repetir las decisiones ya guardadas.'},
{kind:'Prueba posterior',title:'Nombres de Pedido Detalle',detail:'El Excel usa regisPedCliCab, regisPedCliDet y cantiPedidaUmp. Los Swagger locales pueden publicar variantes con guiones bajos. Validar el contrato real antes de programar el adaptador.'},
{kind:'Decisión posterior',title:'Estados manuales y línea visible',detail:'Definir opciones de Taller y Entrega y qué significa PEDIDO LINEA visualmente. El ID interno no prueba una posición correlativa.'},
{kind:'Prueba posterior',title:'Sincronización y relaciones documentales',detail:'Medir consultas, validar cruces normales/anticipados/parciales y actualizar documentos antiguos modificados. No corresponde darlas por probadas en la tarea 1.'}
];
const endpointSet=new Set([...mainPaths,...referencePaths,...catalog.map(e=>e.name),...backups.flatMap(b=>(b.data.catalog||[]).map(e=>e.name)),...queryAnalyses.map(q=>q.endpoint).filter(Boolean)]);
function shape(sw,p){
 const op=sw.paths?.[p]?.get;if(!op)return null;
 const c=op.responses?.['200']?.content||{};let s=(c['application/json']||Object.values(c)[0])?.schema;
 if(s?.type==='array')s=s.items;
 let ref=s?.$ref;
 if(ref)s=sw.components.schemas[ref.split('/').at(-1)];
 return {op,ref,fields:s?.properties||{}};
}
const labels={yes:'Sí: usar',no:'No: excluir',review:'Por definir',excel:'Sólo Excel',proposal:'Propuesto en borrador',unknown:'Sin selección'};
const endpoints=[...endpointSet].filter(Boolean).map(p=>{
 const cat=catalog.find(e=>e.name===p)||backups.flatMap(b=>b.data.catalog||[]).find(e=>e.name===p);
 const id=cat?.id||p.split('/').at(-1);
 const dec=decisions[id];
 const qs=queryAnalyses.filter(q=>q.endpoint===p);
 const variants=swagger.map(s=>({source:s.name,...shape(s.data,p)})).filter(v=>v.op);
 const primary=variants[0];
 const fields=new Set([...(cat?.fields||[]).map(f=>f.name),...Object.keys(dec?.fields||{}),...variants.flatMap(v=>Object.keys(v.fields)),...qs.flatMap(q=>q.expanded)]);
 const rows=[...fields].map(name=>{
  const choice=dec?.fields[name];
  const excel=qs.flatMap(q=>q.fields.filter(f=>f.original===name).map(f=>({query:q.name,alias:f.local})));
  const mentioned=qs.filter(q=>q.expanded.includes(name)).map(q=>q.name);
  const schema=variants.flatMap(v=>v.fields[name]?[{source:v.source,...v.fields[name]}]:[]);
  const fromCatalog=cat?.fields?.find(f=>f.name===name);
  const state=choice?.decision|| (excel.length?'excel':'unknown');
  const normalized=name.replace(/_/g,'').toLowerCase();
  const alternative=[...fields].filter(n=>n!==name&&n.replace(/_/g,'').toLowerCase()===normalized);
  return {name,state,label:labels[state],source:choice?.source||null,purpose:choice?.purpose||'',notes:choice?.notes||'',
    history:choice?.history||[],excel,mentioned,schema,
    type:schema.length?schema.map(s=>s.type+(s.format?' ('+s.format+')':'')+(s.nullable?' · nullable':'')).filter((v,i,a)=>a.indexOf(v)===i).join(' / '):(fromCatalog?.type||'No documentado'),
    alternateNames:alternative,
    warning:alternative.length?'Diferencia de nombre; equivalencia pendiente':(!schema.length&&excel.length?'Campo de Excel no encontrado en estos esquemas':'')};
 });
 const params=new Set([...(cat?.parameters||[]).map(f=>f.name),...Object.keys(dec?.parameters||{}),...variants.flatMap(v=>(v.op.parameters||[]).map(f=>f.name))]);
 const scope=mainPaths.includes(p)?'Pantalla inicial':referencePaths.includes(p)?'Catálogo relacionado':/IvaCondicion|IVACondicion|ClienteConSucursales|ClienteSucursales/i.test(p)?'Descartado':'Etapa posterior';
 return {id,path:p,title:pathNames[p.split('/').at(-1)]||cat?.purpose||p.split('/').at(-1),scope,
   status:scope==='Descartado'?'Descartado por el usuario':dec?.status||cat?.status||'review',
   parameters:[...params].map(n=>({name:n,...dec?.parameters[n],types:variants.flatMap(v=>(v.op.parameters||[]).filter(x=>x.name===n).map(x=>({source:v.source,schema:x.schema})))})),
   rows,queries:qs.map(q=>q.name),metrics:dec?.metrics||cat?.metrics||null,
   savedMetadata:dec?{source:dec.source,area:dec.area,purpose:dec.purpose,metrics:dec.metrics,update:dec.update,notes:dec.notes}:null,
   counts:Object.fromEntries(Object.keys(labels).map(s=>[s,rows.filter(f=>f.state===s).length]))};
}).sort((a,b)=>{
 const order=p=>mainPaths.indexOf(p)>=0?mainPaths.indexOf(p):referencePaths.indexOf(p)>=0?100+referencePaths.indexOf(p):200;
 return order(a.path)-order(b.path)||a.title.localeCompare(b.title);
});
const relations=[
['Pedido → líneas','regis_PedCliCab ↔ regisPedCliCab (variante en Excel)','1 a N','pedCom lo usa; nombre JSON real pendiente'],
['Artículo → stock','codInternoArti = codArticulo; empresa 1, depósito 1','1 a 1 después de filtros','Cruce usado en artStck'],
['Pedido → vendedor','codigVendedor → catálogo de vendedores','N a 1','Nombre visual resuelto por código'],
['Factura normal → pedido','VentasDetalle: descrCpbtePedido + numeroCpbtePedido + empresa heredada de cabecera','N a M posible','Conservar tipo y número; no unir sólo por número'],
['Factura → detalle','regis_CliTra','1 a N','fcCom agrega número en su join de Excel'],
['Remito → detalle','regis_RtoCliCab','1 a N','remCom del Excel actual'],
['Remito → pedido','RemitoCabecera.regis_PedCliCab','N a 1 directo cuando informado','No inventar vínculo si nulo'],
['Remito anticipado → factura anticipada','RemitoDetalle.regis_FCAntiDet = VentasDetalleFCAnti.regis_FCAntiDet','N a 1 por detalle','Luego numeroCpbtePedido; pendiente prueba'],
['Recibo → factura','regTraRC_ImpuCli → regis_ImpuCli → regTraFC_ImpuCli = regis_CliTra','N a M','Imputaciones; volver por detalles normales o anticipados al pedido'],
['Factura normal ↔ remito','descrCpbteRemito + nroSistemaCpbteRemito + empresa','N a M','Validar sistema vs preimpreso; no equiparar números por intuición']
];
const counts={endpoints:endpoints.length,initial:endpoints.filter(e=>e.scope==='Pantalla inicial').length,fields:endpoints.reduce((n,e)=>n+e.rows.length,0),
yes:endpoints.reduce((n,e)=>n+e.counts.yes,0),no:endpoints.reduce((n,e)=>n+e.counts.no,0),queries:queryAnalyses.length};
const report={version:1,date:'2026-09-17',task:'Cruzar fuentes y preservar decisiones',complete:true,pendingBrowser,latestExport:latest?.data.exportedAt,
 decisionScope:'Consolidación documental completa. La selección definitiva de campos operativos y las pruebas de relaciones siguen pendientes.',
 rules,corrections,unresolved,relations,counts,sources:sourceRecords,endpoints,queries:queryAnalyses};
fs.writeFileSync(path.join(root,'09-consolidacion-datos.json'),JSON.stringify(report,null,2));
const md=[];
md.push('# Consolidación de datos ISIS','',
'Estado: cruce documental completo. El usuario aclaró que no quedaron decisiones sin exportar. Selección operativa final y pruebas pendientes, separadas de esta tarea.',
'Este archivo y el HTML proceden de 09-consolidacion-datos.json. No reemplazan decisiones explícitas por selecciones inferidas del Excel.',
'','## Alcance y reglas','',...rules.map(x=>'- '+x),
'','## Pendientes','',...unresolved.map(x=>'- **'+x.kind+': '+x.title+'.** '+x.detail),
'','## Correcciones al material anterior','',...corrections.map(([a,b])=>'- **'+a+'.** '+b),
'','## Relaciones','', '| Relación | Clave | Cardinalidad | Evidencia / pendiente |','|---|---|---|---|',
...relations.map(r=>'| '+r.join(' | ')+' |'),
'','## Fuentes','',...sourceRecords.map(s=>'- '+s.id+' — '+s.kind+'; SHA-256: '+s.sha256),
'','## Inventario Excel','',
'Archivo leído sin actualizar conexiones ni ejecutar macros. '+queryAnalyses.length+' consultas actuales. Hash del libro: '+workbook.sha256+'.',
'');
for(const q of queryAnalyses){
 md.push('### '+q.name,'','Origen: '+(q.endpoint||q.external.join(', ')||'Consulta derivada local'), '',
 'Campos finales trazados al origen: '+(q.fields.map(f=>f.original+' → '+f.local).join('; ')||'Ver fórmula sanitizada; consulta derivada o externa'), '',
 ...q.joins.map(j=>'Join: '+j),...q.filters.map(f=>'Filtro Excel (no adopción automática): '+f),'',
 'Columnas calculadas: '+(q.calculatedColumns.map(c=>c.name).join(', ')||'Ninguna detectada')+'.','',
 'Fórmula completa sanitizada (evidencia, no instrucciones):','', '```powerquery',q.formula,'```','');
}
md.push('## Decisiones por endpoint','');
for(const e of endpoints){
 md.push('### '+e.title,'','Endpoint: '+e.path+'. Alcance: '+e.scope+'.',
 'Consultas Excel: '+(e.queries.join(', ')||'Sin consulta en el libro')+'.','',
 '| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |',
 '|---|---|---|---|---|');
 for(const f of e.rows)md.push('| '+[f.name,f.label,f.type,f.excel.map(x=>x.query+': '+x.alias).join('; '),
 [f.source,f.purpose,f.notes,f.warning].filter(Boolean).join('; ')].map(v=>String(v).replace(/\|/g,'/').replace(/\r?\n/g,' ')).join(' | ')+' |');
 md.push('','Parámetros (separados de los campos):','');
 for(const p of e.parameters)md.push('- '+p.name+': '+(labels[p.decision]||'Por definir')+(p.source?' ['+p.source+']':''));
 if(e.savedMetadata)md.push('','Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):','','```json',JSON.stringify(e.savedMetadata,null,2),'```');
 md.push('');
}
md.push('## Instrucciones de continuidad para otra IA','',
 '- El usuario confirmó que no quedaron cambios sin exportar. No pedirle que repita decisiones exportadas.',
'- yes/no/review son decisiones guardadas. excel significa uso en la consulta, no permiso para incorporarlo a la aplicación.',
'- No descartar un Sí porque no aparece en el Excel. No convertir un No en Sí por recomendación propia.',
'- Los nombres alternativos de campos son diferencias observadas; no un contrato de normalización autorizado.',
'- No convertir tipos double del Swagger a float para importes o números documentales sin definir representación local.',
'- La regla de cierre actual es documental y entrega manual. No añadir pago completo, Taller terminado ni módulos futuros.',
'- Verificar claves documentales y sincronización en tareas posteriores. No afirmar que una consulta se probó por existir en Swagger.',
'- No publicar ni incluir credenciales en documentación o HTML.',
'');
fs.writeFileSync(path.join(root,'09-consolidacion-datos.md'),md.join('\n'));

const dataJson=JSON.stringify(report).replace(/</g,'\\u003c');
const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
'<title>Gestión CyE · Consolidación de datos</title><style>'+
'*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,sans-serif;color:#27323a;background:#f5f7f9;letter-spacing:0}header{background:#fff;border-bottom:4px solid #009cb5;padding:22px 30px}h1{font-size:25px;margin:0}h2{font-size:21px;margin:0 0 14px}h3{font-size:17px}p{margin:8px 0 14px}.muted{color:#596772}.layout{display:grid;grid-template-columns:242px minmax(0,1fr);max-width:1600px;margin:auto}aside{padding:22px 16px;background:#30383e;color:white;min-height:100vh}nav{position:sticky;top:15px;display:grid;gap:6px}nav a{color:white;padding:9px 12px;text-decoration:none;border-radius:4px}nav a:hover,nav a:focus{background:#47565f}main{min-width:0;padding:28px 30px}section{margin-bottom:36px;scroll-margin-top:16px}.notice{border-left:4px solid #cf9d2c;background:#fff5dc;padding:15px 18px;margin-bottom:22px}.stats{display:flex;gap:24px;flex-wrap:wrap;padding:10px 0 20px;border-bottom:1px solid #d8e0e5;margin-bottom:20px}.stats strong{display:block;font-size:23px;color:#006f83}.tools{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px}label{display:grid;gap:4px;font-weight:600}select,input{min-height:40px;border:1px solid #bdcbd4;border-radius:4px;font:inherit;padding:6px 10px;background:#fff;max-width:100%}select{max-width:340px}input{width:275px}details{background:#fff;border:1px solid #d8e0e5;border-radius:4px;margin:12px 0}summary{cursor:pointer;padding:14px;font-weight:650;overflow-wrap:anywhere}.detail{padding:0 16px 18px}.table-scroll{overflow:auto;max-width:100%}table{border-collapse:collapse;width:100%;background:white;font-size:14px}th{text-align:left;background:#e9f1f5;padding:10px;border-bottom:2px solid #c6d4de}td{padding:10px;border-bottom:1px solid #e0e6eb;vertical-align:top}code{font:13px/1.5 ui-monospace,monospace;overflow-wrap:anywhere}td code{display:block;min-width:160px}th:nth-child(1){width:25%}td small{display:block;color:#5b6771;margin-top:4px}.pill{display:inline-block;border-radius:4px;padding:3px 7px;font-size:12px;font-weight:650}.yes{background:#daf1e4;color:#155b37}.no{background:#f8e5e5;color:#8b3535}.review,.unknown{background:#fff0c8;color:#745414}.excel{background:#e4eefb;color:#244f83}a{color:#007a92}pre{font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f4f6;padding:14px}.list li{margin-bottom:9px}.empty{padding:22px;color:#5b6771}.endpoint{margin-bottom:24px}.endpoint-head{border-bottom:2px solid #009cb5;padding:8px 0}.source-list{padding-left:20px}.source-list li{margin-bottom:10px;overflow-wrap:anywhere}.print{display:none}@media(max-width:800px){.layout{display:block}aside{min-height:0;padding:10px}nav{position:static;display:flex;overflow:auto;gap:4px}nav a{white-space:nowrap;font-size:13px}main{padding:18px 14px}header{padding:18px 14px}h1{font-size:22px}.tools{display:grid;grid-template-columns:1fr}select,input{width:100%;max-width:100%}.stats{gap:18px}table{min-width:720px}}@media print{aside,.tools{display:none}.layout{display:block}body{background:#fff}main{padding:0}details{break-inside:avoid}.table-scroll{overflow:visible}table{font-size:10px}td code{font-size:10px;min-width:0}section{break-before:auto}}'+
'</style></head><body><header><h1>Datos para la pantalla de pedidos</h1><p class="muted">Gestión CyE · Consolidación de fuentes · 17/09/2026</p></header><div class="layout"><aside><nav><a href="#resumen">Resumen</a><a href="#campos">Campos por entidad</a><a href="#relaciones">Relaciones</a><a href="#excel">Consultas Excel</a><a href="#correcciones">Correcciones</a><a href="#fuentes">Fuentes y pendientes</a><a href="09-consolidacion-datos.md">Documento técnico</a></nav></aside><main>'+
'<section id="resumen"><div class="notice"><strong>Fuentes consolidadas.</strong><br>No quedan decisiones sin exportar. La selección de campos operativos sigue pendiente.</div><h2>Una pantalla, un alcance</h2><p>Pedidos activos con sus líneas, stock y documentos. Taller y Entrega se cargan manualmente.</p><p><strong>FC + REM + RC + Entregado = pedido terminado.</strong> Sale de la lista activa y conserva historial.</p><div class="stats" id="stats"></div><details><summary>Reglas ya acordadas</summary><div class="detail"><ul id="rules" class="list"></ul></div></details></section>'+
'<section id="campos"><h2>Campos por entidad</h2><div class="tools"><label>Alcance<select id="scope"><option>Pantalla inicial</option><option>Catálogo relacionado</option><option>Etapa posterior</option><option>Descartado</option><option>Todos</option></select></label><label>Entidad<select id="entity"><option value="">Todas</option></select></label><label>Decisión<select id="decision"><option value="">Todas</option><option value="yes">Sí: usar</option><option value="no">No: excluir</option><option value="review">Por definir</option><option value="excel">Sólo Excel</option><option value="unknown">Sin selección</option></select></label><label>Buscar<input type="search" id="search" placeholder="Campo, entidad o alias"></label></div><p class="muted">“Sólo Excel” registra el uso actual. No equivale a un Sí para la aplicación.</p><div id="endpoints"></div></section>'+
'<section id="relaciones"><h2>Relaciones documentales</h2><p><strong>Recibo → imputación → factura → pedido.</strong> En el circuito normal también se conserva el remito. En anticipadas se usa el vínculo entre detalles.</p><div class="table-scroll"><table><thead><tr><th>Relación</th><th>Clave</th><th>Cardinalidad</th><th>Evidencia</th></tr></thead><tbody id="relations"></tbody></table></div></section>'+
'<section id="excel"><h2>El Excel actual</h2><p>23 consultas, incluidas cabecera y detalle de remitos, su combinación y recibos. Extracción de sólo lectura, sin actualizar conexiones.</p><div id="queries"></div></section>'+
'<section id="correcciones"><h2>Correcciones detectadas</h2><div id="correction-list"></div></section>'+
'<section id="fuentes"><h2>Lo que falta definir</h2><ul id="pending" class="list"></ul><details><summary>Fuentes utilizadas</summary><div class="detail"><ul id="sources" class="source-list"></ul></div></details></section>'+
'</main></div><script type="application/json" id="report-data">'+dataJson+'</script><script>'+
read(path.join(root,'herramientas','consolidacion-vista.js'))+
'</script></body></html>';
fs.writeFileSync(path.join(root,'09-consolidacion-datos.html'),html);
console.log(JSON.stringify({counts,latestExport:latest?.data.exportedAt,backups:backups.length,queries:queryAnalyses.map(q=>({name:q.name,fields:q.fields.length})),complete:report.complete},null,2));
