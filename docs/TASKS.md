# TASKS.md — Fases y tareas

Leyenda: `[ ]` pendiente · `[~]` en curso · `[x]` hecho
Cada tarea tiene ID. "**Hecho cuando**" = criterio de aceptación verificable.
Orden pensado en MVPs: **MVP 1** = Fases 0-3 · **MVP 2** = Fases 4-6 · **MVP 3** = Fases 7-9 · Extensiones = Fases 10-13.

---

## FASE 0 — Setup del repositorio
- [x] **T0.1** Crear monorepo con la estructura de carpetas de `CLAUDE.md`, `.gitignore`, `.editorconfig`, licencia.
  - Hecho cuando: el repo existe y está subido a GitHub con la estructura vacía.
- [x] **T0.2** Crear `.env.example` (DATABASE_URL, SECRET_KEY, JWT_SECRET, REDIS_URL, MONITORING_API_KEY, MONITORX_URL).
- [x] **T0.3** Crear `Makefile` con `up`, `down`, `test`, `lint`, `seed`.
- [x] **T0.4** Configurar pre-commit (ruff, black, eslint, prettier) y Conventional Commits.
- [x] **T0.5** Plantilla de ADR en `docs/adr/000-template.md` y primeros ADR (push vs pull, monorepo).

---

## FASE 1 — E-Commerce backend (MVP 1)
- [x] **T1.1** Proyecto Django + DRF + settings por entorno + PostgreSQL vía `DATABASE_URL`.
  - Hecho cuando: `python manage.py check` pasa y conecta a Postgres.
- [x] **T1.2** Endpoint `GET /api/health` (verifica BD).
- [x] **T1.3** App `users`: modelo de usuario custom (campos del README), roles `CUSTOMER`/`ADMIN`.
- [x] **T1.4** Auth JWT: registro, login, logout (blacklist), refresh.
  - Hecho cuando: tests cubren registro, login, refresh, logout y acceso sin token (401).
- [x] **T1.5** Recuperación de contraseña (token + email a consola en dev).
- [x] **T1.6** Permisos por rol (`IsAdmin`, `IsOwnerOrAdmin`).
- [x] **T1.7** App `categories`: CRUD, solo ADMIN escribe.
- [x] **T1.8** App `products`: CRUD, búsqueda, filtros (categoría, precio), orden, paginación, `is_active`.
- [x] **T1.9** Imágenes de producto (almacenamiento local en volumen).
- [x] **T1.10** App `cart`: agregar/eliminar/cambiar cantidad, subtotal y total.
- [x] **T1.11** App `orders`: crear pedido desde carrito (transacción atómica), estados, `order_items`.
  - Hecho cuando: crear pedido vacía el carrito y los precios quedan congelados en `unit_price`.
- [ ] **T1.12** Manejo de errores uniforme y códigos HTTP correctos.
- [ ] **T1.13** Documentación OpenAPI (drf-spectacular) en `/api/docs`.
- [ ] **T1.14** Comando `seed` con categorías, productos y usuarios de ejemplo.
- [ ] **T1.15** Tests: cobertura mínima 80% en `users`, `products`, `cart`, `orders`.

---

## FASE 2 — E-Commerce frontend (MVP 1)
- [ ] **T2.1** Proyecto Vite + React + TS + Tailwind + TanStack Query + React Router.
- [ ] **T2.2** Cliente API tipado (axios/fetch) con interceptor de refresh token.
- [ ] **T2.3** Layout base, navbar, manejo de sesión (AuthContext/hook).
- [ ] **T2.4** Páginas Login y Register con validación.
- [ ] **T2.5** Home + listado de productos con búsqueda, filtros, paginación.
- [ ] **T2.6** Detalle de producto.
- [ ] **T2.7** Carrito (agregar, quitar, cambiar cantidad, totales).
- [ ] **T2.8** Checkout y creación de pedido.
- [ ] **T2.9** Historial de pedidos y perfil.
- [ ] **T2.10** Rutas protegidas por rol; panel Admin mínimo (CRUD productos/categorías).
- [ ] **T2.11** Tests de componentes clave (Vitest).

---

## FASE 3 — Infraestructura Docker + Nginx (MVP 1)
- [ ] **T3.1** Dockerfile backend (multi-stage, usuario no root) y frontend (build estático).
- [ ] **T3.2** `docker-compose.yml`: nginx, frontend, backend, postgres, redis; healthchecks por servicio.
- [ ] **T3.3** Redes `public` e `internal`; Postgres y Redis sin `ports:`.
  - Hecho cuando: `nmap`/intento de conexión externa a 5432 y 6379 falla.
- [ ] **T3.4** Nginx: proxy `/api/` → Django, `/` → React, gzip, headers de seguridad, rate limit básico.
- [ ] **T3.5** Nginx escribe **access logs en formato JSON** a un volumen compartido.
- [ ] **T3.6** Volúmenes persistentes (db, media, logs) y migraciones automáticas al arrancar.
- [ ] **T3.7** `make up` levanta todo y la tienda funciona en `http://localhost`.
  - 🏁 **MVP 1 completo**: capturas de la tienda en el README.

---

## FASE 4 — Monitoring Agent (MVP 2)
- [ ] **T4.1** Proyecto FastAPI del agente + `GET /health` + config por env.
- [ ] **T4.2** Collector de sistema (psutil): CPU, cores, load, RAM, disco, red, uptime, hostname.
- [ ] **T4.3** Collector Docker (read-only): nombre, estado, cpu, memoria, límite, restarts, uptime.
- [ ] **T4.4** Configurar acceso a Docker socket en `:ro` o `docker-socket-proxy`; documentar en `docs/security.md`.
- [ ] **T4.5** Health checks: backend `/api/health`, nginx, `pg_isready`/`SELECT 1`, Redis `PING`.
- [ ] **T4.6** Agregar Celery y su health check con `celery inspect ping` (worker mínimo).
- [ ] **T4.7** Usuario PostgreSQL `pg_monitor` y collector (conexiones, tamaño BD, latencia).
- [ ] **T4.8** Collector Redis (memoria, clientes, comandos, keys) con usuario ACL de solo lectura.
- [ ] **T4.9** Collector HTTP: parsear access logs JSON de Nginx → req/min, latencia, 4xx, 5xx.
- [ ] **T4.10** Sender: `POST /api/v1/metrics` con Bearer API Key, reintentos con backoff y buffer local.
- [ ] **T4.11** Añadir `monitoring-agent` al compose (red `internal` + `egress`).
- [ ] **T4.12** Tests de collectors con datos simulados.

---

## FASE 5 — MonitorX backend (MVP 2)
- [ ] **T5.1** Proyecto FastAPI con estructura `app/{api,models,schemas,services,monitoring,alerts,websocket,core}`.
- [ ] **T5.2** PostgreSQL propia + SQLAlchemy + Alembic. Tablas: `servers`, `services`, `metrics`, `alerts`, `events`, `health_checks`.
- [ ] **T5.3** Índice `metrics(server_id, timestamp DESC)`.
- [ ] **T5.4** Autenticación por API Key para el agente (hash en BD, rotable).
- [ ] **T5.5** `POST /api/v1/metrics`: validación (Pydantic), upsert de server/services, guardado.
  - Hecho cuando: el agente real envía datos y quedan en BD.
- [ ] **T5.6** Endpoints de lectura: servidores, servicios, métricas (rango de tiempo), health, eventos.
- [ ] **T5.7** Auth de usuario para el dashboard (JWT).
- [ ] **T5.8** Job de retención (borrar o agregar métricas > 7 días).
- [ ] **T5.9** Rate limiting y validación de entradas.
- [ ] **T5.10** `docker-compose.yml` de MonitorX (api + db) y tests (pytest).

---

## FASE 6 — MonitorX dashboard (MVP 2)
- [ ] **T6.1** Proyecto Vite + React + TS + Tailwind + TanStack Query + Recharts.
- [ ] **T6.2** Login y rutas protegidas.
- [ ] **T6.3** Dashboard: tarjetas CPU/RAM/Disco/Uptime.
- [ ] **T6.4** Panel de servicios (Online/Offline por servicio).
- [ ] **T6.5** Gráficas de requests y tiempo de respuesta (polling por ahora).
- [ ] **T6.6** Vistas de eventos y detalle de contenedores.
- [ ] **T6.7** Tests de componentes.
  - 🏁 **MVP 2 completo**: GIF del dashboard con datos reales del E-Commerce.

---

## FASE 7 — Tiempo real y alertas (MVP 3)
- [ ] **T7.1** WebSocket en MonitorX API con autenticación y broadcast de métricas nuevas.
- [ ] **T7.2** Cliente WebSocket en React con reconexión automática; reemplazar el polling.
- [ ] **T7.3** Alert Engine: reglas (CPU>80, RAM>90, Disk>85, servicio DOWN, 5xx alto, latencia>1000ms, conexiones BD, memoria Redis, contenedor reiniciado).
- [ ] **T7.4** Anti-ruido: exigir N muestras consecutivas y no duplicar alertas activas.
- [ ] **T7.5** Estados `ACTIVE/ACKNOWLEDGED/RESOLVED` y severidades; resolución automática.
- [ ] **T7.6** Eventos (`SERVICE_DOWN`, `CONTAINER_RESTARTED`, `ALERT_CREATED`, ...).
- [ ] **T7.7** UI de alertas en vivo + acknowledge.
- [ ] **T7.8** Vista de logs (Nginx, backend, Celery, agente) con tail limitado.

---

## FASE 8 — CI/CD (MVP 3)
- [ ] **T8.1** Workflow CI: lint + tests por módulo (matrix).
- [ ] **T8.2** Security scan (pip-audit, npm audit, Trivy sobre imágenes).
- [ ] **T8.3** Build de imágenes Docker y publicación en GHCR.
- [ ] **T8.4** Badges de CI/cobertura en el README.
- [ ] **T8.5** E2E con Playwright: Register → Login → Buscar → Carrito → Checkout → Pedido.
- [ ] **T8.6** Workflow CD (deploy por SSH o similar) — se activa en Fase 12.

---

## FASE 9 — Demo y documentación (MVP 3)
- [ ] **T9.1** `scripts/load-test/`: genera tráfico, errores 5xx y picos de CPU para disparar alertas.
- [ ] **T9.2** Documentos: `architecture.md`, `api.md`, `security.md`, `monitoring.md`, `database.md`, `troubleshooting.md`.
- [ ] **T9.3** ADRs de las decisiones clave.
- [ ] **T9.4** README final con diagramas, capturas y GIF; `docker compose up` verificado desde cero.
  - 🏁 **MVP 3 completo**: el proyecto ya es presentable.

---

## FASE 10 — E-Commerce avanzado
- [ ] **T10.1** Inventario independiente con historial de movimientos (increase/decrease/reserve/release/adjust).
- [ ] **T10.2** Reserva de stock al crear pedido; liberación al cancelar.
- [ ] **T10.3** Pagos simulados (crear, procesar, aprobar, rechazar, reembolsar) y relación con pedidos.
- [ ] **T10.4** Celery + Redis: emails de bienvenida, confirmación y cambio de estado de pedido.
- [ ] **T10.5** Auditoría (`audit_logs`) con middleware/señales.
- [ ] **T10.6** Roles `EMPLOYEE`/`MANAGER` (opcional).
- [ ] **T10.7** Panel admin completo: usuarios, inventario, pedidos, pagos, auditoría, métricas de ventas.

---

## FASE 11 — Seguridad avanzada
- [ ] **T11.1** HTTPS con certificados (local con mkcert; producción con Let's Encrypt).
- [ ] **T11.2** Revisión de CORS, CSRF, secure headers (CSP, HSTS).
- [ ] **T11.3** Rotación de API Keys y principio de mínimo privilegio en todos los contenedores.
- [ ] **T11.4** Revisión de aislamiento de redes y escaneo de puertos.
- [ ] **T11.5** Completar `docs/security.md` (modelo de amenazas básico).

---

## FASE 12 — Cloud
- [ ] **T12.1** VPS (DigitalOcean/AWS/GCP) con Docker, firewall y usuario no root.
- [ ] **T12.2** Dominio + DNS + HTTPS.
- [ ] **T12.3** Despliegue automático desde GitHub Actions.
- [ ] **T12.4** Entornos staging/production separados.
- [ ] **T12.5** Terraform para la infraestructura (opcional).
- [ ] **T12.6** Demo en vivo enlazada en el README.

---

## FASE 13 — Observabilidad avanzada (opcional)
- [ ] **T13.1** Exporters + Prometheus (modelo pull) y comparación documentada con el agente propio.
- [ ] **T13.2** Grafana con dashboards.
- [ ] **T13.3** Loki para logs.
- [ ] **T13.4** OpenTelemetry + trazas distribuidas (Tempo/Jaeger).
- [ ] **T13.5** MonitorX consumiendo datos de Prometheus (opcional).
