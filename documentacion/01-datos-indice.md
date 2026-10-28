# 01 - Datos | Versión completa para IA

Este documento es la fuente explícita para una IA que continúe el trabajo del chat `01 Datos`.

Reglas de lectura:

- No convertir una observación, una columna usada por Excel o una recomendación técnica en una decisión del usuario.
- Mantener separados: confirmado, pendiente de validar y reservado para después.
- No volver a preguntar decisiones ya registradas como confirmadas.
- No considerar terminada una tarea mientras existan pruebas o decisiones indicadas como pendientes.
- La versión resumida para el usuario está en `01-datos-indice.html`.

## Etapa actual

- **01-01:** Datos necesarios para la primera pantalla de pedidos.
- **Objetivo:** mostrar pedidos activos y sus líneas con stock, Taller, factura, remito, recibo y Entrega.
- **Límite:** Taller y Entrega son manuales en esta etapa. Los demás módulos quedan fuera.
- **Fuentes importantes:** no se detectó una familia faltante para construir la primera pantalla.

## Índice de temas definidos

### 01-01-01 Pedidos

#### 01-01-01.1 Endpoint de cabecera

- Endpoint adoptado: `GET /api/ISIS_PedidoClteCab_VW`.
- Parámetros disponibles: número de pedido y fecha desde/hasta.
- Empresa operativa: 1.
- Para identificar pedidos de venta, el Excel filtra `desCpbtePedido = "Pedido cliente autom"`.
- La selección final de campos para la aplicación sigue pendiente.

#### 01-01-01.2 Endpoint de detalle

- Endpoint adoptado: `GET /api/ISIS_PedidoClteDet_VW`.
- Relación con cabecera por el identificador interno de pedido.
- El Excel conserva identidad de pedido y línea, artículo, descripción, unidad, cantidad y precio unitario.
- Existen diferencias de nombres entre Excel y Swagger que deben comprobarse con una respuesta real.

#### 01-01-01.3 Pantalla inicial

Una fila por línea de pedido:

`PEDIDO | PEDIDO LÍNEA | COD. CLIENTE | CLIENTE | COD. ARTÍCULO | ARTÍCULO | CANTIDAD | VENDEDOR | STOCK | TALLER | FC | REM | RC | ENTREGA`

#### 01-01-01.4 Regla de cierre

`terminado = tiene FC + tiene REM + tiene RC relacionado + entrega confirmada`

- Taller no bloquea el cierre.
- El cierre se evalúa por pedido.
- Al terminar, salen de la lista activa todas sus líneas.
- El historial se conserva.
- En esta etapa no se exige comprobar saldo cancelado ni cobertura completa de cantidades.

### 01-01-02 Artículos

#### 01-01-02.1 Maestro

- Endpoint elegido: `GET /api/ISIS_Articulo_VW`.
- `codInternoArti` conserva el código conocido por los usuarios.
- `regisArti` es candidato a identificador técnico interno de ISIS.
- El último respaldo conserva 23 campos con Sí, 38 con No y 5 para revisar.

#### 01-01-02.2 Selección de campos

- Las decisiones exportadas quedan preservadas.
- Cinco campos continúan en revisión.

#### 01-01-02.3 Actualización

- Barrido completo fuera del horario operativo.
- Alta automática puntual por código cuando un documento referencia un artículo inexistente localmente.
- Actualización puntual bajo demanda para cambios de artículos existentes.
- `POST /api/ISIS_Articulo_Insertar_Actualizar` se conserva como posibilidad futura; no se usa en la primera etapa.

#### 01-01-02.4 Calidad de datos

- Los pesos todavía no están cargados; un valor cero se interpreta como dato desconocido.

### 01-01-03 Stock

- Endpoint elegido: `GET /api/ISIS_ArticuloStock_VW`.
- Relación: `codInternoArti = codArticulo`.
- Empresa 1, depósito operativo 1.
- Depósito 80 Reserva: excluido.
- Se usan `stockUm1` y `stockUm2`.
- `cantCompraUm1/2` y `cantVentaUm1/2` no representan pendientes útiles y fueron descartados.

### 01-01-04 Clientes

- Endpoint elegido: `GET /api/ISIS_Cliente_VW`.
- Estrategia de actualización igual a Artículos.
- `codigoCli` sigue visible y relaciona documentos.
- Sólo se incorpora al maestro local un cliente con CUIT real y válido.
- Si un documento trae un cliente inválido, se conserva la razón social documental pero no se crea un maestro defectuoso.
- Los CUIT duplicados existentes son un problema de datos a corregir en ISIS.
- Contactos y sucursales son datos locales de GestionCyE.

### 01-01-05 Proveedores

- Fuente evaluada: `GET /api/ISIS_Proveedor_VW`.
- Mismo criterio de vigencia que Clientes: CUIT real y válido.
- Sin aplicación en la primera pantalla.
- Contactos, rubros/productos, sucursales, CBU y alias serán locales.

### 01-01-06 Catálogos

Catálogos que se replican desde ISIS y no se editan localmente:

- Condiciones de pago.
- Listas de precios.
- Monedas.
- Vendedores.
- Tipos de comprobante.

`IVACondicion` fue quitado por no aportar al alcance actual.

### 01-01-07 Facturas

#### 01-01-07.1 Cabecera normal

- Fuente: `GET /api/ISIS_VentasCabecera_VW`.

#### 01-01-07.2 Detalle normal

- Fuente: `GET /api/ISIS_VentasDetalle_VW`.
- Puede referenciar pedido y remito.

#### 01-01-07.3 Factura anticipada

- Fuente disponible: `GET /api/ISIS_VentasDetalLeFCAnti_VW`.
- No existe una cabecera anticipada equivalente entre las consultas usadas.
- El detalle anticipado contiene referencias candidatas para volver al pedido.

La selección final de campos y las relaciones deben comprobarse con casos reales.

### 01-01-08 Remitos

#### 01-01-08.1 Cabecera

- Fuente: `GET /api/ISIS_RemitoClienteCabecera_VW`.
- Puede incluir vínculo directo con pedido.
- Conserva datos de flete y lugar de entrega.

#### 01-01-08.2 Detalle

- Fuente: `GET /api/ISIS_RemitoClienteDetalle_VW`.
- Relación con cabecera por `regis_RtoCliCab`.
- Puede incluir `regis_FCAntiDet` para el circuito anticipado.

### 01-01-09 Recibos e imputaciones

- Fuente: `GET /api/ISIS_OperacionesClienteImputacion_VW`.
- La imputación vincula recibos con facturas.
- Contiene referencias de débito y crédito.
- No se confirmó un importe aplicado por vínculo; para la primera pantalla sólo se necesita la existencia del recibo relacionado.

### 01-01-10 Trazabilidad documental

#### 01-01-10.1 Circuito normal

`Pedido -> Remito -> Factura -> Imputación -> Recibo`

Las relaciones pueden ser múltiples; no asumir uno a uno.

#### 01-01-10.2 Circuito anticipado

`Pedido -> Factura anticipada -> Remito -> Imputación -> Recibo`

El cruce por detalle anticipado es candidato y necesita prueba real.

#### 01-01-10.3 Regla de modelado

- No unir una línea documental solamente por código de artículo.
- No multiplicar filas de pedido al combinar varios documentos.
- Facturas, remitos y recibos se modelan como colecciones relacionadas con el pedido.

### 01-01-11 Sincronización

- Las pantallas leen la base local.
- Los documentos se sincronizan automáticamente en segundo plano.
- Los maestros tienen barrido nocturno y altas puntuales automáticas.
- Los cambios de maestros existentes pueden actualizarse bajo demanda.
- Ninguna consulta masiva bloquea al usuario.
- Cada entidad tendrá estrategia y frecuencia propias.

### 01-01-12 Datos locales

- Estados manuales de Taller.
- Estado manual de Entrega.
- Usuario y fecha de cada cambio.
- Contactos y sucursales de clientes.
- Cada pedido conserva el contacto y destino confirmados cuando esos datos entren en alcance.

### 01-01-13 Fuentes reservadas para después

- Cheques de clientes en cartera.
- Cheques propios y transferencias.
- Mayor de cuentas para conciliación bancaria.
- Composición de deuda para cobranzas.
- PDF de comprobantes.
- Escritura de artículos en ISIS.

No son bloqueantes de la primera pantalla.

### 01-01-14 Laboratorio técnico del Sprint 1

Definido, todavía no implementado:

- Cliente seguro para la API de ISIS.
- Base PostgreSQL local mínima.
- Importaciones idempotentes.
- Registro de tiempos, cantidades y errores.
- Interfaz técnica para ejecutar y comparar consultas.
- Prueba de alta y actualización sin duplicados.

## Tareas pendientes

### Ahora: cerrar datos de la primera pantalla

| Código | Tarea | Resultado esperado |
|---|---|---|
| 01-01-01.1.1 | Seleccionar campos de cabecera de pedido | Campos a leer, conservar y usar sólo como filtro |
| 01-01-01.1.2 | Ver valores reales de `pedidoPendiente`, `tipoPedido` y `sucursalEntrega` | Significado funcional confirmado |
| 01-01-01.1.3 | Confirmar alcance de identidad de `regis_PedCliCab` | Clave externa definida sin suposiciones |
| 01-01-01.2.1 | Seleccionar campos de detalle de pedido | Contrato mínimo de líneas |
| 01-01-01.2.2 | Comprobar nombres reales del JSON de detalle | Resolver variantes con y sin guiones bajos |
| 01-01-01.2.3 | Definir qué muestra PEDIDO LÍNEA | Posición visible o identificador estable |
| 01-01-07.1.1 | Seleccionar campos de factura cabecera | Contrato mínimo de factura |
| 01-01-07.2.1 | Seleccionar campos de factura detalle | Vínculos a pedido y remito definidos |
| 01-01-07.3.1 | Seleccionar campos de factura anticipada | Vínculo al pedido definido |
| 01-01-08.1.1 | Seleccionar campos de remito cabecera | Contrato mínimo y vínculo directo |
| 01-01-08.2.1 | Seleccionar campos de remito detalle | Artículos y vínculo anticipado definidos |
| 01-01-09.1.1 | Seleccionar campos de imputaciones | Recibo y factura identificables |
| 01-01-10.1.1 | Probar un circuito normal real completo | Pedido, remito, factura y recibo relacionados |
| 01-01-10.2.1 | Probar un circuito anticipado real completo | Pedido, factura anticipada, remito y recibo relacionados |
| 01-01-10.3.1 | Probar documentos múltiples y parciales | Cardinalidades reales confirmadas |
| 01-01-12.1.1 | Definir estados manuales de Taller | Lista corta y significado de cada estado |
| 01-01-12.2.1 | Definir estados manuales de Entrega | Debe existir un estado inequívoco de entrega completa |
| 01-01-12.2.2 | Definir auditoría de cambios manuales | Usuario, fecha y motivo si corresponde |

### Después: demostrar sincronización

| Código | Tarea | Resultado esperado |
|---|---|---|
| 01-01-11.1.1 | Medir consultas completas y filtradas | Tiempo, volumen y errores reales |
| 01-01-11.1.2 | Definir latencia operativa aceptable | Frecuencia por documento |
| 01-01-11.1.3 | Definir ventana móvil de pedidos abiertos | Detectar cambios en pedidos anteriores |
| 01-01-11.2.1 | Probar altas puntuales de cliente y artículo | Dependencias automáticas completas |
| 01-01-11.2.2 | Probar actualización de maestros existentes | Sin bloquear la pantalla |
| 01-01-14.1.1 | Diseñar tablas locales mínimas | Modelo sin duplicar datos de ISIS innecesariamente |
| 01-01-14.2.1 | Implementar cliente ISIS seguro | Credenciales sólo por entorno |
| 01-01-14.3.1 | Implementar importación transaccional e idempotente | Repetir no duplica ni deja datos parciales |
| 01-01-14.4.1 | Implementar interfaz técnica | Ejecutar, medir e inspeccionar consultas |
| 01-01-14.5.1 | Probar alta y actualización | Evidencia reproducible para cerrar Sprint 1 |

### Pendientes de calidad de datos, no bloqueantes inmediatos

| Código | Tarea |
|---|---|
| 01-01-02.2.1 | Resolver los 5 campos de Artículos que continúan en revisión |
| 01-01-02.4.1 | Completar pesos de artículos; hoy los ceros significan dato no cargado |
| 01-01-04.2.1 | Depurar clientes duplicados por CUIT en ISIS |
| 01-01-05.1.1 | Definir cuándo Proveedores entra en una pantalla concreta |
| 01-01-06.1.1 | Cerrar campos mínimos de Listas de precios, Monedas, Vendedores y Comprobantes |

## Fuera de esta etapa

Cotizaciones, OT, Taller automático, Compras, Logística automática, certificados, avisos a clientes/fleteros, cobranzas, bancos y conciliaciones tienen antecedentes documentados, pero no forman parte de la primera pantalla.

La numeración de Arquitectura u otros chats debe definirse en esos chats. Este índice no les asigna códigos.
