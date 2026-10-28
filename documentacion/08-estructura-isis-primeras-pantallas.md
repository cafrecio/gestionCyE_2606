# Estructura ISIS para las primeras pantallas

> Documento de diseño previo. La consolidación vigente de fuentes, decisiones y pendientes está en `09-consolidacion-datos.md`. No convertir los campos candidatos de este archivo en decisiones aprobadas.

Estado: borrador de trabajo. Los campos enumerados son candidatos para revisar;
se consideran definitivos únicamente después de marcarlos en la matriz junto
con el usuario.

## Alcance

Alcance inicial confirmado por el usuario: una pantalla de pedidos activos con
sus líneas y documentos relacionados. Esta definición prevalece sobre las
propuestas más amplias del documento.

- Mostrar pedido, línea, cliente, artículo, cantidad, vendedor, stock, Taller,
  FC, REM, RC y Entrega según la referencia aportada.
- Traer de ISIS pedidos, documentos relacionados y maestros necesarios.
- Registrar manualmente en GestionCyE los estados de Taller y Entrega.
- Retirar automáticamente de la lista activa los pedidos terminados.

### Regla de pedido terminado

`terminado = tieneFC && tieneREM && tieneRC && entregado`

- `tieneFC`: existe al menos una factura normal o anticipada asociada al pedido.
- `tieneREM`: existe al menos un remito asociado al pedido.
- `tieneRC`: existe al menos un recibo asociado mediante las imputaciones de las
  facturas del pedido.
- `entregado`: el usuario confirmó manualmente la entrega del pedido completo.

Las cuatro condiciones deben cumplirse. El estado de Taller no es un requisito
adicional para cerrar. La presencia de documentos es la regla acordada para
esta etapa: no exige calcular importes cancelados ni cobertura de cantidades.
Esta regla no demuestra contablemente que el saldo sea cero.

El cierre se evalúa a nivel pedido, no por cada fila. Al terminar, todas sus
líneas salen de la lista activa; se conservan los datos y relaciones para el
historial. Si posteriormente deja de cumplirse una condición detectada por el
sistema, el pedido vuelve a cumplir el criterio de activo.

Los campos locales necesarios son el estado manual de Taller, el estado manual
de Entrega y el registro de quién y cuándo los modificó. El catálogo de estados
de Taller y Entrega sigue pendiente; la entrega completa debe ser inequívoca.

Los módulos de Taller, Logística, Compras, OT, ensayos, certificados, solicitudes,
mensajes y avisos externos quedan para etapas posteriores. Cotizaciones también
queda fuera de esta primera pantalla; su análisis se conserva como referencia.
En esta etapa el stock mostrado procede de la fuente ISIS ya seleccionada.

## Pantalla operativa de referencia

El usuario aportó una grilla como referencia del contenido a mostrar en el
sistema online. Esta necesidad visual está confirmada; los cruces técnicos
siguen sujetos a validación. No se solicita implementar la pantalla todavía.

La grilla muestra una fila por línea de pedido, con estas columnas:

| Columna | Fuente o relación prevista |
|---|---|
| PEDIDO | Cabecera: número visible del pedido |
| PEDIDO LINEA | Detalle: identidad de línea; definir numeración visible, sin confundirla con el ID interno |
| COD CLIE / CLIENTE | Cliente del pedido y maestro local sincronizado |
| COD ART / ART | Artículo de la línea y su descripción |
| CANT | Cantidad pedida de la línea; mostrar la unidad correspondiente |
| VENDEDOR | Código de vendedor de cabecera relacionado con catálogo |
| STOCK | Información de los módulos de Stock y Compras; stock ISIS de empresa 1 y depósito operativo como fuente de existencias |
| TALLER | Información del módulo de Taller; alcance por pedido o línea por definir |
| FC | Facturas relacionadas, normales o anticipadas |
| REM | Remitos relacionados |
| RC | Recibos relacionados a través de las imputaciones de facturas |
| Entrega | Información del módulo de Logística, separada de la emisión del remito |

### Vistas por usuario y coordinación

Visión futura: las dependencias y acciones descritas en esta sección no son
requisitos de la primera entrega. En ella Taller y Entrega son manuales.

Confirmado por el usuario: la referencia es una pantalla operativa compartida,
adaptada a cada usuario. Reúne información de ISIS y de los módulos internos.

- Entrega depende del módulo de Logística.
- Taller depende del módulo de Taller.
- Stock depende de Stock y Compras. La disponibilidad y los pendientes de compra
  requieren definir sus reglas y fuentes; no se deducen de `cantCompraUm1/2`.
- Cada usuario tendrá una vista acorde a sus responsabilidades y permisos.
  Los registros visibles, columnas y acciones concretas se definirán por perfil.
- Desde esta pantalla se podrá informar o solicitar acciones a otros usuarios,
  vinculadas al pedido y, cuando corresponda, a sus líneas.
- Las solicitudes deben aparecer en el tablero del destinatario y permitir
  seguir su estado desde el pedido, según el objetivo de coordinación ya acordado.

Implicancia de diseño: los módulos responsables mantienen la información que
esta vista presenta. Cada usuario trabaja sobre los mismos pedidos y relaciones;
no se crean copias independientes de los estados por usuario.

Pendiente de definir: acciones habilitadas, destinatarios y reglas de
cumplimiento por perfil. Los cambios provenientes de ISIS podrán actualizar
automáticamente las solicitudes cuya relación documental esté verificada.

Implicancias del modelo:

- FC, REM y RC admiten múltiples documentos. La pantalla puede mostrar varios
  números o acceso a su listado; no deben almacenarse como un único número en
  la línea ni multiplicar filas mediante un join de todas las relaciones.
- Un documento relacionado con el pedido no prueba que incluya todas sus
  líneas. La asociación a una línea requiere evidencia del detalle; cuando
  sólo se conoce el pedido, debe mantenerse ese alcance explícito.
- Un mismo artículo puede repetirse en un pedido. Su código no identifica una
  línea; tampoco el stock mostrado debe interpretarse como stock reservado.
- Tener remito no equivale a entrega confirmada. Tener recibo relacionado no
  determina por sí solo el pago completo de cada línea.
- Las pantallas consultan la base local; la sincronización automática mantiene
  los datos ISIS. Frecuencia y latencia efectiva requieren medición.

## Criterios generales

- ISIS gobierna los datos que se crean o modifican en el ERP.
- GestionCyE mantiene una copia local para servir pantallas rápidas.
- Empresa fija: código 1.
- Existe un solo punto de venta.
- Los documentos se actualizan automáticamente, nunca a pedido del usuario.
- Los maestros se actualizan de noche y puntualmente cuando un documento
  referencia un registro nuevo o modificado.
- Cada sincronización hace `upsert`: crea lo nuevo y actualiza lo existente.
- Los rangos de fechas se superponen para no perder operaciones tardías.

## Maestros mínimos

### Artículos

Fuente: `ISIS_Articulo_VW`.

Campos candidatos:

| Concepto local | Campo ISIS |
|---|---|
| Identidad ISIS | `regisArti` |
| Código visible | `codInternoArti` |
| Descripción | `descripcionArti` |
| Descripción de búsqueda | `descriBusArti` |
| Clasificación 1 a 5 | `descrNivelInt1` a `descrNivelInt5` |

Se incorporan solamente artículos activos. Si un pedido referencia un artículo
desconocido, se consulta puntualmente por código antes de importar el pedido.

### Stock

Fuente: `ISIS_ArticuloStock_VW`.

Campos candidatos: `codArticulo`, `stockUm1` y `stockUm2`. Se filtran empresa 1 y
el único depósito operativo. Las cantidades de compra y venta del endpoint no
se utilizarán porque no representan pendientes.

### Clientes

Fuente: `ISIS_Cliente_VW`.

Campos candidatos:

- `codigoCli`, identidad visible y conocida por los usuarios.
- `cuitCli`, sujeto a validación.
- `razonSocialCli` y `razonSocialBusCli`.
- `fechaAltaCli` y `fechaUltimaFacCli`.
- `descr_Mda`.
- `codigVendedor`.
- `codigListaPrec`.
- `codigCondiPago` y `descrCondiPago`.
- `codProveedorClte`, cuando corresponda.

No se incorporan clientes con CUIT inválido. Si un documento los referencia,
conserva la razón social como dato del documento pero no crea un cliente local.
Contactos y sucursales se administran exclusivamente en GestionCyE.

### Catálogos

- `ISIS_Vendedor_VW`: código y nombre.
- `ISIS_CondicionPago_VW`: código, descripción y vigencia.
- `ISIS_ListaPrecios_VW`: código y descripción.
- `ISIS_Moneda_VW`: código y descripción.

Son espejos de ISIS. No tendrán ABM local.

## Cotizaciones

### Cabecera

Fuente: `ISIS_PresupuestoVtaCab_VW`.

Campos candidatos para la primera pantalla:

- Identidad: `idPresupVtaCab`.
- Comprobante: `comprobantePresup`, `numeroComprobPresup`, `fecha`.
- Cliente: `codigoCliente`, `razonSocial`.
- Responsable: `codVendedor`.
- Condiciones: `codCondPago`, `codListPrec`, `mdaOperac`, `cotizMda1`.
- Importes: `subTotalPresup`, `totalPresup`.
- Vigencia: `senVigenciaPresup`, `diasVigencPresup`, `fechaVigencPresup`.
- Datos operativos a evaluar: `lugarEntregaCliente`, `flete`,
  `ordCpraPresup`, `leyen1Presup`, `leyen2Presup`.

### Detalle

Fuente: `ISIS_PresupuestoVtaDet_VW`.

Campos candidatos:

- `idPresupVtaCab`.
- `codProducPresup`.
- `descripProducPresup` y `descripProducModPresup`.
- `cantidad1Presup` y `cantidad2Presup`.
- `precioPresupDet` e `importePresupDet`.
- `diasEntregaPresupDet` y `fechaEntregaPresupDet`.

La relación cabecera-detalle se realiza por `idPresupVtaCab`.

El seguimiento, la marca de importante, la próxima acción, el resultado y el
motivo de pérdida son datos locales.

## Pedidos

### Cabecera

Fuente: `ISIS_PedidoClteCab_VW`.

Campos candidatos:

- Identidad: `regis_PedCliCab`.
- Comprobante: `desCpbtePedido`, `numero_PedCliCab`, `fecha_PedCliCab`.
- Cliente: `codigoCli`, `razonSocialCli`.
- Responsable: `codigVendedor`.
- Entrega: `codigoFlete`, `sucursalEntrega`.
- Condiciones: `codigCondiPago`, `codigListaPrec`, `desMdaOper`,
  `cotizaOper`.
- Importes: `subtotal_PedCliCab`, `descuento_PedCliCab`,
  `total_PedCliCab`.
- Estado ISIS: `pedidoPendiente`.
- Origen: `desCpbtePresupuesto`, `numero_PreCliCab`.
- Vigencia: `senFechaIniFin_PedCliCab`, `fechaInicioVig_PedCliCab`,
  `fechaFinVig_PedCliCab`.
- Autorizaciones: `usuAutori1`, `fecAut1_PedCliCab`, `usuAutori2`,
  `fecAut2_PedCliCab`.

Los nombres de vendedor, condición y lista se resuelven mediante catálogos; no
son claves.

### Detalle

Fuente: `ISIS_PedidoClteDet_VW`.

Campos candidatos:

- Identidades: `regis_PedCliDet`, `regis_PedCliCab`.
- Artículo: `codInternoArti`, `descripcionArticulo`.
- Unidades: `medidaPri`, `medidaSecu`.
- Solicitado: `cantiPedida_UMP`, `cantiPedida_UMS`.
- Entregado: `cantiEntregada_UMP`, `cantiEntregada_UMS`.
- Precio de referencia: `precioMdaLista_Neto`, `precioMdaCabe_Neto`.
- Vigencia: `senFechaIniFin_PedCliDet`, `fechaInicioVig_PedCliDet`,
  `fechaFinVig_PedCliDet`.

La relación cabecera-detalle se realiza por `regis_PedCliCab`.

## Facturación y remisión

### Operaciones de venta

Fuentes: `ISIS_VentasCabecera_VW` e `ISIS_VentasDetalle_VW`.

La cabecera identifica el documento emitido:

- `regis_CliTra`.
- `descripcionCpbte`, `signoCpbte`.
- `nroComprob_CliTra`, `nroPreimpre_CliTra`, `fecha_CliTra`.
- `codigoCli`, `razonSocialCli`.
- `codigVendedor` y `codigCondiPago`.
- `monedaOper`, `cotizaOper`, `netoPes_CliTra`.

El detalle aporta las relaciones necesarias:

- `regis_CliTra` y `regis_MovArtiD`.
- Pedido: `descrCpbtePedido`, `numeroCpbtePedido`.
- Remito: `descrCpbteRemito`, `nroSistemaCpbteRemito`,
  `nroPreimpreCpbteRemito`, `fechaCpbteRemito`.
- Venta: `descrCpbteVenta`, `nroSistemaCpbteVenta`,
  `nroPreimpreCpbteVenta`, `fechaCpbteVenta`.
- Artículo: `codInternoArti`, `descripcionArti`.
- Cantidad: `cantidad1_MovArtiD`, `cantidad2_MovArtiD`.

La relación cabecera-detalle se realiza por `regis_CliTra`. El pedido se vincula
por tipo y número de comprobante. Con empresa 1 y un único punto de venta, esta
relación es candidata, pero debe validarse con datos reales.

### Facturas anticipadas

Fuente: `ISIS_VentasDetalLeFCAnti_VW`.

No existe una consulta separada de cabecera. El detalle ya incluye factura,
pedido, cliente, artículo y cantidades facturadas, entregadas y pendientes.
Puede utilizarse directamente para el avance del pedido si las pruebas confirman
la relación por número.

Campos principales:

- `regis_CliTra`, `regis_FCAntiDet`.
- Factura: `descrCpbteVenta`, `nroSistemaCpbteVenta`,
  `nroPreimpreCpbteVenta`, `fechaCpbteVenta`, `signoCpbte`.
- Pedido: `descrCpbtePedido`, `numeroCpbtePedido`.
- Artículo: `codInternoArti`, `descripcionArti`.
- `cantiFacturadaPri`, `cantiEntregadaPri`, `cantiPendientePri`.
- Equivalentes de unidad secundaria cuando correspondan.

### Remitos específicos

Fuentes en revisión: `ISIS_RemitoClienteCabecera_VW` y
`ISIS_RemitoClienteDetalle_VW`.

La cabecera aporta `regis_PedCliCab` para el vínculo directo con el pedido. El
detalle aporta `regis_FCAntiDet`, presente también en
`ISIS_VentasDetalLeFCAnti_VW`. Esto permite una segunda relación candidata:

`remito detalle → factura anticipada detalle → pedido`.

No es necesaria una consulta separada de cabecera de factura anticipada para
resolver esa cadena. Además, `ISIS_RemitoClienteDetalle_VW` permite filtrar por
`regis_RtoCliCab`: después de detectar una cabecera nueva puede traerse sólo su
detalle.

Decisión provisional: consultas viables y pendientes de prueba con remitos
comunes, facturación anticipada y entregas parciales.

## Recibos e imputaciones

Fuente: `ISIS_OperacionesClienteImputacion_VW`.

### Circuitos confirmados por el usuario

- Facturación anticipada: un pedido puede tener una o más facturas anticipadas;
  cada factura anticipada puede tener uno o más remitos. El recibo se relaciona
  con las facturas mediante imputaciones.
- Facturación normal: un pedido puede tener uno o más remitos; un remito puede
  relacionarse con una o más facturas y una factura con uno o más remitos.
  Una factura puede tener uno o más recibos, y un recibo una o más facturas.

Son relaciones documentales. No se impone que un recibo de factura anticipada
deba esperar a la emisión del remito.

### Recorrido desde el recibo hasta el pedido

1. Buscar las imputaciones del recibo mediante `regTraRC_ImpuCli` en la copia
   local y obtener todos los `regTraFC_ImpuCli` relacionados.
2. Por cada factura, unir `regTraFC_ImpuCli = regis_CliTra` con su detalle:
   `ISIS_VentasDetalle_VW` para ventas normales y
   `ISIS_VentasDetalLeFCAnti_VW` para anticipadas.
3. Recuperar `descrCpbtePedido` y `numeroCpbtePedido` de todas las líneas y
   resolver el pedido local por empresa, tipo y número de comprobante.
4. Conservar todos los vínculos encontrados, sin elegir solamente la primera
   factura, línea o pedido. Repeticiones de líneas no deben duplicar el vínculo
   documental.

En anticipadas el recorrido es `RC → imputación → FC anticipada → PE`.
En ventas normales la trazabilidad completa es `RC → imputación → FC → RE → PE`;
el detalle de venta permite llegar directamente al pedido cuando informa su
referencia. Si no la informa, se evalúa el recorrido por remito y su cabecera.

El cruce técnico debe comprobarse con datos reales. No se debe equiparar
`regis_FCAntiCab` con `regis_CliTra`: son identificadores diferentes cuya
equivalencia no fue demostrada.

Relaciones:

- `VentasDetalle.regis_CliTra` identifica la factura relacionada con el pedido.
- `regTraFC_ImpuCli` identifica esa factura dentro de la imputación.
- `regTraRC_ImpuCli` identifica el recibo aplicado.
- `regis_ImpuCli` identifica la imputación.

La relación debe modelarse como muchos a muchos: un recibo puede aplicarse a
varias facturas y una factura puede recibir varios recibos.

Campos candidatos:

- `regis_ImpuCli`.
- `codigoCli`.
- `regTraFC_ImpuCli`, `fechaComprobDeb`, `desComprobDeb`, `nroComprobDeb`,
  `totalComproDeb`.
- `regTraRC_ImpuCli`, `fechaComprobCred`, `desComprobCred`, `nroComprobCred`,
  `totalComproCred`.

Limitación: no devuelve el importe aplicado por la imputación. Los totales
requieren validación semántica con datos reales. Según sus nombres,
corresponden a los comprobantes completos. Permite afirmar que existe una
relación con un recibo, pero no determinar por sí sola si la factura o el pedido
quedaron totalmente pagados.

Esto es una cuestión separada de la trazabilidad: no impide encontrar los
pedidos vinculados al recibo.

El filtro por fecha usa la fecha del comprobante de débito. Podría omitir un
recibo nuevo aplicado a una factura vieja. Estrategia candidata: detectar
recibos nuevos mediante `ISIS_VentasCabecera_VW` y consultar sus imputaciones
puntualmente por `NroComprobCred`. Debe comprobarse que la cabecera de ventas
devuelva los recibos y que el número sea suficiente para identificarlos.

## Estrategia de actualización

| Entidad | Estrategia inicial |
|---|---|
| Artículos, clientes y catálogos | Barrido nocturno y consulta puntual al ser referenciados |
| Stock | Actualización programada; frecuencia pendiente de la pantalla que lo use |
| Cotizaciones | Rango de fechas reciente con superposición y actualización por ID |
| Pedidos | Rango de fechas reciente con superposición y actualización por ID |
| Ventas y facturas anticipadas | Rango de fechas reciente con superposición y actualización por ID |
| Recibos e imputaciones | Detectar recibos nuevos y consultar imputaciones por número; pendiente de prueba |

La interfaz nunca espera un barrido completo de ISIS.

## Bloqueos que requieren prueba

1. `ISIS_PedidoClteDet_VW` no permite filtrar por `regis_PedCliCab`; solamente
   ofrece fechas de vigencia. Hay que comprobar si ese filtro permite obtener
   de forma confiable las líneas nuevas. Si no, corresponde solicitar a ISIS un
   filtro por cabecera.
2. Validar con casos reales la relación pedido-factura-remito expuesta por
   `ISIS_VentasDetalle_VW`.
3. Validar facturación anticipada completa y parcial con
   `ISIS_VentasDetalLeFCAnti_VW`.
4. Validar la cadena `regis_RtoCliCab` / `regis_FCAntiDet` para remitos.
5. Confirmar que `ISIS_VentasCabecera_VW` permita detectar recibos nuevos y que
   `NroComprobCred` recupere todas sus imputaciones.
6. Determinar cómo conocer el importe efectivamente imputado y distinguir pago
   parcial de pago total.
7. Medir tiempos y volúmenes de todas las consultas operativas con rangos de
   fechas reales.
