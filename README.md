# Microservicios con Node.js

[Siguiente →](labs/M01-node-en-microservicios/README.md)

## De qué va este curso

Cada tema se mira en un ejemplo que ya está escrito y, cuando el tema lo pide, se practica en un laboratorio distinto. El ejemplo se arranca. El laboratorio se monta a partir de un esqueleto: no es el mismo programa otra vez.

Al terminar sabrás dejar un servicio Node que atiende red sin bloquearse, publicar un API con validación y middleware, comunicar servicios por evento, cola, gRPC o WebSocket, descubrirlos con Consul y entrar por un gateway, guardar el dato en MongoDB, PostgreSQL o Redis, separar lectura y escritura, autenticar y cifrar, empaquetar con Docker y desplegar en Kubernetes, y ver una métrica, un trazo y un log.

Hasta el módulo de contenedores, Docker y Compose se usan para levantar el broker o la base. La imagen y el clúster se abren en ese módulo. Kubernetes se practica con kind.

## Temario

- **M01 — Node.js en microservicios.** Sin laboratorio.
  - [I/O no bloqueante](ejemplos/01-io-no-bloqueante/README.md)
  - [CPU, y Node frente a Java, Python y Go](ejemplos/01-cpu-bloquea/README.md)
- **M02 — APIs REST con Express**
  - [Rutas HTTP](ejemplos/02-rutas-http/README.md)
  - [Joi y errores](ejemplos/02-joi-errores/README.md)
  - [Middleware](ejemplos/02-middleware/README.md)
  - [Laboratorio: incidencias](labs/M02-apis-rest-express/lab-incidencias/README.md)
- **M03 — Comunicación, descubrimiento y entrada**
  - [EventEmitter](ejemplos/03-event-emitter/README.md) · [laboratorio](labs/M03-comunicacion-entre-servicios/lab-eventos/README.md)
  - [RabbitMQ](ejemplos/03-rabbitmq/README.md) · [laboratorio](labs/M03-comunicacion-entre-servicios/lab-rabbitmq/README.md)
  - [Kafka](ejemplos/03-kafka/README.md)
  - [gRPC](ejemplos/03-grpc/README.md)
  - [WebSockets](ejemplos/03-websockets/README.md)
  - [Consul](ejemplos/03-consul/README.md) · [laboratorio](labs/M03-comunicacion-entre-servicios/lab-consul/README.md)
  - [Gateway](ejemplos/03-gateway/README.md) · [laboratorio](labs/M03-comunicacion-entre-servicios/lab-gateway/README.md)
- **M04 — Estado y persistencia**
  - [Mongoose](ejemplos/04-mongoose/README.md)
  - [Sequelize](ejemplos/04-sequelize/README.md)
  - [Redis](ejemplos/04-redis-cache/README.md) · [laboratorio](labs/M04-estado-y-persistencia/lab-cache/README.md)
  - [CQRS](ejemplos/04-cqrs/README.md) · [laboratorio](labs/M04-estado-y-persistencia/lab-cqrs/README.md)
- **M05 — Seguridad**
  - [JWT](ejemplos/05-jwt/README.md) · [laboratorio](labs/M05-seguridad-y-autenticacion/lab-jwt/README.md)
  - [OAuth y Passport](ejemplos/05-oauth/README.md)
  - [Cifrado y TLS](ejemplos/05-cifrado/README.md)
- **M06 — Docker y Kubernetes**
  - [Dockerfile](ejemplos/06-dockerfile/README.md)
  - [Compose](ejemplos/06-compose/README.md)
  - [Kubernetes y volúmenes](ejemplos/06-kubernetes/README.md) · [laboratorio con kind](labs/M06-docker-y-kubernetes/lab-kind/README.md)
  - [Helm, réplicas y autoescalado](ejemplos/06-helm/README.md)
- **M07 — Monitorización y logging**
  - [Prometheus y Grafana](ejemplos/07-prometheus/README.md) · [laboratorio](labs/M07-monitorizacion-y-logging/lab-metricas/README.md)
  - [Jaeger](ejemplos/07-jaeger/README.md)
  - [Logs](ejemplos/07-logs/README.md)

## Antes de empezar

| Requisito | Dónde |
|-----------|--------|
| Node.js 22, Docker, curl | [infra/README.md](infra/README.md) |
| kind, kubectl y Helm | Solo en los ejemplos y el laboratorio de Kubernetes |
| Dejar los puertos libres | `bash scripts/limpiar-entorno.sh` |

## Empieza aquí

→ **[M01 — Node.js en microservicios](labs/M01-node-en-microservicios/README.md)**
