# CLAUDE.md — Contexto del proyecto

> Léelo SIEMPRE al empezar una sesión. Es corto a propósito. No leas más archivos de los necesarios.

## Qué es esto
Monorepo de portafolio con dos sistemas independientes:
1. **E-Commerce** (React + Django REST + PostgreSQL + Redis + Celery) detrás de Nginx, en Docker.
2. **MonitorX** (React + FastAPI + PostgreSQL + WebSockets): plataforma de monitoreo.
Los une un **Monitoring Agent** (Python/FastAPI/psutil) que corre junto al E-Commerce y **envía (push)** métricas a MonitorX por HTTPS con API Key.

## Reglas de arquitectura (NO romper)
1. MonitorX **nunca** accede a la BD del E-Commerce. Solo recibe datos del agente.
2. Cada servicio en su propio contenedor. PostgreSQL y Redis **sin puertos publicados**.
3. Redes Docker: `public` (nginx), `internal` (backend, db, redis, celery, agent), `egress` (agent → MonitorX).
4. Métricas HTTP: el agente lee los **access logs JSON de Nginx** (volumen de solo lectura).
5. Docker socket: solo lectura o socket proxy. Usuario `pg_monitor` de solo lectura para métricas.
6. Health checks: backend `GET /api/health`, agente `GET /health`, Celery `celery inspect ping`.
7. Secretos solo por variables de entorno. Nunca commitear `.env`.
8. Sin lógica de negocio en componentes React (usar hooks/servicios).

## Stack y versiones
- Backend E-Commerce: Python 3.12, Django, DRF, SimpleJWT, Celery, PostgreSQL 16, Redis 7
- Frontend (ambos): React + TypeScript + Vite + Tailwind + TanStack Query (gráficas: Recharts)
- MonitorX API: FastAPI, SQLAlchemy 2.x, Alembic, PostgreSQL 16
- Agente: FastAPI, psutil, docker SDK, httpx
- Tests: pytest (backend/agente), Vitest + Testing Library (front), Playwright (e2e)
- Lint/format: ruff + black (Python), eslint + prettier (TS)
- CI: GitHub Actions

## Estructura
```text
ecommerce/{frontend,backend,nginx}  monitoring-agent/{app,collectors}
monitorx/{frontend,backend}         infrastructure/  scripts/load-test/
docs/  .github/workflows/
```

## Comandos clave (actualizar cuando existan)
```text
make up        # levanta todo con docker compose
make down      # apaga
make test      # tests de todos los módulos
make lint      # lint de todos los módulos
make seed      # datos de ejemplo
```

## Cómo trabajar (flujo de cada sesión)
1. Lee este archivo y `docs/STATUS.md` (estado actual y siguiente tarea).
2. Abre `docs/TASKS.md` y lee **solo la fase activa** (usa grep/rango de líneas, no el archivo entero).
3. Trabaja **una tarea a la vez**. Cumple su "Hecho cuando".
4. Escribe/ejecuta tests de lo que construyes.
5. Marca la tarea `[x]` en `docs/TASKS.md`, actualiza `docs/STATUS.md` y haz commit.
6. Si tomas una decisión de arquitectura nueva, crea un ADR corto en `docs/adr/`.

## Reglas para la IA
- No inventes alcance: si algo no está en `TASKS.md`, pregunta antes.
- Cambios pequeños y verificables. No refactorices código fuera de la tarea.
- Antes de crear algo, revisa si ya existe (evita duplicar).
- Si un test falla, arréglalo; no lo borres ni lo ignores.
- Convenciones detalladas en `docs/CONVENTIONS.md` (léelo solo si vas a escribir código nuevo en un módulo que aún no tocaste).
- El README describe la visión completa; **no lo leas** salvo que se pida: este archivo y TASKS.md bastan.

## Mapa de documentos
| Archivo | Para qué | Cuándo leerlo |
|---|---|---|
| `docs/STATUS.md` | Estado actual y siguiente paso | Siempre |
| `docs/TASKS.md` | Fases y tareas | Solo la fase activa |
| `docs/CONVENTIONS.md` | Estilo, nombres, commits, tests | Al escribir código nuevo |
| `docs/PROMPTS.md` | Prompts reutilizables para ti | Humano |
| `docs/adr/` | Decisiones de arquitectura | Si dudas del "por qué" |
| `README.md` | Visión completa del proyecto | Rara vez |
