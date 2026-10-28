# GestionCyE v2.0 — Definición de sprints

> Estado: vigente.
>
> Última actualización: 2026-07-30.
>
> Este archivo es la fuente operativa para Codex sobre el alcance de cada sprint.
> Su contenido debe mantenerse sincronizado con `SPRINTS.html`.

## 1. Propósito

Este documento registra las definiciones y el detalle de cada sprint de
GestionCyE v2.0.

Las definiciones se acuerdan en el chat **GestionCyE_v2.0 - MVP 0.1**. Una
definición no se considera incorporada al proyecto hasta que queda documentada
en:

- `documentacion/SPRINTS.md`, para uso de Codex y desarrollo.
- `documentacion/SPRINTS.html`, para consulta humana.

## 2. Qué significa sprint en este proyecto

Un sprint se define por un **hito funcional entregable**, no por una duración
fija.

El proyecto se desarrolla según la disponibilidad del responsable durante su
trabajo habitual. Por lo tanto:

- No se asumen ciclos semanales, quincenales ni fechas artificiales.
- Cada sprint termina cuando alcanza sus criterios de aceptación.
- Un sprint debe tener un alcance corto, cerrado y demostrable.
- El avance se mide por resultados terminados, no por tiempo transcurrido.
- Una fecha solo se incorpora cuando sea una necesidad real y explícita.

## 3. Regla de documentación

Cada decisión de alcance tomada en este chat debe actualizar ambos archivos en
la misma intervención.

Los dos archivos deben conservar el mismo contenido funcional. El HTML puede
agregar navegación, filtros y recursos visuales, pero no alterar ni omitir
definiciones del Markdown.

Codex debe:

1. Distinguir entre definición confirmada, propuesta y pregunta pendiente.
2. No incorporar una propuesta al alcance sin confirmación explícita.
3. Señalar contradicciones con decisiones anteriores antes de documentarlas.
4. Actualizar la fecha de modificación de ambos archivos.
5. No implementar elementos expresamente excluidos del sprint.

## 4. Estructura obligatoria de cada sprint

Cada sprint debe definir:

1. **Identificación:** número, nombre y estado.
2. **Hito:** resultado concreto que marca su finalización.
3. **Objetivo:** problema puntual que resuelve.
4. **Resultado demostrable:** qué podrá verificarse al terminar.
5. **Usuarios involucrados:** quién usa o recibe el resultado.
6. **Casos de uso:** necesidad, información utilizada y acción esperada.
7. **Incluido:** alcance comprometido.
8. **Excluido:** límites explícitos.
9. **Criterios de aceptación:** condiciones verificables de cierre.
10. **Dependencias y decisiones:** requisitos previos y definiciones técnicas o
    funcionales necesarias.
11. **Preguntas pendientes:** asuntos todavía no resueltos.
12. **Estado:** propuesto, definido, en desarrollo, bloqueado, en validación o
    terminado.

## 5. Estados permitidos

| Estado | Significado |
|---|---|
| Propuesto | Existe como idea, pero su alcance no está aprobado. |
| Definido | Alcance y criterios de aceptación aprobados. |
| En desarrollo | Implementación iniciada. |
| Bloqueado | Existe un impedimento concreto documentado. |
| En validación | Implementación terminada, pendiente de comprobación. |
| Terminado | Cumple todos los criterios de aceptación. |

## 6. Sprints

### Sprint 1 — Mapa de datos e integración ISIS

- **Estado:** Definido.
- **Hito:** primera infraestructura de integración funcionando y estrategia de
  datos respaldada por mediciones reales.
- **Objetivo:** determinar qué información útil o potencialmente útil puede
  aportar ISIS, qué información utilizará GestionCyE y cómo obtenerla,
  almacenarla y actualizarla sin frenar la aplicación.
- **Resultado demostrable:** desde una interfaz técnica mínima se pueden ejecutar
  las consultas seleccionadas, observar su resultado y rendimiento, guardar los
  datos definidos en una base local y comprobar su actualización.
- **Usuarios involucrados:** responsable del proyecto y equipo de desarrollo.

#### Criterio de selección

No se relevarán indiscriminadamente todos los endpoints publicados por ISIS.

Datos identificará aproximadamente entre 20 y 30 consultas, sin convertir esa
estimación en una cuota obligatoria. La selección se realizará por utilidad:

1. **Útil confirmada:** necesaria para un proceso ya identificado.
2. **Posiblemente útil:** puede aportar información a procesos previstos y
   requiere evaluación.
3. **Descartada:** no tiene utilidad identificada, duplica una fuente mejor o no
   funciona. Debe registrarse el motivo cuando haya sido evaluada.

El relevamiento podrá incorporar o quitar consultas cuando la evidencia lo
justifique. El objetivo no es alcanzar una cantidad, sino cubrir la información
relevante para GestionCyE.

#### Casos de uso

1. **Explorar una consulta de ISIS**
   - El responsable selecciona una consulta candidata.
   - El sistema la ejecuta sin exponer credenciales.
   - Muestra disponibilidad, duración, cantidad de registros, errores y una
     muestra de la respuesta.

2. **Evaluar información**
   - Datos analiza campos, identificadores, filtros, relaciones y significado.
   - Clasifica la consulta y registra qué uso confirmado o posible tendría.

3. **Probar persistencia local**
   - El sistema guarda localmente una entidad seleccionada.
   - Una ejecución posterior permite comprobar altas y modificaciones sin
     duplicar registros.

4. **Comparar estrategias de acceso**
   - Se mide la consulta directa a ISIS.
   - Se mide la lectura de la copia local.
   - Se evalúa el impacto de actualizaciones manuales, periódicas o disparadas
     por una acción.

5. **Definir la propiedad del dato**
   - Cada dato necesario se clasifica como proveniente de ISIS o generado por
     GestionCyE.
   - Si proviene de ISIS, se define si se consulta directamente, se replica
     localmente o se combina con ambas estrategias.

#### Incluido

- Inventario dirigido de endpoints útiles confirmados y posiblemente útiles.
- Prueba real de disponibilidad, autenticación, parámetros, filtros, paginación
  y estructura de respuesta de las consultas seleccionadas.
- Identificación de campos útiles, claves, relaciones y dependencias.
- Medición de duración, volumen, errores y comportamiento con distintos filtros.
- Definición de los datos de ISIS que utilizará GestionCyE.
- Definición inicial de los datos propios que generará GestionCyE.
- Clasificación de cada dato según su fuente y forma de acceso.
- Base de datos local mínima para probar persistencia y actualización.
- Integración mínima con la API de ISIS.
- Registro técnico de cada ejecución relevante.
- Interfaz técnica mínima de diagnóstico.
- Pruebas de guardado, actualización e idempotencia.
- Estrategia de actualización específica por entidad.
- Registro de riesgos, restricciones, datos faltantes y preguntas pendientes.
- Recomendación fundada para el alcance del sprint siguiente.

#### Infraestructura mínima

La implementación debe respetar las decisiones vigentes de arquitectura:

- Un único proyecto con Laravel, React, TypeScript e Inertia.
- PostgreSQL como base de datos local, según la decisión vigente de Arquitectura.
- Credenciales de ISIS configuradas por entorno y nunca guardadas en código,
  documentación, capturas o resultados visibles.
- Registro de mediciones separado de los datos funcionales.

La interfaz de este sprint es una herramienta de diagnóstico, no una pantalla
final del producto. Como mínimo debe permitir:

- Seleccionar una consulta incorporada al laboratorio.
- Indicar y validar sus parámetros.
- Ejecutarla de forma controlada.
- Ver estado, duración, cantidad de registros y error, si existe.
- Inspeccionar una muestra acotada de la respuesta.
- Ejecutar la persistencia local cuando corresponda.
- Comparar el tiempo de ISIS con el tiempo de lectura local.

#### Mediciones mínimas

Para cada consulta evaluada se registrará, cuando corresponda:

- Fecha y hora.
- Endpoint y parámetros no sensibles.
- Resultado exitoso o fallido.
- Duración total.
- Cantidad de registros.
- Tamaño aproximado de la respuesta.
- Uso de paginación y tamaño de página.
- Observaciones sobre filtros y límites.
- Tiempo de persistencia local.
- Tiempo de lectura local.

Las pruebas deben distinguir entre:

- Rendimiento de la API de ISIS aislada.
- Tiempo de procesamiento y persistencia local.
- Tiempo percibido desde la interfaz mínima.

#### Matriz de propiedad y actualización

Cada entidad o conjunto de datos relevante debe terminar clasificado con:

| Definición | Contenido |
|---|---|
| Fuente de verdad | ISIS o GestionCyE. |
| Uso | Necesidad funcional confirmada o posible. |
| Acceso | Directo, réplica local o híbrido. |
| Actualización | Interactiva, periódica, barrido o bajo demanda. |
| Identidad | Clave externa y clave local, si corresponde. |
| Detección de cambios | Fecha, identificador, comparación, hash u otro mecanismo comprobado. |
| Riesgo | Lentitud, falta de filtros, datos incompletos, duplicación u otra limitación. |

#### Excluido

- Relevamiento exhaustivo de endpoints sin utilidad identificada.
- Implementación de módulos operativos para usuarios finales.
- Diseño visual definitivo.
- Sincronización completa de producción.
- Migración histórica completa.
- Escritura, modificación o eliminación de datos en ISIS.
- Automatizaciones definitivas de producción.
- Decidir reglas funcionales sin evidencia de datos o validación del responsable.
- Optimización prematura de consultas que no formarán parte del sistema.

#### Entregables

1. Laboratorio técnico ejecutable.
2. Base local mínima y migraciones reproducibles.
3. Catálogo de consultas evaluadas y su clasificación.
4. Diccionario de campos utilizados.
5. Mapa de claves y relaciones confirmadas.
6. Informe de mediciones reproducibles.
7. Matriz de propiedad y actualización de datos.
8. Estrategia recomendada de sincronización por entidad.
9. Registro de endpoints descartados, limitaciones y preguntas pendientes.
10. Propuesta fundada del siguiente sprint.

#### Criterios de aceptación

El sprint se considera terminado cuando:

1. Las consultas de utilidad confirmada y las candidatas relevantes están
   identificadas y clasificadas.
2. Cada consulta incorporada tiene pruebas y mediciones reproducibles.
3. Los campos que se usarán tienen significado, origen y relación documentados,
   o están marcados explícitamente como pendientes.
4. Existe una base local mínima y se demostró al menos un ciclo de alta y
   actualización sin duplicaciones.
5. La interfaz técnica permite ejecutar, observar y comparar consultas sin
   bloquear toda la aplicación.
6. Cada entidad prioritaria tiene una estrategia de acceso y actualización
   fundada en mediciones.
7. Está separado qué dato administra ISIS y qué dato generará GestionCyE.
8. Las credenciales y datos sensibles no aparecen en código, documentación,
   interfaz ni registros.
9. Los riesgos y preguntas sin resolver están visibles y no se presentan como
   hechos confirmados.
10. Existe información suficiente para definir el siguiente hito sin basarse en
    suposiciones sobre ISIS.

#### Dependencias y decisiones

- Acceso funcional a la API y a su esquema OpenAPI.
- Definiciones técnicas vigentes de `ARQUITECTURA.md`.
- Trabajo de Datos para seleccionar, probar e interpretar las consultas.
- Validación del responsable cuando el significado de un campo o proceso no
  pueda demostrarse técnicamente.
- Los endpoints agregados de ISIS no se presumen funcionales por figurar en
  Swagger: deben probarse.
- La cantidad estimada de 20 a 30 consultas puede cambiar por evidencia.
- La estrategia de actualización se define por entidad; no se impondrá una
  frecuencia única para todo ISIS.

#### Preguntas pendientes

- Lista definitiva de consultas seleccionadas por Datos.
- Volumen histórico necesario para que las mediciones sean representativas.
- Umbrales aceptables de duración para consultas interactivas y procesos de
  fondo.
- Mecanismos confiables disponibles en ISIS para detectar modificaciones según
  cada entidad.
- Datos personales o comerciales que deban ocultarse en la interfaz de
  diagnóstico y en los registros.

## 7. Plantilla

### Sprint N — Nombre

- **Estado:** Propuesto.
- **Hito:**
- **Objetivo:**
- **Resultado demostrable:**
- **Usuarios involucrados:**

#### Casos de uso

- Pendiente de definir.

#### Incluido

- Pendiente de definir.

#### Excluido

- Pendiente de definir.

#### Criterios de aceptación

- Pendiente de definir.

#### Dependencias y decisiones

- Pendiente de definir.

#### Preguntas pendientes

- Pendiente de definir.
