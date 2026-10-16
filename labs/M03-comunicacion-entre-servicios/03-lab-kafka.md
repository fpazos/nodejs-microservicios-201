# Kafka

[← Página anterior](02-lab-rabbitmq.md) · [Siguiente página →](04-lab-grpc.md)

Vas a dejar el mismo hecho de Nexo, `PED-1001`, en un topic de Kafka y a leerlo con el grupo `notificaciones`.

### Objetivo

Ver `{"id":"PED-1001","sku":"NX-1"}` en un consumidor KafkaJS suscrito a `pedidos.creados`.

### Punto de partida

```bash
mkdir -p ~/nexo/m03-kafka && cd ~/nexo/m03-kafka
npm init -y
npm pkg set type=module
npm install kafkajs
docker rm -f nexo-broker >/dev/null 2>&1 || true
```

Guarda este `docker-compose.yml` en la misma carpeta y levántalo:

```yaml
services:
  broker:
    image: apache/kafka:3.9.0
    hostname: broker
    container_name: nexo-broker
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT"
      KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT_HOST://localhost:9092,PLAINTEXT://broker:19092"
      KAFKA_PROCESS_ROLES: "broker,controller"
      KAFKA_CONTROLLER_QUORUM_VOTERS: "1@broker:29093"
      KAFKA_LISTENERS: "CONTROLLER://:29093,PLAINTEXT_HOST://:9092,PLAINTEXT://:19092"
      KAFKA_INTER_BROKER_LISTENER_NAME: "PLAINTEXT"
      KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      CLUSTER_ID: "4L6g3nShT-eMCtK--X86sw"
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_LOG_DIRS: "/tmp/kraft-combined-logs"
```

```bash
docker compose up -d
```

- Un solo broker KRaft. Desde el portátil el cliente usa `127.0.0.1:9092`.
- La primera arrancada elige controlador antes de aceptar productores. El publicador de esta página reintenta la conexión.

### En qué consiste

Dejas el consumidor escuchando el topic desde el principio, publicas el pedido y ves el offset avanzar en ese grupo.

### 1 — Escribe el consumidor

**Acción:** guarda `consumidor.mjs`.

```js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'notificaciones', brokers: ['127.0.0.1:9092'] });
const consumer = kafka.consumer({ groupId: 'notificaciones' });

await consumer.connect();
await consumer.subscribe({ topic: 'pedidos.creados', fromBeginning: true });
console.log('grupo notificaciones en pedidos.creados');

await consumer.run({
  eachMessage: async ({ message }) => {
    console.log(message.value.toString());
  },
});
```

**Por qué:** el grupo es la memoria de Kafka. RabbitMQ quitaba el mensaje con el ack; aquí el mensaje sigue en el topic y el grupo recuerda el offset. `fromBeginning` permite ver lo que se publicó antes de arrancar, en este laboratorio de un solo uso.

**Resultado esperado:** `consumidor.mjs` creado.

### 2 — Arranca el consumidor

**Acción:**

```bash
node consumidor.mjs
```

**Por qué:** KafkaJS crea el topic al suscribirse si el broker lo permite, que es el comportamiento por defecto de esta imagen.

**Resultado esperado:** `grupo notificaciones en pedidos.creados`. Si la primera línea tarda, el broker aún estaba eligiendo controlador: el proceso acaba conectando. Déjalo en marcha.

### 3 — Escribe el publicador

**Acción:** guarda `publicador.mjs`.

```js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'pedidos', brokers: ['127.0.0.1:9092'] });
const producer = kafka.producer();

for (let i = 0; i < 15; i += 1) {
  try {
    await producer.connect();
    break;
  } catch (err) {
    if (i === 14) throw err;
    await new Promise((r) => setTimeout(r, 2000));
  }
}

await producer.send({
  topic: 'pedidos.creados',
  messages: [{ value: JSON.stringify({ id: 'PED-1001', sku: 'NX-1' }) }],
});
console.log('publicado');
await producer.disconnect();
```

**Por qué:** es el mismo JSON que en RabbitMQ, para que se vea el buzón y no un pedido distinto. El bucle cubre el arranque del controlador.

**Resultado esperado:** el fichero está en la carpeta.

### 4 — Publica

**Acción:** en otra terminal, dentro de `~/nexo/m03-kafka`,

```bash
node publicador.mjs
```

**Por qué:** `pedidos` y `notificaciones` no comparten proceso. El topic es el sitio donde el hecho espera.

**Resultado esperado:** `publicado` en esta terminal. En la del consumidor, `{"id":"PED-1001","sku":"NX-1"}`.

## Comprueba tu entendimiento

**El grupo no es la cola de RabbitMQ**
Para el consumidor y vuelve a arrancarlo (`node consumidor.mjs`) sin publicar de nuevo.
→ Con `fromBeginning: true` y un grupo que ya tenía offset, no reimprime el mensaje: el offset ya pasó. (Si borras el grupo o cambias `groupId`, vuelve a salir.)

## Reto

### 1 — Otro grupo sí relee

Cambia `groupId` a `auditoria` en una copia del consumidor y arráncalo sin publicar otra vez.

<details>
<summary>Ver solución</summary>

```js
const consumer = kafka.consumer({ groupId: 'auditoria' });
```

Ese proceso imprime `{"id":"PED-1001","sku":"NX-1"}`. El topic conserva el mensaje; cada grupo tiene su offset. En RabbitMQ, dos colas harían falta para el mismo doble lectura, o un exchange con dos enlaces.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ECONNREFUSED` tras los reintentos | El contenedor no está | `docker ps` tiene que mostrar `nexo-broker`. Si la imagen no existe, fija la etiqueta 3.9 que haya en el registro y repite `docker compose up -d` |
| El consumidor imprime nada | Se arrancó después del publicador con otro `groupId` que ya consumió, o el topic está vacío | Publica otra vez con el consumidor en marcha |
| `docker compose` no encuentra el YAML | No estás en `~/nexo/m03-kafka` | `cd` a esa carpeta |
