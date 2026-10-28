# Consolidación de datos ISIS

Estado: cruce documental completo. El usuario aclaró que no quedaron decisiones sin exportar. Selección operativa final y pruebas pendientes, separadas de esta tarea.
Este archivo y el HTML proceden de 09-consolidacion-datos.json. No reemplazan decisiones explícitas por selecciones inferidas del Excel.

## Alcance y reglas

- Primera entrega: pantalla de pedidos activos y sus líneas. FC, REM y RC vienen de ISIS; Taller y Entrega son manuales.
- Terminado = tiene al menos una FC + al menos un REM + al menos un RC relacionado + entrega completa confirmada. Taller no agrega condición.
- El pedido terminado sale de la lista activa con todas sus líneas y conserva historial. No se requiere calcular saldos ni cobertura de cantidades en esta etapa.
- Empresa 1 y depósito operativo 1. Se excluye depósito 80 (Reserva), según el respaldo de Stock. Un punto de venta.
- Los documentos se sincronizan automáticamente en segundo plano. Maestros: barrido nocturno y altas puntuales automáticas si un documento los referencia; cambios de maestros existentes bajo demanda.
- No duplicar nombres de vendedores en cada entidad como maestro paralelo; relacionar por código. Las descripciones documentales y del artículo pueden tener valor histórico distinto del maestro.
- CUIT válido para clientes y proveedores; códigos ISIS visibles. La depuración de CUIT duplicados sigue pendiente. No fusionar códigos destruyendo trazabilidad.
- Contactos y sucursales serán locales. No son requisitos adicionales de la primera pantalla acotada. OT, logística automática, compras, certificados, avisos y cotizaciones quedan para después.
- Un documento puede relacionarse con varios pedidos y viceversa. No multiplicar líneas por combinar todos los documentos; no inventar una relación de línea sólo por código de artículo.
- No confundir cantidad de stock con reserva o disponibilidad futura. cantCompra y cantVenta no se usarán como pendientes.
- Los Sí/No de respaldos se preservan. Un campo seleccionado en Excel no queda automáticamente aprobado para GestionCyE. Una propuesta de otra IA tampoco es una aprobación.
- Las mediciones existentes son antecedentes de 2026, no nuevas pruebas de esta consolidación. No se consultó la API durante la tarea 1.

## Pendientes

- **Siguiente tarea: Selección de campos operativos.** Pedidos, facturas, remitos e imputaciones tienen evidencia de uso en Excel, no una selección explícita para la app. Revisarlos por entidad con el usuario, sin repetir las decisiones ya guardadas.
- **Prueba posterior: Nombres de Pedido Detalle.** El Excel usa regisPedCliCab, regisPedCliDet y cantiPedidaUmp. Los Swagger locales pueden publicar variantes con guiones bajos. Validar el contrato real antes de programar el adaptador.
- **Decisión posterior: Estados manuales y línea visible.** Definir opciones de Taller y Entrega y qué significa PEDIDO LINEA visualmente. El ID interno no prueba una posición correlativa.
- **Prueba posterior: Sincronización y relaciones documentales.** Medir consultas, validar cruces normales/anticipados/parciales y actualizar documentos antiguos modificados. No corresponde darlas por probadas en la tarea 1.

## Correcciones al material anterior

- **El borrador 08 reducía Artículos a 9 campos.** El último respaldo disponible tiene 23 Sí, 38 No y 5 Revisar. Se conservan todos, aunque algunos sean para etapas futuras.
- **Clientes del borrador incluía descrCondiPago y omitía otros Sí.** Preservar 14 Sí del respaldo, incluidos fechaUltimoRecCli y codProveAsociado. descrCondiPago está marcado No en cliente; se obtiene del catálogo.
- **El relevamiento registraba 19 consultas.** El archivo actual tiene 23: incorporó remCab, remDet, remCom y rcBase. Las mediciones históricas se conservan fechadas.
- **Se afirmó que Excel quitaba flete y destino del remito.** remCab conserva codigoFlete, razonSocialFlete y lugarEntrega. Corregido en esta consolidación.
- **Se descartaba el vínculo de remito por falta de cabecera anticipada.** El detalle remito.regis_FCAntiDet permite intentar el cruce con detalle anticipado y desde allí con pedido. Pendiente de prueba real.
- **Se proponía obtener recibos nuevos en VentasCabecera.** Es una hipótesis sin prueba. No es una estrategia validada ni un requisito de selección de campos.
- **IVACondicion reaparece en respaldos antiguos.** Se conserva como decisión descartada por el usuario, sin reintroducirla al alcance.
- **Moneda se describía como código y descripción.** El catálogo HTML/Swagger debe verificarse: no inventar un ID cuando sólo publica descripción y signo.
- **Filtro de Excel pedCab acepta empresa 4.** Para GestionCyE prevalece empresa 1, confirmada por el usuario.
- **Regla de cierre se confundía con saldo cancelado.** Para esta pantalla rige presencia de FC, REM, RC y entrega manual. Los importes no bloquean la trazabilidad.

## Relaciones

| Relación | Clave | Cardinalidad | Evidencia / pendiente |
|---|---|---|---|
| Pedido → líneas | regis_PedCliCab ↔ regisPedCliCab (variante en Excel) | 1 a N | pedCom lo usa; nombre JSON real pendiente |
| Artículo → stock | codInternoArti = codArticulo; empresa 1, depósito 1 | 1 a 1 después de filtros | Cruce usado en artStck |
| Pedido → vendedor | codigVendedor → catálogo de vendedores | N a 1 | Nombre visual resuelto por código |
| Factura normal → pedido | VentasDetalle: descrCpbtePedido + numeroCpbtePedido + empresa heredada de cabecera | N a M posible | Conservar tipo y número; no unir sólo por número |
| Factura → detalle | regis_CliTra | 1 a N | fcCom agrega número en su join de Excel |
| Remito → detalle | regis_RtoCliCab | 1 a N | remCom del Excel actual |
| Remito → pedido | RemitoCabecera.regis_PedCliCab | N a 1 directo cuando informado | No inventar vínculo si nulo |
| Remito anticipado → factura anticipada | RemitoDetalle.regis_FCAntiDet = VentasDetalleFCAnti.regis_FCAntiDet | N a 1 por detalle | Luego numeroCpbtePedido; pendiente prueba |
| Recibo → factura | regTraRC_ImpuCli → regis_ImpuCli → regTraFC_ImpuCli = regis_CliTra | N a M | Imputaciones; volver por detalles normales o anticipados al pedido |
| Factura normal ↔ remito | descrCpbteRemito + nroSistemaCpbteRemito + empresa | N a M | Validar sistema vs preimpreso; no equiparar números por intuición |

## Fuentes

- excel-consultas-sin-credenciales.json — Excel sanitizado; SHA-256: 62766db495ecf6080c4c163444267715a4b0670a701fc3b832416dde5c35333c
- analisis-api-isis.html — Catálogo HTML; sus valores por defecto no son decisiones del usuario; SHA-256: 079b71c3090f1832ed8959b87132c600eeb79d57d6d8597bdd7d960eeed587b5
- isis-swagger-current.json — Esquema local; no prueba de API en vivo; SHA-256: 6e87b28babd54a9e2b975a21d0f63daa536611ac34f5390b95767f6a99a2c50d
- isis-swagger-v1.json — Esquema local; no prueba de API en vivo; SHA-256: 0dccffd9b6a40b9ead48d251a51eee81331264594b239a8585e8b631eb3b8615
- 04-modulo-1-seguimiento-comercial-operativo.md — Documento de contexto; SHA-256: 2dcbd5eb68946712119ebd1d9a5f1a376095d3181bec06b0763b5ae1b3d3dc5d
- 06-evaluacion-endpoints-isis.md — Documento de contexto; SHA-256: 28984d9063bdaa46f1449f2ab73cca8a00dcf35d963971924ef0e03a8b40170d
- 07-relevamiento-excel-gestion-base.md — Documento de contexto; SHA-256: 0bc16eb49ccae48c2b45b18965d93767447c6956294c9b9e39a2729e90ca89a4
- 08-estructura-isis-primeras-pantallas.md — Documento de contexto; SHA-256: e9e728fbb31155c3f40041e91a86f9c63db7ae6016f05441456e06df47a64838
- ARQUITECTURA.md — Documento de contexto; SHA-256: c06563610ae5b3fe8cedbf28a531a06be155dfcb62fde11f16b35100882e1232
- CONTEXTO_IA.md — Documento de contexto; SHA-256: 9cdd7bb1105cb418af6f6db81cfc04e3660ae9db5d501cae2fa372e7cf36ea0f
- SPRINTS.md — Documento de contexto; SHA-256: afa7f95a196f081fe9c715cf3c2fdb8e27f07b071466de3985881450ea3ddfd7
- relevamiento-campos-isis-articulos-stock.xlsx — Planilla inicial revisada: sin decisiones; CSV dentro de columna A; SHA-256: deb0d26b7df85d54eedcf690ca5c6ce2d4eb80fa39c41a19db2ea1a392e52601
- Ejemplo basico pantalla principal.xlsx — Referencia de pantalla; datos de ejemplo, no decisiones de campos; SHA-256: 7aa77f69f3004c62f080b44fb12b7dbc7ff155cfac104728f5c8c5f6f2111c5a
- analisis-api-isis-2026-07-30.json — Respaldo de decisiones; SHA-256: dbf215fd2ad3d50ef84848177318f81e58bb1ad8ac95b2db4515fbb0ab37596e
- 2026-07-30-articulos-stock.json — Respaldo de decisiones; SHA-256: 5606c056214deff50bde5dba0c86792c8ed4cb3bc15dbfd17b5d973965b81138
- analisis-api-isis-2026-07-30 (1).json — Respaldo de decisiones; SHA-256: 599e89a07492521e755d82cf4841897be780db0cb87e45e943f19852fa7b0371
- 2026-07-30-articulos-stock-clientes.json — Respaldo de decisiones; SHA-256: 00e265a27830a78d65fe36025693b8e160655a850d67c5b61b55c792f08d1a53
- 2026-07-31-articulos-stock-clientes-proveedores.json — Respaldo de decisiones; SHA-256: 0539dbcee9d2f3c687a55ad5d7d41918e06ce170d0d5622409addb37f493cad2
- analisis-api-isis-2026-08-13.json — Respaldo de decisiones; SHA-256: ba5609ba9e2e18c6904867c8205cbc14b9834e2ab4489a18bf89da567a604f02

## Inventario Excel

Archivo leído sin actualizar conexiones ni ejecutar macros. 23 consultas actuales. Hash del libro: 9ADB4301CA64A0E9ED26BE170A074A6F5667A892EED2C886D17FAB91EFB13A1E.

### artStck

Origen: Consulta derivada local

Campos finales trazados al origen: Ver fórmula sanitizada; consulta derivada o externa

Join: Table.NestedJoin(artBase, {"codArt"}, stckBase, {"codArt"}, "stckBase", JoinKind.LeftOuter)

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = Table.NestedJoin(artBase, {"codArt"}, stckBase, {"codArt"}, "stckBase", JoinKind.LeftOuter),
    #"Se expandió stckBase" = Table.ExpandTableColumn(Origen, "stckBase", {"stokU1", "stckU2"}, {"stckBase.stokU1", "stckBase.stckU2"}),
    #"Filas ordenadas" = Table.Sort(#"Se expandió stckBase",{{"codArt", Order.Ascending}})
in
    #"Filas ordenadas"
```

### artBase

Origen: /api/ISIS_Articulo_VW

Campos finales trazados al origen: regisArti → idArt; codInternoArti → codArt; descripcionArti → descArt; descriBusArti → descBusArt; descrNivelInt1 → nivelArt1; descrNivelInt2 → nivelArt2; descrNivelInt3 → nivelArt3; descrNivelInt4 → nivelArt4; descrNivelInt5 → nivelArt5

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each [Column1.senInhabilitadoArti] = "No")

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regisArti", "codInternoArti", "descripcionArti", "descriBusArti", "senInhabilitadoArti", "calificacion", "clasificaArti", "tipoArti", "facturaArti", "codigoArtiGrupo", "codigArtFami1", "descrArtFami1", "codigArtFami2", "descrArtFami2", "despachoArti", "partidaLoteArti", "nroSerieArti", "codigNivelInt1", "descrNivelInt1", "codigNivelInt2", "descrNivelInt2", "codigNivelInt3", "descrNivelInt3", "codigNivelInt4", "descrNivelInt4", "codigNivelInt5", "descrNivelInt5", "diasReaproviArti", "descrUnidadMedidaPri", "pesoPriArti", "descrUniMedidaPesoPri", "volumenPriArti", "descrUniMedidaVolumenPri", "stMinimoPriArti", "stIdealPriArti", "loteCpraPriArti", "ptoPedidoPriArti", "cantPalletPriArti1", "cantPalletPriArti2", "cantPalletPriArti3", "cantBultoPriArti", "descrUnidadMedidaSecu", "factorConveArti", "pesoSecuArti", "descrUniMedidaPesoSecu", "volumenSecuArti", "descrUniMedidaVolumenSecu", "stMinimoSecuArti", "stIdealSecuArti", "loteCpraSecuArti", "ptoPedidoSecuArti", "cantPalletSecuArti1", "cantPalletSecuArti2", "cantPalletSecuArti3", "cantBultoSecuArti", "tasaIva", "codigoActEcoVenta", "descripcionActEcoVenta", "codigoActEcoCompra", "descripcionActEcoCompra", "usaFactorConvePrecio", "codigGrupoComi", "descrGrupoComi", "tipoPreVtaArti", "tipoPreCpraArti", "codBarraArti"}, {"Column1.regisArti", "Column1.codInternoArti", "Column1.descripcionArti", "Column1.descriBusArti", "Column1.senInhabilitadoArti", "Column1.calificacion", "Column1.clasificaArti", "Column1.tipoArti", "Column1.facturaArti", "Column1.codigoArtiGrupo", "Column1.codigArtFami1", "Column1.descrArtFami1", "Column1.codigArtFami2", "Column1.descrArtFami2", "Column1.despachoArti", "Column1.partidaLoteArti", "Column1.nroSerieArti", "Column1.codigNivelInt1", "Column1.descrNivelInt1", "Column1.codigNivelInt2", "Column1.descrNivelInt2", "Column1.codigNivelInt3", "Column1.descrNivelInt3", "Column1.codigNivelInt4", "Column1.descrNivelInt4", "Column1.codigNivelInt5", "Column1.descrNivelInt5", "Column1.diasReaproviArti", "Column1.descrUnidadMedidaPri", "Column1.pesoPriArti", "Column1.descrUniMedidaPesoPri", "Column1.volumenPriArti", "Column1.descrUniMedidaVolumenPri", "Column1.stMinimoPriArti", "Column1.stIdealPriArti", "Column1.loteCpraPriArti", "Column1.ptoPedidoPriArti", "Column1.cantPalletPriArti1", "Column1.cantPalletPriArti2", "Column1.cantPalletPriArti3", "Column1.cantBultoPriArti", "Column1.descrUnidadMedidaSecu", "Column1.factorConveArti", "Column1.pesoSecuArti", "Column1.descrUniMedidaPesoSecu", "Column1.volumenSecuArti", "Column1.descrUniMedidaVolumenSecu", "Column1.stMinimoSecuArti", "Column1.stIdealSecuArti", "Column1.loteCpraSecuArti", "Column1.ptoPedidoSecuArti", "Column1.cantPalletSecuArti1", "Column1.cantPalletSecuArti2", "Column1.cantPalletSecuArti3", "Column1.cantBultoSecuArti", "Column1.tasaIva", "Column1.codigoActEcoVenta", "Column1.descripcionActEcoVenta", "Column1.codigoActEcoCompra", "Column1.descripcionActEcoCompra", "Column1.usaFactorConvePrecio", "Column1.codigGrupoComi", "Column1.descrGrupoComi", "Column1.tipoPreVtaArti", "Column1.tipoPreCpraArti", "Column1.codBarraArti"}),

    // Paso 1: Filtrar solo artículos activos
    #"Filtrar activos" = Table.SelectRows(#"Se expandió Column1", each [Column1.senInhabilitadoArti] = "No"),

    // Paso 2: Quitar columnas innecesarias
    #"Quitar columnas" = Table.SelectColumns(#"Filtrar activos", {
        "Column1.regisArti",
        "Column1.codInternoArti",
        "Column1.descripcionArti",
        "Column1.descriBusArti",
        "Column1.descrNivelInt1",
        "Column1.descrNivelInt2",
        "Column1.descrNivelInt3",
        "Column1.descrNivelInt4",
        "Column1.descrNivelInt5"
    }),

    // Paso 3: Renombrar columnas
    #"Renombrar columnas" = Table.RenameColumns(#"Quitar columnas", {
        {"Column1.regisArti",      "idArt"},
        {"Column1.codInternoArti", "codArt"},
        {"Column1.descripcionArti","descArt"},
        {"Column1.descriBusArti",  "descBusArt"},
        {"Column1.descrNivelInt1", "nivelArt1"},
        {"Column1.descrNivelInt2", "nivelArt2"},
        {"Column1.descrNivelInt3", "nivelArt3"},
        {"Column1.descrNivelInt4", "nivelArt4"},
        {"Column1.descrNivelInt5", "nivelArt5"}
    }),

    // Paso 4: Reordenar columnas según orden del Excel
   #"Reordenar columnas" = Table.ReorderColumns(#"Renombrar columnas", {
        "codArt",
        "descArt",
        "descBusArt",
        "idArt",
        "nivelArt1",
        "nivelArt2",
        "nivelArt3",
        "nivelArt4",
        "nivelArt5"
    }),
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {{"codArt", Order.Ascending}})
in
    #"Ordenar filas"
```

### artCont

Origen: /api/ISIS_Articulo_VW

Campos finales trazados al origen: regisArti → idArt; codInternoArti → codArt; descripcionArti → descArt; tipoArti → tipoArt; facturaArti → factArt; despachoArti → despArt; partidaLoteArti → loteArt; tasaIva → ivaArt; descripcionActEcoVenta → ventaArt; descripcionActEcoCompra → compraArt

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each [Column1.senInhabilitadoArti] = "No")

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regisArti", "codInternoArti", "descripcionArti", "descriBusArti", "senInhabilitadoArti", "calificacion", "clasificaArti", "tipoArti", "facturaArti", "codigoArtiGrupo", "codigArtFami1", "descrArtFami1", "codigArtFami2", "descrArtFami2", "despachoArti", "partidaLoteArti", "nroSerieArti", "codigNivelInt1", "descrNivelInt1", "codigNivelInt2", "descrNivelInt2", "codigNivelInt3", "descrNivelInt3", "codigNivelInt4", "descrNivelInt4", "codigNivelInt5", "descrNivelInt5", "diasReaproviArti", "descrUnidadMedidaPri", "pesoPriArti", "descrUniMedidaPesoPri", "volumenPriArti", "descrUniMedidaVolumenPri", "stMinimoPriArti", "stIdealPriArti", "loteCpraPriArti", "ptoPedidoPriArti", "cantPalletPriArti1", "cantPalletPriArti2", "cantPalletPriArti3", "cantBultoPriArti", "descrUnidadMedidaSecu", "factorConveArti", "pesoSecuArti", "descrUniMedidaPesoSecu", "volumenSecuArti", "descrUniMedidaVolumenSecu", "stMinimoSecuArti", "stIdealSecuArti", "loteCpraSecuArti", "ptoPedidoSecuArti", "cantPalletSecuArti1", "cantPalletSecuArti2", "cantPalletSecuArti3", "cantBultoSecuArti", "tasaIva", "codigoActEcoVenta", "descripcionActEcoVenta", "codigoActEcoCompra", "descripcionActEcoCompra", "usaFactorConvePrecio", "codigGrupoComi", "descrGrupoComi", "tipoPreVtaArti", "tipoPreCpraArti", "codBarraArti"}, {"Column1.regisArti", "Column1.codInternoArti", "Column1.descripcionArti", "Column1.descriBusArti", "Column1.senInhabilitadoArti", "Column1.calificacion", "Column1.clasificaArti", "Column1.tipoArti", "Column1.facturaArti", "Column1.codigoArtiGrupo", "Column1.codigArtFami1", "Column1.descrArtFami1", "Column1.codigArtFami2", "Column1.descrArtFami2", "Column1.despachoArti", "Column1.partidaLoteArti", "Column1.nroSerieArti", "Column1.codigNivelInt1", "Column1.descrNivelInt1", "Column1.codigNivelInt2", "Column1.descrNivelInt2", "Column1.codigNivelInt3", "Column1.descrNivelInt3", "Column1.codigNivelInt4", "Column1.descrNivelInt4", "Column1.codigNivelInt5", "Column1.descrNivelInt5", "Column1.diasReaproviArti", "Column1.descrUnidadMedidaPri", "Column1.pesoPriArti", "Column1.descrUniMedidaPesoPri", "Column1.volumenPriArti", "Column1.descrUniMedidaVolumenPri", "Column1.stMinimoPriArti", "Column1.stIdealPriArti", "Column1.loteCpraPriArti", "Column1.ptoPedidoPriArti", "Column1.cantPalletPriArti1", "Column1.cantPalletPriArti2", "Column1.cantPalletPriArti3", "Column1.cantBultoPriArti", "Column1.descrUnidadMedidaSecu", "Column1.factorConveArti", "Column1.pesoSecuArti", "Column1.descrUniMedidaPesoSecu", "Column1.volumenSecuArti", "Column1.descrUniMedidaVolumenSecu", "Column1.stMinimoSecuArti", "Column1.stIdealSecuArti", "Column1.loteCpraSecuArti", "Column1.ptoPedidoSecuArti", "Column1.cantPalletSecuArti1", "Column1.cantPalletSecuArti2", "Column1.cantPalletSecuArti3", "Column1.cantBultoSecuArti", "Column1.tasaIva", "Column1.codigoActEcoVenta", "Column1.descripcionActEcoVenta", "Column1.codigoActEcoCompra", "Column1.descripcionActEcoCompra", "Column1.usaFactorConvePrecio", "Column1.codigGrupoComi", "Column1.descrGrupoComi", "Column1.tipoPreVtaArti", "Column1.tipoPreCpraArti", "Column1.codBarraArti"}),

    // Paso 1: Filtrar solo artículos activos
    #"Filtrar activos" = Table.SelectRows(#"Se expandió Column1", each [Column1.senInhabilitadoArti] = "No"),

    // Paso 2: Quitar columnas innecesarias
    #"Quitar columnas" = Table.SelectColumns(#"Filtrar activos", {
        "Column1.regisArti",
        "Column1.codInternoArti",
        "Column1.descripcionArti",
        "Column1.tipoArti",
        "Column1.facturaArti",
        "Column1.despachoArti",
        "Column1.partidaLoteArti",
        "Column1.tasaIva",
        "Column1.descripcionActEcoVenta",
        "Column1.descripcionActEcoCompra"
    }),

    // Paso 3: Renombrar columnas
    #"Renombrar columnas" = Table.RenameColumns(#"Quitar columnas", {
        {"Column1.regisArti",               "idArt"},
        {"Column1.codInternoArti",          "codArt"},
        {"Column1.descripcionArti",         "descArt"},
        {"Column1.tipoArti",                "tipoArt"},
        {"Column1.facturaArti",             "factArt"},
        {"Column1.despachoArti",            "despArt"},
        {"Column1.partidaLoteArti",         "loteArt"},
        {"Column1.tasaIva",                 "ivaArt"},
        {"Column1.descripcionActEcoVenta",  "ventaArt"},
        {"Column1.descripcionActEcoCompra", "compraArt"}
    }),

    // Paso 4: Reordenar columnas según orden del Excel
    #"Reordenar columnas" = Table.ReorderColumns(#"Renombrar columnas", {
        "codArt",
        "descArt",
        "idArt",
        "tipoArt",
        "factArt",
        "despArt",
        "loteArt",
        "ivaArt",
        "ventaArt",
        "compraArt"
    }),
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {{"codArt", Order.Ascending}})
in
    #"Ordenar filas"
```

### stckBase

Origen: /api/ISIS_ArticuloStock_VW

Campos finales trazados al origen: codArticulo → codArt; descripcionArticulo → descArt; stockUm1 → stokU1; stockUm2 → stckU2

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each [Column1.codEmpresa] = 1)

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"codArticulo", "descBusquedaArticulo", "descripcionArticulo", "codEmpresa", "empresa", "codDeposito", "deposito", "tipoDeposito", "cantCompraUm1", "cantCompraUm2", "cantVentaUm1", "cantVentaUm2", "stockUm1", "stockUm2"}, {"Column1.codArticulo", "Column1.descBusquedaArticulo", "Column1.descripcionArticulo", "Column1.codEmpresa", "Column1.empresa", "Column1.codDeposito", "Column1.deposito", "Column1.tipoDeposito", "Column1.cantCompraUm1", "Column1.cantCompraUm2", "Column1.cantVentaUm1", "Column1.cantVentaUm2", "Column1.stockUm1", "Column1.stockUm2"}),
    #"Filtrar empresa" = Table.SelectRows(#"Se expandió Column1", each [Column1.codEmpresa] = 1),
    #"Quitar columnas" = Table.SelectColumns(#"Filtrar empresa", {
        "Column1.codArticulo",
        "Column1.descripcionArticulo",
        "Column1.stockUm1",
        "Column1.stockUm2"
    }),
    #"Renombrar columnas" = Table.RenameColumns(#"Quitar columnas", {
        {"Column1.codArticulo",         "codArt"},
        {"Column1.descripcionArticulo", "descArt"},
        {"Column1.stockUm1",            "stokU1"},
        {"Column1.stockUm2",            "stckU2"}
    }),
    #"Reordenar columnas" = Table.ReorderColumns(#"Renombrar columnas", {
        "codArt",
        "descArt",
        "stokU1",
        "stckU2"
    }),
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {{"codArt", Order.Ascending}})
in
    #"Ordenar filas"
```

### condPgo

Origen: /api/ISIS_CondicionPago_VW

Campos finales trazados al origen: codigCondiPago → condPgo; descrCondiPago → desCondPgo; senActivoCondiPago → activo

Filtro Excel (no adopción automática): Table.SelectRows(#"Filas ordenadas", each ([senActivoCondiPago] = "Si"))

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"codigCondiPago", "descrCondiPago", "senActivoCondiPago"}, {"codigCondiPago", "descrCondiPago", "senActivoCondiPago"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Se expandió Column1",{{"codigCondiPago", "condPgo"}}),
    #"Filas ordenadas" = Table.Sort(#"Columnas con nombre cambiado",{{"condPgo", Order.Ascending}}),
    #"Filas filtradas" = Table.SelectRows(#"Filas ordenadas", each ([senActivoCondiPago] = "Si")),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Filas filtradas",{{"descrCondiPago", "desCondPgo"}, {"senActivoCondiPago", "activo"}})
in
    #"Columnas con nombre cambiado1"
```

### chqCart

Origen: /api/ISIS_ChequesEnCarteraCliente_VW

Campos finales trazados al origen: codigoCli → codCli; razonSocialCli → cliente; descripcionCpbte → tipoComp; nroComprob_CliTra → numRc; fecha_CliTra → fchRc; descr_ModPa → tipo; fechaEmision → fchEmi; importeCheque → importe; fechaAcreditracion → fchAcred; comentario_CliVto → pedido


Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"codig_Emp", "cotizacion", "moneda", "importeCheque", "fechaAcreditracion", "fechaDeposito", "fechaEmision", "razonSocialBco", "codigoBco", "nroValor_CliVto", "descr_ModPa", "descrCtroCosto", "codCtroCosto", "razonSocialCli", "codigoCli", "nroPreimpre_CliTra", "nroComprob_CliTra", "descripcionCpbte", "fecha_CliTra", "descr_Emp", "cuitFirma_CliVto", "comentario_CliVto"}, {"Column1.codig_Emp", "Column1.cotizacion", "Column1.moneda", "Column1.importeCheque", "Column1.fechaAcreditracion", "Column1.fechaDeposito", "Column1.fechaEmision", "Column1.razonSocialBco", "Column1.codigoBco", "Column1.nroValor_CliVto", "Column1.descr_ModPa", "Column1.descrCtroCosto", "Column1.codCtroCosto", "Column1.razonSocialCli", "Column1.codigoCli", "Column1.nroPreimpre_CliTra", "Column1.nroComprob_CliTra", "Column1.descripcionCpbte", "Column1.fecha_CliTra", "Column1.descr_Emp", "Column1.cuitFirma_CliVto", "Column1.comentario_CliVto"}),

    // Paso 1: Quitar columnas innecesarias
    #"Quitar columnas" = Table.SelectColumns(#"Se expandió Column1", {
        "Column1.codigoCli",
        "Column1.razonSocialCli",
        "Column1.descripcionCpbte",
        "Column1.nroComprob_CliTra",
        "Column1.fecha_CliTra",
        "Column1.descr_ModPa",
        "Column1.fechaEmision",
        "Column1.importeCheque",
        "Column1.fechaAcreditracion",
        "Column1.comentario_CliVto"
    }),

    // Paso 2: Cambiar tipos datetime → date
    #"Tipo fecha1" = Table.TransformColumnTypes(#"Quitar columnas", {
        {"Column1.fechaAcreditracion", type datetime},
        {"Column1.fecha_CliTra",       type datetime},
        {"Column1.fechaEmision",       type datetime}
    }),
    #"Tipo fecha2" = Table.TransformColumnTypes(#"Tipo fecha1", {
        {"Column1.fechaAcreditracion", type date},
        {"Column1.fecha_CliTra",       type date},
        {"Column1.fechaEmision",       type date}
    }),

    // Paso 3: Cambiar tipo importe a moneda
    #"Tipo importe" = Table.TransformColumnTypes(#"Tipo fecha2", {
        {"Column1.importeCheque", Currency.Type}
    }),

    // Paso 4: Transformar numRc → últimos 5 dígitos
    #"Transformar numRc" = Table.TransformColumns(#"Tipo importe", {
        {"Column1.nroComprob_CliTra", each Text.End(Text.From(_), 5)}
    }),

    // Paso 5: Transformar pedido → últimos 5 dígitos, numérico o "SIN PEDIDO"
     #"Transformar pedido" = Table.TransformColumns(#"Transformar numRc", {
        {"Column1.comentario_CliVto", each
            let val = Text.End(Text.Trim(Text.From(_)), 5)
            in if (try Number.FromText(val))[HasError] then "SIN PEDIDO" else val
        }
    }),

    // Paso 6: Renombrar columnas
    #"Renombrar columnas" = Table.RenameColumns(#"Transformar pedido", {
        {"Column1.codigoCli",        "codCli"},
        {"Column1.razonSocialCli",   "cliente"},
        {"Column1.descripcionCpbte", "tipoComp"},
        {"Column1.nroComprob_CliTra","numRc"},
        {"Column1.fecha_CliTra",     "fchRc"},
        {"Column1.descr_ModPa",      "tipo"},
        {"Column1.fechaEmision",     "fchEmi"},
        {"Column1.importeCheque",    "importe"},
        {"Column1.fechaAcreditracion","fchAcred"},
        {"Column1.comentario_CliVto","pedido"}
    }),

    // Paso 7: Reordenar columnas
    #"Reordenar columnas" = Table.ReorderColumns(#"Renombrar columnas", {
        "codCli",   // 1
        "cliente",  // 2
        "tipoComp", // 3
        "numRc",    // 4
        "fchRc",    // 5
        "tipo",     // 6
        "fchEmi",   // 7
        "importe",  // 8
        "fchAcred", // 9
        "pedido"    // 10
    }),

    // Paso 8: Ordenar por fchAcred a-z
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {{"fchAcred", Order.Ascending}})

in
    #"Ordenar filas"
```

### cliBase

Origen: /api/ISIS_Cliente_VW

Campos finales trazados al origen: codigoCli → codCli; razonSocialCli → rzonSoc; razonSocialBusCli → rzonSocBus; cuitCli → cuitcli; descr_Mda → moneda; nombreVendedor → vendCli; codigListaPrec → listaPr; codigCondiPago → condPg; desdrCondiPago → condPgD; codProveedorClte → codProv; fechaAltaCli → fechaAltaCli; fechaUltimaFacCli → fechaUltimaFacCli

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each [Column1.estadoCli] = "Activo")
Filtro Excel (no adopción automática): Table.SelectRows(#"Quitar columnas", each
        [Column1.cuitCli] <> null and [Column1.cuitCli] <> "00-00000000-0"
    )
Filtro Excel (no adopción automática): Table.SelectRows(#"Tipo fecha2", each
        [Column1.fechaUltimaFacCli] >= #date(2020, 1, 1)
    )

Columnas calculadas: ctaCte, dias, formaPago, ctrlMda.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"codigoCli", "codigoExpreso", "razonSocialExpreso", "descrIvaC", "letraCli", "cuitCli", "ingBrutosCli", "fechaAltaCli", "fechaUltimaFacCli", "fechaUltimoRecCli", "codProveedorClte", "codProveAsociado", "diaVisitaLun", "diaVisitaMar", "diaVisitaMie", "diaVisitaJue", "diaVisitaVie", "diaVisitaSab", "diaVisitaDom", "ordenVisitaDia1CliLun", "ordenVisitaDia1CliMar", "ordenVisitaDia1CliMie", "ordenVisitaDia1CliJue", "ordenVisitaDia1CliVie", "ordenVisitaDia1CliSab", "ordenVisitaDia1CliDom", "usaDtosPreItemCli", "dtoItemPre1Cli", "razonSocialFlete", "codigoFlete", "descr_Mda", "limiteCreditoCli", "razonSocialBusCli", "razonSocialCli", "localidadCli", "codigoPostalCli", "descri_Partido", "codProvincia", "desdrProvincia", "codigoPais", "desdrPais", "estadoCli", "codigoCliCali", "desdrCliCali", "codigNivelInt1", "dtoItemPre2Cli", "desdrNivelInt1", "desdrNivelInt2", "codigNivelInt3", "desdrNivelInt3", "codigNivelInt4", "desdrNivelInt4", "codigVendedor", "nombreVendedor", "codigCobrador", "nombreCobrador", "codigListaPrec", "desdrListaPrec", "codigCondiPago", "desdrCondiPago", "codigNivelInt2", "dtoItemPre3Cli"}, {"Column1.codigoCli", "Column1.codigoExpreso", "Column1.razonSocialExpreso", "Column1.descrIvaC", "Column1.letraCli", "Column1.cuitCli", "Column1.ingBrutosCli", "Column1.fechaAltaCli", "Column1.fechaUltimaFacCli", "Column1.fechaUltimoRecCli", "Column1.codProveedorClte", "Column1.codProveAsociado", "Column1.diaVisitaLun", "Column1.diaVisitaMar", "Column1.diaVisitaMie", "Column1.diaVisitaJue", "Column1.diaVisitaVie", "Column1.diaVisitaSab", "Column1.diaVisitaDom", "Column1.ordenVisitaDia1CliLun", "Column1.ordenVisitaDia1CliMar", "Column1.ordenVisitaDia1CliMie", "Column1.ordenVisitaDia1CliJue", "Column1.ordenVisitaDia1CliVie", "Column1.ordenVisitaDia1CliSab", "Column1.ordenVisitaDia1CliDom", "Column1.usaDtosPreItemCli", "Column1.dtoItemPre1Cli", "Column1.razonSocialFlete", "Column1.codigoFlete", "Column1.descr_Mda", "Column1.limiteCreditoCli", "Column1.razonSocialBusCli", "Column1.razonSocialCli", "Column1.localidadCli", "Column1.codigoPostalCli", "Column1.descri_Partido", "Column1.codProvincia", "Column1.descrProvincia", "Column1.codigoPais", "Column1.descrPais", "Column1.estadoCli", "Column1.codigoCliCali", "Column1.descrCliCali", "Column1.codigNivelInt1", "Column1.dtoItemPre2Cli", "Column1.descrNivelInt1", "Column1.descrNivelInt2", "Column1.codigNivelInt3", "Column1.descrNivelInt3", "Column1.codigNivelInt4", "Column1.descrNivelInt4", "Column1.codigVendedor", "Column1.nombreVendedor", "Column1.codigCobrador", "Column1.nombreCobrador", "Column1.codigListaPrec", "Column1.descrListaPrec", "Column1.codigCondiPago", "Column1.descrCondiPago", "Column1.codigNivelInt2", "Column1.dtoItemPre3Cli"}),

    // Paso 1: Filtrar clientes activos
    #"Filtrar activos" = Table.SelectRows(#"Se expandió Column1", each [Column1.estadoCli] = "Activo"),

    // Paso 2: Quitar columnas innecesarias
    #"Quitar columnas" = Table.SelectColumns(#"Filtrar activos", {
        "Column1.codigoCli",
        "Column1.cuitCli",
        "Column1.fechaAltaCli",
        "Column1.fechaUltimaFacCli",
        "Column1.codProveedorClte",
        "Column1.descr_Mda",
        "Column1.razonSocialBusCli",
        "Column1.razonSocialCli",
        "Column1.nombreVendedor",
        "Column1.codigListaPrec",
        "Column1.codigCondiPago",
        "Column1.descrCondiPago"
    }),

    // Paso 3: Filtrar CUIT nulo o "00-00000000-0"
    #"Filtrar cuit" = Table.SelectRows(#"Quitar columnas", each
        [Column1.cuitCli] <> null and [Column1.cuitCli] <> "00-00000000-0"
    ),

    // Paso 4: Cambiar tipos fechas datetime → date
    #"Tipo fecha1" = Table.TransformColumnTypes(#"Filtrar cuit", {
        {"Column1.fechaAltaCli",      type datetime},
        {"Column1.fechaUltimaFacCli", type datetime}
    }),
    #"Tipo fecha2" = Table.TransformColumnTypes(#"Tipo fecha1", {
        {"Column1.fechaAltaCli",      type date},
        {"Column1.fechaUltimaFacCli", type date}
    }),

    // Paso 5: Filtrar fechaUltimaFacCli >= 01/01/2020
    #"Filtrar fecha fac" = Table.SelectRows(#"Tipo fecha2", each
        [Column1.fechaUltimaFacCli] >= #date(2020, 1, 1)
    ),

    // Paso 6: Renombrar columnas
    #"Renombrar columnas" = Table.RenameColumns(#"Filtrar fecha fac", {
        {"Column1.codigoCli",      "codCli"},
        {"Column1.razonSocialCli", "rzonSoc"},
        {"Column1.razonSocialBusCli", "rzonSocBus"},
        {"Column1.cuitCli",        "cuitcli"},
        {"Column1.descr_Mda",      "moneda"},
        {"Column1.nombreVendedor", "vendCli"},
        {"Column1.codigListaPrec", "listaPr"},
        {"Column1.codigCondiPago", "condPg"},
        {"Column1.descrCondiPago", "condPgD"},
        {"Column1.codProveedorClte","codProv"},
        {"Column1.fechaAltaCli",   "fechaAltaCli"},
        {"Column1.fechaUltimaFacCli", "fechaUltimaFacCli"}
    }),

    // Paso 7: Agregar columna ctaCte
    #"Agregar ctaCte" = Table.AddColumn(#"Renombrar columnas", "ctaCte", each
        if [condPg] >= 2000 and [condPg] <= 3000 then true else false,
        type logical
    ),

    // Paso 8: Agregar columna dias
    #"Agregar dias" = Table.AddColumn(#"Agregar ctaCte", "dias", each
        if [ctaCte] = false then
            if [condPg] < 2000 then 5 else 6
        else
            if [condPg] = 2007 then 7
            else if [condPg] = 2010 then 10
            else if [condPg] = 2014 then 14
            else if [condPg] = 2021 then 21
            else if [condPg] = 2030 then 30
            else if [condPg] = 2037 then 37
            else if [condPg] = 2060 then 60
            else null,
        Int64.Type
    ),

    // Paso 9: Agregar columna formaPago
    #"Agregar formaPago" = Table.AddColumn(#"Agregar dias", "formaPago", each
        if [condPg] >= 1000 and [condPg] < 2000 then "Transferencia"
        else if [condPg] >= 2000 and [condPg] < 3000 then "Transferencia"
        else if [condPg] >= 3000 and [condPg] < 4000 then "ECheq"
        else if [condPg] >= 4000 and [condPg] < 5000 then "Transf Parcial"
        else if [condPg] >= 5000 and [condPg] < 6000 then "ECheq"
        else if [condPg] >= 9000 then "CambiarCOD"
        else null,
        type text
    ),

    // Paso 10: Agregar columna ctrlMda
    #"Agregar ctrlMda" = Table.AddColumn(#"Agregar formaPago", "ctrlMda", each
        if [moneda] <> "Dolar" then "CAMBIAR" else null,
        type text
    ),

    // Paso 11: Reordenar columnas
    #"Reordenar columnas" = Table.ReorderColumns(#"Agregar ctrlMda", {
        "codCli",           // 1
        "rzonSoc",          // 2
        "rzonSocBus",       // 3
        "cuitcli",          // 4
        "moneda",           // 5
        "vendCli",          // 6
        "listaPr",          // 7
        "condPg",           // 8
        "condPgD",          // 9
        "codProv",           // 10
        "fechaAltaCli",     // 11
        "fechaUltimaFacCli",// 12
        "ctaCte",
        "dias",
        "formaPago",
        "ctrlMda"
    }),

    // Paso 12: Ordenar a-z por rzonSocBus
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {{"rzonSocBus", Order.Ascending}})

in
    #"Ordenar filas"
```

### pedCab

Origen: /api/ISIS_PedidoClteCab_VW

Campos finales trazados al origen: numero_PedCliCab → numPed; regis_PedCliCab → idPedCab; fecha_PedCliCab → fchaPed; nombreVendedor → vend; codigoCli → codCli; razonSocialCli → rzonSoc; desMdaOper → moneda; cotizaOper → cot; subtotal_PedCliCab → subtot; total_PedCliCab → total; codigListaPrec → codPre; codigCondiPago → codPgo; descrCondiPago → desPgo; numero_PreCliCab → numCot

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each [Column1.desCpbtePedido] = "Pedido cliente autom")
Filtro Excel (no adopción automática): Table.SelectRows(#"Filtrar tipo", each [Column1.codig_Emp] = 1 or [Column1.codig_Emp] = 4)
Filtro Excel (no adopción automática): Table.SelectRows(#"Tipo fecha2", each
        [Column1.fecha_PedCliCab] > #date(2022, 1, 1) and
        not ([Column1.codig_Emp] = 1 or [Column1.codig_Emp] = 4) or
        [Column1.fecha_PedCliCab] > #date(2022, 1, 1)
    )

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regis_PedCliCab", "nombreVendedor", "codigoFlete", "razonSocialFlete", "sucursalEntrega", "desMdaOper", "cotizaOper", "dto1_PedCliCab", "dto2_PedCliCab", "dto3_PedCliCab", "dto4_PedCliCab", "codigVendedor", "subtotal_PedCliCab", "impInterno_PedCliCab", "ivA_PedCliCab", "perceIva_PedCliCab", "perceIBr_PedCliCab", "total_PedCliCab", "senFechaIniFin_PedCliCab", "fechaInicioVig_PedCliCab", "fechaFinVig_PedCliCab", "pedidoPendiente", "pedidoEcommerce", "descuento_PedCliCab", "desCpbtePresupuesto", "descrListaPrec", "descrCtroCosto", "codig_Emp", "desCpbtePedido", "numero_PedCliCab", "fecha_PedCliCab", "tipoPedido", "mes01_PedCliCab", "mes02_PedCliCab", "mes03_PedCliCab", "mes04_PedCliCab", "mes05_PedCliCab", "mes06_PedCliCab", "mes07_PedCliCab", "mes08_PedCliCab", "mes09_PedCliCab", "mes10_PedCliCab", "mes11_PedCliCab", "mes12_PedCliCab", "codigoCli", "razonSocialCli", "codigListaPrec", "codigCondiPago", "descrCondiPago", "codCtroCosto", "numero_PreCliCab", "usuAutori1", "fecAut1_PedCliCab", "usuAutori2", "fecAut2_PedCliCab"}, {"Column1.regis_PedCliCab", "Column1.nombreVendedor", "Column1.codigoFlete", "Column1.razonSocialFlete", "Column1.sucursalEntrega", "Column1.desMdaOper", "Column1.cotizaOper", "Column1.dto1_PedCliCab", "Column1.dto2_PedCliCab", "Column1.dto3_PedCliCab", "Column1.dto4_PedCliCab", "Column1.codigVendedor", "Column1.subtotal_PedCliCab", "Column1.impInterno_PedCliCab", "Column1.ivA_PedCliCab", "Column1.perceIva_PedCliCab", "Column1.perceIBr_PedCliCab", "Column1.total_PedCliCab", "Column1.senFechaIniFin_PedCliCab", "Column1.fechaInicioVig_PedCliCab", "Column1.fechaFinVig_PedCliCab", "Column1.pedidoPendiente", "Column1.pedidoEcommerce", "Column1.descuento_PedCliCab", "Column1.desCpbtePresupuesto", "Column1.descrListaPrec", "Column1.descrCtroCosto", "Column1.codig_Emp", "Column1.desCpbtePedido", "Column1.numero_PedCliCab", "Column1.fecha_PedCliCab", "Column1.tipoPedido", "Column1.mes01_PedCliCab", "Column1.mes02_PedCliCab", "Column1.mes03_PedCliCab", "Column1.mes04_PedCliCab", "Column1.mes05_PedCliCab", "Column1.mes06_PedCliCab", "Column1.mes07_PedCliCab", "Column1.mes08_PedCliCab", "Column1.mes09_PedCliCab", "Column1.mes10_PedCliCab", "Column1.mes11_PedCliCab", "Column1.mes12_PedCliCab", "Column1.codigoCli", "Column1.razonSocialCli", "Column1.codigListaPrec", "Column1.codigCondiPago", "Column1.descrCondiPago", "Column1.codCtroCosto", "Column1.numero_PreCliCab", "Column1.usuAutori1", "Column1.fecAut1_PedCliCab", "Column1.usuAutori2", "Column1.fecAut2_PedCliCab"}),

    // Paso 1: Filtrar tipo de pedido
    #"Filtrar tipo" = Table.SelectRows(#"Se expandió Column1", each [Column1.desCpbtePedido] = "Pedido cliente autom"),

    // Paso 2: Filtrar empresas 1 y 4
    #"Filtrar empresa" = Table.SelectRows(#"Filtrar tipo", each [Column1.codig_Emp] = 1 or [Column1.codig_Emp] = 4),

    // Paso 3: Quitar columnas innecesarias (manteniendo codig_Emp y fecha para filtros)
    #"Quitar columnas" = Table.SelectColumns(#"Filtrar empresa", {
        "Column1.numero_PedCliCab",
        "Column1.regis_PedCliCab",
        "Column1.fecha_PedCliCab",
        "Column1.codig_Emp",
        "Column1.nombreVendedor",
        "Column1.codigoCli",
        "Column1.razonSocialCli",
        "Column1.desMdaOper",
        "Column1.cotizaOper",
        "Column1.subtotal_PedCliCab",
        "Column1.total_PedCliCab",
        "Column1.codigListaPrec",
        "Column1.codigCondiPago",
        "Column1.descrCondiPago",
        "Column1.numero_PreCliCab"
    }),

    // Paso 4: Cambiar tipo fecha datetime → date
    #"Tipo fecha1" = Table.TransformColumnTypes(#"Quitar columnas", {
        {"Column1.fecha_PedCliCab", type datetime}
    }),
    #"Tipo fecha2" = Table.TransformColumnTypes(#"Tipo fecha1", {
        {"Column1.fecha_PedCliCab", type date}
    }),

    // Paso 5: Filtrar fechas — general > 01/01/2022, empresa 1 y 4 > 01/01/2024
    #"Filtrar fecha" = Table.SelectRows(#"Tipo fecha2", each
        [Column1.fecha_PedCliCab] > #date(2022, 1, 1) and
        not ([Column1.codig_Emp] = 1 or [Column1.codig_Emp] = 4) or
        [Column1.fecha_PedCliCab] > #date(2022, 1, 1)
    ),

    // Paso 6: Quitar columna codig_Emp
    #"Quitar codig_Emp" = Table.RemoveColumns(#"Filtrar fecha", {"Column1.codig_Emp"}),

    // Paso 7: Cambiar tipo moneda
    #"Tipo moneda" = Table.TransformColumnTypes(#"Quitar codig_Emp", {
        {"Column1.cotizaOper",        Currency.Type},
        {"Column1.subtotal_PedCliCab", Currency.Type},
        {"Column1.total_PedCliCab",   Currency.Type}
    }),

    // Paso 8: Renombrar columnas
    #"Renombrar columnas" = Table.RenameColumns(#"Tipo moneda", {
        {"Column1.numero_PedCliCab",   "numPed"},
        {"Column1.regis_PedCliCab",    "idPedCab"},
        {"Column1.fecha_PedCliCab",    "fchaPed"},
        {"Column1.nombreVendedor",     "vend"},
        {"Column1.codigoCli",          "codCli"},
        {"Column1.razonSocialCli",     "rzonSoc"},
        {"Column1.desMdaOper",         "moneda"},
        {"Column1.cotizaOper",         "cot"},
        {"Column1.subtotal_PedCliCab", "subtot"},
        {"Column1.total_PedCliCab",    "total"},
        {"Column1.codigListaPrec",     "codPre"},
        {"Column1.codigCondiPago",     "codPgo"},
        {"Column1.descrCondiPago",     "desPgo"},
        {"Column1.numero_PreCliCab",   "numCot"}
    }),

    // Paso 9: Reordenar columnas
    #"Reordenar columnas" = Table.ReorderColumns(#"Renombrar columnas", {
        "numPed",   // 1
        "idPedCab", // 2
        "fchaPed",  // 3
        "vend",     // 4
        "codCli",   // 5
        "rzonSoc",  // 6
        "moneda",   // 7
        "cot",      // 8
        "subtot",   // 9
        "total",    // 10
        "codPre",   // 11
        "codPgo",   // 12
        "desPgo",   // 13
        "numCot"    // 14
    }),

    // Paso 10: Ordenar 1° fchaPed z-a, 2° numPed z-a
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas",{{"fchaPed", Order.Descending}, {"numPed", Order.Descending}, {"idPedCab", Order.Ascending}})

in
    #"Ordenar filas"
```

### pedDet

Origen: /api/ISIS_PedidoClteDet_VW

Campos finales trazados al origen: regisPedCliCab → idPedCab; regisPedCliDet → idPedDet; codInternoArti → codArt; descripcionArticulo → descArt; medidaPri → unidad; cantiPedidaUmp → cant; precioMdaListaNeto → pcioUnit

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each [Column1.regisPedCliCab] >= 21983)

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regisPedCliDet", "regisPedCliCab", "codInternoArti", "descripcionArticulo", "medidaPri", "cantiPedidaUmp", "bonifPedidaUmp", "cantiEntregadaUmp", "bonifEntregadaUmp", "medidaSecu", "cantiPedidaUms", "bonifPedidaUms", "cantiEntregadaUms", "bonifEntregadaUms", "codigListaPrec", "descrListaPrec", "monedaLista", "cotizMdaLista", "tipoPrecioPedCliDet", "precioMdaLista", "precioMdaCabe", "dto1Item", "dto2Item", "dto3Item", "dto1Cabe", "dto2Cabe", "dto3Cabe", "dto4Cabe", "precioMdaListaNeto", "precioMdaCabeNeto", "senFechaIniFinPedCliDet", "fechaInicioVigPedCliDet", "fechaFinVigPedCliDet", "prCpra1PesosArti", "prCpra2PesosArti", "prCto1PesosArti", "prCto2PesosArti", "mdaPrecioCompra", "cotizPrecioCompra", "prCpra1MonedaArti", "prCpra2MonedaArti", "prCto1MonedaArti", "prCto2MonedaArti"}, {"Column1.regisPedCliDet", "Column1.regisPedCliCab", "Column1.codInternoArti", "Column1.descripcionArticulo", "Column1.medidaPri", "Column1.cantiPedidaUmp", "Column1.bonifPedidaUmp", "Column1.cantiEntregadaUmp", "Column1.bonifEntregadaUmp", "Column1.medidaSecu", "Column1.cantiPedidaUms", "Column1.bonifPedidaUms", "Column1.cantiEntregadaUms", "Column1.bonifEntregadaUms", "Column1.codigListaPrec", "Column1.descrListaPrec", "Column1.monedaLista", "Column1.cotizMdaLista", "Column1.tipoPrecioPedCliDet", "Column1.precioMdaLista", "Column1.precioMdaCabe", "Column1.dto1Item", "Column1.dto2Item", "Column1.dto3Item", "Column1.dto1Cabe", "Column1.dto2Cabe", "Column1.dto3Cabe", "Column1.dto4Cabe", "Column1.precioMdaListaNeto", "Column1.precioMdaCabeNeto", "Column1.senFechaIniFinPedCliDet", "Column1.fechaInicioVigPedCliDet", "Column1.fechaFinVigPedCliDet", "Column1.prCpra1PesosArti", "Column1.prCpra2PesosArti", "Column1.prCto1PesosArti", "Column1.prCto2PesosArti", "Column1.mdaPrecioCompra", "Column1.cotizPrecioCompra", "Column1.prCpra1MonedaArti", "Column1.prCpra2MonedaArti", "Column1.prCto1MonedaArti", "Column1.prCto2MonedaArti"}),

    // Paso 1: Filtrar regisPedCliCab >= 30492
    #"Filtrar cab" = Table.SelectRows(#"Se expandió Column1", each [Column1.regisPedCliCab] >= 21983),

    // Paso 2: Quitar columnas innecesarias
    #"Quitar columnas" = Table.SelectColumns(#"Filtrar cab", {
        "Column1.regisPedCliCab",
        "Column1.regisPedCliDet",
        "Column1.codInternoArti",
        "Column1.descripcionArticulo",
        "Column1.medidaPri",
        "Column1.cantiPedidaUmp",
        "Column1.precioMdaListaNeto"
    }),

    // Paso 3: Cambiar tipo moneda
    #"Tipo moneda" = Table.TransformColumnTypes(#"Quitar columnas", {
        {"Column1.precioMdaListaNeto", Currency.Type}
    }),

    // Paso 5: Renombrar columnas
    #"Renombrar columnas" = Table.RenameColumns(#"Tipo moneda", {
        {"Column1.regisPedCliCab",    "idPedCab"},
        {"Column1.regisPedCliDet",    "idPedDet"},
        {"Column1.codInternoArti",    "codArt"},
        {"Column1.descripcionArticulo","descArt"},
        {"Column1.medidaPri",         "unidad"},
        {"Column1.cantiPedidaUmp",    "cant"},
        {"Column1.precioMdaListaNeto","pcioUnit"}
    }),

    // Paso 6: Reordenar columnas
    #"Reordenar columnas" = Table.ReorderColumns(#"Renombrar columnas", {
        "idPedCab",  // 1
        "idPedDet",  // 2
        "codArt",    // 3
        "descArt",   // 4
        "unidad",    // 5
        "cant",      // 6
        "pcioUnit"  // 7
    }),

    // Paso 7: Ordenar 1° idPedCab z-a, 2° idPedDet z-a
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {
        {"idPedCab", Order.Descending},
        {"idPedDet", Order.Descending}
    })

in
    #"Ordenar filas"
```

### pedCom

Origen: Consulta derivada local

Campos finales trazados al origen: Ver fórmula sanitizada; consulta derivada o externa

Join: Table.NestedJoin(pedCab, {"idPedCab"}, pedDet, {"idPedCab"}, "pedDet", JoinKind.LeftOuter)

Columnas calculadas: pedLine.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = Table.NestedJoin(pedCab, {"idPedCab"}, pedDet, {"idPedCab"}, "pedDet", JoinKind.LeftOuter),
    #"Se expandió pedDet" = Table.ExpandTableColumn(Origen, "pedDet", {"idPedDet", "codArt", "descArt", "unidad", "cant", "pcioUnit"}, {"pedDet.idPedDet", "pedDet.codArt", "pedDet.descArt", "pedDet.unidad", "pedDet.cant", "pedDet.pcioUnit"}),

    // Paso 1: Renombrar columnas pedDet
    #"Renombrar columnas" = Table.RenameColumns(#"Se expandió pedDet", {
        {"pedDet.idPedDet", "idPedDet"},
        {"pedDet.codArt",   "codArt"},
        {"pedDet.descArt",  "descArt"},
        {"pedDet.unidad",   "unidad"},
        {"pedDet.cant",     "cant"},
        {"pedDet.pcioUnit", "pcioUnit"}
    }),

    // Paso 2: Agregar columna pedLine = numPed & "-" & idPedDet
    #"Agregar pedLine" = Table.AddColumn(#"Renombrar columnas", "pedLine",
        each Text.From([numPed]) & "-" & Text.From([idPedDet]),
        type text
    ),

    // Paso 3: Reordenar columnas
    #"Reordenar columnas" = Table.ReorderColumns(#"Agregar pedLine", {
        "numPed",   // 1
        "idPedCab", // 2
        "pedLine",  // 3
        "fchaPed",  // 4
        "vend",     // 5
        "codCli",   // 6
        "rzonSoc",  // 7
        "moneda",   // 8
        "cot",      // 9
        "subtot",   // 10
        "total",    // 11
        "codPre",   // 12
        "codPgo",   // 13
        "desPgo",   // 14
        "numCot",   // 15
        "idPedDet", // 16
        "codArt",   // 17
        "descArt",  // 18
        "unidad",   // 19
        "cant",     // 20
        "pcioUnit"  // 21
    }),

    // Paso 4: Ordenar 1° fchaPed z-a, 2° pedLine z-a
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {
        {"fchaPed", Order.Descending},
        {"pedLine", Order.Descending}
    })

in
    #"Ordenar filas"
```

### cotDet

Origen: /api/ISIS_PresupuestoVtaDet_VW

Campos finales trazados al origen: idPresupVtaCab → idCotCab; codProducPresup → codArt; descripProducPresup → descArt; cantidad1Presup → cant; precioPresupDet → precio; importePresupDet → subtotal

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each [Column1.idPresupVtaCab] >= 31682)
Filtro Excel (no adopción automática): Table.SelectRows(#"Filtrar cab", each [Column1.codProducPresup] <> null)

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"idPresupVtaCab", "codProducPresup", "descripProducPresup", "descripProducModPresup", "cantidad1Presup", "cantidad2Presup", "bonific1Presup", "bonific2Presup", "codLisPrecPresupDet", "listPrecPresupDet", "monedaPresupDet", "cotizacMdaPresupDet", "tipoPrecioPresupDet", "dto1PrecPresupDet", "dto2PrecPresupDet", "dto3PrecPresupDet", "precioListPrecPresupDet", "precioPresupDet", "importePresupDet", "diasEntregaPresupDet", "fechaEntregaPresupDet"}, {"Column1.idPresupVtaCab", "Column1.codProducPresup", "Column1.descripProducPresup", "Column1.descripProducModPresup", "Column1.cantidad1Presup", "Column1.cantidad2Presup", "Column1.bonific1Presup", "Column1.bonific2Presup", "Column1.codLisPrecPresupDet", "Column1.listPrecPresupDet", "Column1.monedaPresupDet", "Column1.cotizacMdaPresupDet", "Column1.tipoPrecioPresupDet", "Column1.dto1PrecPresupDet", "Column1.dto2PrecPresupDet", "Column1.dto3PrecPresupDet", "Column1.precioListPrecPresupDet", "Column1.precioPresupDet", "Column1.importePresupDet", "Column1.diasEntregaPresupDet", "Column1.fechaEntregaPresupDet"}),

    // Paso 1: Filtrar idPresupVtaCab >= 31682
    #"Filtrar cab" = Table.SelectRows(#"Se expandió Column1", each [Column1.idPresupVtaCab] >= 31682),
    // Filtrar codArt no nulos
    #"Filtrar codArt" = Table.SelectRows(#"Filtrar cab", each [Column1.codProducPresup] <> null),

    // Paso 2: Quitar columnas innecesarias
    #"Quitar columnas" = Table.SelectColumns(#"Filtrar codArt", {
        "Column1.idPresupVtaCab",
        "Column1.codProducPresup",
        "Column1.descripProducPresup",
        "Column1.cantidad1Presup",
        "Column1.precioPresupDet",
        "Column1.importePresupDet"
    }),

    // Paso 3: Renombrar columnas
    #"Renombrar columnas" = Table.RenameColumns(#"Quitar columnas", {
        {"Column1.idPresupVtaCab",     "idCotCab"},
        {"Column1.codProducPresup",    "codArt"},
        {"Column1.descripProducPresup","descArt"},
        {"Column1.cantidad1Presup",    "cant"},
        {"Column1.precioPresupDet",    "precio"},
        {"Column1.importePresupDet",   "subtotal"}
    }),


    // Paso 4: Reordenar columnas
    #"Reordenar columnas" = Table.ReorderColumns(#"Renombrar columnas", {
        "idCotCab", // 1
        "codArt",   // 2
        "descArt",  // 3
        "cant",     // 4
        "precio",   // 5
        "subtotal"  // 6
    }),

    // Paso 5: Ordenar z-a por idCotCab
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {{"idCotCab", Order.Descending}})

in
    #"Ordenar filas"
```

### cotCom

Origen: Consulta derivada local

Campos finales trazados al origen: Ver fórmula sanitizada; consulta derivada o externa

Join: Table.NestedJoin(cotCab, {"idCotCab"}, cotDet, {"idCotCab"}, "cotDet", JoinKind.LeftOuter)

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = Table.NestedJoin(cotCab, {"idCotCab"}, cotDet, {"idCotCab"}, "cotDet", JoinKind.LeftOuter),
    #"Se expandió cotDet" = Table.ExpandTableColumn(Origen, "cotDet", {"codArt", "descArt", "cant", "precio", "subtotal"}, {"cotDet.codArt", "cotDet.descArt", "cotDet.cant", "cotDet.precio", "cotDet.subtotal"}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Se expandió cotDet",{{"cotMda", Currency.Type}, {"subtotal", Currency.Type}, {"total", Currency.Type}, {"cotDet.precio", Currency.Type}, {"cotDet.subtotal", Currency.Type}}),
    #"Filas ordenadas" = Table.Sort(#"Tipo cambiado",{{"idCotCab", Order.Descending}})
in
    #"Filas ordenadas"
```

### cotCab

Origen: /api/ISIS_PresupuestoVtaCab_VW

Campos finales trazados al origen: idPresupVtaCab → idCotCab; numeroComprobPresup → numCot; fecha → fchCot; codigoCliente → codClie; razonSocial → rzSoc; vendedor → vendedor; codListPrec → codPcio; mda1Operac → moneda; cotizMda1 → cotMda; subTotalPresup → subtotal; totalPresup → total

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each [Column1.division] = "CyE")
Filtro Excel (no adopción automática): Table.SelectRows(#"Tipo fecha2", each
        [Column1.fecha] >= #date(2023, 1, 1)
    )

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"idPresupVtaCab", "division", "comprobantePresup", "numeroComprobPresup", "fecha", "codigoCliente", "razonSocial", "lugarEntregaCliente", "codVendedor", "vendedor", "flete", "codCondPago", "condicPago", "codCtoCos", "centroCosto", "codListPrec", "listaPrecio", "ordCpraPresup", "mdaOperac", "mda1Operac", "cotizMda1", "mda2Operac", "cotizMda2", "mda3Operac", "cotizMda3", "mda4Operac", "cotizMda4", "dto1Presup", "dto2Presup", "dto3Presup", "dto4Presup", "recargoPresup", "subTotalPresup", "desctoListPrecPresup", "recargoListPrecPresup", "impInrPresup", "ivaPresup", "percepIvaPresup", "percepIibbPresup", "totalPresup", "leyen1Presup", "leyen2Presup", "usuarioAudiPresup", "fehaAudiPresup", "senVigenciaPresup", "diasVigencPresup", "fechaVigencPresup"}, {"Column1.idPresupVtaCab", "Column1.division", "Column1.comprobantePresup", "Column1.numeroComprobPresup", "Column1.fecha", "Column1.codigoCliente", "Column1.razonSocial", "Column1.lugarEntregaCliente", "Column1.codVendedor", "Column1.vendedor", "Column1.flete", "Column1.codCondPago", "Column1.condicPago", "Column1.codCtoCos", "Column1.centroCosto", "Column1.codListPrec", "Column1.listaPrecio", "Column1.ordCpraPresup", "Column1.mdaOperac", "Column1.mda1Operac", "Column1.cotizMda1", "Column1.mda2Operac", "Column1.cotizMda2", "Column1.mda3Operac", "Column1.cotizMda3", "Column1.mda4Operac", "Column1.cotizMda4", "Column1.dto1Presup", "Column1.dto2Presup", "Column1.dto3Presup", "Column1.dto4Presup", "Column1.recargoPresup", "Column1.subTotalPresup", "Column1.desctoListPrecPresup", "Column1.recargoListPrecPresup", "Column1.impInrPresup", "Column1.ivaPresup", "Column1.percepIvaPresup", "Column1.percepIibbPresup", "Column1.totalPresup", "Column1.leyen1Presup", "Column1.leyen2Presup", "Column1.usuarioAudiPresup", "Column1.fehaAudiPresup", "Column1.senVigenciaPresup", "Column1.diasVigencPresup", "Column1.fechaVigencPresup"}),

    // Paso 1: Filtrar division = "CyE"
    #"Filtrar division" = Table.SelectRows(#"Se expandió Column1", each [Column1.division] = "CyE"),

    // Paso 2: Quitar columnas innecesarias
    #"Quitar columnas" = Table.SelectColumns(#"Filtrar division", {
        "Column1.idPresupVtaCab",
        "Column1.numeroComprobPresup",
        "Column1.fecha",
        "Column1.codigoCliente",
        "Column1.razonSocial",
        "Column1.vendedor",
        "Column1.codListPrec",
        "Column1.mda1Operac",
        "Column1.cotizMda1",
        "Column1.subTotalPresup",
        "Column1.totalPresup"
    }),

    // Paso 3: Cambiar tipo fecha datetime → date
    #"Tipo fecha1" = Table.TransformColumnTypes(#"Quitar columnas", {
        {"Column1.fecha", type datetime}
    }),
    #"Tipo fecha2" = Table.TransformColumnTypes(#"Tipo fecha1", {
        {"Column1.fecha", type date}
    }),

    // Paso 3b: Filtrar fechas >= 01/01/2023
    #"Filtrar fecha" = Table.SelectRows(#"Tipo fecha2", each
        [Column1.fecha] >= #date(2023, 1, 1)
    ),

    // Paso 4: Renombrar columnas
    #"Renombrar columnas" = Table.RenameColumns(#"Filtrar fecha", {
        {"Column1.idPresupVtaCab",   "idCotCab"},
        {"Column1.numeroComprobPresup", "numCot"},
        {"Column1.fecha",            "fchCot"},
        {"Column1.codigoCliente",    "codClie"},
        {"Column1.razonSocial",      "rzSoc"},
        {"Column1.vendedor",         "vendedor"},
        {"Column1.codListPrec",      "codPcio"},
        {"Column1.mda1Operac",       "moneda"},
        {"Column1.cotizMda1",        "cotMda"},
        {"Column1.subTotalPresup",   "subtotal"},
        {"Column1.totalPresup",      "total"}
    }),

    // Paso 5: Reordenar columnas
    #"Reordenar columnas" = Table.ReorderColumns(#"Renombrar columnas", {
        "idCotCab",  // 1
        "numCot",    // 2
        "fchCot",    // 3
        "codClie",   // 4
        "rzSoc",     // 5
        "vendedor",  // 6
        "codPcio",   // 7
        "moneda",    // 8
        "cotMda",    // 9
        "subtotal",  // 10
        "total"      // 11
    }),

    // Paso 6: Ordenar 1° fchCot z-a, 2° numCot z-a
    #"Ordenar filas" = Table.Sort(#"Reordenar columnas", {
        {"fchCot", Order.Descending},
        {"numCot", Order.Descending}
    })

in
    #"Ordenar filas"
```

### Divisa

Origen: https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial

Campos finales trazados al origen: venta → div.venta; fecha → div.fecha

Filtro Excel (no adopción automática): Table.SelectRows(#"Changed Type", each [div.fecha] > #date(2020, 12, 31))

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Source = Json.Document(Web.Contents("https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial")),
    #"Converted to Table" = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", {"venta", "fecha"}, {"div.venta", "div.fecha"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1",{{"div.fecha", type date}, {"div.venta", Currency.Type}}),
    #"Filtered Rows" = Table.SelectRows(#"Changed Type", each [div.fecha] > #date(2020, 12, 31)),
    #"Sorted Rows" = Table.Sort(#"Filtered Rows",{{"div.fecha", Order.Descending}}),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Sorted Rows",{"div.fecha", "div.venta"})
in
    #"Columnas reordenadas"
```

### ProvBase

Origen: /api/ISIS_Proveedor_VW

Campos finales trazados al origen: regisProve → idProv; codigoProve → codProv; cuitProve → cuit; razonSocialBusProve → rzonSocBus; razonSocialProve → rzonSoc; fechaAltaProve → fchaAltaProv; fechaUltimaFacProve → fchaUltFac; fechaUltOpagoProve → fechaUltPago; descrProveCP → condPago; descr_Mda → moneda

Filtro Excel (no adopción automática): Table.SelectRows(
        #"Fechas convertidas a date",
        each ValidarCUIT([cuit])
    )
Filtro Excel (no adopción automática): Table.SelectRows(
        #"Filas con CUIT válido",
        each
            let
                FechaCorte = #date(2022, 1, 1),

                AltaAnterior =
                    [fchaAltaProv] <> null
                    and [fchaAltaProv] < FechaCorte,

                SinFacturaPosterior =
                    [fchaUltFac] = null
                    or [fchaUltFac] <= FechaCorte,

                SinPagoPosterior =
                    [fechaUltPago] = null
                    or [fechaUltPago] <= FechaCorte,

                DebeOcultarse =
                    AltaAnterior
                    and SinFacturaPosterior
                    and SinPagoPosterior
            in
                not DebeOcultarse
    )

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    ValidarCUIT = (Valor as any) as logical =>
        let
            TextoOriginal =
                if Valor = null then
                    ""
                else
                    Text.Trim(Text.From(Valor)),

            CUITLimpio =
                Text.Remove(
                    TextoOriginal,
                    {"-", " ", "."}
                ),

            FormatoValido =
                Text.Length(CUITLimpio) = 11
                and Text.Select(CUITLimpio, {"0".."9"}) = CUITLimpio,

            PrefijoValido =
                if FormatoValido then
                    List.Contains(
                        {"20", "23", "24", "27", "30", "33", "34"},
                        Text.Start(CUITLimpio, 2)
                    )
                else
                    false,

            DigitoCalculado =
                if FormatoValido and PrefijoValido then
                    let
                        PrimerosDiez = Text.Start(CUITLimpio, 10),

                        Digitos =
                            List.Transform(
                                Text.ToList(PrimerosDiez),
                                each Number.FromText(_)
                            ),

                        Multiplicadores =
                            {5, 4, 3, 2, 7, 6, 5, 4, 3, 2},

                        Suma =
                            List.Sum(
                                List.Transform(
                                    List.Positions(Digitos),
                                    each Digitos{_} * Multiplicadores{_}
                                )
                            ),

                        Resto = Number.Mod(Suma, 11),
                        Resultado = 11 - Resto,

                        Digito =
                            if Resultado = 11 then
                                0
                            else if Resultado = 10 then
                                9
                            else
                                Resultado
                    in
                        Digito
                else
                    -1,

            DigitoInformado =
                if FormatoValido then
                    Number.FromText(Text.End(CUITLimpio, 1))
                else
                    -2
        in
            FormatoValido
            and PrefijoValido
            and DigitoCalculado = DigitoInformado,

    Origen = Json.Document(
        Web.Contents(
            "https://sistemaisis.ar:8103/api/ISIS_Proveedor_VW",
    Origen = FUENTE_API_SIN_CREDENCIALES,
        )
    ),

    #"Convertida en tabla" = Table.FromList(
        Origen,
        Splitter.SplitByNothing(),
        null,
        null,
        ExtraValues.Error
    ),

    #"Datos de proveedores expandidos" = Table.ExpandRecordColumn(
        #"Convertida en tabla",
        "Column1",
        {
            "regisProve",
            "codigoProve",
            "cuitProve",
            "razonSocialBusProve",
            "razonSocialProve",
            "fechaAltaProve",
            "fechaUltimaFacProve",
            "fechaUltOpagoProve",
            "descrProveCP",
            "descr_Mda"
        },
        {
            "idProv",
            "codProv",
            "cuit",
            "rzonSocBus",
            "rzonSoc",
            "fchaAltaProv",
            "fchaUltFac",
            "fechaUltPago",
            "condPago",
            "moneda"
        }
    ),

    #"Fechas convertidas a datetime" = Table.TransformColumnTypes(
        #"Datos de proveedores expandidos",
        {
            {"fchaAltaProv", type datetime},
            {"fchaUltFac", type datetime},
            {"fechaUltPago", type datetime}
        }
    ),

    #"Fechas convertidas a date" = Table.TransformColumnTypes(
        #"Fechas convertidas a datetime",
        {
            {"fchaAltaProv", type date},
            {"fchaUltFac", type date},
            {"fechaUltPago", type date}
        }
    ),

    #"Filas con CUIT válido" = Table.SelectRows(
        #"Fechas convertidas a date",
        each ValidarCUIT([cuit])
    ),

    #"Proveedores con actividad vigente" = Table.SelectRows(
        #"Filas con CUIT válido",
        each
            let
                FechaCorte = #date(2022, 1, 1),

                AltaAnterior =
                    [fchaAltaProv] <> null
                    and [fchaAltaProv] < FechaCorte,

                SinFacturaPosterior =
                    [fchaUltFac] = null
                    or [fchaUltFac] <= FechaCorte,

                SinPagoPosterior =
                    [fechaUltPago] = null
                    or [fechaUltPago] <= FechaCorte,

                DebeOcultarse =
                    AltaAnterior
                    and SinFacturaPosterior
                    and SinPagoPosterior
            in
                not DebeOcultarse
    ),

    #"Ordenado por razón social" = Table.Sort(
        #"Proveedores con actividad vigente",
        {{"rzonSoc", Order.Ascending}}
    )
in
    #"Ordenado por razón social"
```

### fcCab

Origen: /api/ISIS_VentasCabecera_VW

Campos finales trazados al origen: fecha_CliTra → fc.fecha; regis_CliTra → idFcCab; nroComprob_CliTra → numFc; signoCpbte → signo; descripcionCpbte → tipoFc; monedaOper → moneda; netoPes_CliTra → finalPesos; netoMda1_CliTra → finalUSD; codigoCli → codCli; razonSocialCli → razonSocial; nombreVendedor → vendedor; codigCondiPago → codConPgo; descrCondiPago → CondPago

Filtro Excel (no adopción automática): Table.SelectRows(#"Se expandió Column1", each ([Column1.codig_Emp] = 1))
Filtro Excel (no adopción automática): Table.SelectRows(#"Columnas con nombre cambiado", each [fc.fecha] > #date(2022, 1, 1))

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regis_CliTra", "signoCpbte", "netoPes_CliTra", "netoMda1_CliTra", "netoMda2_CliTra", "netoMda3_CliTra", "netoMda4_CliTra", "dto1_CliTra", "dto2_CliTra", "dto3_CliTra", "dto4_CliTra", "porceRec_CliTra", "descuento_CliTra", "descuentoPes_CliTra", "recargo_CliTra", "recargoPes_CliTra", "ivA_CliTra", "ivaPes_CliTra", "perceIva_CliTra", "perceIvaPes_CliTra", "cotizaOper", "monedaOper", "nroMonedaOper", "nombreCliSucu", "codig_Emp", "descr_Emp", "fecha_CliTra", "descripcionCpbte", "nroComprob_CliTra", "nroPreimpre_CliTra", "codigoCli", "razonSocialCli", "codigCondiPago", "perceIBr_CliTra", "descrCondiPago", "descrCtroCosto", "codigListaPrec", "descrListaPrec", "codigVendedor", "nombreVendedor", "codConceOpe", "descrConceOpe", "codigoFlete", "razonSocialFlete", "codCtroCosto", "perceIBrPes_CliTra"}, {"Column1.regis_CliTra", "Column1.signoCpbte", "Column1.netoPes_CliTra", "Column1.netoMda1_CliTra", "Column1.netoMda2_CliTra", "Column1.netoMda3_CliTra", "Column1.netoMda4_CliTra", "Column1.dto1_CliTra", "Column1.dto2_CliTra", "Column1.dto3_CliTra", "Column1.dto4_CliTra", "Column1.porceRec_CliTra", "Column1.descuento_CliTra", "Column1.descuentoPes_CliTra", "Column1.recargo_CliTra", "Column1.recargoPes_CliTra", "Column1.ivA_CliTra", "Column1.ivaPes_CliTra", "Column1.perceIva_CliTra", "Column1.perceIvaPes_CliTra", "Column1.cotizaOper", "Column1.monedaOper", "Column1.nroMonedaOper", "Column1.nombreCliSucu", "Column1.codig_Emp", "Column1.descr_Emp", "Column1.fecha_CliTra", "Column1.descripcionCpbte", "Column1.nroComprob_CliTra", "Column1.nroPreimpre_CliTra", "Column1.codigoCli", "Column1.razonSocialCli", "Column1.codigCondiPago", "Column1.perceIBr_CliTra", "Column1.descrCondiPago", "Column1.descrCtroCosto", "Column1.codigListaPrec", "Column1.descrListaPrec", "Column1.codigVendedor", "Column1.nombreVendedor", "Column1.codConceOpe", "Column1.descrConceOpe", "Column1.codigoFlete", "Column1.razonSocialFlete", "Column1.codCtroCosto", "Column1.perceIBrPes_CliTra"}),
    #"Filas filtradas" = Table.SelectRows(#"Se expandió Column1", each ([Column1.codig_Emp] = 1)),
    #"Columnas quitadas" = Table.RemoveColumns(#"Filas filtradas",{"Column1.codig_Emp", "Column1.descr_Emp", "Column1.netoMda2_CliTra", "Column1.netoMda3_CliTra", "Column1.netoMda4_CliTra", "Column1.dto1_CliTra", "Column1.dto2_CliTra", "Column1.dto3_CliTra", "Column1.dto4_CliTra", "Column1.porceRec_CliTra", "Column1.descuento_CliTra", "Column1.descuentoPes_CliTra", "Column1.recargo_CliTra", "Column1.recargoPes_CliTra", "Column1.ivA_CliTra", "Column1.ivaPes_CliTra", "Column1.perceIva_CliTra", "Column1.perceIvaPes_CliTra", "Column1.cotizaOper", "Column1.nroMonedaOper", "Column1.nombreCliSucu"}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columnas quitadas",{{"Column1.fecha_CliTra", type datetime}}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Tipo cambiado",{{"Column1.fecha_CliTra", type date}}),
    #"Columnas quitadas1" = Table.RemoveColumns(#"Tipo cambiado1",{"Column1.nroPreimpre_CliTra", "Column1.perceIBr_CliTra", "Column1.descrCtroCosto", "Column1.codigListaPrec", "Column1.descrListaPrec", "Column1.codigVendedor", "Column1.codConceOpe", "Column1.descrConceOpe", "Column1.codigoFlete", "Column1.razonSocialFlete", "Column1.codCtroCosto", "Column1.perceIBrPes_CliTra"}),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Columnas quitadas1",{"Column1.fecha_CliTra", "Column1.regis_CliTra", "Column1.nroComprob_CliTra", "Column1.signoCpbte", "Column1.descripcionCpbte", "Column1.monedaOper", "Column1.netoPes_CliTra", "Column1.netoMda1_CliTra", "Column1.codigoCli", "Column1.razonSocialCli", "Column1.nombreVendedor", "Column1.codigCondiPago", "Column1.descrCondiPago"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas reordenadas",{{"Column1.fecha_CliTra", "fc.fecha"}, {"Column1.regis_CliTra", "idFcCab"}, {"Column1.nroComprob_CliTra", "numFc"}, {"Column1.signoCpbte", "signo"}, {"Column1.descripcionCpbte", "tipoFc"}, {"Column1.monedaOper", "moneda"}, {"Column1.netoPes_CliTra", "finalPesos"}, {"Column1.netoMda1_CliTra", "finalUSD"}, {"Column1.codigoCli", "codCli"}, {"Column1.razonSocialCli", "razonSocial"}, {"Column1.nombreVendedor", "vendedor"}, {"Column1.codigCondiPago", "codConPgo"}, {"Column1.descrCondiPago", "CondPago"}}),
    #"Filas filtradas1" = Table.SelectRows(#"Columnas con nombre cambiado", each [fc.fecha] > #date(2022, 1, 1)),
    #"Filas ordenadas" = Table.Sort(#"Filas filtradas1",{{"fc.fecha", Order.Descending}}),
    #"Tipo cambiado2" = Table.TransformColumnTypes(#"Filas ordenadas",{{"finalPesos", Currency.Type}})
in
    #"Tipo cambiado2"
```

### fcDet

Origen: /api/ISIS_VentasDetalle_VW

Campos finales trazados al origen: importe → FcD.importe; fechaCpbteVenta → fchaFc; regis_CliTra → idFcCab; mdaPrecioVta → mdaFcCab; precio → precioUn; medidaPrincipal → medida; regis_MovArtiD → idMovArti; codigoCli → codCli; razonSocialCli → rzonSoc; descrCpbteVenta → descrCpbte; nroSistemaCpbteVenta → nroFc; fechaCpbteRemito → fchaRemito; nroSistemaCpbteRemito → numCpbteRem; numeroCpbtePedido → numPed; nombreVdorCpbtePedido → Vendedor; codInternoArti → codArt; descripcionArti → descArt; cantidad1_MovArtiD → cant

Filtro Excel (no adopción automática): Table.SelectRows(#"Changed Type1", each [FcD.fechaCpbteVenta] > #date(2022, 01, 01))
Filtro Excel (no adopción automática): Table.SelectRows(#"Sorted Rows", each [FcD.fechaCpbteVenta] > #date(2022, 1, 1))

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Converted to Table" = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", {"regis_CliTra", "mdaPrecioVta", "precio", "importe", "mdaPrecioCpra", "prCpra1MonedaCpra", "medidaPrincipal", "regis_MovArtiD", "codigoCli", "razonSocialCli", "fechaCpbteVenta", "descrCpbteVenta", "nroSistemaCpbteVenta", "fechaCpbteRemito", "nroSistemaCpbteRemito", "fechaCpbtePedido", "numeroCpbtePedido", "nombreVdorCpbtePedido", "codInternoArti", "descripcionArti", "cantidad1_MovArtiD", "prCosto2MonedaCpra"}, {"FcD.regis_CliTra", "FcD.mdaPrecioVta", "FcD.precio", "FcD.importe", "FcD.mdaPrecioCpra", "FcD.prCpra1MonedaCpra", "FcD.medidaPrincipal", "FcD.regis_MovArtiD", "FcD.codigoCli", "FcD.razonSocialCli", "FcD.fechaCpbteVenta", "FcD.descrCpbteVenta", "FcD.nroSistemaCpbteVenta", "FcD.fechaCpbteRemito", "FcD.nroSistemaCpbteRemito", "FcD.fechaCpbtePedido", "FcD.numeroCpbtePedido", "FcD.nombreVdorCpbtePedido", "FcD.codInternoArti", "FcD.descripcionArti", "FcD.cantidad1_MovArtiD", "FcD.prCosto2MonedaCpra"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1",{{"FcD.fechaCpbteVenta", type datetime}}),
    #"Changed Type1" = Table.TransformColumnTypes(#"Changed Type",{{"FcD.fechaCpbteVenta", type date}}),
    #"Filtered Rows" = Table.SelectRows(#"Changed Type1", each [FcD.fechaCpbteVenta] > #date(2022, 01, 01)),
    #"Sorted Rows" = Table.Sort(#"Filtered Rows",{{"FcD.fechaCpbteVenta", Order.Descending}}),
    #"Filas filtradas" = Table.SelectRows(#"Sorted Rows", each [FcD.fechaCpbteVenta] > #date(2022, 1, 1)),
    #"Changed Type2" = Table.TransformColumnTypes(#"Filas filtradas",{{"FcD.fechaCpbteRemito", type datetime}}),
    #"Changed Type3" = Table.TransformColumnTypes(#"Changed Type2",{{"FcD.fechaCpbteRemito", type date}, {"FcD.fechaCpbtePedido", type datetime}}),
    #"Changed Type4" = Table.TransformColumnTypes(#"Changed Type3",{{"FcD.fechaCpbtePedido", type date}}),
    #"Filas ordenadas" = Table.Sort(#"Changed Type4",{{"FcD.regis_CliTra", Order.Descending}}),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Filas ordenadas",{"FcD.fechaCpbteVenta", "FcD.regis_CliTra", "FcD.mdaPrecioVta", "FcD.precio", "FcD.importe", "FcD.mdaPrecioCpra", "FcD.prCpra1MonedaCpra", "FcD.medidaPrincipal", "FcD.regis_MovArtiD", "FcD.codigoCli", "FcD.razonSocialCli", "FcD.descrCpbteVenta", "FcD.nroSistemaCpbteVenta", "FcD.fechaCpbteRemito", "FcD.nroSistemaCpbteRemito", "FcD.fechaCpbtePedido", "FcD.numeroCpbtePedido", "FcD.nombreVdorCpbtePedido", "FcD.codInternoArti", "FcD.descripcionArti", "FcD.cantidad1_MovArtiD", "FcD.prCosto2MonedaCpra"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas reordenadas",{{"FcD.fechaCpbteVenta", "fchaFc"}, {"FcD.regis_CliTra", "idFcCab"}, {"FcD.mdaPrecioVta", "mdaFcCab"}, {"FcD.precio", "precioUn"}}),
    #"Columnas quitadas" = Table.RemoveColumns(#"Columnas con nombre cambiado",{"FcD.mdaPrecioCpra", "FcD.prCpra1MonedaCpra"}),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Columnas quitadas",{{"FcD.medidaPrincipal", "medida"}, {"FcD.regis_MovArtiD", "idMovArti"}, {"FcD.codigoCli", "codCli"}, {"FcD.razonSocialCli", "rzonSoc"}, {"FcD.descrCpbteVenta", "descrCpbte"}, {"FcD.nroSistemaCpbteVenta", "nroFc"}, {"FcD.fechaCpbteRemito", "fchaRemito"}, {"FcD.nroSistemaCpbteRemito", "numCpbteRem"}, {"FcD.fechaCpbtePedido", "fchaCpbtePed"}}),
    #"Columnas quitadas1" = Table.RemoveColumns(#"Columnas con nombre cambiado1",{"fchaCpbtePed"}),
    #"Columnas con nombre cambiado2" = Table.RenameColumns(#"Columnas quitadas1",{{"FcD.numeroCpbtePedido", "numPed"}, {"FcD.nombreVdorCpbtePedido", "Vendedor"}, {"FcD.codInternoArti", "codArt"}, {"FcD.descripcionArti", "descArt"}, {"FcD.cantidad1_MovArtiD", "cant"}}),
    #"Columnas quitadas2" = Table.RemoveColumns(#"Columnas con nombre cambiado2",{"FcD.prCosto2MonedaCpra"}),
    #"Columnas reordenadas1" = Table.ReorderColumns(#"Columnas quitadas2",{"fchaFc", "idFcCab", "idMovArti", "mdaFcCab", "precioUn", "FcD.importe", "codCli", "rzonSoc", "descrCpbte", "nroFc", "fchaRemito", "numCpbteRem", "numPed", "Vendedor", "codArt", "descArt", "cant", "medida"}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columnas reordenadas1",{{"cant", type number}, {"precioUn", Currency.Type}, {"FcD.importe", Currency.Type}}),
    #"Columnas reordenadas2" = Table.ReorderColumns(#"Tipo cambiado",{"fchaFc", "descrCpbte", "nroFc", "idFcCab", "idMovArti", "codCli", "rzonSoc", "mdaFcCab", "FcD.importe", "fchaRemito", "numCpbteRem", "numPed", "Vendedor", "codArt", "descArt", "cant", "medida", "precioUn"}),
    #"Filas ordenadas1" = Table.Sort(#"Columnas reordenadas2",{{"fchaFc", Order.Descending}, {"nroFc", Order.Descending}, {"idMovArti", Order.Ascending}})
in
    #"Filas ordenadas1"
```

### fcAnt

Origen: /api/ISIS_VentasDetalLeFCAnti_VW

Campos finales trazados al origen: cotizMdaLista → cotizMda; monedaLista → moneda; descrListaPrec → ListaPrec; precioMdaLista_Neto → preMdaList; razonSocialCli → rzonSoc; codigoCli → codCli; fechaCpbteVenta → fchaFc; descrCpbteVenta → descrCpbte; nroSistemaCpbteVenta → nroCpbte; numeroCpbtePedido → numPed; nombreVdorCpbtePedido → vendedor; signoCpbte → signo; codInternoArti → codArt; medidaPrincipal → medida; cantiFacturadaPri → cant; cantiPendientePri → cantiPend; descripcionArti → descArt; precioMdaCabe_Neto → precioCabeNeto; regis_CliTra → idFcCab; regis_FCAntiDet → idFcAntLin

Filtro Excel (no adopción automática): Table.SelectRows(#"Tipo cambiado3", each true)
Filtro Excel (no adopción automática): Table.SelectRows(#"Columnas reordenadas", each [fchaFc] > #date(2022, 2, 1))

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regis_CliTra", "codigListaPrec", "descrListaPrec", "monedaLista", "cotizMdaLista", "tipoPrecio_FCAntiDet", "precioMdaLista", "precioMdaCabe", "dto1Item", "dto2Item", "dto3Item", "dto1_CliTra", "bonifPendienteSec", "dto2_CliTra", "dto4_CliTra", "precioMdaLista_Neto", "precioMdaCabe_Neto", "prCpra1Pesos_Arti", "prCpra2Pesos_Arti", "prCto1Pesos_Arti", "prCto2Pesos_Arti", "mdaPrecioCompra", "cotizPrecioCompra", "prCpra1Moneda_Arti", "prCpra2Moneda_Arti", "dto3_CliTra", "bonifEntregadaSec", "bonifFacturadaSec", "cantiPendienteSec", "regis_FCAntiDet", "codigoCli", "razonSocialCli", "fechaCpbteVenta", "descrCpbteVenta", "nroSistemaCpbteVenta", "nroPreimpreCpbteVenta", "fechaCpbtePedido", "descrCpbtePedido", "numeroCpbtePedido", "codigoVdorCpbtePedido", "nombreVdorCpbtePedido", "signoCpbte", "codInternoArti", "descripcionArti", "medidaPrincipal", "cantiFacturadaPri", "cantiEntregadaPri", "cantiPendientePri", "bonifFacturadaPri", "bonifEntregadaPri", "bonifPendientePri", "medidaSecundaria", "cantiFacturadaSec", "cantiEntregadaSec", "prCto1Moneda_Arti", "prCto2Moneda_Arti"}, {"Column1.regis_CliTra", "Column1.codigListaPrec", "Column1.descrListaPrec", "Column1.monedaLista", "Column1.cotizMdaLista", "Column1.tipoPrecio_FCAntiDet", "Column1.precioMdaLista", "Column1.precioMdaCabe", "Column1.dto1Item", "Column1.dto2Item", "Column1.dto3Item", "Column1.dto1_CliTra", "Column1.bonifPendienteSec", "Column1.dto2_CliTra", "Column1.dto4_CliTra", "Column1.precioMdaLista_Neto", "Column1.precioMdaCabe_Neto", "Column1.prCpra1Pesos_Arti", "Column1.prCpra2Pesos_Arti", "Column1.prCto1Pesos_Arti", "Column1.prCto2Pesos_Arti", "Column1.mdaPrecioCompra", "Column1.cotizPrecioCompra", "Column1.prCpra1Moneda_Arti", "Column1.prCpra2Moneda_Arti", "Column1.dto3_CliTra", "Column1.bonifEntregadaSec", "Column1.bonifFacturadaSec", "Column1.cantiPendienteSec", "Column1.regis_FCAntiDet", "Column1.codigoCli", "Column1.razonSocialCli", "Column1.fechaCpbteVenta", "Column1.descrCpbteVenta", "Column1.nroSistemaCpbteVenta", "Column1.nroPreimpreCpbteVenta", "Column1.fechaCpbtePedido", "Column1.descrCpbtePedido", "Column1.numeroCpbtePedido", "Column1.codigoVdorCpbtePedido", "Column1.nombreVdorCpbtePedido", "Column1.signoCpbte", "Column1.codInternoArti", "Column1.descripcionArti", "Column1.medidaPrincipal", "Column1.cantiFacturadaPri", "Column1.cantiEntregadaPri", "Column1.cantiPendientePri", "Column1.bonifFacturadaPri", "Column1.bonifEntregadaPri", "Column1.bonifPendientePri", "Column1.medidaSecundaria", "Column1.cantiFacturadaSec", "Column1.cantiEntregadaSec", "Column1.prCto1Moneda_Arti", "Column1.prCto2Moneda_Arti"}),
    #"Columnas quitadas" = Table.RemoveColumns(#"Se expandió Column1",{"Column1.codigListaPrec"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas quitadas",{{"Column1.cotizMdaLista", "cotizMda"}, {"Column1.monedaLista", "moneda"}, {"Column1.descrListaPrec", "ListaPrec"}}),
    #"Columnas quitadas1" = Table.RemoveColumns(#"Columnas con nombre cambiado",{"Column1.tipoPrecio_FCAntiDet", "Column1.precioMdaLista"}),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Columnas quitadas1",{{"Column1.precioMdaCabe", "precioMda"}}),
    #"Columnas quitadas2" = Table.RemoveColumns(#"Columnas con nombre cambiado1",{"Column1.dto1Item", "Column1.dto2Item", "Column1.dto3Item", "Column1.dto1_CliTra", "Column1.bonifPendienteSec", "Column1.dto2_CliTra", "Column1.dto4_CliTra", "precioMda"}),
    #"Columnas con nombre cambiado2" = Table.RenameColumns(#"Columnas quitadas2",{{"Column1.precioMdaLista_Neto", "preMdaList"}}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columnas con nombre cambiado2",{{"cotizMda", Currency.Type}, {"preMdaList", Currency.Type}}),
    #"Columnas quitadas3" = Table.RemoveColumns(#"Tipo cambiado",{"Column1.prCpra1Pesos_Arti", "Column1.prCpra2Pesos_Arti", "Column1.prCto1Pesos_Arti", "Column1.prCto2Pesos_Arti", "Column1.mdaPrecioCompra", "Column1.cotizPrecioCompra", "Column1.prCpra1Moneda_Arti", "Column1.prCpra2Moneda_Arti", "Column1.dto3_CliTra", "Column1.bonifEntregadaSec", "Column1.bonifFacturadaSec", "Column1.cantiPendienteSec"}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Columnas quitadas3",{{"Column1.precioMdaCabe_Neto", Currency.Type}}),
    #"Columnas con nombre cambiado3" = Table.RenameColumns(#"Tipo cambiado1",{{"Column1.razonSocialCli", "rzonSoc"}, {"Column1.codigoCli", "codCli"}, {"Column1.fechaCpbteVenta", "fchaFc"}}),
    #"Tipo cambiado2" = Table.TransformColumnTypes(#"Columnas con nombre cambiado3",{{"fchaFc", type datetime}}),
    #"Tipo cambiado3" = Table.TransformColumnTypes(#"Tipo cambiado2",{{"fchaFc", type date}}),
    #"Filas filtradas" = Table.SelectRows(#"Tipo cambiado3", each true),
    #"Columnas con nombre cambiado4" = Table.RenameColumns(#"Filas filtradas",{{"Column1.descrCpbteVenta", "descrCpbte"}, {"Column1.nroSistemaCpbteVenta", "nroCpbte"}}),
    #"Columnas quitadas4" = Table.RemoveColumns(#"Columnas con nombre cambiado4",{"Column1.nroPreimpreCpbteVenta", "Column1.fechaCpbtePedido", "Column1.descrCpbtePedido"}),
    #"Columnas con nombre cambiado5" = Table.RenameColumns(#"Columnas quitadas4",{{"Column1.numeroCpbtePedido", "numPed"}}),
    #"Columnas quitadas5" = Table.RemoveColumns(#"Columnas con nombre cambiado5",{"Column1.codigoVdorCpbtePedido"}),
    #"Columnas con nombre cambiado6" = Table.RenameColumns(#"Columnas quitadas5",{{"Column1.nombreVdorCpbtePedido", "vendedor"}, {"Column1.signoCpbte", "signo"}, {"Column1.codInternoArti", "codArt"}, {"Column1.medidaPrincipal", "medida"}, {"Column1.cantiFacturadaPri", "cant"}}),
    #"Tipo cambiado4" = Table.TransformColumnTypes(#"Columnas con nombre cambiado6",{{"cant", type number}}),
    #"Columnas quitadas6" = Table.RemoveColumns(#"Tipo cambiado4",{"Column1.prCto2Moneda_Arti", "Column1.cantiEntregadaPri"}),
    #"Columnas con nombre cambiado7" = Table.RenameColumns(#"Columnas quitadas6",{{"Column1.cantiPendientePri", "cantiPend"}, {"Column1.descripcionArti", "descArt"}}),
    #"Columnas quitadas7" = Table.RemoveColumns(#"Columnas con nombre cambiado7",{"Column1.bonifFacturadaPri", "Column1.bonifEntregadaPri", "Column1.bonifPendientePri", "Column1.medidaSecundaria", "Column1.cantiEntregadaSec", "Column1.cantiFacturadaSec", "Column1.prCto1Moneda_Arti"}),
    #"Columnas con nombre cambiado8" = Table.RenameColumns(#"Columnas quitadas7",{{"Column1.precioMdaCabe_Neto", "precioCabeNeto"}}),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Columnas con nombre cambiado8",{"Column1.regis_FCAntiDet", "Column1.regis_CliTra", "fchaFc", "descrCpbte", "signo", "nroCpbte", "numPed", "moneda", "cotizMda", "ListaPrec", "precioCabeNeto", "codCli", "rzonSoc", "vendedor", "codArt", "descArt", "preMdaList", "cant", "medida", "cantiPend"}),
    #"Filas filtradas1" = Table.SelectRows(#"Columnas reordenadas", each [fchaFc] > #date(2022, 2, 1)),
    #"Columnas con nombre cambiado9" = Table.RenameColumns(#"Filas filtradas1",{{"Column1.regis_CliTra", "idFcCab"}, {"Column1.regis_FCAntiDet", "idFcAntLin"}})
in
    #"Columnas con nombre cambiado9"
```

### fcCom

Origen: Consulta derivada local

Campos finales trazados al origen: Ver fórmula sanitizada; consulta derivada o externa

Join: Table.NestedJoin(fcCab, {"idFcCab", "numFc"}, fcDet, {"idFcCab", "nroFc"}, "fcDet", JoinKind.LeftOuter)

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = Table.NestedJoin(fcCab, {"idFcCab", "numFc"}, fcDet, {"idFcCab", "nroFc"}, "fcDet", JoinKind.LeftOuter),
    #"Se expandió fcDet" = Table.ExpandTableColumn(Origen, "fcDet", {"fchaFc", "descrCpbte", "nroFc", "idFcCab", "idMovArti", "codCli", "rzonSoc", "mdaFcCab", "FcD.importe", "fchaRemito", "numCpbteRem", "numPed", "Vendedor", "codArt", "descArt", "cant", "medida", "precioUn"}, {"fcDet.fchaFc", "fcDet.descrCpbte", "fcDet.nroFc", "fcDet.idFcCab", "fcDet.idMovArti", "fcDet.codCli", "fcDet.rzonSoc", "fcDet.mdaFcCab", "fcDet.FcD.importe", "fcDet.fchaRemito", "fcDet.numCpbteRem", "fcDet.numPed", "fcDet.Vendedor", "fcDet.codArt", "fcDet.descArt", "fcDet.cant", "fcDet.medida", "fcDet.precioUn"}),
    #"Columnas quitadas" = Table.RemoveColumns(#"Se expandió fcDet",{"fcDet.fchaFc", "fcDet.descrCpbte", "fcDet.nroFc", "fcDet.idFcCab", "fcDet.codCli", "fcDet.rzonSoc", "fcDet.mdaFcCab", "fcDet.fchaRemito", "fcDet.Vendedor"}),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Columnas quitadas",{"fc.fecha", "idFcCab", "numFc", "signo", "tipoFc", "moneda", "finalPesos", "finalUSD", "vendedor", "codCli", "razonSocial", "codConPgo", "CondPago", "fcDet.idMovArti", "fcDet.FcD.importe", "fcDet.numCpbteRem", "fcDet.numPed", "fcDet.codArt", "fcDet.descArt", "fcDet.cant", "fcDet.medida", "fcDet.precioUn"}),
    #"Filas ordenadas" = Table.Sort(#"Columnas reordenadas",{{"fc.fecha", Order.Descending}, {"idFcCab", Order.Descending}}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Filas ordenadas",{{"finalUSD", Currency.Type}})
in
    #"Tipo cambiado"
```

### remCab

Origen: /api/ISIS_RemitoClienteCabecera_VW

Campos finales trazados al origen: codigoFlete → Column1.codigoFlete; razonSocialFlete → Column1.razonSocialFlete; lugarEntrega → Column1.lugarEntrega; regis_RtoCliCab → idRtoCliCab; regis_PedCliCab → idPedCliCab; nroComprob_RtoCliCab → numRto; fecha_RtoCliCab → fchRto; codigoCli → codCli; razonSocialBusCli → razSocBus; codigCondiPago → codCondPgo; descrCondiPago → condPg; codigListaPrec → codListPrec; nombreVendedor → nomVend; monedaOper → moneda; regis_FCAntiCab → idFCAntCab; cotizaOper → cotDol

Filtro Excel (no adopción automática): Table.SelectRows(#"Columnas con nombre cambiado", each [Column1.codig_Emp] = 1)
Filtro Excel (no adopción automática): Table.SelectRows(#"Columnas quitadas", each [Column1.descripcion] = "Remito Vta.")
Filtro Excel (no adopción automática): Table.SelectRows(#"Columnas con nombre cambiado6", each [fchRto] > #date(2021, 12, 31))

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regis_RtoCliCab", "regis_PedCliCab", "codig_Emp", "descr_Emp", "descripcion", "nroComprob_RtoCliCab", "nroPreimpre_RtoCliCab", "fecha_RtoCliCab", "codigoCli", "razonSocialBusCli", "codigCondiPago", "descrCondiPago", "codCtroCosto", "descrCtroCosto", "codigListaPrec", "descrListaPrec", "codigVendedor", "nombreVendedor", "codConceOpe", "descrConceOpe", "codigoFlete", "razonSocialFlete", "lugarEntrega", "mdaOper_RtoCliCab", "monedaOper", "cotizaOper", "moneda1", "cotizMda1_RtoCliCab", "moneda2", "cotizMda2_RtoCliCab", "moneda3", "cotizMda3_RtoCliCab", "moneda4", "cotizMda4_RtoCliCab", "dto1_RtoCliCab", "dto2_RtoCliCab", "dto3_RtoCliCab", "dto4_RtoCliCab", "valorDecla_RtoCliCab", "leye1_RtoCliCab", "leye2_RtoCliCab", "regis_FCAntiCab"}, {"Column1.regis_RtoCliCab", "Column1.regis_PedCliCab", "Column1.codig_Emp", "Column1.descr_Emp", "Column1.descripcion", "Column1.nroComprob_RtoCliCab", "Column1.nroPreimpre_RtoCliCab", "Column1.fecha_RtoCliCab", "Column1.codigoCli", "Column1.razonSocialBusCli", "Column1.codigCondiPago", "Column1.descrCondiPago", "Column1.codCtroCosto", "Column1.descrCtroCosto", "Column1.codigListaPrec", "Column1.descrListaPrec", "Column1.codigVendedor", "Column1.nombreVendedor", "Column1.codConceOpe", "Column1.descrConceOpe", "Column1.codigoFlete", "Column1.razonSocialFlete", "Column1.lugarEntrega", "Column1.mdaOper_RtoCliCab", "Column1.monedaOper", "Column1.cotizaOper", "Column1.moneda1", "Column1.cotizMda1_RtoCliCab", "Column1.moneda2", "Column1.cotizMda2_RtoCliCab", "Column1.moneda3", "Column1.cotizMda3_RtoCliCab", "Column1.moneda4", "Column1.cotizMda4_RtoCliCab", "Column1.dto1_RtoCliCab", "Column1.dto2_RtoCliCab", "Column1.dto3_RtoCliCab", "Column1.dto4_RtoCliCab", "Column1.valorDecla_RtoCliCab", "Column1.leye1_RtoCliCab", "Column1.leye2_RtoCliCab", "Column1.regis_FCAntiCab"}),
    #"Filas ordenadas" = Table.Sort(#"Se expandió Column1",{{"Column1.regis_RtoCliCab", Order.Descending}}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Filas ordenadas",{{"Column1.regis_RtoCliCab", "idRtoCliCab"}, {"Column1.regis_PedCliCab", "idPedCliCab"}}),
    #"Filas filtradas" = Table.SelectRows(#"Columnas con nombre cambiado", each [Column1.codig_Emp] = 1),
    #"Columnas quitadas" = Table.RemoveColumns(#"Filas filtradas",{"Column1.codig_Emp", "Column1.descr_Emp"}),
    #"Filas filtradas1" = Table.SelectRows(#"Columnas quitadas", each [Column1.descripcion] = "Remito Vta."),
    #"Columnas quitadas1" = Table.RemoveColumns(#"Filas filtradas1",{"Column1.descripcion"}),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Columnas quitadas1",{{"Column1.nroComprob_RtoCliCab", "numRto"}}),
    #"Columnas quitadas2" = Table.RemoveColumns(#"Columnas con nombre cambiado1",{"Column1.nroPreimpre_RtoCliCab"}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columnas quitadas2",{{"Column1.fecha_RtoCliCab", type datetime}}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Tipo cambiado",{{"Column1.fecha_RtoCliCab", type date}}),
    #"Columnas con nombre cambiado2" = Table.RenameColumns(#"Tipo cambiado1",{{"Column1.fecha_RtoCliCab", "fchRto"}, {"Column1.codigoCli", "codCli"}, {"Column1.razonSocialBusCli", "razSocBus"}, {"Column1.codigCondiPago", "codCondPgo"}, {"Column1.descrCondiPago", "condPg"}}),
    #"Columnas quitadas3" = Table.RemoveColumns(#"Columnas con nombre cambiado2",{"Column1.codCtroCosto", "Column1.descrCtroCosto"}),
    #"Columnas con nombre cambiado3" = Table.RenameColumns(#"Columnas quitadas3",{{"Column1.codigListaPrec", "codListPrec"}}),
    #"Columnas quitadas4" = Table.RemoveColumns(#"Columnas con nombre cambiado3",{"Column1.descrListaPrec", "Column1.codigVendedor"}),
    #"Columnas con nombre cambiado4" = Table.RenameColumns(#"Columnas quitadas4",{{"Column1.nombreVendedor", "nomVend"}}),
    #"Columnas quitadas5" = Table.RemoveColumns(#"Columnas con nombre cambiado4",{"Column1.codConceOpe", "Column1.descrConceOpe", "Column1.mdaOper_RtoCliCab"}),
    #"Columnas con nombre cambiado5" = Table.RenameColumns(#"Columnas quitadas5",{{"Column1.monedaOper", "moneda"}}),
    #"Columnas quitadas6" = Table.RemoveColumns(#"Columnas con nombre cambiado5",{"Column1.moneda1", "Column1.cotizMda1_RtoCliCab", "Column1.moneda2", "Column1.cotizMda2_RtoCliCab", "Column1.moneda3", "Column1.cotizMda3_RtoCliCab", "Column1.moneda4", "Column1.cotizMda4_RtoCliCab", "Column1.dto1_RtoCliCab", "Column1.dto2_RtoCliCab", "Column1.dto3_RtoCliCab", "Column1.dto4_RtoCliCab", "Column1.valorDecla_RtoCliCab", "Column1.leye1_RtoCliCab", "Column1.leye2_RtoCliCab"}),
    #"Tipo cambiado2" = Table.TransformColumnTypes(#"Columnas quitadas6",{{"Column1.cotizaOper", Currency.Type}}),
    #"Columnas con nombre cambiado6" = Table.RenameColumns(#"Tipo cambiado2",{{"Column1.regis_FCAntiCab", "idFCAntCab"}, {"Column1.cotizaOper", "cotDol"}}),
    #"Filas filtradas2" = Table.SelectRows(#"Columnas con nombre cambiado6", each [fchRto] > #date(2021, 12, 31)),
    #"Filas ordenadas1" = Table.Sort(#"Filas filtradas2",{{"numRto", Order.Descending}})
in
    #"Filas ordenadas1"
```

### remDet

Origen: /api/ISIS_RemitoClienteDetalle_VW

Campos finales trazados al origen: regis_RtoCliDet → idRtoCliDet; regis_RtoCliCab → idRtoCliCab; codInternoArti → codArt; descripcion_RtoCliDet → descArt; canRto1_RtoCliDet → cantRem; codigListaPrec → codListPre; descr_Mda → moneda; cotiz_Mda → cotMoneda; precioCab_RtoCliDet → precioUnitario; importe_RtoCliDet → Subtotal; canFac1_RtoCliDet → cantFac; regis_FCAntiDet → idFCAntiDet


Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regis_RtoCliDet", "regis_RtoCliCab", "codDeposito", "descrDeposito", "codInternoArti", "descripcion_RtoCliDet", "canRto1_RtoCliDet", "canRto2_RtoCliDet", "bonRto1_RtoCliDet", "bonRto2_RtoCliDet", "codigListaPrec", "descrListaPrec", "descr_Mda", "cotiz_Mda", "tipoPrecio_RtoCliDet", "dto1_RtoCliDet", "dto2_RtoCliDet", "dto3_RtoCliDet", "precioCab_RtoCliDet", "importe_RtoCliDet", "canFac1_RtoCliDet", "canFac2_RtoCliDet", "bonFac1_RtoCliDet", "bonFac2_RtoCliDet", "regis_FCAntiDet"}, {"Column1.regis_RtoCliDet", "Column1.regis_RtoCliCab", "Column1.codDeposito", "Column1.descrDeposito", "Column1.codInternoArti", "Column1.descripcion_RtoCliDet", "Column1.canRto1_RtoCliDet", "Column1.canRto2_RtoCliDet", "Column1.bonRto1_RtoCliDet", "Column1.bonRto2_RtoCliDet", "Column1.codigListaPrec", "Column1.descrListaPrec", "Column1.descr_Mda", "Column1.cotiz_Mda", "Column1.tipoPrecio_RtoCliDet", "Column1.dto1_RtoCliDet", "Column1.dto2_RtoCliDet", "Column1.dto3_RtoCliDet", "Column1.precioCab_RtoCliDet", "Column1.importe_RtoCliDet", "Column1.canFac1_RtoCliDet", "Column1.canFac2_RtoCliDet", "Column1.bonFac1_RtoCliDet", "Column1.bonFac2_RtoCliDet", "Column1.regis_FCAntiDet"}),
    #"Filas ordenadas" = Table.Sort(#"Se expandió Column1",{{"Column1.regis_RtoCliDet", Order.Descending}}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Filas ordenadas",{{"Column1.regis_RtoCliDet", "idRtoCliDet"}, {"Column1.regis_RtoCliCab", "idRtoCliCab"}}),
    #"Columnas quitadas" = Table.RemoveColumns(#"Columnas con nombre cambiado",{"Column1.codDeposito", "Column1.descrDeposito"}),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Columnas quitadas",{{"Column1.codInternoArti", "codArt"}, {"Column1.descripcion_RtoCliDet", "descArt"}, {"Column1.canRto1_RtoCliDet", "cantRem"}}),
    #"Columnas quitadas1" = Table.RemoveColumns(#"Columnas con nombre cambiado1",{"Column1.canRto2_RtoCliDet", "Column1.bonRto1_RtoCliDet", "Column1.bonRto2_RtoCliDet"}),
    #"Columnas con nombre cambiado2" = Table.RenameColumns(#"Columnas quitadas1",{{"Column1.codigListaPrec", "codListPre"}}),
    #"Columnas quitadas2" = Table.RemoveColumns(#"Columnas con nombre cambiado2",{"Column1.descrListaPrec"}),
    #"Columnas con nombre cambiado3" = Table.RenameColumns(#"Columnas quitadas2",{{"Column1.descr_Mda", "moneda"}}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columnas con nombre cambiado3",{{"Column1.cotiz_Mda", Currency.Type}}),
    #"Columnas con nombre cambiado4" = Table.RenameColumns(#"Tipo cambiado",{{"Column1.cotiz_Mda", "cotMoneda"}}),
    #"Columnas quitadas3" = Table.RemoveColumns(#"Columnas con nombre cambiado4",{"Column1.tipoPrecio_RtoCliDet", "Column1.dto1_RtoCliDet", "Column1.dto2_RtoCliDet", "Column1.dto3_RtoCliDet"}),
    #"Columnas con nombre cambiado5" = Table.RenameColumns(#"Columnas quitadas3",{{"Column1.precioCab_RtoCliDet", "precioUnitario"}, {"Column1.importe_RtoCliDet", "Subtotal"}, {"Column1.canFac1_RtoCliDet", "cantFac"}}),
    #"Columnas quitadas4" = Table.RemoveColumns(#"Columnas con nombre cambiado5",{"Column1.canFac2_RtoCliDet", "Column1.bonFac1_RtoCliDet", "Column1.bonFac2_RtoCliDet"}),
    #"Columnas con nombre cambiado6" = Table.RenameColumns(#"Columnas quitadas4",{{"Column1.regis_FCAntiDet", "idFCAntiDet"}}),
    #"Filas ordenadas1" = Table.Sort(#"Columnas con nombre cambiado6",{{"idRtoCliDet", Order.Descending}})
in
    #"Filas ordenadas1"
```

### remCom

Origen: Consulta derivada local

Campos finales trazados al origen: Ver fórmula sanitizada; consulta derivada o externa

Join: Table.NestedJoin(remCab, {"idRtoCliCab"}, remDet, {"idRtoCliCab"}, "remDet", JoinKind.LeftOuter)

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = Table.NestedJoin(remCab, {"idRtoCliCab"}, remDet, {"idRtoCliCab"}, "remDet", JoinKind.LeftOuter),
    #"Se expandió remDet" = Table.ExpandTableColumn(Origen, "remDet", {"idRtoCliDet", "codArt", "descArt", "cantRem", "codListPre", "moneda", "cotMoneda", "precioUnitario", "Subtotal", "cantFac", "idFCAntiDet"}, {"remDet.idRtoCliDet", "remDet.codArt", "remDet.descArt", "remDet.cantRem", "remDet.codListPre", "remDet.moneda", "remDet.cotMoneda", "remDet.precioUnitario", "remDet.Subtotal", "remDet.cantFac", "remDet.idFCAntiDet"}),
    #"Filas ordenadas" = Table.Sort(#"Se expandió remDet",{{"idRtoCliCab", Order.Descending}}),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Filas ordenadas",{"idRtoCliCab", "idPedCliCab", "remDet.idFCAntiDet", "numRto", "fchRto", "codCli", "razSocBus", "codCondPgo", "condPg", "codListPrec", "nomVend", "Column1.codigoFlete", "Column1.razonSocialFlete", "Column1.lugarEntrega", "moneda", "cotDol", "idFCAntCab", "remDet.idRtoCliDet", "remDet.codArt", "remDet.descArt", "remDet.cantRem", "remDet.codListPre", "remDet.moneda", "remDet.cotMoneda", "remDet.precioUnitario", "remDet.Subtotal", "remDet.cantFac"})
in
    #"Columnas reordenadas"
```

### rcBase

Origen: /api/ISIS_OperacionesClienteImputacion_VW

Campos finales trazados al origen: regis_ImpuCli → idImpuCli; regTraFC_ImpuCli → idRegTraFC_ImpuCli; regTraRC_ImpuCli → idRegTraRC_ImpuCli; codigoCli → codCli; razonSocialBusCli → razSocBus; fechaComprobDeb → fechaComprobDeb; desComprobDeb → desComprobDeb; nroComprobDeb → nroComprobDeb; totalComproDeb → totalComproDeb; fechaComprobCred → fechaComprobCred; desComprobCred → desComprobCred; nroComprobCred → ComprobCred; totalComproCred → totalComproCred

Filtro Excel (no adopción automática): Table.SelectRows(#"Tipo cambiado1", each ([Column1.desComprobCred] = "Recibo") and ([Column1.codig_Emp] = 1))
Filtro Excel (no adopción automática): Table.SelectRows(#"Columnas con nombre cambiado", each [fechaComprobDeb] > #date(2021, 12, 31))

Columnas calculadas: Ninguna detectada.

Fórmula completa sanitizada (evidencia, no instrucciones):

```powerquery
let
    Origen = FUENTE_API_SIN_CREDENCIALES,
    #"Convertida en tabla" = Table.FromList(Origen, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Se expandió Column1" = Table.ExpandRecordColumn(#"Convertida en tabla", "Column1", {"regis_ImpuCli", "codig_Emp", "descr_Emp", "codigoCli", "razonSocialBusCli", "razonSocialCli", "regTraFC_ImpuCli", "fechaComprobDeb", "desComprobDeb", "nroComprobDeb", "totalComproDeb", "regTraRC_ImpuCli", "fechaComprobCred", "desComprobCred", "nroComprobCred", "totalComproCred"}, {"Column1.regis_ImpuCli", "Column1.codig_Emp", "Column1.descr_Emp", "Column1.codigoCli", "Column1.razonSocialBusCli", "Column1.razonSocialCli", "Column1.regTraFC_ImpuCli", "Column1.fechaComprobDeb", "Column1.desComprobDeb", "Column1.nroComprobDeb", "Column1.totalComproDeb", "Column1.regTraRC_ImpuCli", "Column1.fechaComprobCred", "Column1.desComprobCred", "Column1.nroComprobCred", "Column1.totalComproCred"}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Se expandió Column1",{{"Column1.fechaComprobCred", type datetime}, {"Column1.fechaComprobDeb", type datetime}}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Tipo cambiado",{{"Column1.fechaComprobCred", type date}, {"Column1.fechaComprobDeb", type date}, {"Column1.totalComproDeb", Currency.Type}, {"Column1.totalComproCred", Currency.Type}}),
    #"Filas filtradas" = Table.SelectRows(#"Tipo cambiado1", each ([Column1.desComprobCred] = "Recibo") and ([Column1.codig_Emp] = 1)),
    #"Columnas quitadas" = Table.RemoveColumns(#"Filas filtradas",{"Column1.codig_Emp", "Column1.descr_Emp", "Column1.razonSocialCli"}),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Columnas quitadas",{"Column1.regis_ImpuCli", "Column1.regTraFC_ImpuCli", "Column1.regTraRC_ImpuCli", "Column1.codigoCli", "Column1.razonSocialBusCli", "Column1.fechaComprobDeb", "Column1.desComprobDeb", "Column1.nroComprobDeb", "Column1.totalComproDeb", "Column1.fechaComprobCred", "Column1.desComprobCred", "Column1.nroComprobCred", "Column1.totalComproCred"}),
    #"Filas ordenadas" = Table.Sort(#"Columnas reordenadas",{{"Column1.regis_ImpuCli", Order.Descending}}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Filas ordenadas",{{"Column1.regis_ImpuCli", "idImpuCli"}, {"Column1.regTraFC_ImpuCli", "idRegTraFC_ImpuCli"}, {"Column1.regTraRC_ImpuCli", "idRegTraRC_ImpuCli"}, {"Column1.codigoCli", "codCli"}, {"Column1.razonSocialBusCli", "razSocBus"}, {"Column1.fechaComprobDeb", "fechaComprobDeb"}, {"Column1.desComprobDeb", "desComprobDeb"}, {"Column1.nroComprobDeb", "nroComprobDeb"}, {"Column1.totalComproDeb", "totalComproDeb"}, {"Column1.fechaComprobCred", "fechaComprobCred"}, {"Column1.desComprobCred", "desComprobCred"}, {"Column1.nroComprobCred", "ComprobCred"}, {"Column1.totalComproCred", "totalComproCred"}}),
    #"Filas filtradas1" = Table.SelectRows(#"Columnas con nombre cambiado", each [fechaComprobDeb] > #date(2021, 12, 31))
in

    #"Filas filtradas1"
```

## Decisiones por endpoint

### Pedidos · cabecera

Endpoint: /api/ISIS_PedidoClteCab_VW. Alcance: Pantalla inicial.
Consultas Excel: pedCab.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regis_PedCliCab | Sólo Excel | integer (int32) | pedCab: idPedCab |  |
| nombreVendedor | Sólo Excel | string · nullable | pedCab: vend |  |
| codigoFlete | Sin selección | string · nullable |  |  |
| razonSocialFlete | Sin selección | string · nullable |  |  |
| sucursalEntrega | Sin selección | string · nullable |  |  |
| desMdaOper | Sólo Excel | string · nullable | pedCab: moneda |  |
| cotizaOper | Sólo Excel | number (double) | pedCab: cot |  |
| dto1_PedCliCab | Sin selección | number (double) |  |  |
| dto2_PedCliCab | Sin selección | number (double) |  |  |
| dto3_PedCliCab | Sin selección | number (double) |  |  |
| dto4_PedCliCab | Sin selección | number (double) |  |  |
| codigVendedor | Sin selección | integer (int32) |  |  |
| subtotal_PedCliCab | Sólo Excel | number (double) | pedCab: subtot |  |
| impInterno_PedCliCab | Sin selección | number (double) |  |  |
| ivA_PedCliCab | Sin selección | number (double) |  |  |
| perceIva_PedCliCab | Sin selección | number (double) |  |  |
| perceIBr_PedCliCab | Sin selección | number (double) |  |  |
| total_PedCliCab | Sólo Excel | number (double) | pedCab: total |  |
| senFechaIniFin_PedCliCab | Sin selección | string · nullable |  |  |
| fechaInicioVig_PedCliCab | Sin selección | string (date-time) · nullable |  |  |
| fechaFinVig_PedCliCab | Sin selección | string (date-time) · nullable |  |  |
| pedidoPendiente | Sin selección | string · nullable |  |  |
| pedidoEcommerce | Sin selección | string · nullable |  |  |
| descuento_PedCliCab | Sin selección | number (double) |  |  |
| desCpbtePresupuesto | Sin selección | string · nullable |  |  |
| descrListaPrec | Sin selección | string · nullable |  |  |
| descrCtroCosto | Sin selección | string · nullable |  |  |
| codig_Emp | Sin selección | integer (int32) |  |  |
| desCpbtePedido | Sin selección | string · nullable |  |  |
| numero_PedCliCab | Sólo Excel | number (double) | pedCab: numPed |  |
| fecha_PedCliCab | Sólo Excel | string (date-time) · nullable | pedCab: fchaPed |  |
| tipoPedido | Sin selección | string · nullable |  |  |
| mes01_PedCliCab | Sin selección | string · nullable |  |  |
| mes02_PedCliCab | Sin selección | string · nullable |  |  |
| mes03_PedCliCab | Sin selección | string · nullable |  |  |
| mes04_PedCliCab | Sin selección | string · nullable |  |  |
| mes05_PedCliCab | Sin selección | string · nullable |  |  |
| mes06_PedCliCab | Sin selección | string · nullable |  |  |
| mes07_PedCliCab | Sin selección | string · nullable |  |  |
| mes08_PedCliCab | Sin selección | string · nullable |  |  |
| mes09_PedCliCab | Sin selección | string · nullable |  |  |
| mes10_PedCliCab | Sin selección | string · nullable |  |  |
| mes11_PedCliCab | Sin selección | string · nullable |  |  |
| mes12_PedCliCab | Sin selección | string · nullable |  |  |
| codigoCli | Sólo Excel | string · nullable | pedCab: codCli |  |
| razonSocialCli | Sólo Excel | string · nullable | pedCab: rzonSoc |  |
| codigListaPrec | Sólo Excel | integer (int32) · nullable | pedCab: codPre |  |
| codigCondiPago | Sólo Excel | integer (int32) | pedCab: codPgo |  |
| descrCondiPago | Sólo Excel | string · nullable | pedCab: desPgo |  |
| codCtroCosto | Sin selección | integer (int32) |  |  |
| numero_PreCliCab | Sólo Excel | number (double) · nullable | pedCab: numCot |  |
| usuAutori1 | Sin selección | string · nullable |  |  |
| fecAut1_PedCliCab | Sin selección | string (date-time) · nullable |  |  |
| usuAutori2 | Sin selección | string · nullable |  |  |
| fecAut2_PedCliCab | Sin selección | string (date-time) · nullable |  |  |

Parámetros (separados de los campos):

- NumeroPedCliCab: Por definir
- FechaPedCliCabDesde: Por definir
- FechaPedCliCabHasta: Por definir

### Pedidos · líneas

Endpoint: /api/ISIS_PedidoClteDet_VW. Alcance: Pantalla inicial.
Consultas Excel: pedDet.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regis_PedCliDet | Sin selección | integer (int32) |  | Diferencia de nombre; equivalencia pendiente |
| dto3Item | Sin selección | number (double) |  |  |
| dto1Cabe | Sin selección | number (double) |  |  |
| dto2Cabe | Sin selección | number (double) |  |  |
| dto3Cabe | Sin selección | number (double) |  |  |
| dto4Cabe | Sin selección | number (double) |  |  |
| precioMdaLista_Neto | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| precioMdaCabe_Neto | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| senFechaIniFin_PedCliDet | Sin selección | string · nullable |  | Diferencia de nombre; equivalencia pendiente |
| dto2Item | Sin selección | number (double) |  |  |
| fechaInicioVig_PedCliDet | Sin selección | string (date-time) · nullable |  | Diferencia de nombre; equivalencia pendiente |
| prCpra1Pesos_Arti | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| prCpra2Pesos_Arti | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| prCto1Pesos_Arti | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| prCto2Pesos_Arti | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| mdaPrecioCompra | Sin selección | string · nullable |  |  |
| cotizPrecioCompra | Sin selección | number (double) |  |  |
| prCpra1Moneda_Arti | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| prCpra2Moneda_Arti | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| fechaFinVig_PedCliDet | Sin selección | string (date-time) · nullable |  | Diferencia de nombre; equivalencia pendiente |
| prCto1Moneda_Arti | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| dto1Item | Sin selección | number (double) |  |  |
| precioMdaLista | Sin selección | number (double) |  |  |
| regis_PedCliCab | Sin selección | integer (int32) |  | Diferencia de nombre; equivalencia pendiente |
| codInternoArti | Sólo Excel | string · nullable | pedDet: codArt |  |
| descripcionArticulo | Sólo Excel | string · nullable | pedDet: descArt |  |
| medidaPri | Sólo Excel | string · nullable | pedDet: unidad |  |
| cantiPedida_UMP | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| bonifPedida_UMP | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| cantiEntregada_UMP | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| bonifEntregada_UMP | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| precioMdaCabe | Sin selección | number (double) |  |  |
| medidaSecu | Sin selección | string · nullable |  |  |
| bonifPedida_UMS | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| cantiEntregada_UMS | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| bonifEntregada_UMS | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| codigListaPrec | Sin selección | integer (int32) |  |  |
| descrListaPrec | Sin selección | string · nullable |  |  |
| monedaLista | Sin selección | string · nullable |  |  |
| cotizMdaLista | Sin selección | number (double) |  |  |
| tipoPrecio_PedCliDet | Sin selección | integer (int32) |  | Diferencia de nombre; equivalencia pendiente |
| cantiPedida_UMS | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| prCto2Moneda_Arti | Sin selección | number (double) |  | Diferencia de nombre; equivalencia pendiente |
| regisPedCliDet | Sólo Excel | No documentado | pedDet: idPedDet | Diferencia de nombre; equivalencia pendiente |
| regisPedCliCab | Sólo Excel | No documentado | pedDet: idPedCab | Diferencia de nombre; equivalencia pendiente |
| cantiPedidaUmp | Sólo Excel | No documentado | pedDet: cant | Diferencia de nombre; equivalencia pendiente |
| bonifPedidaUmp | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| cantiEntregadaUmp | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| bonifEntregadaUmp | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| cantiPedidaUms | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| bonifPedidaUms | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| cantiEntregadaUms | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| bonifEntregadaUms | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| tipoPrecioPedCliDet | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| precioMdaListaNeto | Sólo Excel | No documentado | pedDet: pcioUnit | Diferencia de nombre; equivalencia pendiente |
| precioMdaCabeNeto | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| senFechaIniFinPedCliDet | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| fechaInicioVigPedCliDet | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| fechaFinVigPedCliDet | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| prCpra1PesosArti | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| prCpra2PesosArti | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| prCto1PesosArti | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| prCto2PesosArti | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| prCpra1MonedaArti | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| prCpra2MonedaArti | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| prCto1MonedaArti | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |
| prCto2MonedaArti | Sin selección | No documentado |  | Diferencia de nombre; equivalencia pendiente |

Parámetros (separados de los campos):

- FechaVigPedCliDetDesde: Por definir
- FechaVigPedCliDetHasta: Por definir

### Facturas · cabecera

Endpoint: /api/ISIS_VentasCabecera_VW. Alcance: Pantalla inicial.
Consultas Excel: fcCab.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regis_CliTra | Sólo Excel | integer (int32) | fcCab: idFcCab |  |
| signoCpbte | Sólo Excel | integer (int32) | fcCab: signo |  |
| netoPes_CliTra | Sólo Excel | number (double) | fcCab: finalPesos |  |
| netoMda1_CliTra | Sólo Excel | number (double) | fcCab: finalUSD |  |
| netoMda2_CliTra | Sin selección | number (double) |  |  |
| netoMda3_CliTra | Sin selección | number (double) |  |  |
| netoMda4_CliTra | Sin selección | number (double) |  |  |
| dto1_CliTra | Sin selección | number (double) |  |  |
| dto2_CliTra | Sin selección | number (double) |  |  |
| dto3_CliTra | Sin selección | number (double) |  |  |
| dto4_CliTra | Sin selección | number (double) |  |  |
| porceRec_CliTra | Sin selección | number (double) |  |  |
| descuento_CliTra | Sin selección | number (double) |  |  |
| descuentoPes_CliTra | Sin selección | number (double) |  |  |
| recargo_CliTra | Sin selección | number (double) |  |  |
| recargoPes_CliTra | Sin selección | number (double) |  |  |
| ivA_CliTra | Sin selección | number (double) |  |  |
| ivaPes_CliTra | Sin selección | number (double) |  |  |
| perceIva_CliTra | Sin selección | number (double) |  |  |
| perceIvaPes_CliTra | Sin selección | number (double) |  |  |
| cotizaOper | Sin selección | number (double) |  |  |
| monedaOper | Sólo Excel | string · nullable | fcCab: moneda |  |
| nroMonedaOper | Sin selección | integer (int32) |  |  |
| nombreCliSucu | Sin selección | string · nullable |  |  |
| codig_Emp | Sin selección | integer (int32) |  |  |
| descr_Emp | Sin selección | string · nullable |  |  |
| fecha_CliTra | Sólo Excel | string (date-time) · nullable | fcCab: fc.fecha |  |
| descripcionCpbte | Sólo Excel | string · nullable | fcCab: tipoFc |  |
| nroComprob_CliTra | Sólo Excel | number (double) | fcCab: numFc |  |
| nroPreimpre_CliTra | Sin selección | number (double) |  |  |
| codigoCli | Sólo Excel | string · nullable | fcCab: codCli |  |
| razonSocialCli | Sólo Excel | string · nullable | fcCab: razonSocial |  |
| codigCondiPago | Sólo Excel | integer (int32) | fcCab: codConPgo |  |
| perceIBr_CliTra | Sin selección | number (double) |  |  |
| descrCondiPago | Sólo Excel | string · nullable | fcCab: CondPago |  |
| descrCtroCosto | Sin selección | string · nullable |  |  |
| codigListaPrec | Sin selección | integer (int32) · nullable |  |  |
| descrListaPrec | Sin selección | string · nullable |  |  |
| codigVendedor | Sin selección | integer (int32) |  |  |
| nombreVendedor | Sólo Excel | string · nullable | fcCab: vendedor |  |
| codConceOpe | Sin selección | integer (int32) |  |  |
| descrConceOpe | Sin selección | string · nullable |  |  |
| codigoFlete | Sin selección | string · nullable |  |  |
| razonSocialFlete | Sin selección | string · nullable |  |  |
| codCtroCosto | Sin selección | integer (int32) |  |  |
| perceIBrPes_CliTra | Sin selección | number (double) |  |  |

Parámetros (separados de los campos):

- CodigoCli: Por definir
- DescripcionCpbte: Por definir
- Fecha_CliTraDesde: Por definir
- Fecha_CliTraHasta: Por definir
- NroComprob_CliTraDesde: Por definir
- NroComprob_CliTraHasta: Por definir

### Facturas · detalle normal

Endpoint: /api/ISIS_VentasDetalle_VW. Alcance: Pantalla inicial.
Consultas Excel: fcDet.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regis_CliTra | Sólo Excel | integer (int32) | fcDet: idFcCab |  |
| cantidad2_MovArtiD | Sin selección | number (double) |  |  |
| bonifica2_MovArtiD | Sin selección | number (double) |  |  |
| dto1_CliTra | Sin selección | number (double) |  |  |
| dto2_CliTra | Sin selección | number (double) |  |  |
| dto3_CliTra | Sin selección | number (double) |  |  |
| dto4_CliTra | Sin selección | number (double) |  |  |
| mdaPrecioVta | Sólo Excel | string · nullable | fcDet: mdaFcCab |  |
| cotizacion | Sin selección | number (double) |  |  |
| tipoPrecio_MovArtiD | Sin selección | integer (int32) |  |  |
| precio | Sólo Excel | number (double) | fcDet: precioUn |  |
| importe | Sólo Excel | number (double) | fcDet: FcD.importe |  |
| prCpra1Pesos_MovArtiD | Sin selección | number (double) |  |  |
| prCpra2Pesos_MovArtiD | Sin selección | number (double) |  |  |
| prCto1Pesos_MovArtiD | Sin selección | number (double) |  |  |
| prCto2Pesos_MovArtiD | Sin selección | number (double) |  |  |
| mdaPrecioCpra | Sin selección | string · nullable |  |  |
| cotizPrecioCompra | Sin selección | number (double) |  |  |
| prCpra1MonedaCpra | Sin selección | number (double) |  |  |
| prCpra2MonedaCpra | Sin selección | number (double) |  |  |
| medidaSecundaria | Sin selección | string · nullable |  |  |
| prCosto1MonedaCpra | Sin selección | number (double) |  |  |
| bonifica1_MovArtiD | Sin selección | number (double) |  |  |
| medidaPrincipal | Sólo Excel | string · nullable | fcDet: medida |  |
| regis_MovArtiD | Sólo Excel | integer (int32) | fcDet: idMovArti |  |
| codigoCli | Sólo Excel | string · nullable | fcDet: codCli |  |
| razonSocialCli | Sólo Excel | string · nullable | fcDet: rzonSoc |  |
| fechaCpbteVenta | Sólo Excel | string (date-time) | fcDet: fchaFc |  |
| descrCpbteVenta | Sólo Excel | string · nullable | fcDet: descrCpbte |  |
| nroSistemaCpbteVenta | Sólo Excel | number (double) | fcDet: nroFc |  |
| nroPreimpreCpbteVenta | Sin selección | number (double) |  |  |
| fechaCpbteRemito | Sólo Excel | string (date-time) · nullable | fcDet: fchaRemito |  |
| descrCpbteRemito | Sin selección | string · nullable |  |  |
| nroSistemaCpbteRemito | Sólo Excel | number (double) | fcDet: numCpbteRem |  |
| nroPreimpreCpbteRemito | Sin selección | number (double) |  |  |
| fechaCpbtePedido | Sin selección | string (date-time) · nullable |  |  |
| descrCpbtePedido | Sin selección | string · nullable |  |  |
| numeroCpbtePedido | Sólo Excel | number (double) · nullable | fcDet: numPed |  |
| codigoVdorCpbtePedido | Sin selección | integer (int32) · nullable |  |  |
| nombreVdorCpbtePedido | Sólo Excel | string · nullable | fcDet: Vendedor |  |
| signoCpbte | Sin selección | integer (int32) |  |  |
| codInternoArti | Sólo Excel | string · nullable | fcDet: codArt |  |
| descripcionArti | Sólo Excel | string · nullable | fcDet: descArt |  |
| cantidad1_MovArtiD | Sólo Excel | number (double) | fcDet: cant |  |
| prCosto2MonedaCpra | Sin selección | number (double) |  |  |

Parámetros (separados de los campos):

- Regis_CliTra: Por definir
- FechaCpbteVentaDesde: Por definir
- FechaCpbteVentaHasta: Por definir

### Facturas anticipadas · detalle

Endpoint: /api/ISIS_VentasDetalLeFCAnti_VW. Alcance: Pantalla inicial.
Consultas Excel: fcAnt.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regis_CliTra | Sólo Excel | No documentado | fcAnt: idFcCab | Campo de Excel no encontrado en estos esquemas |
| codigListaPrec | Sin selección | No documentado |  |  |
| descrListaPrec | Sólo Excel | No documentado | fcAnt: ListaPrec | Campo de Excel no encontrado en estos esquemas |
| monedaLista | Sólo Excel | No documentado | fcAnt: moneda | Campo de Excel no encontrado en estos esquemas |
| cotizMdaLista | Sólo Excel | No documentado | fcAnt: cotizMda | Campo de Excel no encontrado en estos esquemas |
| tipoPrecio_FCAntiDet | Sin selección | No documentado |  |  |
| precioMdaLista | Sin selección | No documentado |  |  |
| precioMdaCabe | Sin selección | No documentado |  |  |
| dto1Item | Sin selección | No documentado |  |  |
| dto2Item | Sin selección | No documentado |  |  |
| dto3Item | Sin selección | No documentado |  |  |
| dto1_CliTra | Sin selección | No documentado |  |  |
| bonifPendienteSec | Sin selección | No documentado |  |  |
| dto2_CliTra | Sin selección | No documentado |  |  |
| dto4_CliTra | Sin selección | No documentado |  |  |
| precioMdaLista_Neto | Sólo Excel | No documentado | fcAnt: preMdaList | Campo de Excel no encontrado en estos esquemas |
| precioMdaCabe_Neto | Sólo Excel | No documentado | fcAnt: precioCabeNeto | Campo de Excel no encontrado en estos esquemas |
| prCpra1Pesos_Arti | Sin selección | No documentado |  |  |
| prCpra2Pesos_Arti | Sin selección | No documentado |  |  |
| prCto1Pesos_Arti | Sin selección | No documentado |  |  |
| prCto2Pesos_Arti | Sin selección | No documentado |  |  |
| mdaPrecioCompra | Sin selección | No documentado |  |  |
| cotizPrecioCompra | Sin selección | No documentado |  |  |
| prCpra1Moneda_Arti | Sin selección | No documentado |  |  |
| prCpra2Moneda_Arti | Sin selección | No documentado |  |  |
| dto3_CliTra | Sin selección | No documentado |  |  |
| bonifEntregadaSec | Sin selección | No documentado |  |  |
| bonifFacturadaSec | Sin selección | No documentado |  |  |
| cantiPendienteSec | Sin selección | No documentado |  |  |
| regis_FCAntiDet | Sólo Excel | No documentado | fcAnt: idFcAntLin | Campo de Excel no encontrado en estos esquemas |
| codigoCli | Sólo Excel | No documentado | fcAnt: codCli | Campo de Excel no encontrado en estos esquemas |
| razonSocialCli | Sólo Excel | No documentado | fcAnt: rzonSoc | Campo de Excel no encontrado en estos esquemas |
| fechaCpbteVenta | Sólo Excel | No documentado | fcAnt: fchaFc | Campo de Excel no encontrado en estos esquemas |
| descrCpbteVenta | Sólo Excel | No documentado | fcAnt: descrCpbte | Campo de Excel no encontrado en estos esquemas |
| nroSistemaCpbteVenta | Sólo Excel | No documentado | fcAnt: nroCpbte | Campo de Excel no encontrado en estos esquemas |
| nroPreimpreCpbteVenta | Sin selección | No documentado |  |  |
| fechaCpbtePedido | Sin selección | No documentado |  |  |
| descrCpbtePedido | Sin selección | No documentado |  |  |
| numeroCpbtePedido | Sólo Excel | No documentado | fcAnt: numPed | Campo de Excel no encontrado en estos esquemas |
| codigoVdorCpbtePedido | Sin selección | No documentado |  |  |
| nombreVdorCpbtePedido | Sólo Excel | No documentado | fcAnt: vendedor | Campo de Excel no encontrado en estos esquemas |
| signoCpbte | Sólo Excel | No documentado | fcAnt: signo | Campo de Excel no encontrado en estos esquemas |
| codInternoArti | Sólo Excel | No documentado | fcAnt: codArt | Campo de Excel no encontrado en estos esquemas |
| descripcionArti | Sólo Excel | No documentado | fcAnt: descArt | Campo de Excel no encontrado en estos esquemas |
| medidaPrincipal | Sólo Excel | No documentado | fcAnt: medida | Campo de Excel no encontrado en estos esquemas |
| cantiFacturadaPri | Sólo Excel | No documentado | fcAnt: cant | Campo de Excel no encontrado en estos esquemas |
| cantiEntregadaPri | Sin selección | No documentado |  |  |
| cantiPendientePri | Sólo Excel | No documentado | fcAnt: cantiPend | Campo de Excel no encontrado en estos esquemas |
| bonifFacturadaPri | Sin selección | No documentado |  |  |
| bonifEntregadaPri | Sin selección | No documentado |  |  |
| bonifPendientePri | Sin selección | No documentado |  |  |
| medidaSecundaria | Sin selección | No documentado |  |  |
| cantiFacturadaSec | Sin selección | No documentado |  |  |
| cantiEntregadaSec | Sin selección | No documentado |  |  |
| prCto1Moneda_Arti | Sin selección | No documentado |  |  |
| prCto2Moneda_Arti | Sin selección | No documentado |  |  |

Parámetros (separados de los campos):


### Remitos · cabecera

Endpoint: /api/ISIS_RemitoClienteCabecera_VW. Alcance: Pantalla inicial.
Consultas Excel: remCab.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regis_RtoCliCab | Sólo Excel | integer (int32) | remCab: idRtoCliCab |  |
| regis_PedCliCab | Sólo Excel | integer (int32) · nullable | remCab: idPedCliCab |  |
| codig_Emp | Sin selección | integer (int32) |  |  |
| descr_Emp | Sin selección | string · nullable |  |  |
| descripcion | Sin selección | string · nullable |  |  |
| nroComprob_RtoCliCab | Sólo Excel | number (double) | remCab: numRto |  |
| nroPreimpre_RtoCliCab | Sin selección | number (double) |  |  |
| fecha_RtoCliCab | Sólo Excel | string (date-time) · nullable | remCab: fchRto |  |
| codigoCli | Sólo Excel | string · nullable | remCab: codCli |  |
| razonSocialBusCli | Sólo Excel | string · nullable | remCab: razSocBus |  |
| codigCondiPago | Sólo Excel | integer (int32) | remCab: codCondPgo |  |
| descrCondiPago | Sólo Excel | string · nullable | remCab: condPg |  |
| codCtroCosto | Sin selección | integer (int32) |  |  |
| descrCtroCosto | Sin selección | string · nullable |  |  |
| codigListaPrec | Sólo Excel | integer (int32) · nullable | remCab: codListPrec |  |
| descrListaPrec | Sin selección | string · nullable |  |  |
| codigVendedor | Sin selección | integer (int32) |  |  |
| nombreVendedor | Sólo Excel | string · nullable | remCab: nomVend |  |
| codConceOpe | Sin selección | integer (int32) |  |  |
| descrConceOpe | Sin selección | string · nullable |  |  |
| codigoFlete | Sólo Excel | string · nullable | remCab: Column1.codigoFlete |  |
| razonSocialFlete | Sólo Excel | string · nullable | remCab: Column1.razonSocialFlete |  |
| lugarEntrega | Sólo Excel | string · nullable | remCab: Column1.lugarEntrega |  |
| mdaOper_RtoCliCab | Sin selección | integer (int32) |  |  |
| monedaOper | Sólo Excel | string · nullable | remCab: moneda |  |
| cotizaOper | Sólo Excel | number (double) | remCab: cotDol |  |
| moneda1 | Sin selección | string · nullable |  |  |
| cotizMda1_RtoCliCab | Sin selección | number (double) |  |  |
| moneda2 | Sin selección | string · nullable |  |  |
| cotizMda2_RtoCliCab | Sin selección | number (double) |  |  |
| moneda3 | Sin selección | string · nullable |  |  |
| cotizMda3_RtoCliCab | Sin selección | number (double) |  |  |
| moneda4 | Sin selección | string · nullable |  |  |
| cotizMda4_RtoCliCab | Sin selección | number (double) |  |  |
| dto1_RtoCliCab | Sin selección | number (double) |  |  |
| dto2_RtoCliCab | Sin selección | number (double) |  |  |
| dto3_RtoCliCab | Sin selección | number (double) |  |  |
| dto4_RtoCliCab | Sin selección | number (double) |  |  |
| valorDecla_RtoCliCab | Sin selección | number (double) |  |  |
| leye1_RtoCliCab | Sin selección | string · nullable |  |  |
| leye2_RtoCliCab | Sin selección | string · nullable |  |  |
| regis_FCAntiCab | Sólo Excel | integer (int32) · nullable | remCab: idFCAntCab |  |

Parámetros (separados de los campos):

- CodigoCli: Por definir
- Descripcion: Por definir
- NroComprob_RtoCliCab: Por definir
- Fecha_RtoCliCabDesde: Por definir
- Fecha_RtoCliCabHasta: Por definir

### Remitos · detalle

Endpoint: /api/ISIS_RemitoClienteDetalle_VW. Alcance: Pantalla inicial.
Consultas Excel: remDet.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regis_RtoCliDet | Sólo Excel | integer (int32) | remDet: idRtoCliDet |  |
| regis_RtoCliCab | Sólo Excel | integer (int32) | remDet: idRtoCliCab |  |
| codDeposito | Sin selección | integer (int32) |  |  |
| descrDeposito | Sin selección | string · nullable |  |  |
| codInternoArti | Sólo Excel | string · nullable | remDet: codArt |  |
| descripcion_RtoCliDet | Sólo Excel | string · nullable | remDet: descArt |  |
| canRto1_RtoCliDet | Sólo Excel | number (double) | remDet: cantRem |  |
| canRto2_RtoCliDet | Sin selección | number (double) |  |  |
| bonRto1_RtoCliDet | Sin selección | number (double) |  |  |
| bonRto2_RtoCliDet | Sin selección | number (double) |  |  |
| codigListaPrec | Sólo Excel | integer (int32) · nullable | remDet: codListPre |  |
| descrListaPrec | Sin selección | string · nullable |  |  |
| descr_Mda | Sólo Excel | string · nullable | remDet: moneda |  |
| cotiz_Mda | Sólo Excel | number (double) | remDet: cotMoneda |  |
| tipoPrecio_RtoCliDet | Sin selección | integer (int32) |  |  |
| dto1_RtoCliDet | Sin selección | number (double) |  |  |
| dto2_RtoCliDet | Sin selección | number (double) |  |  |
| dto3_RtoCliDet | Sin selección | number (double) |  |  |
| precioCab_RtoCliDet | Sólo Excel | number (double) | remDet: precioUnitario |  |
| importe_RtoCliDet | Sólo Excel | number (double) | remDet: Subtotal |  |
| canFac1_RtoCliDet | Sólo Excel | number (double) | remDet: cantFac |  |
| canFac2_RtoCliDet | Sin selección | number (double) |  |  |
| bonFac1_RtoCliDet | Sin selección | number (double) |  |  |
| bonFac2_RtoCliDet | Sin selección | number (double) |  |  |
| regis_FCAntiDet | Sólo Excel | integer (int32) · nullable | remDet: idFCAntiDet |  |

Parámetros (separados de los campos):

- Regis_RtoCliCab: Por definir

### Recibos · imputaciones

Endpoint: /api/ISIS_OperacionesClienteImputacion_VW. Alcance: Pantalla inicial.
Consultas Excel: rcBase.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regis_ImpuCli | Sólo Excel | integer (int32) | rcBase: idImpuCli |  |
| codig_Emp | Sin selección | integer (int32) · nullable |  |  |
| descr_Emp | Sin selección | string · nullable |  |  |
| codigoCli | Sólo Excel | string · nullable | rcBase: codCli |  |
| razonSocialBusCli | Sólo Excel | string · nullable | rcBase: razSocBus |  |
| razonSocialCli | Sin selección | string · nullable |  |  |
| regTraFC_ImpuCli | Sólo Excel | integer (int32) · nullable | rcBase: idRegTraFC_ImpuCli |  |
| fechaComprobDeb | Sólo Excel | string (date-time) · nullable | rcBase: fechaComprobDeb |  |
| desComprobDeb | Sólo Excel | string · nullable | rcBase: desComprobDeb |  |
| nroComprobDeb | Sólo Excel | number (double) · nullable | rcBase: nroComprobDeb |  |
| totalComproDeb | Sólo Excel | number (double) · nullable | rcBase: totalComproDeb |  |
| regTraRC_ImpuCli | Sólo Excel | integer (int32) · nullable | rcBase: idRegTraRC_ImpuCli |  |
| fechaComprobCred | Sólo Excel | string (date-time) · nullable | rcBase: fechaComprobCred |  |
| desComprobCred | Sólo Excel | string · nullable | rcBase: desComprobCred |  |
| nroComprobCred | Sólo Excel | number (double) · nullable | rcBase: ComprobCred |  |
| totalComproCred | Sólo Excel | number (double) · nullable | rcBase: totalComproCred |  |

Parámetros (separados de los campos):

- CodigoCli: Por definir
- FechaComprobDebDesde: Por definir
- FechaComprobDebHasta: Por definir
- NroComprobCred: Por definir

### Artículos

Endpoint: /api/ISIS_Articulo_VW. Alcance: Pantalla inicial.
Consultas Excel: artBase, artCont.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regisArti | Sí: usar | integer (int32) | artBase: idArt; artCont: idArt | analisis-api-isis-2026-08-13.json |
| codInternoArti | Sí: usar | string · nullable | artBase: codArt; artCont: codArt | analisis-api-isis-2026-08-13.json |
| descripcionArti | Sí: usar | string · nullable | artBase: descArt; artCont: descArt | analisis-api-isis-2026-08-13.json |
| descriBusArti | Sí: usar | string · nullable | artBase: descBusArt | analisis-api-isis-2026-08-13.json |
| senInhabilitadoArti | Sí: usar | string · nullable |  | analisis-api-isis-2026-08-13.json |
| calificacion | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| clasificaArti | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| tipoArti | Sí: usar | string · nullable | artCont: tipoArt | analisis-api-isis-2026-08-13.json; Podria servir para crear nuevos, para taller |
| facturaArti | No: excluir | string · nullable | artCont: factArt | analisis-api-isis-2026-08-13.json |
| codigoArtiGrupo | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigArtFami1 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrArtFami1 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigArtFami2 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrArtFami2 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| despachoArti | No: excluir | string · nullable | artCont: despArt | analisis-api-isis-2026-08-13.json |
| partidaLoteArti | No: excluir | string · nullable | artCont: loteArt | analisis-api-isis-2026-08-13.json |
| nroSerieArti | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelInt1 | Sí: usar | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json; Filtros, estadisticas |
| descrNivelInt1 | Sí: usar | string · nullable | artBase: nivelArt1 | analisis-api-isis-2026-08-13.json |
| codigNivelInt2 | Sí: usar | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelInt2 | Sí: usar | string · nullable | artBase: nivelArt2 | analisis-api-isis-2026-08-13.json |
| codigNivelInt3 | Sí: usar | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelInt3 | Sí: usar | string · nullable | artBase: nivelArt3 | analisis-api-isis-2026-08-13.json |
| codigNivelInt4 | Sí: usar | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelInt4 | Sí: usar | string · nullable | artBase: nivelArt4 | analisis-api-isis-2026-08-13.json |
| codigNivelInt5 | Sí: usar | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelInt5 | Sí: usar | string · nullable | artBase: nivelArt5 | analisis-api-isis-2026-08-13.json |
| diasReaproviArti | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json; Seria util, pero no esta cargado |
| descrUnidadMedidaPri | Sí: usar | string · nullable |  | analisis-api-isis-2026-08-13.json |
| pesoPriArti | Por definir | number (double) |  | analisis-api-isis-2026-08-13.json; No esta cargado, pero seria interesante para cuando lleguemos a logistica |
| descrUniMedidaPesoPri | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| volumenPriArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| descrUniMedidaVolumenPri | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| stMinimoPriArti | Por definir | number (double) |  | analisis-api-isis-2026-08-13.json; Generaria el dato en nuestro sistema |
| stIdealPriArti | Por definir | number (double) |  | analisis-api-isis-2026-08-13.json; dato de gestion |
| loteCpraPriArti | Por definir | number (double) |  | analisis-api-isis-2026-08-13.json; dato de gestion |
| ptoPedidoPriArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantPalletPriArti1 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantPalletPriArti2 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantPalletPriArti3 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantBultoPriArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| descrUnidadMedidaSecu | Sí: usar | string · nullable |  | analisis-api-isis-2026-08-13.json |
| factorConveArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| pesoSecuArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| descrUniMedidaPesoSecu | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| volumenSecuArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| descrUniMedidaVolumenSecu | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| stMinimoSecuArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| stIdealSecuArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| loteCpraSecuArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| ptoPedidoSecuArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantPalletSecuArti1 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantPalletSecuArti2 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantPalletSecuArti3 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantBultoSecuArti | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| tasaIva | Sí: usar | number (double) | artCont: ivaArt | analisis-api-isis-2026-08-13.json; Para impuestos |
| codigoActEcoVenta | Sí: usar | string · nullable |  | analisis-api-isis-2026-08-13.json; Impuestos |
| descripcionActEcoVenta | Sí: usar | string · nullable | artCont: ventaArt | analisis-api-isis-2026-08-13.json; Impuestos |
| codigoActEcoCompra | Sí: usar | string · nullable |  | analisis-api-isis-2026-08-13.json; Impuestos |
| descripcionActEcoCompra | Sí: usar | string · nullable | artCont: compraArt | analisis-api-isis-2026-08-13.json; Impuestos |
| usaFactorConvePrecio | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigGrupoComi | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descrGrupoComi | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| tipoPreVtaArti | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| tipoPreCpraArti | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codBarraArti | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- CodInternoArti: Sí: usar [analisis-api-isis-2026-08-13.json]
- CodBarraArti: No: excluir [analisis-api-isis-2026-08-13.json]
- DescriBusArti: No: excluir [analisis-api-isis-2026-08-13.json]
- Regis_Arti: Por definir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Artículos",
  "purpose": "Maestro local de artículos de ISIS",
  "metrics": {
    "records": "7498",
    "time": "28550",
    "size": "12804.22",
    "date": "2026-07-30T09:26"
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Completa: 28,55 s y 12,5 MB. Activos: 1.090. Inactivos: 6.408; no incorporarlos como artículos nuevos. Por código: 161 ms. Por regisArti exacto: 152 ms."
}
```

### Stock

Endpoint: /api/ISIS_ArticuloStock_VW. Alcance: Pantalla inicial.
Consultas Excel: stckBase.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| codArticulo | Sí: usar | string · nullable | stckBase: codArt | analisis-api-isis-2026-08-13.json |
| descBusquedaArticulo | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| descripcionArticulo | No: excluir | string · nullable | stckBase: descArt | analisis-api-isis-2026-08-13.json |
| codEmpresa | Sí: usar | integer (int32) |  | analisis-api-isis-2026-08-13.json; Para evitar datos viejos |
| empresa | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codDeposito | Sí: usar | integer (int32) |  | analisis-api-isis-2026-08-13.json; como filtro |
| deposito | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| tipoDeposito | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| cantCompraUm1 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantCompraUm2 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantVentaUm1 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantVentaUm2 | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| stockUm1 | Sí: usar | number (double) | stckBase: stokU1 | analisis-api-isis-2026-08-13.json |
| stockUm2 | Sí: usar | number (double) | stckBase: stckU2 | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- Cod_Articulo: Sí: usar [analisis-api-isis-2026-08-13.json]
- Cod_Empresa: No: excluir [analisis-api-isis-2026-08-13.json]
- Cod_Deposito: No: excluir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Artículos",
  "purpose": "Stock actual por artículo",
  "metrics": {
    "records": "5975",
    "time": "1390",
    "size": "2097.33",
    "date": "2026-07-30T09:15"
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Completa: 1,39 a 2,39 s. Por artículo: 69 ms. Empresa 1: 4.853 filas. Usar depósito 1; ignorar depósito 80 (Reserva). cantCompra y cantVenta son acumulados y no se usarán."
}
```

### Clientes

Endpoint: /api/ISIS_Cliente_VW. Alcance: Pantalla inicial.
Consultas Excel: cliBase.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| codigoCli | Sí: usar | string · nullable | cliBase: codCli | analisis-api-isis-2026-08-13.json; ID local, actualizacion particular |
| codigoExpreso | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| razonSocialExpreso | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| descrIvaC | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| letraCli | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| cuitCli | Sí: usar | string · nullable | cliBase: cuitcli | analisis-api-isis-2026-08-13.json |
| ingBrutosCli | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| fechaAltaCli | Sí: usar | string (date-time) | cliBase: fechaAltaCli | analisis-api-isis-2026-08-13.json; Filtros |
| fechaUltimaFacCli | Sí: usar | string (date-time) · nullable | cliBase: fechaUltimaFacCli | analisis-api-isis-2026-08-13.json; Filtros |
| fechaUltimoRecCli | Sí: usar | string (date-time) · nullable |  | analisis-api-isis-2026-08-13.json; Filtros |
| codProveedorClte | Sí: usar | string · nullable | cliBase: codProv | analisis-api-isis-2026-08-13.json; FK para vincular un cliente-proveedor |
| codProveAsociado | Sí: usar | string · nullable |  | analisis-api-isis-2026-08-13.json; vinculo cliente proveedor |
| diaVisitaLun | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| diaVisitaMar | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| diaVisitaMie | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| diaVisitaJue | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| diaVisitaVie | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| diaVisitaSab | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| diaVisitaDom | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| ordenVisitaDia1CliLun | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| ordenVisitaDia1CliMar | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| ordenVisitaDia1CliMie | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| ordenVisitaDia1CliJue | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| ordenVisitaDia1CliVie | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| ordenVisitaDia1CliSab | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| ordenVisitaDia1CliDom | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| usaDtosPreItemCli | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| dtoItemPre1Cli | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| razonSocialFlete | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoFlete | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| descr_Mda | Sí: usar | string · nullable | cliBase: moneda | analisis-api-isis-2026-08-13.json |
| limiteCreditoCli | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| razonSocialBusCli | Sí: usar | string · nullable | cliBase: rzonSocBus | analisis-api-isis-2026-08-13.json |
| razonSocialCli | Sí: usar | string · nullable | cliBase: rzonSoc | analisis-api-isis-2026-08-13.json |
| localidadCli | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoPostalCli | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| descri_Partido | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codProvincia | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descrProvincia | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoPais | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| descrPais | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| estadoCli | Sí: usar | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoCliCali | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descrCliCali | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelInt1 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| dtoItemPre2Cli | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| descrNivelInt1 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelInt2 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelInt3 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelInt3 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelInt4 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelInt4 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigVendedor | Sí: usar | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| nombreVendedor | No: excluir | string · nullable | cliBase: vendCli | analisis-api-isis-2026-08-13.json |
| codigCobrador | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| nombreCobrador | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigListaPrec | Sí: usar | integer (int32) | cliBase: listaPr | analisis-api-isis-2026-08-13.json |
| descrListaPrec | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigCondiPago | Sí: usar | integer (int32) | cliBase: condPg | analisis-api-isis-2026-08-13.json |
| descrCondiPago | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelInt2 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| dtoItemPre3Cli | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| emailCli | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| desdrProvincia | Sin selección | No documentado |  |  |
| desdrPais | Sin selección | No documentado |  |  |
| desdrCliCali | Sin selección | No documentado |  |  |
| desdrNivelInt1 | Sin selección | No documentado |  |  |
| desdrNivelInt2 | Sin selección | No documentado |  |  |
| desdrNivelInt3 | Sin selección | No documentado |  |  |
| desdrNivelInt4 | Sin selección | No documentado |  |  |
| desdrListaPrec | Sin selección | No documentado |  |  |
| desdrCondiPago | Sólo Excel | No documentado | cliBase: condPgD | Campo de Excel no encontrado en estos esquemas |

Parámetros (separados de los campos):

- CodigoCli: Sí: usar [analisis-api-isis-2026-08-13.json]
- CuitCli: No: excluir [analisis-api-isis-2026-08-13.json]
- RazonSocialBusCli: No: excluir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Clientes",
  "purpose": "Maestro local de clientes de ISIS",
  "metrics": {
    "records": "11353",
    "time": "9787",
    "size": "17189.44",
    "date": "2026-07-30T13:33"
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Completa: 9,79 s y 16,79 MB. Activos: 11.289. Inactivos: 64. Activos sin CUIT útil: 2.579. Con factura desde 2020: 1.875. Por código: 103 ms."
}
```

### Vendedores

Endpoint: /api/ISIS_Vendedor_VW. Alcance: Pantalla inicial.
Consultas Excel: Sin consulta en el libro.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| codigVendedor | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| nombreVendedor | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| senActivoVendedor | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- CodigVendedor: Por definir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Catálogos ISIS",
  "purpose": "Vendedores",
  "metrics": {
    "records": "",
    "time": "",
    "size": "",
    "date": ""
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Pendiente de prueba real. Catálogo administrado exclusivamente en ISIS."
}
```

### Condiciones de pago

Endpoint: /api/ISIS_CondicionPago_VW. Alcance: Catálogo relacionado.
Consultas Excel: condPgo.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| codigCondiPago | Sí: usar | integer (int32) | condPgo: condPgo | analisis-api-isis-2026-08-13.json |
| descrCondiPago | Sí: usar | string · nullable | condPgo: desCondPgo | analisis-api-isis-2026-08-13.json |
| senActivoCondiPago | Sí: usar | string · nullable | condPgo: activo | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- CodigCondiPago: Sí: usar [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Catálogos ISIS",
  "purpose": "Condiciones de pago",
  "metrics": {
    "records": "",
    "time": "",
    "size": "",
    "date": ""
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Pendiente de prueba real. Catálogo administrado exclusivamente en ISIS."
}
```

### Listas de precios

Endpoint: /api/ISIS_ListaPrecios_VW. Alcance: Catálogo relacionado.
Consultas Excel: Sin consulta en el libro.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| codigListaPrec | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descrListaPrec | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| abrevListaPrec | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- CodigListaPrec: Por definir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Catálogos ISIS",
  "purpose": "Listas de precios",
  "metrics": {
    "records": "",
    "time": "",
    "size": "",
    "date": ""
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Pendiente de prueba real. Catálogo administrado exclusivamente en ISIS."
}
```

### Monedas

Endpoint: /api/ISIS_Moneda_VW. Alcance: Catálogo relacionado.
Consultas Excel: Sin consulta en el libro.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| descr_Mda | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| signo_Mda | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- DescrMda: Por definir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Catálogos ISIS",
  "purpose": "Monedas",
  "metrics": {
    "records": "",
    "time": "",
    "size": "",
    "date": ""
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Pendiente de prueba real. Catálogo administrado exclusivamente en ISIS."
}
```

### Tipos de comprobante

Endpoint: /api/ISIS_API_Comprobantes. Alcance: Catálogo relacionado.
Consultas Excel: Sin consulta en el libro.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regisCom | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descripcion | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| regisTco | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| abreviatura | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| letra | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| signoComp | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| calculaImpu | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| libroIva | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| signoImpue | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| grabaAsiento | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| codigoCiti | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| codigoAfip | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| senalFiscal | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| senActivoComp | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| senCpbteElec | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| senCpbteManual | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- Descripcion: Por definir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Catálogos ISIS",
  "purpose": "Tipos de comprobante",
  "metrics": {
    "records": "",
    "time": "",
    "size": "",
    "date": ""
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Pendiente de prueba real. Catálogo administrado exclusivamente en ISIS."
}
```

### Cheques de clientes disponibles para depositar o vender

Endpoint: /api/ISIS_ChequesEnCarteraCliente_VW. Alcance: Etapa posterior.
Consultas Excel: chqCart.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| codig_Emp | Sin selección | integer (int32) |  |  |
| cotizacion | Sin selección | number (double) |  |  |
| moneda | Sin selección | string · nullable |  |  |
| importeCheque | Sólo Excel | number (double) | chqCart: importe |  |
| fechaAcreditracion | Sólo Excel | string (date-time) · nullable | chqCart: fchAcred |  |
| fechaDeposito | Sin selección | string (date-time) · nullable |  |  |
| fechaEmision | Sólo Excel | string (date-time) · nullable | chqCart: fchEmi |  |
| razonSocialBco | Sin selección | string · nullable |  |  |
| codigoBco | Sin selección | string · nullable |  |  |
| nroValor_CliVto | Sin selección | string · nullable |  |  |
| descr_ModPa | Sólo Excel | string · nullable | chqCart: tipo |  |
| descrCtroCosto | Sin selección | string · nullable |  |  |
| codCtroCosto | Sin selección | integer (int32) |  |  |
| razonSocialCli | Sólo Excel | string · nullable | chqCart: cliente |  |
| codigoCli | Sólo Excel | string · nullable | chqCart: codCli |  |
| nroPreimpre_CliTra | Sin selección | number (double) |  |  |
| nroComprob_CliTra | Sólo Excel | number (double) | chqCart: numRc |  |
| descripcionCpbte | Sólo Excel | string · nullable | chqCart: tipoComp |  |
| fecha_CliTra | Sólo Excel | string (date-time) | chqCart: fchRc |  |
| descr_Emp | Sin selección | string · nullable |  |  |
| cuitFirma_CliVto | Sin selección | string · nullable |  |  |
| comentario_CliVto | Sólo Excel | string · nullable | chqCart: pedido |  |

Parámetros (separados de los campos):

- CodigoBco: Por definir
- FechaDepositoDesde: Por definir
- FechaDepositoHasta: Por definir
- FechaAcreditracionDesde: Por definir
- FechaAcreditracionHasta: Por definir
- FechaEmisionDesde: Por definir
- FechaEmisionHasta: Por definir

### Cheques propios y transferencias emitidas

Endpoint: /api/ISIS_ChequesPropiosYTransferencias. Alcance: Etapa posterior.
Consultas Excel: Sin consulta en el libro.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| codig_Emp | Sin selección | integer (int32) |  |  |
| comentario_BcoMov | Sin selección | string · nullable |  |  |
| cotiza_BcoMov | Sin selección | number (double) |  |  |
| moneda | Sin selección | string · nullable |  |  |
| importe_BcoMov | Sin selección | number (double) |  |  |
| fechaAcreditracion | Sin selección | string (date-time) |  |  |
| fechaDeposito | Sin selección | string (date-time) |  |  |
| fechaEmision | Sin selección | string (date-time) · nullable |  |  |
| razonSocialBco | Sin selección | string · nullable |  |  |
| codigoBco | Sin selección | string · nullable |  |  |
| senConciliado | Sin selección | string · nullable |  |  |
| nroValor_BcoMov | Sin selección | string · nullable |  |  |
| descrCtroCosto | Sin selección | string · nullable |  |  |
| codCtroCosto | Sin selección | integer (int32) |  |  |
| razonSocialProve | Sin selección | string · nullable |  |  |
| codigoProve | Sin selección | string · nullable |  |  |
| nroPreimpre_BcoMov | Sin selección | number (double) |  |  |
| nroComprob_BcoMov | Sin selección | number (double) |  |  |
| descripcionCpbte | Sin selección | string · nullable |  |  |
| fecha_BcoMov | Sin selección | string (date-time) |  |  |
| descr_Emp | Sin selección | string · nullable |  |  |
| descr_ModPa | Sin selección | string · nullable |  |  |
| senRechazo | Sin selección | integer (int32) |  |  |

Parámetros (separados de los campos):

- CodigoBco: Por definir
- FechaAcreditracionDesde: Por definir
- FechaAcreditracionHasta: Por definir
- FechaDepositoDesde: Por definir
- FechaDepositoHasta: Por definir
- FechaEmisionDesde: Por definir
- FechaEmisionHasta: Por definir
- TipoOperacion: Por definir

### Condiciones frente al IVA

Endpoint: /api/ISIS_IvaCondicion. Alcance: Descartado.
Consultas Excel: Sin consulta en el libro.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regisIvaC | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descrIvaC | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| abrevIvaC | Por definir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| calculaIvaC | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| discriminaIvaC | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| calcuAdiIvaC | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| liberaIvaC | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| perceIva | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| perceIbr | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| retenIva | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| retenIbr | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| retenGan | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| retenSuss | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| ingresaCuit | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| discriminaAdiIvaC | Por definir | integer (int32) |  | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- DescrIvaC: Por definir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Catálogos ISIS",
  "purpose": "Condiciones frente al IVA",
  "metrics": {
    "records": "",
    "time": "",
    "size": "",
    "date": ""
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Pendiente de prueba real. Catálogo administrado exclusivamente en ISIS."
}
```

### Fuente contable ISIS para conciliación bancaria

Endpoint: /api/ISIS_MayorCuentaConta_VW. Alcance: Etapa posterior.
Consultas Excel: Sin consulta en el libro.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| codigoEmpresa | Sin selección | integer (int32) · nullable |  |  |
| empresa | Sin selección | string · nullable |  |  |
| abrevEmpresa | Sin selección | string · nullable |  |  |
| fechaAsiento | Sin selección | string (date-time) · nullable |  |  |
| numeroAsiento | Sin selección | integer (int32) · nullable |  |  |
| controCosto | Sin selección | string · nullable |  |  |
| abrevCtoCosto | Sin selección | string · nullable |  |  |
| codigoCuentaCont | Sin selección | string · nullable |  |  |
| decripCuentaCont | Sin selección | string · nullable |  |  |
| debe | Sin selección | number (double) · nullable |  |  |
| haber | Sin selección | number (double) · nullable |  |  |
| importe | Sin selección | number (double) · nullable |  |  |
| cotiz_AsM | Sin selección | number (double) · nullable |  |  |
| regis_Emp | Sin selección | integer (int32) · nullable |  |  |
| regis_CCo | Sin selección | integer (int32) · nullable |  |  |
| regis_Com | Sin selección | integer (int32) · nullable |  |  |
| conceptoAsiento | Sin selección | string · nullable |  |  |
| nroComprobante | Sin selección | string · nullable |  |  |
| comprobante | Sin selección | string · nullable |  |  |
| abrevComprob | Sin selección | string · nullable |  |  |
| regis_Cta | Sin selección | integer (int32) · nullable |  |  |
| leyenda1 | Sin selección | string · nullable |  |  |
| leyenda2 | Sin selección | string · nullable |  |  |
| usuario | Sin selección | string · nullable |  |  |
| fechaAuditoria | Sin selección | string (date-time) · nullable |  |  |
| horaAuditoria | Sin selección | string · nullable |  |  |

Parámetros (separados de los campos):

- DCodigoCuentaCont: Por definir
- HCodigoCuentaCont: Por definir
- DFechaAsiento: Por definir
- HFechaAsiento: Por definir

### ISIS_PresupuestoVtaCab_VW

Endpoint: /api/ISIS_PresupuestoVtaCab_VW. Alcance: Etapa posterior.
Consultas Excel: cotCab.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| idPresupVtaCab | Sólo Excel | integer (int32) | cotCab: idCotCab |  |
| division | Sin selección | string · nullable |  |  |
| comprobantePresup | Sin selección | string · nullable |  |  |
| numeroComprobPresup | Sólo Excel | number (double) | cotCab: numCot |  |
| fecha | Sólo Excel | string (date-time) | cotCab: fchCot |  |
| codigoCliente | Sólo Excel | string · nullable | cotCab: codClie |  |
| razonSocial | Sólo Excel | string · nullable | cotCab: rzSoc |  |
| lugarEntregaCliente | Sin selección | string · nullable |  |  |
| codVendedor | Sin selección | integer (int32) |  |  |
| vendedor | Sólo Excel | string · nullable | cotCab: vendedor |  |
| flete | Sin selección | string · nullable |  |  |
| codCondPago | Sin selección | integer (int32) · nullable |  |  |
| condicPago | Sin selección | string · nullable |  |  |
| codCtoCos | Sin selección | integer (int32) |  |  |
| centroCosto | Sin selección | string · nullable |  |  |
| codListPrec | Sólo Excel | integer (int32) · nullable | cotCab: codPcio |  |
| listaPrecio | Sin selección | string · nullable |  |  |
| ordCpraPresup | Sin selección | string · nullable |  |  |
| mdaOperac | Sin selección | integer (int32) |  |  |
| mda1Operac | Sólo Excel | string · nullable | cotCab: moneda |  |
| cotizMda1 | Sólo Excel | number (double) | cotCab: cotMda |  |
| mda2Operac | Sin selección | string · nullable |  |  |
| cotizMda2 | Sin selección | number (double) |  |  |
| mda3Operac | Sin selección | string · nullable |  |  |
| cotizMda3 | Sin selección | number (double) |  |  |
| mda4Operac | Sin selección | string · nullable |  |  |
| cotizMda4 | Sin selección | number (double) |  |  |
| dto1Presup | Sin selección | number (double) |  |  |
| dto2Presup | Sin selección | number (double) |  |  |
| dto3Presup | Sin selección | number (double) |  |  |
| dto4Presup | Sin selección | number (double) |  |  |
| recargoPresup | Sin selección | number (double) |  |  |
| subTotalPresup | Sólo Excel | number (double) | cotCab: subtotal |  |
| desctoListPrecPresup | Sin selección | number (double) |  |  |
| recargoListPrecPresup | Sin selección | number (double) |  |  |
| impInrPresup | Sin selección | number (double) |  |  |
| ivaPresup | Sin selección | number (double) |  |  |
| percepIvaPresup | Sin selección | number (double) |  |  |
| percepIibbPresup | Sin selección | number (double) |  |  |
| totalPresup | Sólo Excel | number (double) | cotCab: total |  |
| leyen1Presup | Sin selección | string · nullable |  |  |
| leyen2Presup | Sin selección | string · nullable |  |  |
| usuarioAudiPresup | Sin selección | string · nullable |  |  |
| fehaAudiPresup | Sin selección | string (date-time) |  |  |
| senVigenciaPresup | Sin selección | integer (int32) |  |  |
| diasVigencPresup | Sin selección | integer (int32) |  |  |
| fechaVigencPresup | Sin selección | string (date-time) · nullable |  |  |

Parámetros (separados de los campos):

- FechaPreCliCabDesde: Por definir
- FechaPreCliCabHasta: Por definir

### ISIS_PresupuestoVtaDet_VW

Endpoint: /api/ISIS_PresupuestoVtaDet_VW. Alcance: Etapa posterior.
Consultas Excel: cotDet.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| idPresupVtaCab | Sólo Excel | integer (int32) | cotDet: idCotCab |  |
| codProducPresup | Sólo Excel | string · nullable | cotDet: codArt |  |
| descripProducPresup | Sólo Excel | string · nullable | cotDet: descArt |  |
| descripProducModPresup | Sin selección | string · nullable |  |  |
| cantidad1Presup | Sólo Excel | number (double) | cotDet: cant |  |
| cantidad2Presup | Sin selección | number (double) |  |  |
| bonific1Presup | Sin selección | number (double) |  |  |
| bonific2Presup | Sin selección | number (double) |  |  |
| codLisPrecPresupDet | Sin selección | integer (int32) · nullable |  |  |
| listPrecPresupDet | Sin selección | string · nullable |  |  |
| monedaPresupDet | Sin selección | string · nullable |  |  |
| cotizacMdaPresupDet | Sin selección | number (double) |  |  |
| tipoPrecioPresupDet | Sin selección | string · nullable |  |  |
| dto1PrecPresupDet | Sin selección | number (double) |  |  |
| dto2PrecPresupDet | Sin selección | number (double) |  |  |
| dto3PrecPresupDet | Sin selección | number (double) |  |  |
| precioListPrecPresupDet | Sin selección | number (double) |  |  |
| precioPresupDet | Sólo Excel | number (double) | cotDet: precio |  |
| importePresupDet | Sólo Excel | number (double) | cotDet: subtotal |  |
| diasEntregaPresupDet | Sin selección | integer (int32) |  |  |
| fechaEntregaPresupDet | Sin selección | string (date-time) · nullable |  |  |

Parámetros (separados de los campos):

- FechaCabPreCliDetDesde: Por definir
- FechaCabPreCliDetHasta: Por definir

### Maestro local de proveedores de ISIS

Endpoint: /api/ISIS_Proveedor_VW. Alcance: Etapa posterior.
Consultas Excel: ProvBase.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|
| regisProve | Sí: usar | integer (int32) | ProvBase: idProv | analisis-api-isis-2026-08-13.json |
| codigoProve | Sí: usar | string · nullable | ProvBase: codProv | analisis-api-isis-2026-08-13.json |
| razonSocialBusProve | Sí: usar | string · nullable | ProvBase: rzonSocBus | analisis-api-isis-2026-08-13.json |
| razonSocialProve | Sí: usar | string · nullable | ProvBase: rzonSoc | analisis-api-isis-2026-08-13.json |
| calleProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| numeroProve | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| pisoProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| deptoProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| barrioProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| localidadProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoPostalProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| regisPro | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| regisPais | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| telefono1Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| telefono2Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| telefono3Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| faxProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| emailProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| paginaWebProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| estadoProve | Sí: usar | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| calificaProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| regisNivelProve1 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| regisNivelProve2 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| regisNivelProve3 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| regisNivelProve4 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| diaVisita1Prove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| diaVisita2Prove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| diaVisita3Prove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| diaVisita4Prove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| diaVisita5Prove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| diaVisita6Prove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| diaVisita7Prove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| regisProveCp | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| limiteCreditoProve | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| regisMda | Sí: usar | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| regisIvaC | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| cuitProve | Sí: usar | string · nullable | ProvBase: cuit | analisis-api-isis-2026-08-13.json |
| ingBrutosProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| cbuprove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json; Local |
| regisCta | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| granContribProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| inscripGananciaProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| regisGanCon | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| regisCashFlowCon | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| horarioAtenProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| fechaAltaProve | Sí: usar | string (date-time) | ProvBase: fchaAltaProv | analisis-api-isis-2026-08-13.json |
| fechaCumpleProve | No: excluir | string (date-time) · nullable |  | analisis-api-isis-2026-08-13.json |
| fechaUltimaFacProve | Sí: usar | string (date-time) · nullable | ProvBase: fchaUltFac | analisis-api-isis-2026-08-13.json |
| fechaUltOpagoProve | Sí: usar | string (date-time) · nullable | ProvBase: fechaUltPago | analisis-api-isis-2026-08-13.json |
| comentarioProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| docuNombre1Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| docuDescr1Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| docuNombre2Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| docuDescr2Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| docuNombre3Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| docuDescr3Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| docuNombre4Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| docuDescr4Prove | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| repoPedCotizProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| repoOrdCpraProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| porceRetIvaProve | No: excluir | number (double) |  | analisis-api-isis-2026-08-13.json |
| cantDtosProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| usaPorceRecarProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| usaImpoRecarProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| calcuRetSussProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| regisSussCon | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| regisCli | Por definir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| usuarioAudi | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| fechaAudi | No: excluir | string (date-time) |  | analisis-api-isis-2026-08-13.json |
| horaAudi | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| regisProveConce | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| calcuRetIvaProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| regisIvaConRet | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| nroSedronarProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| calcuPerceGanProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| regisTesoConce | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| senExenRetIvaprove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| dfecExenRetIvaprove | No: excluir | string (date-time) · nullable |  | analisis-api-isis-2026-08-13.json |
| hfecExenRetIvaprove | No: excluir | string (date-time) · nullable |  | analisis-api-isis-2026-08-13.json |
| senExenRetSussprove | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| dfecExenRetSussprove | No: excluir | string (date-time) · nullable |  | analisis-api-isis-2026-08-13.json |
| hfecExenRetSussprove | No: excluir | string (date-time) · nullable |  | analisis-api-isis-2026-08-13.json |
| senExenRetGanProve | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| dfecExenRetGanProve | No: excluir | string (date-time) · nullable |  | analisis-api-isis-2026-08-13.json |
| hfecExenRetGanProve | No: excluir | string (date-time) · nullable |  | analisis-api-isis-2026-08-13.json |
| letraProve | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codProvincia | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descrProvincia | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigProveCP | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descrProveCP | No: excluir | string · nullable | ProvBase: condPago | analisis-api-isis-2026-08-13.json |
| descr_Mda | Sí: usar | string · nullable | ProvBase: moneda | analisis-api-isis-2026-08-13.json |
| descrIvaC | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigCta | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| descrCta | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigCashFlowCon | No: excluir | integer (int32) |  | analisis-api-isis-2026-08-13.json |
| descrCashFlowCon | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoPais | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| descrPais | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelProve1 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelProve1 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelProve2 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelProve2 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelProve3 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelProve3 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigNivelProve4 | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrNivelProve4 | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigGanCon | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrGanCon | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoSussCon | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descriSussCon | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoCli | Sí: usar | string · nullable |  | analisis-api-isis-2026-08-13.json |
| razonSocialBusCli | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigProveConce | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrProveConce | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigoIvaConRet | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descriIvaConRet | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |
| codigTesoConce | No: excluir | integer (int32) · nullable |  | analisis-api-isis-2026-08-13.json |
| descrTesoConce | No: excluir | string · nullable |  | analisis-api-isis-2026-08-13.json |

Parámetros (separados de los campos):

- CodigoProve: Sí: usar [analisis-api-isis-2026-08-13.json]
- RazonSocialBusProve: No: excluir [analisis-api-isis-2026-08-13.json]
- CuitProve: No: excluir [analisis-api-isis-2026-08-13.json]

Notas y mediciones del respaldo (antecedentes; no pruebas nuevas):

```json
{
  "source": "analisis-api-isis-2026-08-13.json",
  "area": "Proveedores",
  "purpose": "Maestro local de proveedores de ISIS",
  "metrics": {
    "records": "3510",
    "time": "22250",
    "size": "9261.55",
    "date": "2026-07-30T14:30"
  },
  "update": {
    "mode": "",
    "frequency": "",
    "key": "",
    "volume": ""
  },
  "notes": "Primera prueba completa: 3.510 filas, 9,04 MB y 22,25 s. Se confirmaron 71 proveedores con cliente asociado. Pendiente repetir estado, CUIT y consulta puntual porque luego la conexión desde Codex dejó de responder."
}
```

### Obtener el PDF original de un comprobante ISIS

Endpoint: /api/ISIS_ComprobantePdf. Alcance: Etapa posterior.
Consultas Excel: Sin consulta en el libro.

| Campo exacto | Decisión guardada | Tipo publicado | Excel / alias | Fuente y observación |
|---|---|---|---|---|

Parámetros (separados de los campos):

- CodigoDivision: Por definir
- DescripcionComprobante: Por definir
- Numero: Por definir

## Instrucciones de continuidad para otra IA

- El usuario confirmó que no quedaron cambios sin exportar. No pedirle que repita decisiones exportadas.
- yes/no/review son decisiones guardadas. excel significa uso en la consulta, no permiso para incorporarlo a la aplicación.
- No descartar un Sí porque no aparece en el Excel. No convertir un No en Sí por recomendación propia.
- Los nombres alternativos de campos son diferencias observadas; no un contrato de normalización autorizado.
- No convertir tipos double del Swagger a float para importes o números documentales sin definir representación local.
- La regla de cierre actual es documental y entrega manual. No añadir pago completo, Taller terminado ni módulos futuros.
- Verificar claves documentales y sincronización en tareas posteriores. No afirmar que una consulta se probó por existir en Swagger.
- No publicar ni incluir credenciales en documentación o HTML.
