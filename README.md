# Microservicios con Node.js

[Siguiente página →](labs/M01-node-en-microservicios/00-io-no-bloqueante.md)

## De qué va este curso

Este curso va de microservicios con Node.js. Un microservicio aquí es un proceso pequeño con una responsabilidad: publica un API, habla con otros servicios, guarda su dato, sabe quién llama y se puede desplegar y observar.

Está dirigido a quien ya escribe JavaScript actual (módulos, promesas, `async`/`await`), conoce HTTP (verbos, códigos, JSON) y se maneja en la terminal de Linux. Con haber usado Docker una vez basta para arrancar. Kubernetes, gRPC y los brokers se aprenden en el curso. No hace falta cuenta de Google, Facebook ni GitHub: cuando aparece OAuth, el proveedor es local y usa el mismo contrato que esos sitios.

El objetivo es dejar servicios que se hablan, se descubren, guardan estado, se identifican y se despliegan con una señal de salud, y saber explicar qué está pasando en cada pieza:

- cuándo Node sostiene un API de red y cuándo un cálculo pide otro runtime;
- un API con rutas, validación, códigos HTTP y middleware;
- un aviso dentro del proceso, una cola, una consulta con contrato, un canal abierto, un listín de servicios y un solo puerto de entrada;
- el dato en MongoDB o PostgreSQL, una copia caliente en Redis, y una lectura que no mira la misma tabla que la escritura;
- una identidad con rol, un authorization code y el cifrado de una clave, de un campo y del canal;
- una imagen, varios contenedores en una red y un despliegue con más de una réplica;
- una métrica, el recorrido de una petición y un log que se puede buscar.

## Temario

- **M01 — Node.js en microservicios.** Sin laboratorio.
  - [I/O no bloqueante](labs/M01-node-en-microservicios/00-io-no-bloqueante.md)
  - [CPU, y Node frente a Java, Python y Go](labs/M01-node-en-microservicios/01-cpu-y-otros-runtimes.md)
- **M02 — APIs REST con Express**
  - [Rutas HTTP](labs/M02-apis-rest-express/00-rutas-http.md)
  - [Joi y errores](labs/M02-apis-rest-express/01-joi-y-errores.md)
  - [Middleware](labs/M02-apis-rest-express/02-middleware.md)
  - [Laboratorio: incidencias](labs/M02-apis-rest-express/lab-incidencias/README.md)
- **M03 — Comunicación, descubrimiento y entrada**
  - [EventEmitter](labs/M03-comunicacion-entre-servicios/00-event-emitter.md)
  - [RabbitMQ](labs/M03-comunicacion-entre-servicios/01-rabbitmq.md)
  - [Kafka](labs/M03-comunicacion-entre-servicios/02-kafka.md)
  - [gRPC](labs/M03-comunicacion-entre-servicios/03-grpc.md)
  - [WebSockets](labs/M03-comunicacion-entre-servicios/04-websockets.md)
  - [Consul](labs/M03-comunicacion-entre-servicios/05-consul.md)
  - [Gateway](labs/M03-comunicacion-entre-servicios/06-gateway.md)
- **M04 — Estado y persistencia**
  - [Mongoose](labs/M04-estado-y-persistencia/00-mongoose.md)
  - [Sequelize](labs/M04-estado-y-persistencia/01-sequelize.md)
  - [Redis](labs/M04-estado-y-persistencia/02-redis.md)
  - [Consistencia eventual y CQRS](labs/M04-estado-y-persistencia/03-cqrs.md)
- **M05 — Seguridad**
  - [JWT](labs/M05-seguridad-y-autenticacion/00-jwt.md)
  - [OAuth y Passport](labs/M05-seguridad-y-autenticacion/01-oauth.md)
  - [Cifrado y TLS](labs/M05-seguridad-y-autenticacion/02-cifrado-y-tls.md)
- **M06 — Docker y Kubernetes**
  - [Dockerfile](labs/M06-docker-y-kubernetes/00-dockerfile.md)
  - [Compose](labs/M06-docker-y-kubernetes/01-compose.md)
  - [Kubernetes y volúmenes](labs/M06-docker-y-kubernetes/02-kubernetes.md)
  - [Helm, réplicas y autoescalado](labs/M06-docker-y-kubernetes/03-helm-y-replicas.md)
- **M07 — Monitorización y logging**
  - [Prometheus y Grafana](labs/M07-monitorizacion-y-logging/00-prometheus.md)
  - [Jaeger](labs/M07-monitorizacion-y-logging/01-jaeger.md)
  - [Logs](labs/M07-monitorizacion-y-logging/02-logs.md)

## Antes de empezar

| Requisito | Dónde |
|-----------|--------|
| Node.js 22, Docker, curl | [infra/README.md](infra/README.md) |
| kind, kubectl y Helm | Solo en las páginas de Kubernetes |
| Dejar los puertos libres | `bash scripts/limpiar-entorno.sh` |

## Empieza aquí

→ **[I/O no bloqueante](labs/M01-node-en-microservicios/00-io-no-bloqueante.md)**
