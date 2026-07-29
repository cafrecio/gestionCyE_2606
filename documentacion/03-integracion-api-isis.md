# Integracion con API de ISIS

## Objetivo inicial

La primera etapa tecnica del proyecto sera conectarse con la API de ISIS y traer la informacion disponible.

Antes de definir funcionalidades finales del nuevo sistema, necesitamos entender:

- Que informacion expone ISIS.
- Que tablas, entidades o recursos estan disponibles.
- Que datos son utiles para la gestion diaria.
- Como se relacionan esos datos entre si.
- Que informacion falta o debera generarse en el nuevo sistema.

## Primer relevamiento de informacion

La idea inicial es descargar toda la informacion disponible desde ISIS para hacer un analisis completo.

Ese primer relevamiento deberia permitir:

1. Identificar tablas o recursos disponibles.
2. Ver campos principales de cada tabla.
3. Detectar claves, codigos o identificadores.
4. Entender relaciones entre clientes, ventas, productos, comprobantes, stock, compras u otras entidades.
5. Separar informacion util de informacion que no sera necesaria para el nuevo sistema.

## Trabajo en tiempo real

El nuevo sistema deberia trabajar con informacion actualizada en tiempo real o lo mas cercano posible.

Para eso hay que medir:

- Cuanto tarda una descarga completa de informacion.
- Cuanto tarda la actualizacion de cada tabla.
- Que tablas cambian con mas frecuencia.
- Que tablas pueden actualizarse con menor frecuencia.
- Que impacto tiene la sincronizacion en la API de ISIS y en el nuevo sistema.

## Actualizaciones incrementales

Luego de la primera descarga completa, el criterio deseado es actualizar solamente los ultimos valores o cambios de cada tabla.

Para definir esto hay que investigar si la API de ISIS permite filtrar por:

- Fecha de alta.
- Fecha de modificacion.
- Ultimo ID.
- Numero de comprobante.
- Estado.
- Rango de fechas.
- Otro criterio incremental disponible.

Si la API permite alguno de estos filtros, el nuevo sistema podra sincronizar solo novedades en lugar de descargar todo cada vez.

## Preguntas tecnicas abiertas

1. Que endpoints ofrece la API de ISIS.
2. Como se autentica el sistema contra la API.
3. Si la API entrega datos por tabla, por modulo o por consulta.
4. Si existe documentacion tecnica de la API.
5. Si cada registro tiene fecha de modificacion.
6. Si se puede pedir informacion paginada.
7. Si hay limites de cantidad de registros o frecuencia de consultas.
8. Si hay tablas que deban sincronizarse mas seguido que otras.
9. Donde se guardara localmente la informacion tomada desde ISIS.
10. Como se controlaran errores, cortes o datos incompletos durante la sincronizacion.

## Criterio inicial de sincronizacion

La estrategia inicial propuesta es:

1. Realizar una descarga completa de la informacion disponible en ISIS.
2. Analizar estructura, utilidad y relaciones entre datos.
3. Medir tiempos de descarga y actualizacion.
4. Definir tablas prioritarias.
5. Implementar actualizaciones incrementales por tabla cuando la API lo permita.
6. Mantener registros de ultima sincronizacion para saber desde donde continuar.

