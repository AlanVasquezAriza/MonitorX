# STATUS.md — Estado actual

> La IA actualiza este archivo al terminar CADA sesión. Máximo ~40 líneas; borra lo viejo del log.

## Resumen
- **Fase activa:** 1 — E-Commerce backend (MVP 1)
- **Última tarea completada:** T1.11
- **Siguiente tarea:** T1.12
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
| 2026-10-05 | T1.11 | App orders: pedido atómico desde carrito, estados, unit_price congelado — 15 tests pasando. |
| 2026-10-04 | T1.10 | App cart: agregar/eliminar/cambiar cantidad + subtotal/total — 13 tests pasando. |
| 2026-10-04 | T1.9 | Imágenes de producto con almacenamiento local (Pillow instalado). |
| 2026-10-04 | T1.8 | App products: CRUD + búsqueda + filtros + orden + paginación — 18 tests pasando. |
| 2026-10-04 | T1.7 | App categories: CRUD con permisos solo ADMIN — 14 tests pasando. |


