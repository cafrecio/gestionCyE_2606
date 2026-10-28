# Reglas del proyecto

## Regla principal: calidad antes que velocidad

Antes de responder, proponer o implementar cualquier prompt, consulta o cambio, realizar un análisis crítico y profundo. Es preferible tardar más y pensar bien que entregar rápido una solución superficial.

Evaluar siempre:

- ¿Qué afectamos con esto?
- ¿Dónde tiene consecuencias dentro del sistema: endpoints, tablas, relaciones, servicios, procesos, sincronizaciones, seguridad y vistas?
- ¿Qué debe hacerse técnicamente para que se aplique de forma completa y consistente?
- ¿Es seguro?
- ¿Qué riesgos existen y qué recaudos de seguridad debemos tomar?
- ¿Cómo beneficia o perjudica al usuario?
- ¿Resuelve realmente su problema o agrega trabajo, confusión o fricción?
- ¿Estamos entregando una solución de calidad o solamente algo que funciona?
- Si afecta una vista, ¿el resultado es moderno, lindo, claro y agradable de usar?

No hacemos solamente soluciones: hacemos productos. El funcionamiento correcto es obligatorio, pero no suficiente. El producto debe transmitir calidad y no hacer sentir al usuario dentro de una herramienta vieja, incómoda o improvisada.

Toda propuesta debe considerar conjuntamente:

- Calidad técnica.
- Impacto funcional.
- Escalabilidad y mantenimiento.
- Seguridad y protección de datos.
- Experiencia del usuario.
- Calidad visual cuando exista una interfaz.

## Identificación de temas y tareas

Toda conversación, tarea, decisión y documento debe identificarse con un código jerárquico.

- Formato base: `CC-EE-TT`.
- `CC`: número de chat o parte del sistema.
- `EE`: etapa dentro de ese chat.
- `TT`: tarea o tema principal de la etapa.
- Se pueden agregar subniveles con `.NN` tantas veces como sea necesario.
- El código completo de un punto específico es único y nunca se reutiliza.
- Si un tema continúa dentro de la misma etapa, se agrega un nuevo subnivel en su rama.
- Si pertenece a una etapa nueva, se incrementa `EE`.
- Los números identifican temas; no representan fechas.

Registro inicial:

- `01`: Datos.

Ejemplos:

- `01-01-01`: Pedidos.
- `01-01-01.1`: Endpoint de cabecera de pedidos.
- `01-01-01.1.1`: Punto específico sobre la cabecera.
- `01-01-01.1.135`: Cambio posterior relacionado con esa rama.
- `01-02-05.55.12`: Punto 12 del subtema 55, tarea 05, etapa 02, chat Datos.

Al crear o tratar un punto nuevo, asignar primero su código y mantenerlo en toda la documentación relacionada.
