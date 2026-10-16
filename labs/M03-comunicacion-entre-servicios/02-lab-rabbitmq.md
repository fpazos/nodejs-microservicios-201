# RabbitMQ

[← Página anterior](01-lab-event-emitter.md) · [Siguiente página →](03-lab-kafka.md)

Vas a dejar el hecho `PED-1001` en una cola de RabbitMQ y a leerlo desde otro proceso, que es `notificaciones`.

### Objetivo

Publicar `{ "id": "PED-1001", "sku": "NX-1" }` en la cola `pedidos.creados` y ver esa cadena en el consumidor.

### Punto de partida

```bash
mkdir -p ~/nexo/m03-rabbit && cd ~/nexo/m03-rabbit
npm init -y
npm pkg set type=module
npm install amqplib
docker rm -f nexo-rabbit >/dev/null 2>&1 || true
docker run -d --name nexo-rabbit --hostname nexo-rabbit \
  -p 5672:5672 -p 15672:15672 rabbitmq:3-management
until docker exec nexo-rabbit rabbitmq-diagnostics -q ping; do sleep 2; done
```

- Docker en marcha.
- Consola: `http://127.0.0.1:15672` con usuario `guest` y clave `guest`.
- El ping del `until` acaba cuando el broker acepta comandos. Si la carpeta ya tenía `node_modules`, el `npm install` solo asegura `amqplib`.

### En qué consiste

Arrancas un consumidor que espera, publicas un mensaje y compruebas que la cola se vacía al reconocerlo.

### 1 — Escribe el consumidor

**Acción:** guarda esto como `consumidor.mjs`.

```js
import amqp from 'amqplib';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();
await ch.assertQueue('pedidos.creados', { durable: true });
console.log('esperando pedidos.creados');

ch.consume('pedidos.creados', (msg) => {
  console.log(msg.content.toString());
  ch.ack(msg);
});
```

**Por qué:** `notificaciones` tiene que existir como proceso distinto. `assertQueue` crea la cola si no estaba. El `ack` dice que el aviso ya se ha tratado; sin él, RabbitMQ lo reentregaría.

**Resultado esperado:** `consumidor.mjs` en la carpeta.

### 2 — Arranca el consumidor

**Acción:**

```bash
node consumidor.mjs
```

**Por qué:** si publicas antes de tener consumidor, el mensaje espera en la cola. También vale; aquí lo dejamos escuchando para ver la línea en cuanto salga.

**Resultado esperado:** `esperando pedidos.creados`. La terminal queda ocupada.

### 3 — Escribe el publicador

**Acción:** en otra terminal, `cd ~/nexo/m03-rabbit` y guarda `publicador.mjs`.

```js
import amqp from 'amqplib';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();
await ch.assertQueue('pedidos.creados', { durable: true });

const cuerpo = JSON.stringify({ id: 'PED-1001', sku: 'NX-1' });
ch.sendToQueue('pedidos.creados', Buffer.from(cuerpo), { persistent: true });
console.log('publicado');

await ch.close();
await conn.close();
```

**Por qué:** este es `pedidos` en el momento del alta. `persistent: true` pide que el mensaje sobreviva a un reinicio del broker, alineado con la cola durable.

**Resultado esperado:** el fichero está junto al consumidor.

### 4 — Publica

**Acción:**

```bash
node publicador.mjs
```

**Por qué:** es el salto que `EventEmitter` no daba. El JSON sale de este proceso y entra en el otro.

**Resultado esperado:** esta terminal imprime `publicado` y vuelve al prompt. La terminal del consumidor imprime `{"id":"PED-1001","sku":"NX-1"}`.

### 5 — Mira la cola en la consola

**Acción:** abre `http://127.0.0.1:15672`, entra con `guest` / `guest`, y abre Queues → `pedidos.creados`.

**Por qué:** el ack ha vaciado la cola. Si el consumidor no reconociera el mensaje, aquí habría un ready o un unacked.

**Resultado esperado:** la cola existe y `Ready` está en 0.

## Comprueba tu entendimiento

**El mensaje espera si nadie escucha**
Para el consumidor (Ctrl+C). Vuelve a ejecutar `node publicador.mjs`. Abre la cola en la consola.
→ `Ready` es 1. Arranca otra vez `node consumidor.mjs`: imprime el JSON y `Ready` vuelve a 0.

## Reto

### 1 — Un segundo aviso

Publica también `PED-1002` con el mismo SKU, sin cambiar el nombre de la cola.

<details>
<summary>Ver solución</summary>

En `publicador.mjs`, duplica el `sendToQueue` con `JSON.stringify({ id: 'PED-1002', sku: 'NX-1' })` antes de cerrar el canal. Con el consumidor en marcha, la terminal muestra las dos líneas JSON.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ECONNREFUSED 127.0.0.1:5672` | El contenedor aún no escucha | Espera a que el `until` del punto de partida termine y repite |
| `ACCESS_REFUSED` | Usuario distinto de `guest` | La URL es `amqp://guest:guest@127.0.0.1:5672` |
| El consumidor no imprime y Ready sigue en 1 | El `consume` está en otra cola | El nombre, en los dos ficheros, es `pedidos.creados` |
