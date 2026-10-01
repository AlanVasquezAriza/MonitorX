# PROMPTS.md — Prompts listos para copiar y pegar

## 1. Iniciar sesión (retomar el proyecto)
```text
Lee CLAUDE.md y docs/STATUS.md. Luego lee solo la fase activa en docs/TASKS.md.
Dime en 3 líneas: dónde estamos, cuál es la siguiente tarea y tu plan para hacerla.
No escribas código todavía.
```

## 2. Ejecutar una tarea
```text
Haz la tarea T1.8. Reglas: solo esa tarea, sigue docs/CONVENTIONS.md, escribe tests,
ejecuta lint y tests, y no toques código fuera del alcance. Al terminar muéstrame
un resumen de archivos cambiados y cómo verificarlo.
```

## 3. Cerrar sesión
```text
Cierra la sesión: marca como [x] las tareas completadas en docs/TASKS.md, actualiza
docs/STATUS.md (fase, siguiente tarea, qué funciona, bloqueos, log) y propón el mensaje
de commit en formato Conventional Commits.
```

## 4. Arreglar un bug
```text
Hay un bug: <describe síntoma, pasos y error>. Reprodúcelo primero con un test que falle,
luego corrígelo con el cambio mínimo y confirma que todos los tests pasan.
```

## 5. Revisión antes de commit
```text
Revisa los cambios (git diff) buscando: secretos en código, endpoints sin permisos,
lógica de negocio en React, código duplicado, tests faltantes y violaciones de las
reglas de arquitectura de CLAUDE.md. Lista hallazgos por severidad.
```

## 6. Decisión de arquitectura
```text
Necesito decidir <tema>. Compara 2-3 opciones con pros/contras para este proyecto
(portafolio, un solo dev). Recomienda una y crea el ADR en docs/adr/ con la plantilla.
```

## 7. Ahorrar contexto (sesiones largas)
```text
Resume en 10 líneas lo hecho en esta sesión, actualiza docs/STATUS.md con eso y
sugiéreme empezar una conversación nueva con el prompt de "Iniciar sesión".
```

## Consejos de uso
- **Una tarea por conversación** cuando sea posible: menos contexto acumulado, menos tokens, menos errores.
- Pide un **plan antes del código** en tareas grandes (T1.11, T4.9, T7.3).
- Si la IA se desvía, recuérdale: "Solo T<id>; revisa CLAUDE.md".
- Haz commit después de cada tarea: es tu punto de retorno si algo sale mal.
- Si usas otra herramienta (Cursor, Copilot, Codex), copia `CLAUDE.md` como `AGENTS.md` o `.cursorrules` (mismo contenido).
