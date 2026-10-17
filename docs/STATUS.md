# STATUS.md — Estado actual

> La IA actualiza este archivo al terminar CADA sesión. Máximo ~40 líneas; borra lo viejo del log.

## Resumen
- **Fase activa:** 2 — E-Commerce frontend (MVP 1)
- **Última tarea completada:** T2.11
- **Siguiente tarea:** T3.1 (Fase 3 — Infraestructura Docker)
- **MVP actual:** MVP 1 (en progreso)

## Qué funciona hoy
- Setup completo del repositorio (Fase 0).
- Django + DRF + settings por entorno, `python manage.py check` pasa (T1.1).
- `GET /api/health` con verificación de BD (T1.2).
- Modelo `User` custom con roles `CUSTOMER`/`ADMIN`, email como identificador (T1.3).
- Auth JWT completa + recuperación de contraseña con token (19/19 tests pasando). Endpoints: `register`, `login`, `refresh`, `logout`, `profile`, `password-reset`, `password-reset/confirm`.
- Permisos por rol: `IsAdmin` e `IsOwnerOrAdmin` (29/29 tests pasando).
- App `categories` con CRUD completo, solo ADMIN escribe (14/14 tests pasando).
- App `products` con CRUD, búsqueda, filtros, orden, paginación e imágenes (18/18 tests pasando).
- App `cart` con agregar/eliminar/cambiar cantidad, subtotal y total (13/13 tests pasando).
- App `orders`: pedido desde carrito en transacción atómica, estados y `order_items` con `unit_price` congelado (15/15 tests pasando).
- Manejo de errores uniforme: handler global con formato `{"error": {"code", "message"}}`, códigos HTTP correctos (7 tests config + integración).
- Documentación OpenAPI con Swagger UI en `/api/docs/`, esquema en `/api/schema/` y ReDoc en `/api/redoc/`.
- Comando `python manage.py seed_data`: 4 categorías, 8 productos y usuarios de ejemplo idempotentes; contraseñas configurables por entorno.
- Cobertura de `users`, `products`, `cart` y `orders`: 96.70% (84 pruebas); pytest exige un mínimo de 80%.
- Frontend E-Commerce inicializado con Vite, React, TypeScript, Tailwind, TanStack Query y React Router.
- Tests de componentes con Vitest + Testing Library: 73 pruebas sobre `QuantityStepper`, `CartView`, `LoginForm`, `RegisterForm`, `ProductCard`, estados vacíos y utilidades de formato. Cobertura 97–100% en los módulos probados.

## Cómo correrlo
```text
(pendiente — se llena cuando exista `make up` con servicios)
```

## Bloqueos / dudas abiertas
- Ninguno.

## Decisiones recientes
- ADR-001: Adopción de Monorepo.
- ADR-002: Modelo Push para recolección de métricas.

## Log de sesiones (más reciente arriba; conservar solo las últimas 5)
| Fecha | Tareas | Notas |
|---|---|---|
| 2026-10-17 | T2.11 | Vitest + Testing Library configurados; 73 tests sobre componentes clave con lógica. npm como package manager oficial. |
| 2026-10-11 | T2.1 | Base React + TypeScript creada con Tailwind, Query Client y rutas. Build y lint pasan. |
| 2026-10-09 | T1.15 | Cobertura de `users`, `products`, `cart` y `orders`: 96.70% con 84 pruebas; umbral 80% configurado. |
| 2026-10-09 | T1.14 | Comando de seed idempotente para categorías, productos y usuarios. Prueba del comando: 1 pasada. |
| 2026-10-09 | T1.13 | Documentación OpenAPI ya configurada; pruebas de esquema y Swagger UI añadidas. No se pudieron ejecutar: pytest no está instalado en el entorno local. |
| 2026-10-09 | T1.12 | Manejo de errores uniforme (handler global) — 7 tests nuevos + integración. |


