# Ejemplos

Cada carpeta se ejecuta sola. Trae su `package.json`, el código y, si hace falta, el Compose o los Dockerfile. No continúan una historia de una carpeta a la siguiente. El concepto de cada una está en la página del módulo, enlazada al principio de su README.

Si un puerto está ocupado por otro ejemplo, desde la raíz del repo:

```bash
bash scripts/limpiar-entorno.sh
```

| Carpeta | Qué aísla |
|---------|-----------|
| [01-io-no-bloqueante](01-io-no-bloqueante/README.md) | El hilo libre mientras una espera está pendiente |
| [01-cpu-bloquea](01-cpu-bloquea/README.md) | Un cálculo que para `/salud` aunque la función sea `async` |
| [02-rutas-http](02-rutas-http/README.md) | GET, POST, PUT y DELETE |
| [02-joi-errores](02-joi-errores/README.md) | Joi y el código HTTP |
| [02-middleware](02-middleware/README.md) | Log, compresión y una clave |
| [03-event-emitter](03-event-emitter/README.md) | Un evento que no sale del proceso |
| [03-rabbitmq](03-rabbitmq/README.md) | Una cola |
| [03-kafka](03-kafka/README.md) | El mismo aviso en un topic y un grupo |
| [03-grpc](03-grpc/README.md) | Un `.proto` y el GET equivalente |
| [03-websockets](03-websockets/README.md) | Un canal abierto en los dos sentidos |
| [03-consul](03-consul/README.md) | Registrarse y descubrir |
| [03-gateway](03-gateway/README.md) | Un puerto delante de dos servicios |
| [04-mongoose](04-mongoose/README.md) | Un documento en MongoDB |
| [04-sequelize](04-sequelize/README.md) | Una fila en PostgreSQL |
| [04-redis-cache](04-redis-cache/README.md) | La segunda lectura en Redis |
| [04-cqrs](04-cqrs/README.md) | Escribir en un sitio y leer en otro |
| [05-jwt](05-jwt/README.md) | Token y rol |
| [05-oauth](05-oauth/README.md) | Authorization code con Passport |
| [05-cifrado](05-cifrado/README.md) | bcrypt, un campo cifrado y TLS |
| [06-dockerfile](06-dockerfile/README.md) | Una imagen de Node |
| [06-compose](06-compose/README.md) | Dos contenedores y un nombre de red |
| [06-kubernetes](06-kubernetes/README.md) | Deployment, Service y un volumen, con kind |
| [06-helm](06-helm/README.md) | Chart, réplicas y un HPA |
| [07-prometheus](07-prometheus/README.md) | `/metrics`, Grafana y una alerta |
| [07-jaeger](07-jaeger/README.md) | Un trazo |
| [07-logs](07-logs/README.md) | Stdout hasta Elasticsearch |

Los laboratorios están en `labs/` y no repiten estos programas.
