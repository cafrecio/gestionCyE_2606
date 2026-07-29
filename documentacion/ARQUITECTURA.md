# Arquitectura de GestionCyE v2.0

Documento técnico para orientar el desarrollo. Solo contiene hechos confirmados,
decisiones tomadas y pendientes explícitos.

## 1. Alcance de este documento

Este documento define:

- La organización técnica del sistema.
- La infraestructura de ejecución.
- La integración con la API de ISIS.
- El almacenamiento y la sincronización de información.
- La seguridad, operación, despliegue y recuperación.

La definición detallada de los datos de ISIS y de los datos propios de GestionCyE
se realiza por separado en el trabajo denominado **Datos**.

También corresponde al trabajo **Datos**:

- Evaluar endpoints y campos.
- Medir cantidades y tiempos de respuesta.
- Determinar relaciones entre entidades.
- Definir la lógica funcional que establece cuándo un documento está pendiente,
  completo o cerrado.

Este documento utilizará esos resultados como requisitos para elegir tecnologías,
componentes y mecanismos de ejecución.

### Organización de los chats

- Cada chat del proyecto tendrá un único tema.
- Su nombre indicará claramente el tema trabajado.
- **DATOS** define qué información existe en ISIS, qué información genera
  GestionCyE y cómo se organiza.
- **ARQUITECTURA** define tecnologías, componentes, infraestructura, despliegue y
  reglas estructurales.
- **DISEÑO UX-UI** definirá experiencia de uso, navegación, sistema visual,
  prototipos y validación de pantallas.
- Las decisiones no se duplicarán entre chats: arquitectura consumirá las
  definiciones producidas por datos.

## 2. Criterio general

- ISIS continúa siendo el sistema base.
- GestionCyE será un sistema web complementario.
- GestionCyE tomará información de la API de ISIS y generará información propia.
- Producción se ejecutará en un VPS existente.
- El desarrollo se realiza inicialmente en un entorno local.

### Repositorios

- Proyecto anterior, usado como referencia y fuente de componentes reutilizables:
  `https://github.com/cafrecio/Gestion_CyE`
- Repositorio oficial de GestionCyE v2.0:
  `https://github.com/cafrecio/gestionCyE_2606`
- El nuevo proyecto se guardará progresivamente mediante commits verificables.
- La carpeta local está conectada al repositorio oficial, sobre la rama `main`.

## 3. Infraestructura confirmada

### Acceso a la API de ISIS

- Existe una API key funcional con acceso a datos reales.
- La API puede consumirse desde distintas computadoras y redes; no exige, según
  la experiencia actual, conectarse desde una IP fija o autorizada.
- Actualmente se consume mediante archivos Excel que obtienen información desde
  la API.
- Por lo tanto, la exploración inicial puede ejecutarse localmente y no depende
  del despliegue previo en el VPS.

### Requisitos de disponibilidad de la información

- GestionCyE deberá disponer de al menos los últimos tres años de información de
  ISIS.
- La información no será una descarga estática: deberá actualizarse
  continuamente.
- Los registros creados en ISIS deberán quedar disponibles en GestionCyE.
- El retraso máximo aceptable entre la creación en ISIS y su disponibilidad en
  GestionCyE es de un minuto.
- La estrategia prevista deberá contemplar una carga histórica inicial y luego
  sincronizaciones incrementales.

### Restricciones de sincronización

- Las consultas a ISIS deberán ser lo más pequeñas posible.
- Los registros existentes en ISIS pueden modificarse después de su creación.
- ISIS no registra o expone una fecha de modificación utilizable.
- La sincronización no deberá bloquear ni volver lento el uso de GestionCyE.
- Las consultas periódicas deberán ejecutarse en segundo plano, separadas de las
  solicitudes de los usuarios.
- Se deberán aprovechar filtros por fecha, identificador, número de comprobante o
  paginación cuando cada endpoint los permita.
- GestionCyE trabajará normalmente sobre su almacenamiento local; no deberá
  depender de consultar ISIS para mostrar cada pantalla.
- Cada familia de datos podrá requerir una estrategia distinta según los filtros
  reales disponibles en su endpoint.

### Estrategia preliminar de actualización

- Por defecto, GestionCyE consultará y descargará registros nuevos.
- Los registros operativos que todavía estén activos se releerán
  automáticamente para detectar cambios sin revisar todo el histórico.
- El usuario podrá solicitar la actualización puntual de un registro.
- Los registros históricos no se releerán completos de forma periódica, porque el
  volumen hace inviable esa estrategia.
- ISIS puede tanto anular como eliminar registros.
- Una eliminación física no puede detectarse consultando solamente novedades. Se
  detectará al releer puntualmente un registro o dentro del conjunto activo.
- La API y sus endpoints deberán probarse para confirmar cómo responden ante un
  identificador eliminado.

Esta estrategia acepta que un registro histórico modificado o eliminado en ISIS
pueda permanecer desactualizado en GestionCyE hasta que sea consultado
puntualmente. Esa limitación deberá mostrarse mediante la fecha de última
sincronización del registro.

El carácter **activo, pendiente o cerrado** no viene necesariamente informado por
ISIS. Podrá ser un estado calculado por GestionCyE a partir de documentos,
relaciones y reglas definidas en el trabajo **Datos**.

### Familias de sincronización

La sincronización no será igual para todas las entidades.

#### Transacciones operativas

Entidades confirmadas como necesarias:

- Pedidos: cabecera y detalle.
- Facturas: cabecera, detalle y facturas anticipadas.
- Remitos: cabecera y detalle.

Estrategia preliminar:

- Detectar y descargar nuevos registros.
- Releer automáticamente los registros que continúen activos.
- Actualizar bajo pedido un registro histórico puntual.

#### Datos maestros

Entidades confirmadas como necesarias:

- Clientes.
- Productos.

Son necesarios para que GestionCyE pueda interpretar y operar con los pedidos.
No se deberá cargar un pedido con referencias inexistentes sin registrar y tratar
esa inconsistencia.

Restricciones conocidas:

- Clientes, proveedores y productos no poseen códigos autoincrementales.
- Clientes supera los 8.000 registros y una consulta completa demora casi un
  minuto.
- Por ese costo, no se realizará una consulta completa de clientes cada minuto.
- Podrían existir fechas útiles, como fecha de creación o fecha de última factura.
- La fecha de última factura no prueba que el cliente haya sido modificado.
- Antes de definir la sincronización hay que verificar, por endpoint, qué filtros
  existen realmente y si permiten detectar altas nuevas.

La estrategia incremental concreta para clientes y otros maestros queda pendiente
del relevamiento realizado en **Datos**.

### VPS de producción

| Elemento | Valor |
|---|---|
| Proveedor | Hostinger, inferido del nombre de host |
| Ubicación | United States - Boston 2 |
| Sistema operativo | AlmaLinux 9 |
| Nombre de host | `srv1753195.hstgr.cloud` |
| IPv4 | `2.25.204.38` |
| Usuario SSH mostrado | `root` |
| Copias de seguridad configuradas | Semanales |
| Plan | KVM 1 |
| CPU | 1 núcleo |
| Memoria | 4 GB |
| Disco | 50 GB |
| Ancho de banda | 4 TB |
| Estado | VPS operativo; GestionCyE aún no está desplegado |

### Uso compartido

- El VPS no será exclusivo de GestionCyE.
- Está previsto alojar GestionCyE y otros programas en el mismo servidor.
- Actualmente hay dos programas adicionales previstos y el objetivo posible es
  llegar a cuatro programas en total.
- Esos programas todavía no fueron desplegados.
- El procedimiento de despliegue todavía no está definido.
- Los otros programas previstos tienen una carga baja.
- El sistema de patín funcionará principalmente fuera del horario de uso de
  GestionCyE.
- El sistema de taller de reparaciones gestionará menos de 1.000 trabajos
  anuales.

Esta condición obliga a separar aplicaciones, configuraciones, dominios, procesos,
credenciales, datos y copias de seguridad para evitar que un programa afecte a los
demás.

### Capacidad y riesgo del VPS

- Los 4 GB de memoria permiten evaluar contenedores.
- Un solo núcleo de CPU puede ser una limitación al ejecutar hasta cuatro
  aplicaciones, PostgreSQL, servidor web y procesos de sincronización.
- Los 50 GB de disco deberán evaluarse contra el volumen real de datos, registros,
  imágenes de contenedores y backups.
- La baja carga esperada y la separación parcial de horarios hacen razonable
  utilizar Docker para aislar los programas.
- Aun así, se deberá monitorear CPU, memoria y disco después de cada despliegue.
- Si la capacidad resulta insuficiente, se ampliará el plan del VPS.

### Equipo local de desarrollo

| Elemento | Valor |
|---|---|
| Sistema operativo | Windows 11 Pro de 64 bits |
| Procesador | Intel Core i7-13700H |
| CPU | 14 núcleos, 20 procesadores lógicos |
| Memoria | 63,5 GB |
| Disco principal | 952,7 GB; 638,2 GB libres al relevar |

El equipo local tiene capacidad suficiente para utilizar Docker durante el
desarrollo si se decide hacerlo.

### Contenedores

- Docker se utilizará tanto en desarrollo como en producción.
- El objetivo es mantener entornos consistentes y aislar cada programa y sus
  dependencias.
- El uso de Docker no cambia la experiencia del usuario: la aplicación seguirá
  utilizándose desde el navegador.

### Observaciones de seguridad

- El acceso habitual de la aplicación no deberá depender del usuario `root`.
- Todavía no está confirmado si el acceso SSH de `root` está restringido.
- La existencia de un backup semanal no confirma qué archivos, bases de datos o
  configuraciones cubre ni cuánto demora una recuperación.

## 4. Decisiones pendientes

1. Servicios ya instalados y activos en el VPS.
2. Servidor web y tecnología del backend.
3. Estrategia de almacenamiento de datos provenientes de ISIS.
4. Frecuencia y proceso de sincronización inicial e incremental.
5. Separación física o lógica entre datos de ISIS y datos propios.
6. Ambientes de desarrollo, prueba y producción.
7. Método de despliegue.
8. Gestión de secretos y credenciales.
9. Monitoreo, registros y alertas.
10. Alcance, retención y prueba de restauración de backups.

## 5. Registro de decisiones

| Estado | Decisión |
|---|---|
| Confirmada | GestionCyE será un sistema web complementario de ISIS. |
| Confirmada | Producción se ejecutará en el VPS existente. |
| Confirmada | El VPS utiliza AlmaLinux 9. |
| Confirmada | Los datos nuevos de ISIS deberán estar disponibles en menos de un minuto. |
| Confirmada | La sincronización será incremental, en segundo plano y no bloqueará al usuario. |
| Confirmada | No se realizará una revisión completa periódica de todo el histórico. |
| Preliminar | Se traerán novedades, se releerán registros activos y se permitirá actualización puntual. |
| Pendiente | Definir qué significa “activo” para cada tipo de registro. |
| Confirmada | Pedidos, facturas, remitos, clientes y productos deben mantenerse actualizados. |
| Descartada | Actualizar completamente clientes cada minuto: más de 8.000 registros y casi un minuto por consulta. |
| Confirmada | Backend desarrollado con una versión vigente de Laravel. |
| Confirmada | Interfaz desarrollada con React. |
| Confirmada | PostgreSQL será el motor de base de datos. |
| Confirmada | Laravel y React se integrarán mediante Inertia dentro de una sola aplicación. |
| Confirmada | El frontend React se desarrollará con TypeScript. |
| Confirmada | Se creará un proyecto nuevo; no se continuará directamente sobre el Laravel 10 anterior. |
| Confirmada | Del sistema anterior se reutilizarán selectivamente conceptos o código útil, después de revisarlo. |
| Confirmada | Las sincronizaciones se ejecutarán mediante tareas programadas y colas de Laravel. |
| Confirmada | Utilizar Docker en desarrollo y producción. |
| Confirmada | Ampliar el plan del VPS si el monitoreo demuestra falta de capacidad. |
| Pendiente | Arquitectura concreta de despliegue y mecanismo de sincronización por endpoint. |

## 6. Tecnologías de aplicación

### Backend

- Laravel en una versión vigente al iniciar el desarrollo.
- Será responsable de la API interna, reglas de negocio, autenticación,
  autorización, acceso a la base de datos e integración con ISIS.
- Las tareas de sincronización no se ejecutarán dentro de las solicitudes de los
  usuarios: se enviarán a colas.
- El programador de Laravel iniciará las tareas periódicas, con una frecuencia de
  hasta un minuto cuando corresponda.

### Frontend

- React.
- TypeScript.
- Se integrará con Laravel mediante Inertia.
- Laravel y React vivirán en el mismo proyecto y se desplegarán juntos.
- Laravel conservará el control de rutas, autenticación, permisos y entrega de
  datos a las pantallas React.
- No consultará directamente la API de ISIS.
- TypeScript se utilizará para describir estructuras de datos y detectar errores
  antes de ejecutar la aplicación.

### Criterios de diseño UX/UI

- El diseño visual es una parte prioritaria del proyecto, no una decoración
  posterior.
- Se diseñará y validará visualmente antes de consolidar cada pantalla.
- Se utilizarán skills oficiales de Figma para generar diseños, establecer reglas
  del sistema visual e implementar los diseños aprobados.
- Figma será la herramienta propuesta para prototipos y sistema de diseño. Su
  plugin todavía debe conectarse.
- Tailwind podrá utilizarse como herramienta de estilos, pero no determinará la
  identidad visual.
- Se evaluará Radix como base de componentes accesibles y sin estilo impuesto.
- Los componentes de shadcn podrán reutilizarse selectivamente como código base;
  no se utilizará una plantilla genérica completa.
- Se evitarán:
  - Pantallas formadas por acumulaciones de tablas blancas.
  - Botones genéricos repetidos.
  - Apariencia de panel administrativo antiguo.
  - Uso decorativo excesivo de tarjetas, bordes y colores.
- Se priorizarán:
  - Jerarquía visual clara.
  - Información operativa agrupada por contexto.
  - Acciones situadas junto al trabajo correspondiente.
  - Tableros, flujos, líneas de tiempo y vistas divididas cuando sean más útiles
    que una tabla.
  - Tablas solamente cuando permitan comparar datos densos con precisión.

#### Alternativas descartadas

- React como aplicación separada consumiendo una API Laravel: agrega dos
  despliegues, autenticación separada y mayor complejidad sin una ventaja actual.
- Next.js separado: no aporta valor suficiente para una aplicación interna.

### Base de datos

- PostgreSQL.
- Guardará los datos sincronizados desde ISIS, los datos propios de GestionCyE,
  las relaciones, los estados calculados y el historial operativo.

### Sistema anterior

- El proyecto Laravel 10 anterior será una referencia, no la base directa del
  nuevo sistema.
- Podrán reutilizarse, previa revisión:
  - Conexión con ISIS.
  - Usuarios, roles y permisos.
  - Criterios de sincronización.
  - Otras piezas que demuestren ser compatibles y correctas.

### Forma de trabajo

- Codex programará directamente sobre los archivos del proyecto.
- No será necesario copiar y pegar código desde el chat.
- Codex instalará y configurará las herramientas necesarias dentro del alcance
  autorizado por el usuario.
- Los cambios se comprobarán con pruebas y, cuando corresponda, desde el
  navegador.
- Un IDE es opcional para que el usuario inspeccione el código; Codex no lo
  necesita para desarrollar.
