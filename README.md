# Microservicios con Node.js

[Siguiente página →](labs/M01-node-en-microservicios/README.md)

## De qué va este curso

Nexo Logística reparte paquetes con un solo proceso que hace de catálogo, de pedidos y de avisos. Ese proceso se va a partir. Tú construyes las tres piezas con Node.js: `catalogo` (el SKU `NX-1`), `pedidos` (el envío `PED-1001`) y `notificaciones` (el aviso de que el envío existe).

No es un curso de sintaxis ni un curso de clúster. Es el corte de un pedido: entra por un API, se valida, se publica a otro servicio, se guarda, se autoriza, se mete en un contenedor y deja una métrica, un trazo y un log.

Al terminar sabrás desarrollar esos microservicios, diseñar el API para que falle con un código claro, comunicarlos y desplegarlos en contenedores, y aplicarles autenticación, cifrado y monitorización.

## Temario

- **M01 — Introducción a Node.js en la arquitectura de microservicios** — [el I/O no bloqueante cuando muchos clientes miran el stock](labs/M01-node-en-microservicios/00-io-no-bloqueante.md)
  - [Concurrencia: dos peticiones a la vez](labs/M01-node-en-microservicios/01-lab-concurrencia.md)
  - [Node frente a Java, Python y Go, y el trabajo que no le pega](labs/M01-node-en-microservicios/02-lab-cuando-node.md)
- **M02 — APIs REST con Express** — [rutas y controladores del catálogo](labs/M02-apis-rest-express/00-rutas-express.md)
  - [GET, POST, PUT y DELETE, con un handler asíncrono](labs/M02-apis-rest-express/01-lab-crud-catalogo.md)
  - [Joi y códigos de estado](labs/M02-apis-rest-express/02-lab-joi-y-errores.md)
  - [Middleware de autenticación, logging y compresión](labs/M02-apis-rest-express/03-lab-middleware.md)
- **M03 — Comunicación entre microservicios** — [evento, cola, llamada y canal abierto](labs/M03-comunicacion-entre-servicios/00-tres-formas-de-hablar.md)
  - [EventEmitter dentro del proceso](labs/M03-comunicacion-entre-servicios/01-lab-event-emitter.md)
  - [RabbitMQ](labs/M03-comunicacion-entre-servicios/02-lab-rabbitmq.md)
  - [Kafka](labs/M03-comunicacion-entre-servicios/03-lab-kafka.md)
  - [gRPC frente a REST, en Node](labs/M03-comunicacion-entre-servicios/04-lab-grpc.md)
  - [WebSockets](labs/M03-comunicacion-entre-servicios/05-lab-websockets.md)
- **M04 — Estado y persistencia** — [MongoDB, PostgreSQL y Redis en Nexo](labs/M04-estado-y-persistencia/00-donde-vive-el-dato.md)
  - [Mongoose y el catálogo](labs/M04-estado-y-persistencia/01-lab-mongodb-mongoose.md)
  - [Sequelize y el pedido](labs/M04-estado-y-persistencia/02-lab-postgres-sequelize.md)
  - [Redis como caché](labs/M04-estado-y-persistencia/03-lab-redis-cache.md)
  - [Consistencia eventual y CQRS](labs/M04-estado-y-persistencia/04-lab-cqrs.md)
- **M05 — Seguridad y autenticación** — [quién es Ana y qué puede hacer](labs/M05-seguridad-y-autenticacion/00-identidad-en-nexo.md)
  - [JWT, roles y permisos](labs/M05-seguridad-y-autenticacion/01-lab-jwt-y-roles.md)
  - [OAuth 2.0, OpenID Connect y Passport](labs/M05-seguridad-y-autenticacion/02-lab-oauth-passport.md)
  - [bcrypt, crypto y TLS](labs/M05-seguridad-y-autenticacion/03-lab-cifrado-y-tls.md)
- **M06 — Docker y Kubernetes** — [el catálogo deja de ser un `node` en una terminal](labs/M06-docker-y-kubernetes/00-de-proceso-a-cluster.md)
  - [Dockerfile](labs/M06-docker-y-kubernetes/01-lab-dockerfile.md)
  - [Docker Compose](labs/M06-docker-y-kubernetes/02-lab-compose.md)
  - [Pods, Deployments, Services y volúmenes](labs/M06-docker-y-kubernetes/03-lab-kubernetes.md)
  - [Helm, réplicas y autoescalado](labs/M06-docker-y-kubernetes/04-lab-helm-y-replicas.md)
- **M07 — Monitorización y logging** — [métrica, trazo y log del mismo servicio](labs/M07-monitorizacion-y-logging/00-tres-senales.md)
  - [Prometheus, Grafana y una alerta](labs/M07-monitorizacion-y-logging/01-lab-prometheus-grafana.md)
  - [Jaeger](labs/M07-monitorizacion-y-logging/02-lab-jaeger.md)
  - [Logs en Elasticsearch, Fluent Bit y Kibana](labs/M07-monitorizacion-y-logging/03-lab-logs-efk.md)

## Antes de empezar

| Requisito | Dónde |
|-----------|--------|
| Node.js 22, Docker y la terminal | [infra/README.md](infra/README.md) |
| JavaScript con promesas y HTTP básico | Se usan desde la primera página; el curso no los enseña |
| kind, kubectl y Helm | Solo desde M06; la página de Kubernetes lo comprueba |

Cada demostración y cada laboratorio se hacen solos. Empiezan en su propia carpeta bajo `~/nexo` y, si usan un contenedor, lo borran y lo crean ahí.

## Empieza aquí

→ **[M01 — Node.js en la arquitectura de microservicios](labs/M01-node-en-microservicios/README.md)**
