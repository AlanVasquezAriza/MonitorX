# E-Commerce + MonitorX

## Plataforma E-Commerce con entorno de producción simulado y sistema de monitoreo independiente

> Proyecto de portafolio que demuestra Full Stack, DevOps, Seguridad y Observabilidad.
> Badges sugeridos: CI (GitHub Actions) · Cobertura · Licencia · Demo en vivo

---

# 1. Descripción general

Plataforma de comercio electrónico completa, desplegada en un entorno Linux simulado con Docker, acompañada de una segunda aplicación independiente llamada **MonitorX**, encargada de monitorear la infraestructura y la aplicación.

Áreas que demuestra:

* Full Stack, Backend y Frontend
* APIs REST y bases de datos
* Docker y Linux
* Nginx y Redis
* Procesamiento asíncrono
* Monitoring y observabilidad
* WebSockets
* Seguridad
* CI/CD, Cloud y DevOps
* Arquitectura de software

La arquitectura separa claramente el sistema de negocio del sistema de monitoreo.

---

# 2. Alcance y estrategia de entrega (NUEVO)

El mayor riesgo de este proyecto es su tamaño. **Un proyecto terminado, con buen README y demo, vale más que uno enorme e incompleto.** Por eso se construye en *rebanadas verticales* que funcionan de extremo a extremo.

| MVP | Contenido | Resultado visible |
|-----|-----------|-------------------|
| **MVP 1** | E-Commerce mínimo: auth, productos, categorías, carrito, pedidos + Docker Compose + Nginx | Tienda funcionando con `docker compose up` |
| **MVP 2** | Monitoring Agent (CPU/RAM/disco + health checks) → MonitorX con dashboard básico | Lo que diferencia el proyecto de cualquier otro e-commerce |
| **MVP 3** | WebSockets, motor de alertas, CI/CD | Dashboard en tiempo real y pipeline con badge |
| **Después** | Celery, inventario avanzado, pagos simulados, auditoría, roles extra, Prometheus, Terraform | Extensiones |

**Recomendación:** adelantar el MVP 2 antes de pulir el e-commerce (inventario, pagos, roles extra), porque es el diferenciador.

**Criterio de "terminado" por MVP:** funciona con un solo comando, tiene tests en CI, está documentado y tiene capturas o GIF en este README.

---

# 3. Arquitectura general

```text
                    INTERNET
                       │
                       ▼
              ┌─────────────────┐
              │      NGINX      │
              │ Reverse Proxy   │
              └────────┬────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │       E-COMMERCE            │
        │                             │
        │ React + Django REST API     │
        │                             │
        │ ┌─────────┐  ┌───────────┐ │
        │ │PostgreSQL│  │   Redis   │ │
        │ └─────────┘  └─────┬─────┘ │
        │                     │       │
        │                ┌────▼────┐  │
        │                │ Celery  │  │
        │                └─────────┘  │
        │                             │
        │      Monitoring Agent       │
        └──────────────┬──────────────┘
                       │
                       │ HTTPS (push)
                       ▼
             ┌─────────────────────┐
             │       MONITORX       │
             │ Monitoring Platform  │
             │                     │
             │ React Dashboard      │
             │ FastAPI              │
             │ PostgreSQL           │
             │ WebSocket            │
             └─────────────────────┘
                       │
                       ▼
             Dashboard de métricas
             Alertas / Servicios
             Logs / Actividad
```

---

# 4. Reglas arquitectónicas principales

**4.1 MonitorX NO debe acceder directamente a la base de datos del E-Commerce.**
La comunicación se realiza mediante un **Monitoring Agent**.

```text
E-Commerce
    │
    ├── PostgreSQL
    ├── Redis
    ├── Nginx
    ├── Backend
    ├── Celery
    └── Sistema Linux
            │
            ▼
    Monitoring Agent
            │
            │ HTTPS + API Key
            ▼
        MonitorX API
            │
            ▼
       MonitorX DB
            │
            ▼
       React Dashboard
```

Esto mantiene separados: datos de negocio, datos de monitoreo, credenciales, redes, responsabilidades y permisos.

**4.2 Modelo push (NUEVO).**
El agente **envía** las métricas a MonitorX (push). Ventaja: no hay que abrir puertos entrantes en el entorno del E-Commerce; el agente solo necesita salida HTTPS. Es el modelo contrario al de Prometheus (pull), y esta diferencia debe quedar documentada en `docs/architecture.md` como decisión de diseño (ADR).

---

# 5. Proyecto principal: E-Commerce

Aplicación de negocio con operaciones similares a una tienda online real.

## Autenticación

* Registro, Login, Logout
* Refresh token
* Recuperación de contraseña
* Hash seguro de contraseñas
* Roles y permisos

Roles iniciales: `CUSTOMER`, `ADMIN`. Opcionalmente: `EMPLOYEE`, `MANAGER`.

---

# 6. Usuarios

```text
id, username, email, password_hash, first_name, last_name,
role, is_active, created_at, updated_at, last_login
```

Eventos a registrar:

```text
USER_REGISTERED, USER_LOGIN, USER_LOGOUT,
USER_PASSWORD_CHANGED, USER_UPDATED
```

---

# 7. Productos

Los administradores pueden: crear, editar, eliminar/desactivar, consultar, buscar, filtrar, ordenar y controlar stock.

```text
id, name, description, price, sku, category_id,
stock, image, is_active, created_at, updated_at
```

---

# 8. Categorías

```text
id, name, description, is_active, created_at, updated_at
```

Un producto pertenece a una categoría (Electrónica, Computadores, Accesorios, Videojuegos, Celulares).

---

# 9. Inventario

Se maneja de forma independiente y conserva historial: stock actual, entradas, salidas, ajustes, reservas y movimientos.

```text
PRODUCT_CREATED, STOCK_INCREASED, STOCK_DECREASED,
STOCK_RESERVED, STOCK_RELEASED, STOCK_ADJUSTED
```

---

# 10. Carrito

Agregar, eliminar y cambiar cantidad de productos; consultar carrito; calcular subtotal y total.

---

# 11. Pedidos

Estados: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

```text
orders:      id, user_id, status, subtotal, shipping_cost, total, created_at, updated_at
order_items: order_id, product_id, quantity, unit_price, subtotal
```

---

# 12. Pagos

Sistema de pago **simulado** (sin dinero real). Estados: `PENDING`, `APPROVED`, `REJECTED`, `REFUNDED`.

Operaciones simuladas: crear, procesar, aprobar, rechazar y reembolsar. Diseñado para integrar Stripe o Mercado Pago en una fase avanzada.

---

# 13. Notificaciones

Las tareas sin respuesta inmediata se procesan de forma asíncrona con **Redis + Celery**:

```text
Django → Redis Queue → Celery Worker → Task
```

Ejemplos: confirmación de pedido, correo de bienvenida, cambio de estado, recuperación de contraseña, alertas administrativas.

---

# 14. Auditoría

Tabla `audit_logs`:

```text
id, user_id, action, entity, entity_id, ip_address, timestamp, metadata
```

Acciones: `LOGIN`, `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`, `ORDER_CREATED`, `ORDER_CANCELLED`, `STOCK_UPDATED`, `USER_UPDATED`.

---

# 15. Backend

Python, Django, Django REST Framework, PostgreSQL, Redis, Celery. Organizado por módulos con responsabilidades claras:

```text
backend/
├── config/
├── users/
├── products/
├── categories/
├── inventory/
├── cart/
├── orders/
├── payments/
├── notifications/
├── audit/
├── manage.py
└── requirements.txt
```

---

# 16. API REST

```http
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}

GET    /api/categories
POST   /api/categories

GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/{id}
DELETE /api/cart/items/{id}

GET    /api/orders
GET    /api/orders/{id}
POST   /api/orders

GET    /api/inventory
POST   /api/inventory/movements

GET    /api/health
```

Debe incluir: serializers, permissions, authentication, validation, pagination, filtering, error handling y códigos HTTP correctos.

---

# 17. Frontend (ACTUALIZADO)

Stack recomendado:

```text
React + TypeScript + Vite
Tailwind CSS
TanStack Query (datos del servidor)
```

Páginas: Home, Login, Register, Products, Product Detail, Search, Categories, Cart, Checkout, Orders, Profile, Admin.

Regla: **sin lógica de negocio en componentes React**; usar hooks y servicios.

---

# 18. Panel administrativo

Visualizar: usuarios, productos, categorías, inventario, pedidos, pagos, auditoría.
Además: productos vendidos, ventas, pedidos pendientes, productos con poco stock y usuarios registrados.

---

# 19. Nginx

Punto de entrada del sistema:

```text
Internet → Nginx ─┬─ /      → React
                  └─ /api/  → Django
```

Responsabilidades: reverse proxy, servir frontend, routing, headers, compresión, logs, rate limiting básico, HTTPS en producción.

**Access logs en formato JSON (NUEVO):** Nginx debe escribir sus access logs en JSON (con `request_time`, `status`, `request`, `upstream_response_time`). El Monitoring Agent los lee para calcular las métricas HTTP (ver sección 26).

---

# 20. Docker

Todo el sistema se ejecuta con Docker; cada servicio en su propio contenedor:

```text
nginx, frontend, backend, postgres, redis, celery-worker, monitoring-agent
```

Archivo: `docker-compose.yml`. Cada servicio con su `healthcheck` de Compose.

---

# 21. Redes Docker (ACTUALIZADO)

Separación de redes:

```text
public   → nginx
internal → backend, postgres, redis, celery, monitoring-agent
egress   → monitoring-agent (salida hacia MonitorX)
```

```text
public
   │
   ▼
 nginx
   │
   ▼
backend ── internal ──┬── postgres
                      ├── redis
                      ├── celery
                      └── monitoring-agent ──► (salida HTTPS) MonitorX
```

* PostgreSQL y Redis no se exponen al exterior (sin `ports:` publicados).
* El agente está en la red interna para llegar a postgres/redis y tiene salida hacia MonitorX.
* Incluir este diagrama en `docs/architecture.md`.

---

# 22. Monitoring Agent

Servicio independiente que recolecta métricas. Stack inicial: **Python, FastAPI, psutil, Docker API**. Se ejecuta dentro del entorno del E-Commerce.

### Seguridad del acceso a Docker (NUEVO)

Montar `/var/run/docker.sock` equivale casi a dar acceso root al host. Mitigaciones:

* Montarlo en **solo lectura** (`:ro`), o
* Usar un **socket proxy** (por ejemplo `tecnativa/docker-socket-proxy`) que exponga solo endpoints de lectura de contenedores.
* Documentar el riesgo y la decisión en `docs/security.md`.

### Acceso a PostgreSQL y Redis (NUEVO)

* PostgreSQL: crear un usuario dedicado de **solo lectura** con el rol `pg_monitor`. Nunca usar el usuario de la aplicación.
* Redis: usar un usuario ACL limitado a comandos de lectura (`INFO`, `DBSIZE`, `PING`).

---

# 23. Métricas del sistema

**CPU:** uso, núcleos, load average.
**RAM:** total, usada, disponible, porcentaje.
**Disco:** total, usado, disponible, porcentaje.
**Red:** bytes enviados/recibidos, paquetes.
**Sistema:** hostname, sistema operativo, uptime, timestamp.

---

# 24. Métricas Docker

Por contenedor:

```text
name, status, cpu, memory, memory_limit, network, restarts, uptime
```

---

# 25. Health Checks (ACTUALIZADO)

Cada servicio debe tener un mecanismo de salud adecuado a su tipo:

| Servicio | Método |
|----------|--------|
| Backend (Django) | `GET /api/health` → `{"status": "healthy"}` |
| Nginx | Petición HTTP al puerto público o `stub_status` |
| PostgreSQL | `pg_isready` o consulta `SELECT 1` con el usuario de métricas |
| Redis | `PING` |
| **Celery** | **`celery inspect ping`** (no hay endpoint HTTP) |
| Monitoring Agent | `GET /health` propio |

El agente consulta periódicamente cada uno y reporta el estado a MonitorX.

---

# 26. Métricas HTTP (ACTUALIZADO)

El agente **no puede ver las peticiones por sí solo**. Se obtienen **leyendo los access logs JSON de Nginx** (volumen compartido de solo lectura), que es la opción más limpia y realista. Alternativa: un middleware en Django que reporte las peticiones.

Métricas: requests, response time, status codes, errores 4xx y 5xx, requests por minuto.

```text
GET /api/products  200  125ms
```

---

# 27. Métricas PostgreSQL

Conexiones activas, tamaño de la base de datos, fallos de conexión, latencia de consultas. **No almacenar datos sensibles de las consultas.**

---

# 28. Métricas Redis

Uso de memoria, clientes conectados, comandos, keys, errores.

---

# 29. Comunicación con MonitorX

```http
POST /api/v1/metrics
Authorization: Bearer MONITORING_API_KEY
Content-Type: application/json
```

```json
{
  "server": "production-01",
  "timestamp": "2026-09-30T12:00:00Z",
  "system": { "cpu": 42.5, "memory": 67.2, "disk": 51.8 },
  "services": {
    "nginx": "healthy",
    "backend": "healthy",
    "postgres": "healthy",
    "redis": "healthy",
    "celery": "healthy"
  }
}
```

Recomendaciones: reintentos con backoff y buffer local si MonitorX no responde, para no perder métricas.

---

# 30. MonitorX

Aplicación completamente independiente que centraliza: métricas, salud, alertas, eventos, estado de servicios e información de infraestructura.

Stack: **React + TypeScript + Tailwind + FastAPI + PostgreSQL + WebSockets**. Gráficas en tiempo real con **Recharts** (o similar).

---

# 31. MonitorX Backend

```text
monitorx-api/
├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── monitoring/
│   ├── alerts/
│   ├── websocket/
│   └── core/
└── main.py
```

---

# 32. Base de datos MonitorX (ACTUALIZADO)

PostgreSQL propia, sin relación con la del E-Commerce.

Tablas: `servers`, `services`, `metrics`, `alerts`, `events`, `health_checks`.

**Rendimiento y retención (NUEVO):**

* Índice compuesto en `metrics (server_id, timestamp DESC)`.
* Política de retención: borrar métricas de más de 7 días (job programado), o agregarlas por hora antes de borrar.
* Opcional: evaluar la extensión **TimescaleDB** (hypertables, compresión y retención automática).

---

# 33. Dashboard

```text
┌─────────────────────────────────────────────┐
│                 MONITORX                    │
├─────────────────────────────────────────────┤
│ CPU        RAM        DISK       UPTIME     │
│ 42%        67%        51%        3d 14h     │
├─────────────────────────────────────────────┤
│ SERVICES                                    │
│ Nginx       ● Online                        │
│ Backend     ● Online                        │
│ PostgreSQL  ● Online                        │
│ Redis       ● Online                        │
│ Celery      ● Online                        │
├─────────────────────────────────────────────┤
│ REQUESTS         📈 gráfico de tráfico      │
├─────────────────────────────────────────────┤
│ RESPONSE TIME    📈 gráfico de latencia     │
├─────────────────────────────────────────────┤
│ ALERTS                                      │
│ ⚠ CPU > 80%                                 │
│ ⚠ Backend latency high                      │
└─────────────────────────────────────────────┘
```

---

# 34. Tiempo real

MonitorX actualiza la información sin refrescar la página:

```text
Monitoring Agent → MonitorX API → WebSocket → React Dashboard
```

Incluir autenticación del WebSocket y reconexión automática en el cliente.

---

# 35. Sistema de alertas

Alertas automáticas:

```text
CPU > 80%, RAM > 90%, Disk > 85%, Service DOWN,
HTTP 5xx elevado, Latency > 1000ms,
Database connections high, Redis memory high, Container restarted
```

Campos: `id, type, severity, message, service, value, threshold, created_at, resolved_at, status`.

Estados: `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`. Severidades: `INFO`, `WARNING`, `CRITICAL`.

Buenas prácticas: evitar alertas duplicadas mientras una siga activa y exigir que la condición se mantenga N muestras seguidas (evita falsos positivos por picos).

---

# 36. Eventos

```text
SERVICE_STARTED, SERVICE_STOPPED, SERVICE_DOWN, CONTAINER_RESTARTED,
ALERT_CREATED, ALERT_RESOLVED, DEPLOYMENT_STARTED, DEPLOYMENT_COMPLETED
```

---

# 37. Logs

Inicialmente: logs de Nginx, Backend, Celery y Monitoring Agent. Posteriormente: Loki, Grafana, ELK u OpenSearch.

---

# 38. Seguridad

## E-Commerce

HTTPS, JWT, hash de contraseñas, CORS, CSRF, validación de entradas, prevención de SQL injection, rate limiting, secure headers, secretos por variables de entorno, PostgreSQL y Redis sin exponer.

## MonitorX

API Keys, HTTPS, autenticación y autorización, rate limiting, validación de entradas, sin almacenar secretos innecesarios.

## Monitoring Agent (NUEVO)

* Docker socket en solo lectura o mediante socket proxy.
* Usuarios de solo lectura para PostgreSQL (`pg_monitor`) y Redis.
* API Key rotable y con permisos limitados al endpoint de métricas.
* Contenedor sin privilegios (`user` no root, `read_only` cuando sea posible).

---

# 39. Variables de entorno

```env
DATABASE_URL=
SECRET_KEY=
JWT_SECRET=
REDIS_URL=
MONITORING_API_KEY=
MONITORX_URL=
```

Crear `.env.example`. **Nunca subir `.env` a Git.**

---

# 40. CI/CD

GitHub Actions:

```text
Push → CI (Tests, Lint, Security scan, Build, Docker build) → CD → Deployment
```

Los tests deben ejecutarse realmente en el pipeline y el badge de CI debe aparecer en este README.

---

# 41. Testing

* **Backend:** unit, integration, API y authentication tests.
* **Frontend:** component e integration tests.
* **E2E (Playwright):** Register → Login → Search product → Add to cart → Checkout → Create order.
* **Monitoring Agent:** tests de los collectors con datos simulados.

---

# 42. Observabilidad

Tres pilares: Metrics, Logs, Traces.

Inicialmente: Metrics → Monitoring Agent; Logs → Docker/Nginx/aplicación. Posteriormente: OpenTelemetry, Prometheus, Grafana, Loki, Jaeger/Tempo.

La implementación inicial es propia para entender cómo funciona el monitoreo antes de incorporar herramientas especializadas.

---

# 43. Prometheus

Fase avanzada. Prometheus usa el modelo **pull** (scrape de exporters), a diferencia del modelo push del agente propio. MonitorX puede evolucionar para consumir datos de Prometheus.

---

# 44. Infraestructura

Comienza localmente con Docker; luego AWS, Google Cloud, Azure o DigitalOcean (un VPS económico es suficiente para el demo). Documentar la infraestructura; opcionalmente usar Terraform.

---

# 45. Ambientes

Development (local), Staging (similar a producción), Production (servidor Linux real).

---

# 46. Repositorios (ACTUALIZADO)

**Recomendado: monorepo.** Un solo enlace para reclutadores, un solo `docker compose up`, un solo pipeline. Las carpetas internas siguen siendo independientes para reflejar la separación E-Commerce / Agent / MonitorX.

---

# 47. Estructura general

```text
portfolio-monitoring-system/
├── ecommerce/
│   ├── frontend/
│   ├── backend/
│   ├── nginx/
│   └── docker-compose.yml
├── monitoring-agent/
│   ├── app/
│   ├── collectors/
│   ├── Dockerfile
│   └── requirements.txt
├── monitorx/
│   ├── frontend/
│   ├── backend/
│   └── docker-compose.yml
├── infrastructure/
│   ├── terraform/
│   ├── nginx/
│   └── deployment/
├── scripts/
│   └── load-test/          # generador de tráfico y alertas (NUEVO)
├── docs/
├── .github/workflows/
├── .env.example
└── README.md
```

---

# 48. Flujo completo de una petición

```text
Browser → Nginx → React → GET /api/products → Django REST → PostgreSQL → Django → React → Browser
```

En paralelo:

```text
Nginx access log (JSON) → Monitoring Agent → registra request, latency, status, health
                                   │
                                   ▼
                               MonitorX → Dashboard
```

---

# 49. Flujo de una alerta

```text
CPU > 80% → Monitoring Agent → MonitorX API → Alert Engine → Database → WebSocket → Dashboard
```

```text
⚠ WARNING
High CPU usage
Server: production-01
CPU: 87%
Threshold: 80%
```

---

# 50. Principios de desarrollo

Clean Code, SOLID, DRY, Separation of Concerns, Dependency Injection, REST, Secure by Design, Least Privilege, Fail Securely.

Evitar: código duplicado, secretos en código, credenciales hardcodeadas, endpoints sin autorización, bases de datos expuestas, lógica de negocio en componentes React, monolitos innecesariamente grandes.

---

# 51. Documentación (ACTUALIZADO)

```text
docs/
├── architecture.md      # diagramas, redes, push vs pull
├── adr/                 # decisiones de arquitectura (NUEVO)
├── api.md
├── security.md          # docker.sock, usuarios de solo lectura, etc.
├── monitoring.md
├── deployment.md
├── database.md          # índices y retención
└── troubleshooting.md
```

**ADRs (NUEVO):** documentos cortos que explican *por qué* se eligió cada tecnología o patrón. Ejemplos:

* `001-push-vs-pull.md`
* `002-nginx-json-logs-para-metricas-http.md`
* `003-docker-socket-proxy.md`
* `004-monorepo.md`
* `005-retencion-de-metricas.md`

---

# 52. Cómo hacer destacar el repositorio (NUEVO)

* README con diagrama de arquitectura y **capturas/GIF del dashboard**.
* `docker compose up` que funcione a la primera, con datos de ejemplo (seed).
* Badges de CI y cobertura.
* **Demo en vivo** en un VPS con dominio propio y HTTPS.
* **Script de generación de tráfico** (`scripts/load-test/`) que simula carga, errores 5xx y picos de CPU para disparar alertas en directo durante una demostración.
* Carpeta `docs/` con ADRs.
* Commits pequeños y descriptivos; issues/milestones por fase.

---

# 53. Roadmap (ACTUALIZADO)

Priorizado por MVP (ver sección 2).

## MVP 1 — E-Commerce mínimo + infraestructura base

* React + Django + PostgreSQL
* Autenticación, productos, categorías, carrito, pedidos
* Docker Compose + Nginx (logs JSON)
* Redes Docker separadas

## MVP 2 — Monitoring Agent + MonitorX básico

* CPU, RAM, disco, red
* Estado de contenedores (Docker socket de solo lectura o socket proxy)
* Health checks (HTTP, `pg_isready`, `PING`, `celery inspect ping`)
* Métricas HTTP desde logs de Nginx
* FastAPI + PostgreSQL de MonitorX con índice y retención
* Dashboard básico

## MVP 3 — Tiempo real, alertas y CI/CD

* WebSockets y métricas en vivo
* Motor de alertas y eventos
* GitHub Actions: tests, lint, security scan, Docker build
* Script de tráfico para demo

## Fase 4 — E-Commerce avanzado

* Inventario con historial, pagos simulados, roles extra, auditoría
* Celery + Redis para notificaciones

## Fase 5 — Seguridad avanzada

* HTTPS, rate limiting, security headers, rotación de API keys, revisión de aislamiento de redes

## Fase 6 — Cloud

* VPS / AWS / GCP, dominio, HTTPS, despliegue en producción, Terraform (opcional)

## Fase 7 — Observabilidad avanzada

* Prometheus, Grafana, OpenTelemetry, Loki, distributed tracing

---

# 54. Objetivo final

```text
                         INTERNET
                            │
                            ▼
                     ┌─────────────┐
                     │    NGINX    │
                     └──────┬──────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   E-COMMERCE  │
                    │ React         │
                    │ Django API    │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         PostgreSQL       Redis         Celery
              │             │             │
              └─────────────┼─────────────┘
                            │
                            ▼
                    Monitoring Agent
                            │
                      HTTPS (push)
                            │
                            ▼
                     ┌─────────────┐
                     │  MonitorX   │
                     │ FastAPI     │
                     │ PostgreSQL  │
                     │ WebSocket   │
                     └──────┬──────┘
                            │
                            ▼
                     React Dashboard
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Metrics         Alerts          Logs
```

El proyecto prioriza una implementación progresiva: funcionalidades simples primero, evolucionando hacia una arquitectura distribuida, segura, observable y desplegable en la nube. Debe funcionar completamente en local con Docker antes de desplegarse en un servidor Linux real.

El objetivo no es solo crear un E-Commerce, sino una **plataforma completa de software + infraestructura + observabilidad** que demuestre capacidades de Full Stack, DevOps, Cloud, Security y Monitoring.