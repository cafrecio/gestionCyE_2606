# GestionCyE - Contexto maestro para IA

> Estado: diseño conceptual. No existe todavía una aplicación implementada.
>
> Última actualización: 2026-07-22.
>
> Este archivo es la fuente de verdad para Codex, Claude Code u otra IA que trabaje en el proyecto. Antes de proponer arquitectura, código o flujos, leerlo completo.

## 1. Reglas de trabajo

- El usuario conoce ISIS, su operación y sus consultas de API. No asumir que parte de cero.
- Preguntar antes de repetir pruebas básicas o cambiar una solución que ya funciona.
- Analizar críticamente las propuestas del usuario; no aceptarlas de manera automática.
- No inventar comportamientos de ISIS ni significados de campos.
- Diferenciar siempre: dato confirmado, decisión tomada, hipótesis y pregunta pendiente.
- No diseñar procesos que exijan completar datos manualmente después.
- No trasladar al usuario tareas de integración, memorización de identificadores o corrección técnica.
- Toda decisión nueva debe actualizar este archivo y `DECISIONES.html`.
- Nunca guardar, reproducir ni incluir credenciales o API Keys en documentación, código de ejemplo o capturas.

## 2. Definición del producto

GestionCyE será una aplicación web alojada en un VPS que complementa a **ISIS Gestión**, el ERP de la empresa.

No reemplaza a ISIS. Su función es coordinar el trabajo que hoy ocurre mediante correos, planillas y conocimiento informal, y aprovechar los datos que ya existen en el ERP sin exigir una segunda carga.

### Problema principal

- La coordinación interna genera más de 150 correos diarios.
- Las personas reciben copias para mantener visibilidad, pero el volumen impide saber qué requiere acción.
- No existe una vista única y ordenada de solicitudes, responsables, demoras y bloqueos.
- Responder un correo o marcar manualmente una tarea duplica trabajo cuando el resultado ya quedó registrado en ISIS.

### Resultado buscado

- Cada persona tendrá uno o más paneles según su perfil y responsabilidad.
- Desde esos paneles podrá crear solicitudes internas vinculadas con datos reales de ISIS.
- El sector receptor verá una nueva tarea en su tablero inmediatamente.
- Cuando ISIS permita comprobar el resultado, GestionCyE lo detectará sin pedir una respuesta manual.
- La dirección podrá ver toda la operación organizada, no una copia de cada mensaje.
- El correo será un aviso transitorio. Podrá eliminarse cuando el sistema sea estable y suficiente.

## 3. Límites y autoridad de los datos

### ISIS es la fuente de verdad para

- Clientes.
- Artículos.
- Pedidos, presupuestos y documentos comerciales.
- Facturas, remitos, recibos y demás operaciones registradas en el ERP.
- Códigos y datos centrales ya administrados por ISIS.

### GestionCyE será responsable de

- Solicitudes y tareas internas.
- Asignaciones, prioridades, plazos y estados propios.
- Avisos, bloqueos, excepciones y trazabilidad operativa.
- Paneles y vistas por perfil.
- Datos complementarios que ISIS no posea, almacenados por separado y vinculados al registro de ISIS.

### Reglas no negociables

- GestionCyE no cambia los códigos que los usuarios ya conocen.
- No crea clientes o artículos centrales; solo los replica desde ISIS.
- No guarda entidades centrales parciales con la promesa de completarlas después.
- El control contable y comercial de lo facturado, remitido y cobrado continúa en ISIS.
- GestionCyE consulta esos resultados y los usa como evidencia para sus flujos.

## 4. Dominio comercial conocido

### Presupuesto y pedido

1. Se emite un presupuesto.
2. Si el cliente no acepta, el proceso termina. En el futuro se analizarán presupuestos no convertidos.
3. Si acepta total o parcialmente, se crea un pedido.
4. Un pedido pertenece a un único cliente y contiene una o muchas líneas.

### Tipos de abastecimiento de una línea

- Importado disponible en estantería.
- Reventa local con stock.
- Reventa local sin stock.
- Fabricación totalmente interna.
- Fabricación con trabajos de terceros.

### Condiciones generales de pago

- Pago anticipado: no se avanza hasta recibir pago o cheques.
- Pago a cuenta: se avanza y se cobra posteriormente.
- Cada categoría contiene variantes todavía no modeladas.

### Formas de entrega

- Domicilio del cliente.
- Transporte definido por el cliente.
- Retiro desde el local.

### Unidad principal

- El **pedido** es la unidad principal del circuito comercial.
- La **línea** es necesaria para abastecimiento, fabricación, entregas parciales y excepciones.
- Más del 98 % de los casos se factura y remite como pedido completo. El diseño debe optimizar ese camino sin impedir el tratamiento del resto.
- Facturación, remisión y cobranza no forman una secuencia rígida universal.

## 5. Ejemplo operativo de referencia

Caso: Laura crea un pedido en ISIS y necesita que Stella realice una factura anticipada.

Flujo esperado:

1. Laura abre “Nueva solicitud” en GestionCyE.
2. GestionCyE consulta en ISIS los pedidos recientes y muestra los correspondientes a Laura.
3. Laura selecciona el pedido; no memoriza ni escribe su número.
4. GestionCyE identifica cliente y artículos del pedido.
5. Si son nuevos para la base local, obtiene automáticamente sus registros completos desde ISIS.
6. En una operación transaccional replica dependencias, pedido y líneas.
7. Crea la tarea “Factura anticipada”.
8. Stella la ve inmediatamente en su panel.
9. Cuando la factura aparezca asociada en ISIS, GestionCyE podrá considerar cumplida la solicitud sin respuesta manual.

## 6. Arquitectura conceptual decidida

### Patrón híbrido

- **Base local:** sirve las pantallas con velocidad y mantiene continuidad ante lentitud de ISIS.
- **Sincronización interactiva:** consulta ISIS en el momento de una acción operativa concreta.
- **Sincronización de activos:** actualiza periódicamente pedidos abiertos o recientes para detectar cambios.
- **Barridos masivos:** se ejecutan fuera del camino interactivo y, preferentemente, fuera de horario.

Sin webhooks, eventos o una fuente de cambios de ISIS no existe tiempo real automático estricto. El tiempo real operativo se consigue con consultas puntuales disparadas por acciones y actualizaciones frecuentes de registros activos.

### Regla de interfaz

- Al abrir la aplicación se muestran primero los datos locales.
- La interfaz no debe quedar bloqueada por una consulta masiva a ISIS.
- Una acción que necesita información nueva dispara una consulta puntual y muestra un estado claro mientras se resuelve.

### Importación transaccional

Al incorporar un pedido desconocido:

1. Obtener el pedido desde ISIS.
2. Detectar cliente y artículos referenciados.
3. Obtener desde ISIS los maestros completos que falten localmente.
4. Replicar cliente, artículos, pedido y líneas en una única operación controlada.
5. Crear la tarea solamente cuando la información requerida esté consistente.

Propiedades obligatorias:

- **Atómica:** no deja datos a medio guardar.
- **Idempotente:** repetirla no duplica entidades ni tareas.
- **Automática:** ningún usuario completa dependencias después.
- **Fiel:** conserva códigos y datos de ISIS.

## 7. Estrategia de sincronización por entidad

### Pedidos

- Carga inicial completa.
- Actualizaciones frecuentes de pedidos del día.
- Actualizaciones de pedidos abiertos/pendientes y una ventana móvil todavía por definir.
- Actualización puntual cuando el usuario trabaja con un pedido.
- No alcanza con refrescar solo el día actual: pedidos anteriores pueden cambiar por entrega, autorización, vigencia u otros hechos.

### Clientes y artículos

- El código de negocio no es autonumérico y no debe tratarse como clave técnica sin validación.
- Evaluar `regis_Cli` y `regis_Arti` como identificadores técnicos de ISIS, confirmando estabilidad y alcance.
- Como no se confirmó una fecha confiable de última modificación, una sincronización incremental por fecha puede omitir cambios.
- Alternativas a evaluar: barrido completo fuera de horario, comparación por hash y actualización puntual automática cuando una operación referencia un maestro nuevo.
- Debe definirse cómo detectar bajas, cambios de código o registros que dejan de aparecer.

### Principio general

La arquitectura es común, pero frecuencia, filtros y criterio de cambio son específicos de cada entidad. No forzar una única estrategia para todo.

## 8. API de ISIS: información confirmada

### Referencia

- Documento revisado: `ISIS_Cloud_API_Diccionario.pdf`.
- Generado: 2026-04-14.
- Declara API v1, 32 grupos y 191 endpoints.
- Incluye descripciones y parámetros, pero no todos los esquemas de respuesta.
- La autenticación usa el header `X-Api-Key`. Nunca documentar su valor.

### Empresa operativa verificada

- `codig_Emp = 1`
- Descripción: `CyE`
- Abreviatura: `CyE`

Otras empresas visibles en una prueba: 2 `zPresupuesto`, 99 `zzResumen`, 3 `E. Meldini`, 4 `zM_Presupuesto`. No se decidió integrarlas.

### Pedidos: endpoints adoptados

- Cabecera: `GET /api/ISIS_PedidoClteCab_VW`
- Detalle: `GET /api/ISIS_PedidoClteDet_VW`
- Ambos ya funcionan y son usados habitualmente desde Excel/Power Query.
- Relación confirmada: `regis_PedCliCab`.

Prueba confirmada:

- Consulta: `ISIS_PedidoClteCab_VW?NumeroPedCliCab=25888`
- Resultado: `regis_PedCliCab=30999`
- Vendedor: `LAURA FERREIRA`
- Flete: código `NL`, descripción `RETIRA POR NUESTRO LOCAL`
- Moneda: `Dolar`
- `sucursalEntrega`: nula en esa respuesta.

### Endpoint descartado por ahora

- `GET /api/ISIS_API_Pedidos` devuelve cabecera y detalle juntos según Swagger.
- Las pruebas realizadas devolvieron listas vacías incluso con empresa 1, pedido 25888 y fechas amplias.
- El endpoint simple de cabecera sí devolvió el pedido.
- Decisión: no dedicar más tiempo al consolidado porque las consultas separadas ya funcionan y existe una combinación estándar.

### Escritura de pedidos

- `POST /api/ISIS_Pedido` permite insertar pedidos.
- No debe confundirse con el GET plural anterior.
- Escribir en ISIS no forma parte de la primera estrategia de integración, que será de solo lectura hasta comprender contratos y riesgos.

## 9. Datos disponibles en pedidos

### Cabecera: campos útiles confirmados

- Identidad: `regis_PedCliCab`, `codig_Emp`, `desCpbtePedido`, `numero_PedCliCab`.
- Fecha: `fecha_PedCliCab`.
- Cliente: `codigoCli`, `razonSocialCli`.
- Vendedor: `codigVendedor`, `nombreVendedor`.
- Pago: `codigCondiPago`, `descrCondiPago`.
- Entrega: `codigoFlete`, `razonSocialFlete`, `sucursalEntrega`.
- Moneda: `desMdaOper`, `cotizaOper`.
- Importes: subtotal, descuentos, impuestos y total.
- Presupuesto: `desCpbtePresupuesto`, `numero_PreCliCab`.
- Estado candidato: `pedidoPendiente`.
- Autorizaciones: `usuAutori1`, `fecAut1_PedCliCab`, `usuAutori2`, `fecAut2_PedCliCab`.
- Vigencia: `senFechaIniFin_PedCliCab`, `fechaInicioVig_PedCliCab`, `fechaFinVig_PedCliCab`.

### Detalle: campos útiles confirmados

- Identidad: `regisPedCliDet`, `regisPedCliCab`.
- Artículo: `codInternoArti`, `descripcionArticulo`.
- Unidades principal y secundaria.
- Cantidades pedidas, entregadas y bonificadas.
- Lista, moneda, cotización, precios y descuentos.
- Costos de compra y costos internos.
- Vigencia de la línea.

## 10. Consulta combinada estándar existente

La combinación de pedidos ya existe y funciona:

```powerquery
Table.NestedJoin(
    pedCab,
    {"idPedCab"},
    pedDet,
    {"idPedCab"},
    "pedDet",
    JoinKind.LeftOuter
)
```

Decisiones de esa consulta:

- La unión izquierda conserva cabeceras sin detalle coincidente.
- `idPedCab` relaciona ambas fuentes.
- `pedLine` se construye como `numPed-idPedDet`.
- Orden: `fchaPed` descendente y luego `pedLine` descendente.

Salida estándar actual:

| Grupo | Columnas |
|---|---|
| Pedido | `numPed`, `idPedCab`, `pedLine`, `fchaPed` |
| Comercial | `vend`, `codCli`, `rzonSoc`, `moneda`, `cot` |
| Importes | `subtot`, `total` |
| Referencias | `codPre`, `codPgo`, `desPgo`, `numCot` |
| Línea | `idPedDet`, `codArt`, `descArt`, `unidad`, `cant`, `pcioUnit` |

Campos disponibles que se agregarán solo cuando una vista o regla los necesite:

- Cabecera: pendiente, vigencia, transporte, sucursal, autorizaciones, tipo, ecommerce, centro de costo, lista, impuestos y descuentos detallados.
- Detalle: cantidades entregadas/bonificadas, unidad secundaria, vigencia, costos y precios netos.

## 11. Paneles y perfiles

Decisiones actuales:

- No habrá una única pantalla universal; habrá distintas vistas del mismo proceso.
- Ventas tendrá la visión más completa porque es responsable del pedido.
- Cada vendedor verá sus propios pedidos.
- Administración, Logística, Expedición, Compras y otros sectores verán lo correspondiente a su función.
- Dirección verá todo, organizado por sector, responsable, estado, demora y excepción; la composición final todavía no está definida.
- Una solicitud nueva debe aparecer como una línea en el tablero del sector receptor.

## 12. Módulos candidatos

No están priorizados ni diseñados todavía:

- Logística.
- Despacho: armado y confirmación de entrega/recepción.
- Compras productivas.
- Compras no productivas.
- Stock.
- Cobranzas.
- Conciliación de impuestos.
- Conciliación bancaria.
- Reportes.
- Flujo de caja.
- Recepción.
- Bancos.
- Taller.
- Cuentas a cobrar.

## 13. Decisiones descartadas o corregidas

- **Descartado:** usar el mensaje como unidad central. El sistema coordina operaciones vinculadas a entidades de ISIS.
- **Corregido:** usar siempre la línea como unidad principal. El pedido es principal; la línea resuelve detalle y excepciones.
- **Descartado:** imponer una secuencia fija pedido → entrega → factura → cobro.
- **Descartado:** depender solo de sincronizaciones nocturnas o cada varios minutos para acciones operativas.
- **Descartado:** pedir al usuario que memorice el número de pedido.
- **Descartado:** crear clientes/artículos mínimos y completarlos manualmente después.
- **Descartado:** seguir investigando `ISIS_API_Pedidos` mientras cabecera/detalle ya resuelven el caso.

## 14. Preguntas abiertas

### Identidad y cambios

- ¿`regis_PedCliCab` es único globalmente o dentro de cada empresa?
- ¿`regis_Cli` y `regis_Arti` son permanentes y reutilizables como identificadores externos?
- ¿`numPed` puede repetirse entre empresas o tipos de comprobante?
- ¿`idPedDet` es estable para construir `pedLine` a largo plazo?
- ¿Qué mecanismo confiable permite detectar modificaciones en ISIS?

### Semántica de campos

- Valores reales de `pedidoPendiente`, `tipoPedido` y campos de vigencia.
- Significado exacto de cantidades `canRepar*` / `bonRepar*` observadas en otro esquema.

### Relaciones documentales

- Cómo se vinculan pedido, factura, remito, recibo, NC y ND en la API.
- Cómo reconocer de forma automática el cumplimiento de cada tipo de solicitud.

### Experiencia de usuario

- Cuáles serán las primeras vistas concretas.
- Cómo asociar usuario de GestionCyE con vendedor y sector de ISIS.
- Qué latencia máxima es aceptable para una solicitud interactiva.

## 15. Próximo paso recomendado

Mapear un flujo real completo de **solicitud de factura anticipada**, usando los endpoints separados que ya funcionan:

1. Qué ve Laura.
2. Cómo selecciona el pedido.
3. Qué datos exactos se sincronizan.
4. Qué tarea recibe Stella.
5. Qué dato de ISIS demuestra que la factura fue creada.
6. Qué excepciones pueden bloquear el proceso.

No implementar todavía una arquitectura definitiva hasta confirmar ese flujo y la relación pedido-factura en la API.

## 16. Registro resumido de decisiones

| Fecha | Tema | Decisión |
|---|---|---|
| 2026-07-13 | Producto | GestionCyE complementa a ISIS y coordina trabajo interno. |
| 2026-07-13 | Unidad comercial | Pedido principal; línea para detalle y excepciones. |
| 2026-07-13 | Paneles | Vistas según perfil; dirección ve todo organizado. |
| 2026-07-14 | Integración | ISIS es fuente de verdad; primera etapa de lectura. |
| 2026-07-14 | Datos | Usar copia local por lentitud de consultas ISIS. |
| 2026-07-14 | Tiempo real | Modelo híbrido: base local + consulta puntual + refresco de activos. |
| 2026-07-14 | Dependencias | Importación automática, completa, transaccional e idempotente. |
| 2026-07-14 | Pedidos API | Adoptar cabecera/detalle existentes; descartar consolidado por ahora. |
| 2026-07-22 | Documentación | Mantener contexto IA y panel humano sincronizados. |

