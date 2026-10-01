# ADR-001: Estructura de Monorepo para la plataforma

- **Estado:** Aceptada
- **Fecha:** 2026-10-01
- **Tarea relacionada:** T0.5

## Contexto
El proyecto consta de múltiples componentes independientes pero interrelacionados: una aplicación de E-Commerce (Frontend React + Backend Django), un Monitoring Agent en Python/FastAPI y la plataforma de monitoreo MonitorX (Backend FastAPI + Frontend React). Se requiere definir el modelo de repositorios para el desarrollo y despliegue.

## Opciones consideradas
1. **Multirepo (repositorios separados)**
   - Pros: Aislamiento total de código y permisos por servicio.
   - Contras: Complejidad para sincronizar tareas, documentación dividida y dificulta la ejecución conjunta local con Docker Compose.
2. **Monorepo (un solo repositorio con subcarpetas)**
   - Pros: Facilidad para compartir contratos de API, visión global del proyecto, desarrollo local unificado con Docker Compose y flujo de tareas simplificado.
   - Contras: Requiere organización clara de carpetas y CI/CD configurado para construir solo los servicios modificados.

## Decisión
Se decide adoptar una arquitectura de **Monorepo** organizando los proyectos en carpetas (`ecommerce/`, `monitoring-agent/`, `monitorx/`, `infrastructure/`). Esto simplifica el orquestamiento local con Docker Compose y permite mantener la documentación (`docs/`) sincronizada con el estado real del desarrollo.

## Consecuencias
- Positivas:
  - Todo el flujo del sistema se puede levantar y probar con un único comando (`make up`).
  - Historial de cambios unificado para tareas complejas que abarquen múltiples servicios.
- Negativas / deuda aceptada:
  - Las acciones de CI deberán filtrar rutas para evitar ejecuciones de pipeline innecesarias cuando cambie un solo servicio.
