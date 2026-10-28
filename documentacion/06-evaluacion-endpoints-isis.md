# Evaluación de endpoints ISIS

Este archivo conserva decisiones breves. La selección de campos se realiza en
`analisis-api-isis.html`.

## Artículos

### Elegido: `GET /api/ISIS_Articulo_VW`

Se usará como candidato a maestro local de artículos.

Motivos:

- Devuelve `regisArti`, código interno, descripciones, estado y clasificación.
- Permite buscar por código interno, código de barras, descripción e ID interno.
- Ya se utiliza satisfactoriamente en una consulta Power Query.
- Mantiene separados los datos maestros del stock y los precios.

Confirmado por conocimiento del negocio:

- `regisArti` es el ID interno autonumérico de ISIS.
- `senInhabilitadoArti` indica si el artículo está activo o inhabilitado.
- La empresa trabaja actualmente con un único depósito.
- Los artículos inhabilitados no deben persistirse en la base local. El campo de
  estado puede utilizarse durante la importación para filtrar sin guardar esos
  registros.
- La unidad secundaria se utiliza en pocos artículos, principalmente cadenas.
  Esos artículos no se modifican: cualquier cambio exige crear un artículo nuevo.
- `partidaLoteArti`, `nroSerieArti` y `despachoArti` son indicadores de sí/no;
  no contienen el lote, número de serie o despacho real.
- Actualmente ISIS no tiene cargados los pesos de los artículos. Completar esa
  información será una tarea propia y progresiva.

Pendiente:

- Comprobar si `Regis_Arti` sólo admite coincidencia exacta o permite recuperar
  registros posteriores a un ID. Que el parámetro sea de tipo `integer` no
  define el operador aplicado por ISIS.

Prueba real del 30/07/2026:

- Respuesta completa: 7.498 filas, aproximadamente 12,5 MB.
- Tiempo de respuesta completo: 28,55 segundos.
- Artículos activos: 1.090.
- Artículos inactivos: 6.408.
- Consulta por código interno: 1 fila en 161 ms.
- Consulta por `regisArti`: 1 fila exacta en 152 ms.

La consulta completa no es apta para actualización frecuente. Las consultas
puntuales tienen un tiempo operativo aceptable.

### Estrategia de actualización de artículos

- Ejecutar una actualización general durante la noche.
- No bloquear las pantallas ni el flujo operativo con esa consulta.
- Cuando ingresa un pedido, revisar los códigos de artículo de sus líneas.
- Si un artículo no existe localmente, fue habilitado recientemente o necesita
  refresco, consultarlo puntualmente mediante `CodInternoArti`.
- Aplicar la misma estrategia para clientes y proveedores referenciados por
  documentos.
- La incorporación de maestros nuevos es automática.
- La actualización puntual bajo demanda se reserva para maestros existentes que
  hayan cambiado.

La inmediatez funcional debe resolverse al importar automáticamente el
documento. Sus maestros se actualizan como dependencias puntuales, sin descargar
los maestros completos.

### Descartado para el maestro: `GET /api/ISIS_Articulo`

Combina artículos, stock y una lista de precios configurada en el módulo API de
ISIS. La empresa maneja varias listas y el precio realmente utilizado por Ventas
no siempre coincide con el cargado en ISIS.

No se elimina del relevamiento: podría servir para una consulta puntual si más
adelante se confirma un uso concreto.

### No elegido: `GET /api/ISIS_ArticuloVW_Pag`

Devuelve el maestro por páginas, pero el schema actual no incluye `regisArti`.
Además, el texto del Swagger menciona filtros por código de barras y descripción
que no aparecen entre sus parámetros publicados.

Sólo se reconsiderará si la consulta completa resulta demasiado pesada.

### Complemento pendiente: `GET /api/ISIS_ArticuloStock_VW`

Elegido como fuente de stock actual por artículo.

Prueba real del 30/07/2026:

- Respuesta completa: 5.975 filas, aproximadamente 2 MB.
- Tiempo completo observado: entre 1,39 y 2,39 segundos.
- Empresa 1: 4.853 filas.
- Depósito 1, tipo `Inventario`: 4.851 filas.
- Depósito 80, tipo `Reserva`: 2 filas. Falta confirmar su tratamiento.
- Consulta filtrada por un artículo: 1 fila en 69 ms.
- Una ejecución filtrada sólo por empresa demoró aproximadamente 154 segundos.
  Debe repetirse antes de concluir que el filtro causa la demora.

Los campos `cantCompraUm1` y `cantVentaUm1` no representan pendientes. En las
4.851 filas de Inventario se cumplió:

`cantCompraUm1 - cantVentaUm1 = stockUm1`

Para la unidad 2, la fórmula se cumplió en 4.839 filas y tuvo 12 diferencias.
Los nombres parecen representar acumulados de entradas y salidas; su semántica
exacta sigue pendiente de confirmación con ISIS.

La relación con el maestro se realiza mediante el código del artículo. Las
descripciones repetidas no son necesarias para la base local.

### Útil para una etapa posterior: `POST /api/ISIS_Articulo_Insertar_Actualizar`

Se conserva como capacidad futura. Podría convertir artículos locales de
Compras, Taller o consumibles en artículos formales de ISIS.

No se probará ni utilizará durante el Sprint 1 porque escribe en ISIS. Antes de
habilitarlo habrá que definir validaciones, permisos, prevención de duplicados y
tratamiento de errores.

## Clientes

### Elegido: `GET /api/ISIS_Cliente_VW`

Se usará para el maestro local y para consultas puntuales por `CodigoCli`.

Prueba real del 30/07/2026:

- Respuesta completa: 11.353 filas, aproximadamente 16,79 MB.
- Tiempo completo: 9,79 segundos.
- Clientes activos: 11.289.
- Clientes inactivos: 64.
- Activos sin CUIT o con CUIT genérico: 2.579.
- Activos con factura desde 2020: 1.875.
- Consulta por código: 1 fila en 103 ms.

La descarga completa es aceptable para el barrido nocturno. Los clientes
se sincronizarán con la misma estrategia que Artículos:

- Barrido completo nocturno.
- Conservar sólo clientes vigentes y relevantes para la operación.
- Actualización puntual por `CodigoCli`.
- Incorporación automática cuando un documento referencia un cliente nuevo,
  siempre que sus datos sean válidos.

`codigoCli` seguirá siendo el código ISIS visible y conocido por los usuarios.
La clave técnica real de ISIS podría ser compuesta y queda pendiente de
confirmación. El CUIT se utilizará como control obligatorio de validez y
unificación de duplicados.

ISIS permite CUIT repetidos. GestionCyE deberá mantener la referencia de cada
código ISIS para no perder vínculos históricos, pero asociar los códigos
duplicados a un único cliente canónico por CUIT. Existe una tarea de calidad de
datos para dejar un solo cliente por CUIT también en ISIS.

Un registro con CUIT inválido se considera descarte y no se incorpora como
cliente local. El documento puede conservar la razón social informada por ISIS
sin crear un cliente duplicado.

### No elegido: `GET /api/ISIS_Cliente_Pag`

Devuelve los mismos 63 campos por páginas. Permite limitar memoria, reintentar
una página fallida y mostrar progreso, pero no aporta incrementalidad. Como la
consulta completa respondió en menos de 10 segundos y ya funcionaba en el
proyecto anterior, por ahora se prioriza la versión simple.

### Datos propios de GestionCyE

Contactos y sucursales se cargarán y administrarán exclusivamente en GestionCyE.
No se tomarán de endpoints ISIS.

### Lecciones del proyecto anterior

- Ya utilizaba `ISIS_Cliente_VW` completo todos los días a las 06:30.
- Usaba `codigoCli` como clave de sincronización, aunque la clave técnica real
  de ISIS podría ser compuesta.
- Filtraba clientes activos, con CUIT válido y actividad reciente. El nuevo
  sistema mantendrá el criterio de no cargar clientes muertos o inválidos.
- Consultaba por error `codigoListaPrec`, pero el campo real es
  `codigListaPrec`.
- La nueva integración no debe incluir credenciales en el código.

## Proveedores

### Prueba inicial: `GET /api/ISIS_Proveedor_VW`

Prueba real del 30/07/2026:

- Respuesta completa: 3.510 filas, aproximadamente 9,04 MB.
- Tiempo completo: 22,25 segundos.
- `codigoProve`: 3.510 valores únicos.
- `regisProve`: 3.510 valores únicos.
- 71 proveedores informan un cliente asociado.
- Los 71 códigos de cliente informados existen en `ISIS_Cliente_VW`.
- Desde Clientes, 84 vínculos informados coinciden con un `codigoProve`.

Esto confirma que ISIS ya conserva relaciones explícitas entre clientes y
proveedores. No corresponde deducirlas solamente por igualdad de CUIT.

Queda pendiente repetir dos controles:

- Interpretar correctamente los valores de `estadoProve`.
- Comparar los CUIT normalizados de ambos maestros. La primera medición resultó
  contradictoria con los vínculos explícitos y no se considera válida.

La estrategia candidata es la misma que para Clientes: barrido nocturno completo
y actualización puntual por `CodigoProve`. La selección de campos se hará después
de completar estas verificaciones.

### Datos propios de GestionCyE

Para proveedores, GestionCyE administrará localmente contactos, rubros y
productos relacionados, sucursales, CBU y alias. No dependerán de que esos datos
estén cargados en ISIS. Esta funcionalidad queda prevista para una etapa
posterior y no tendrá aplicación por el momento.

### Criterio de proveedor activo

Se seguirá el criterio utilizado para Clientes: sólo se incorporarán proveedores
con CUIT real y válido. El valor de `estadoProve` se conservará para análisis,
pero no alcanzará por sí solo para definir la vigencia operativa.

## Catálogos ISIS

Endpoints incorporados al relevamiento:

- `GET /api/ISIS_CondicionPago_VW`
- `GET /api/ISIS_ListaPrecios_VW`
- `GET /api/ISIS_Moneda_VW`
- `GET /api/ISIS_Vendedor_VW`
- `GET /api/ISIS_API_Comprobantes`

Serán tablas locales de referencia administradas exclusivamente en ISIS. Se
sincronizarán completas por la noche. Quedan pendientes las pruebas reales de
cantidad, tiempo, contenido y filtros porque la API no fue accesible desde el
entorno de Codex durante este relevamiento.

## Operaciones V2 no habilitadas

Prueba real del 04/08/2026 desde Swagger, con autorización y
`CodEmpresa_All = 1`:

| Endpoint | HTTP | Respuesta | Tiempo |
|---|---:|---|---:|
| `ISIS_API_Presupuestos` | 200 | `[]` | 228 ms |
| `ISIS_API_Pedidos` | 200 | `[]` | 177 ms |
| `ISIS_API_RemitosDeVenta` | 200 | `[]` | 512 ms |
| `ISIS_API_Ventas` | 200 | `[]` | 278 ms |
| `ISIS_API_FacturasAnticipadasDeVentas` | 200 | `[]` | 320 ms |
| `ISIS_API_OrdenesDeCompra` | 200 | `[]` | 332 ms |
| `ISIS_API_RemitosDeCompra` | 200 | `[]` | 252 ms |
| `ISIS_API_FacturasAnticipadasDeCompras` | 200 | `[]` | 410 ms |

`ISIS_API_Pedidos` también se probó con rango de empresa 1 a 1 y devolvió `[]`.

Conclusión: los endpoints están publicados y responden correctamente a nivel
HTTP, pero no entregan datos de la empresa. No se usarán ni se incorporarán a la
matriz de campos mientras ISIS no los habilite. El relevamiento operativo seguirá
con los endpoints V1 de cabecera y detalle.

## Tesorería futura

### Útil posteriormente: `GET /api/ISIS_ChequesEnCarteraCliente_VW`

Puede alimentar un tablero de cheques recibidos todavía disponibles para
depositar o vender. Aporta cliente, banco, importe, moneda y fechas de emisión,
depósito y acreditación.

No forma parte del MVP inmediato, pero se incorpora a la matriz para conservar
el análisis. Antes de implementarlo hay que probar datos reales y resolver una
inconsistencia del Swagger: la descripción habla de una lista, mientras el
esquema documenta un único objeto.

### Útil posteriormente: `GET /api/ISIS_ChequesPropiosYTransferencias`

Complementa los cheques recibidos con los pagos emitidos por la empresa. Puede
usarse para calendario de egresos, seguimiento de pagos a proveedores,
conciliación bancaria y alertas por cheques rechazados.

Permite consultar cheques, transferencias o ambos. No forma parte del MVP
inmediato. Antes de implementarlo se probarán sus datos reales y la forma de la
respuesta, porque Swagger también describe una lista pero documenta un único
objeto.

## Logística

### Endpoints descartados

- `GET /api/ISIS_ClienteConSucursales`
- `GET /api/ISIS_ClienteSucursales_VW`

Contactos y sucursales serán datos locales, cargados incrementalmente al procesar
pedidos. El pedido no podrá avanzar si faltan el contacto o el destino completos.

## Comprobantes PDF

### Útil posteriormente: `GET /api/ISIS_ComprobantePdf`

Prueba real del 20/08/2026:

- Factura: PDF A4 válido de una página, 59.018 bytes, 444 ms.
- Remito: PDF A4 válido de una página, 43.670 bytes, 591 ms.
- Comprobante inexistente: respuesta `404` en 216 ms.
- La respuesta incluye `application/pdf` y un nombre de archivo.

Puede permitir mostrar, descargar o adjuntar el comprobante desde GestionCyE.
Necesita `CodigoDivision`, la descripción exacta y el número del documento.

## Conciliación bancaria

### Confirmado: `GET /api/ISIS_MayorCuentaConta_VW`

Prueba real del 20/08/2026:

- Banco Galicia (`1119`): 216 filas en 522 ms para veinte días.
- Banco Credicoop (`111601`): 38 filas en 276 ms para veinte días.
- En ambos casos cada movimiento apareció exactamente dos veces.
- Galicia tenía 108 movimientos únicos y Credicoop, 19.

El endpoint aporta fecha, importe con signo, debe, haber, concepto, número de
asiento y tipo y número de comprobante. Son datos suficientes como fuente ISIS
para comparar contra los extractos bancarios.

Antes de sumar o conciliar se deben eliminar los duplicados exactos. Esta regla
debe validarse una vez contra un mayor exportado directamente desde ISIS para no
eliminar por error dos movimientos legítimos iguales.
