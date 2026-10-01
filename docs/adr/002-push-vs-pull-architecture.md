# ADR-002: Modelo de recolección de métricas (Push vs Pull)

- **Estado:** Aceptada
- **Fecha:** 2026-10-01
- **Tarea relacionada:** T0.5

## Contexto
El sistema de monitoreo necesita obtener métricas del sistema host, contenedores Docker, logs de Nginx y servicios de base de datos/caché de la infraestructura del E-Commerce para enviarlos a MonitorX. Se debe definir cómo se comunican el E-Commerce y MonitorX.

## Opciones consideradas
1. **Modelo Pull (MonitorX consulta activamente la infraestructura monitoreada)**
   - Pros: Control centralizado de la frecuencia de recolección desde la plataforma de monitoreo.
   - Contras: Exige exponer puertos o endpoints de monitoreo en la red del E-Commerce hacia el exterior, violando el principio de aislamiento de base de datos y servicios internos.
2. **Modelo Push (Agente autónomo envía métricas a MonitorX vía HTTPS POST)**
   - Pros: La red interna del E-Commerce permanece completamente aislada y sin puertos abiertos de entrada; solo el agente necesita salida HTTPS hacia MonitorX (red `egress`). No hay acceso directo a la BD.
   - Contras: Requiere gestionar un buffer local o reintentos en el agente en caso de caída temporal del servidor de MonitorX.

## Decisión
Se elige la arquitectura **Push**. Un **Monitoring Agent** ligero desarrollado en Python/FastAPI se ejecuta en la misma red interna que el E-Commerce, recolecta métricas del sistema y servicios (vía Docker socket `:ro` y logs JSON de Nginx), y envía un payload firmado con `MONITORING_API_KEY` mediante HTTPS `POST /api/v1/metrics` a MonitorX.

## Consecuencias
- Positivas:
  - Cumple estrictamente la regla de arquitectura: MonitorX **nunca** accede a la base de datos ni a la red interna del E-Commerce.
  - La infraestructura monitoreada no requiere abrir puertos de entrada ni modificar su postura de seguridad.
- Negativas / deuda aceptada:
  - El agente debe implementar resiliencia (retry con backoff exponencial) para manejar la indisponibilidad de MonitorX backend.
