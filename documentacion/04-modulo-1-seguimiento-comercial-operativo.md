# Modulo 1: seguimiento comercial y operativo

## Situacion actual

Hoy ventas genera cotizaciones, las envia al cliente y muchas veces quedan en el olvido.

No hay un seguimiento claro y centralizado de:

- Ultimas cotizaciones generadas.
- Cotizaciones importantes.
- Cotizaciones enviadas y pendientes de respuesta.
- Cotizaciones que se convierten en pedidos.
- Pedidos activos y su estado real.
- Tareas pendientes por sector.

Gran parte del seguimiento operativo se realiza por mail. Esto genera mucho volumen de comunicacion diaria y dificulta ver rapidamente que falta, quien debe actuar y que pedidos estan trabados.

## Objetivo del modulo

El primer modulo del nuevo sistema sera un tablero de control y seguimiento de cotizaciones y pedidos.

La idea principal es que cada usuario tenga en una sola pantalla:

- Que tiene por hacer.
- Que ya esta hecho.
- Que esta pendiente de otro sector.
- Que pedidos o cotizaciones requieren atencion.
- Algunos indicadores o KPI, cuando correspondan.

## Cotizaciones

Ventas necesita una vista de seguimiento de cotizaciones.

La vista deberia permitir:

- Ver las ultimas cotizaciones.
- Marcar cotizaciones importantes.
- Identificar principales clientes.
- Hacer seguimiento de cotizaciones enviadas.
- Ver que cotizaciones se convirtieron en pedidos.
- Evitar que una cotizacion quede sin seguimiento.

## Pedidos activos

Algunas cotizaciones se convierten en pedidos. Esos pedidos necesitan seguimiento hasta quedar concluidos.

Un pedido puede requerir distintos documentos, confirmaciones o procesos segun el caso.

Elementos posibles para considerar un pedido concluido:

- Remito.
- Factura.
- Confirmacion de entrega.
- Confirmacion de pago.
- Recibo.
- OT, orden de trabajo.
- Compras asociadas.

No todos los pedidos requieren todos los elementos. La necesidad depende de los articulos, la condicion comercial y el flujo operativo.

## Preparacion y despacho

Cuando un pedido esta disponible para entregar o para que el cliente lo retire, ventas solicita a almacenes que lo prepare.

Almacenes devuelve un documento de preparacion. Hoy ese documento se maneja como Excel.

El documento de preparacion puede incluir:

- Lote.
- Cantidad de bultos.
- Tipo de bultos.
- Distribucion de articulos por bulto.
- Peso, si corresponde.
- Volumen, si corresponde.

Con esa informacion, ventas solicita a administracion el remito o la factura segun corresponda.

## Administracion

Administracion interviene en distintos momentos del pedido.

Actualmente envia mails informando, segun el caso:

- Numero de remito.
- Numero de factura.
- Confirmacion de pago.
- Recibo u otra documentacion relacionada.

La factura puede solicitarse de formas distintas dependiendo de la condicion de pago del cliente. Ese flujo se documentara con mayor detalle mas adelante.

## Ordenes de trabajo

Cuando un pedido incluye OT, se envia la OT firmada y se descuentan los consumos del stock.

Este flujo tambien genera comunicacion por mail y deberia quedar integrado al seguimiento del pedido.

## Problema principal a resolver

El flujo actual genera una gran cantidad de mails diarios.

El objetivo es reducir esa dependencia del mail y reemplazarla por estados visibles en tableros de control.

En lugar de que cada sector informe manualmente por mail cada avance, el sistema deberia actualizar el estado del pedido cuando se crea o registra el documento correspondiente.

## Tableros por sector

### Ventas

Ventas necesita un tablero para:

- Presupuestos o cotizaciones.
- Pedidos activos.
- Seguimiento de respuestas pendientes.
- Pedidos pendientes de administracion.
- Pedidos pendientes de preparacion.
- Pedidos preparados.
- Documentacion generada por administracion.
- Clientes principales.
- Cotizaciones importantes.

La respuesta de administracion deberia actualizarse automaticamente con la creacion del documento correspondiente, por ejemplo remito, factura o confirmacion de pago.

### Despacho o almacenes

Despacho necesita un tablero para:

- Pedidos a preparar.
- Pedidos preparados a enviar.
- Pedidos preparados para retiro del cliente.
- Documentos de preparacion pendientes.
- Datos logisticos del pedido: bultos, lote, peso, volumen y distribucion.

### Logistica

Logistica necesita visibilidad sobre:

- Pedidos preparados para enviar.
- Pedidos preparados para retirar.
- Informacion de bultos.
- Peso y volumen cuando corresponda.
- Estado de entrega.

### Administracion

Administracion necesita un tablero con pedidos pendientes de:

- Factura anticipada.
- Remito.
- Factura con remito.
- Factura tras recepcion del pedido.
- Facturas que esperan habilitacion del cliente.
- Confirmacion de pago.
- Recibo.

### Compras

Compras necesita un tablero para:

- Compras asociadas a pedidos.
- Compras internas.
- Compras pendientes.
- Compras que destraban pedidos.

### Taller

Taller necesita un tablero con pedidos y trabajos en diferentes estados, por ejemplo:

- Falta pago.
- Falta OT.
- En taller.
- En costura.
- Esperando productos.
- Pendiente de fabricacion.
- Pendiente de terminacion.
- Listo para entregar o preparar.

## Criterio general del modulo

Cada pedido deberia tener un estado visible y compartido entre sectores.

Cada sector deberia ver principalmente lo que necesita para trabajar:

- Tareas pendientes.
- Tareas hechas.
- Pedidos bloqueados.
- Pedidos que esperan accion de otro sector.
- Indicadores relevantes.

La informacion deberia actualizarse por eventos reales del proceso, como creacion de remito, factura, confirmacion de pago, preparacion del pedido, generacion de OT o cierre de entrega.

