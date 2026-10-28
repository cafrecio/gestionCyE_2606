# Relevamiento del Excel GestionCyEBase

> Actualización 17/09/2026: el libro actual contiene 23 consultas. Se agregaron `remCab`, `remDet`, `remCom` y `rcBase`. Este documento conserva el relevamiento anterior como antecedente; la extracción vigente está en `09-consolidacion-datos.md`.

Fuente analizada en modo solo lectura:

- `GestionCyEBase 2604_v1.22.xlsm`
- Fecha observada: 16/09/2026

Este documento registra lo que el Excel resuelve hoy. No convierte sus filtros o
estructuras en decisiones automáticas para el sistema nuevo.

## Estructura

- 19 hojas.
- 19 consultas Power Query.
- 24 conexiones.
- 2 tablas cargadas en el modelo de datos.
- Sin macros VBA. La extensión `.xlsm` no contiene módulos de código.

## Fuentes funcionales

### Maestros

- Artículos: `ISIS_Articulo_VW`.
- Stock: `ISIS_ArticuloStock_VW`.
- Clientes: `ISIS_Cliente_VW`.
- Proveedores: `ISIS_Proveedor_VW`.
- Condiciones de pago: `ISIS_CondicionPago_VW`.

### Operaciones

- Cotizaciones: cabecera y detalle.
- Pedidos: cabecera y detalle.
- Facturas y notas de crédito: cabecera y detalle.
- Facturas anticipadas.
- Cheques de clientes en cartera.

## Relaciones confirmadas

- Artículo con stock: código de artículo.
- Cotización cabecera con detalle: `idPresupVtaCab`.
- Pedido cabecera con detalle: `regis_PedCliCab`.
- Factura cabecera con detalle: `regis_CliTra` y número de comprobante.
- Factura con pedido y remito: el detalle de ventas aporta ambos números.

## Pedidos

El Excel confirma que la base correcta es:

- `ISIS_PedidoClteCab_VW`.
- `ISIS_PedidoClteDet_VW`.

La consulta combinada une ambas por `regis_PedCliCab`.

### Datos que usa hoy

Cabecera:

- Número e identificador interno del pedido.
- Fecha.
- Vendedor.
- Cliente.
- Moneda y cotización.
- Subtotal y total.
- Lista y condición de pago.
- Cotización de origen.

Detalle:

- Identificador de línea.
- Artículo y descripción.
- Unidad.
- Cantidad pedida.
- Precio unitario neto.

### Datos que el Excel descarta pero el sistema necesita evaluar

- `pedidoPendiente`.
- Código de vendedor.
- Flete y sucursal de entrega.
- Cantidades entregadas por línea.
- Unidad y cantidades secundarias.
- Vigencia del pedido.
- Autorizaciones.
- Descuentos de cabecera e ítem.

Las cantidades entregadas y el estado pendiente pueden ayudar a determinar qué
resta completar. No deben descartarse antes de probar datos reales.

## Cotizaciones

El Excel une cabecera y detalle por `idPresupVtaCab` y conserva cliente,
vendedor, moneda, importes y artículos.

También permite marcar manualmente una cotización para convertir su subtotal a
dólares usando la cotización oficial histórica. Esta es una regla analítica del
Excel, no un dato de ISIS.

El resumen actual muestra por vendedor y mes:

- Cantidad de cotizaciones.
- Subtotal ajustado.

Para el seguimiento comercial faltan estados propios: importante, seguimiento,
próxima acción, motivo de pérdida y conversión a pedido.

## Facturación y remitos

El detalle de ventas vincula factura, pedido, remito y artículo. Esta relación
puede actualizar automáticamente el avance del pedido cuando ISIS crea un
documento.

Las facturas anticipadas aportan cantidad facturada, entregada y pendiente. Son
necesarias para representar correctamente ese flujo.

### Cabecera de remitos aportada posteriormente

Se incorporó al análisis `ISIS_RemitoClienteCabecera_VW`, aunque no formaba
parte de las 19 consultas originales del archivo.

Relaciones principales:

- `regis_RtoCliCab`: identidad interna del remito.
- `regis_PedCliCab`: vínculo directo con el pedido.
- `regis_FCAntiCab`: vínculo con una factura anticipada.

Para el circuito logístico también deben evaluarse `codigoFlete`,
`razonSocialFlete`, `lugarEntrega`, el número y la fecha del remito. El Excel
eliminaba parte de estos datos, pero esa selección no debe trasladarse sin
revisión al sistema nuevo.

El endpoint permite filtrar por cliente, descripción de comprobante, número y
rango de fechas. Como no ofrece un filtro incremental por identificador, la
estrategia candidata es consultar periódicamente una ventana reciente de fechas
y actualizar por `regis_RtoCliCab`. Falta medir la consulta y comprobar cómo
informa modificaciones posteriores.

El detalle `ISIS_RemitoClienteDetalle_VW` puede consultarse por
`regis_RtoCliCab`. Su campo `regis_FCAntiDet` coincide con el identificador del
detalle de factura anticipada y permite intentar la relación remito → factura
anticipada → pedido sin necesitar una cabecera de factura anticipada separada.

## Reglas observadas

- Artículos: sólo activos.
- Clientes: activos, con CUIT informado y actividad reciente.
- Proveedores: CUIT validado y actividad reciente.
- Condiciones de pago: sólo activas.
- Empresa: varias consultas filtran empresa 1; pedidos también admiten empresa 4.
- Cotizaciones y operaciones: aplican cortes históricos para reducir volumen.

Los cortes por fecha e identificador son optimizaciones del Excel. No deben
tratarse como reglas del negocio.

## Riesgos detectados

- Pedidos elimina cantidades entregadas y el indicador de pendiente.
- Algunas consultas guardan nombres en lugar de códigos relacionados.
- La consulta de pedidos incluye empresa 4, aunque el sistema nuevo operará con
  empresa 1.
- Cheques intenta obtener el pedido desde los últimos cinco caracteres de un
  comentario. Es una relación frágil.
- El Excel descarga conjuntos completos y luego filtra localmente.
- Los datos históricos usados para reportes no equivalen al conjunto operativo
  que requiere sincronización inmediata.

## Cruce completo con la matriz de API

El Excel no es solamente una herramienta de pedidos. Sus 19 consultas se
reparten entre 15 consultas de origen y 4 consultas derivadas mediante joins.
Las consultas de origen utilizan 13 endpoints únicos de ISIS y una API externa
de cotización del dólar. `ISIS_Articulo_VW` se consulta dos veces con selecciones
de campos diferentes.

Endpoints del Excel que ya están incluidos en la matriz:

- `ISIS_Articulo_VW`
- `ISIS_ArticuloStock_VW`
- `ISIS_CondicionPago_VW`
- `ISIS_ChequesEnCarteraCliente_VW`
- `ISIS_Cliente_VW`
- `ISIS_Proveedor_VW`

Endpoints operativos presentes en el Excel que todavía falta incorporar y
evaluar en la matriz:

- `ISIS_PedidoClteCab_VW`
- `ISIS_PedidoClteDet_VW`
- `ISIS_PresupuestoVtaCab_VW`
- `ISIS_PresupuestoVtaDet_VW`
- `ISIS_VentasCabecera_VW`
- `ISIS_VentasDetalle_VW`
- `ISIS_VentasDetalLeFCAnti_VW`

Las consultas `artStck`, `pedCom`, `cotCom` y `fcCom` son transformaciones del
Excel, no endpoints de ISIS. La consulta `Divisa` depende de ArgentinaDatos y
debe registrarse como integración externa.

## Conclusión

El Excel permite adelantar la selección inicial de entidades, relaciones y
reglas. No reemplaza la prueba de endpoints: fue diseñado para analizar datos,
no para administrar el flujo operativo entre sectores.

## Decisiones posteriores al relevamiento

- Empezar Pedidos con dos consultas: cabecera y detalle.
- Incorporar después los documentos necesarios para cerrar el circuito, en
  especial remitos y recibos.
- Proveedores ya aparece en el Excel mediante `ISIS_Proveedor_VW`, pero falta
  definir su participación en el flujo operativo.
- No agregar macros al Excel. Las funciones nuevas se implementarán en la
  aplicación para centralizar reglas, permisos, historial y mantenimiento.
