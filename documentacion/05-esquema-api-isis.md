# Esquema API ISIS

## Archivo descargado

Se descargo el esquema Swagger/OpenAPI de ISIS desde:

- https://sistemaisis.ar:8103/swagger/v1/swagger.json

Archivo local:

- `documentacion/isis-swagger-v1.json`

## Datos generales del esquema

- Titulo: ISIS Cloud ERP - API
- Version API: v1
- OpenAPI: 3.0.1
- Cantidad de endpoints relevados: 193
- Cantidad de schemas/modelos relevados: 226

## Autenticacion

La API declara autenticacion por API key:

- Nombre: `X-Api-Key`
- Ubicacion: header HTTP

En el sistema nuevo, la API key no debe quedar escrita en el codigo. Debe configurarse por entorno, por ejemplo en `.env`, especialmente para la ejecucion en VPS.

## Endpoints relevantes para el primer modulo

### Clientes

- `/api/ISIS_Cliente_VW`
- `/api/ISIS_Cliente_Pag`

Parametros utiles detectados:

- `CodigoCli`
- `CuitCli`
- `RazonSocialBusCli`

### Presupuestos / cotizaciones

- `/api/ISIS_PresupuestoVtaCab_VW`
- `/api/ISIS_PresupuestoVtaDet_VW`
- `/api/ISIS_PresupuestoVtaCab_Pag`
- `/api/ISIS_PresupuestoVtaDet_Pag`
- `/api/ISIS_API_Presupuestos`

Endpoints especialmente interesantes:

- `/api/ISIS_API_Presupuestos`: obtiene presupuestos de clientes con detalle de articulos.

Parametros utiles detectados:

- `CodigoCli`
- `DesdeFecha`
- `HastaFecha`
- `DescriCpbte`
- `DesdeNroCpbte`
- `HastaNroCpbte`

### Pedidos

- `/api/ISIS_PedidoClteCab_VW`
- `/api/ISIS_PedidoClteDet_VW`
- `/api/ISIS_PedidoClteCab_Pag`
- `/api/ISIS_PedidoClteDet_Pag`
- `/api/ISIS_API_Pedidos`

Endpoints especialmente interesantes:

- `/api/ISIS_API_Pedidos`: obtiene pedidos de clientes con detalle de articulos.

Parametros utiles detectados:

- `NumeroPedCliCab`
- `FechaPedCliCabDesde`
- `FechaPedCliCabHasta`
- `FechaVigPedCliDetDesde`
- `FechaVigPedCliDetHasta`
- `CodigoCli`
- `DesdeFecha`
- `HastaFecha`
- `DescriCpbte`
- `DesdeNroCpbte`
- `HastaNroCpbte`

### Remitos

- `/api/ISIS_RemitoClienteCabecera_VW`
- `/api/ISIS_RemitoClienteDetalle_VW`
- `/api/ISIS_RemitoClienteTrazabilidad_VW`
- `/api/ISIS_API_RemitosDeVenta`

Endpoints especialmente interesantes:

- `/api/ISIS_API_RemitosDeVenta`: obtiene remitos de clientes con detalle y trazabilidad.

Parametros utiles detectados:

- `CodigoCli`
- `Descripcion`
- `NroComprob_RtoCliCab`
- `Fecha_RtoCliCabDesde`
- `Fecha_RtoCliCabHasta`
- `Regis_RtoCliCab`
- `DesdeFecha`
- `HastaFecha`

### Facturas anticipadas

- `/api/ISIS_API_FacturasAnticipadasDeVentas`

Parametros utiles detectados:

- `CodigoCli`
- `DesdeFecha`
- `HastaFecha`
- `DescriCpbte`
- `DesdeNroCpbte`
- `HastaNroCpbte`

### Articulos y stock

- `/api/ISIS_Articulo_VW`
- `/api/ISIS_Articulo_Pag`
- `/api/ISIS_ArticuloStock_VW`
- `/api/ISIS_ArticuloStock_Pag`
- `/api/ISIS_ArticuloStockFecha_VW`
- `/api/ISIS_ArticuloStockIntegrado_VW`

Parametros utiles detectados:

- `CodInternoArti`
- `CodBarraArti`
- `DescriBusArti`
- `Regis_Arti`
- `Cod_Articulo`
- `Cod_Empresa`
- `Cod_Deposito`

### Compras

- `/api/ISIS_OrdenCompraCab_VW`
- `/api/ISIS_OrdenCompraDet_Api`
- `/api/ISIS_API_OrdenesDeCompra`
- `/api/ISIS_API_Compras`
- `/api/ISIS_API_ComprasSinProductos`

Parametros utiles detectados:

- `CodigoProve`
- `DescripcionCpbte`
- `Fecha_PrvTraDesde`
- `Fecha_PrvTraHasta`
- `Numero_OrdCpCabDesde`
- `Numero_OrdCpCabHasta`
- `codigoArticulo`
- `fechaEntrega`
- `fechaOrdenCompra`
- `numeroComprobante`
- `pageNumber`
- `pageSize`

## Primeras conclusiones

1. ISIS expone suficientes endpoints para empezar por presupuestos, pedidos, clientes, remitos, articulos, stock y compras.
2. Para el modulo inicial conviene analizar primero los endpoints agregados:
   - `/api/ISIS_API_Presupuestos`
   - `/api/ISIS_API_Pedidos`
   - `/api/ISIS_API_RemitosDeVenta`
3. Tambien conviene conservar los endpoints separados por cabecera/detalle, porque pueden servir para sincronizaciones incrementales o consultas mas especificas.
4. Hay endpoints paginados (`_Pag`) y endpoints sin paginar (`_VW`). Para sincronizacion en VPS deberiamos preferir paginados cuando exista mucha cantidad de registros.
5. Muchos endpoints permiten filtro por fecha o rango de comprobantes, lo cual puede servir para actualizaciones incrementales.
6. Aunque el Swagger muestra una API amplia, no todos los endpoints estan necesariamente habilitados para el uso real de la empresa.

## Disponibilidad real de endpoints

El esquema Swagger debe tomarse como mapa tecnico de posibilidades, no como garantia de disponibilidad.

Antes de construir una funcionalidad apoyada en un endpoint, hay que validar:

- Si el endpoint responde correctamente.
- Si esta habilitado para la API key disponible.
- Si devuelve datos para la empresa.
- Si acepta los filtros documentados.
- Si la respuesta coincide con el schema publicado.
- Si tiene paginacion o limites practicos.
- Si el tiempo de respuesta es aceptable para el uso esperado.

Cada endpoint relevante deberia clasificarse como:

- Disponible.
- Disponible con limitaciones.
- No habilitado.
- Pendiente de prueba.

Esta clasificacion deberia guardarse como parte del relevamiento tecnico de integracion.

## Pendientes de analisis

1. Revisar los schemas de respuesta de presupuestos, pedidos y remitos.
2. Identificar claves de relacion entre cabecera y detalle.
3. Medir tiempos reales de consulta por endpoint.
4. Ver si los endpoints agregados alcanzan para reconstruir el seguimiento del pedido.
5. Definir que informacion se guarda localmente y que informacion se consulta en tiempo real.
6. Confirmar como detectar documentos nuevos o modificados desde ISIS.
