# CONVENTIONS.md — Convenciones de código

## General
- Idioma del código, commits y nombres: **inglés**. Documentación: **español**.
- Cambios pequeños; una tarea (`Tx.y`) por commit o PR.
- Nada de secretos, URLs de producción ni credenciales en código.
- Si copias un patrón, reutiliza el existente del repo antes de inventar otro.

## Commits (Conventional Commits)
```text
feat(products): add search and filters (T1.8)
fix(cart): prevent negative quantities
docs: update STATUS after T1.4
chore(ci): add ruff to pipeline
test(orders): cover atomic order creation
```
Siempre incluir el ID de tarea cuando aplique. Ramas: `feat/T1.8-products-search`.

## Python (Django, FastAPI, agente)
- Python 3.12, tipado con type hints, `ruff` + `black`.
- Django: una app por módulo; lógica de negocio en `services.py`, no en views ni serializers.
- Views delgadas: validan, llaman al service, devuelven respuesta.
- FastAPI: routers en `api/`, esquemas Pydantic en `schemas/`, lógica en `services/`, dependencias inyectadas con `Depends`.
- Tests con `pytest`; nombre `test_<comportamiento>`; un archivo de tests por módulo.
- Modelos: `snake_case`, `created_at`/`updated_at` en todas las tablas.
- Errores: respuestas JSON uniformes `{ "error": { "code": "...", "message": "..." } }`.

## TypeScript / React
- `strict: true`. Componentes funcionales, nombres en `PascalCase`, hooks `useXxx`.
- Estructura por feature: `features/<name>/{components,hooks,api,types}`.
- Datos del servidor con TanStack Query; estado local con `useState`/context; nada de lógica de negocio en componentes.
- Estilos con Tailwind; sin CSS suelto salvo casos justificados.
- Tests con Vitest + Testing Library: probar comportamiento, no implementación.

## API
- REST, sustantivos en plural, códigos correctos (200/201/204/400/401/403/404/409/422/429/500).
- Paginación estándar `?page=&page_size=`; filtros por query params.
- Todos los endpoints con autenticación/permiso explícito (nada "abierto por olvido").
- Monitoring: `/api/v1/...` versionado.

## Docker / infraestructura
- Imágenes multi-stage, usuario no root, sin `latest` (versiones fijas).
- Cada servicio con `healthcheck`.
- Solo `nginx` publica puertos. Redes según `CLAUDE.md`.
- Variables en `.env` (nunca commiteado); documentar en `.env.example`.

## Tests mínimos antes de cerrar una tarea
- Backend: tests unitarios + de API del módulo tocado.
- Frontend: test de los componentes con lógica.
- Si cambia infra: `make up` arranca limpio desde cero.

## Definición de "hecho"
1. Cumple el "Hecho cuando" de la tarea.
2. Tests y lint pasan (`make test`, `make lint`).
3. `TASKS.md` y `STATUS.md` actualizados.
4. Commit con mensaje convencional.
