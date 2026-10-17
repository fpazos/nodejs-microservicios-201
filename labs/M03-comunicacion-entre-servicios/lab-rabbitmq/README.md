# Laboratorio: la cola guarda el trabajo

El ejemplo de RabbitMQ ya publica en `avisos` y el consumidor ya sabe ese nombre. Aquí la cola se llama `trabajos` y el mensaje es `{"tarea":"barrer"}`, pero los dos programas todavía traen un hueco. Primero dejas el acuerdo en un solo sitio y lo compruebas. Después publica el publicador, con el consumidor parado. Al final arranca el consumidor y vuelves a publicar. Kafka está en `ejemplos/03-kafka` para ver el otro broker. Este laboratorio es solo RabbitMQ.

El nombre de la cola y el JSON del mensaje están en [contrato.json](contrato.json).

### Objetivo

Ver `{"tarea":"barrer"}` en el consumidor, y ver `Ready` 1 en la consola si publicas con el consumidor parado.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M03-comunicacion-entre-servicios/lab-rabbitmq
docker compose up -d
until docker exec ms-lab-rabbit rabbitmq-diagnostics -q ping; do sleep 2; done
npm install
```

Consola: http://127.0.0.1:15672 usuario `guest`, clave `guest`.

### 1 — El nombre y el cuerpo, en un solo sitio

**Acción:** crea `mensaje.mjs` con esto.

```js
// Un solo sitio para el acuerdo. Publicador y consumidor leen estas
// dos constantes: si cada uno nombrara la cola por su lado, el mensaje
// se publicaría donde nadie lee.
export const cola = 'trabajos';
export const cuerpo = JSON.stringify({ tarea: 'barrer' });
```

```bash
node --input-type=module -e "import { cola, cuerpo } from './mensaje.mjs'; console.log(cola); console.log(cuerpo)"
```

**Por qué:** el fichero todavía no habla con RabbitMQ. Esta ejecución solo comprueba que el acuerdo está escrito y se puede importar.

**Resultado esperado:**

```text
trabajos
{"tarea":"barrer"}
```

### 2 — Publica, con el consumidor parado

**Acción:** en `publicador.mjs`, sustituye desde el import hasta `sendToQueue` por esto. Borra las líneas `const cola = 'PON_AQUI_LA_COLA'` y `const cuerpo = JSON.stringify(...)`. El `console.log('publicado')` y los `close` se quedan.

```js
import amqp from 'amqplib';
import { cola, cuerpo } from './mensaje.mjs';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();

// Crea `trabajos` si no existe. durable deja la cola en el broker
// para que el mensaje pueda esperar con el consumidor parado.
await ch.assertQueue(cola, { durable: true });

ch.sendToQueue(cola, Buffer.from(cuerpo), { persistent: true });
```

No arranques el consumidor. El suyo sigue en `PON_AQUI_LA_COLA`.

```bash
npm run publicar
```

Abre Queues → `trabajos` en la consola.

**Por qué:** la cola es el sitio donde el aviso sobrevive al proceso que lo va a tratar. Sin nadie en `consume`, el mensaje se queda en Ready.

**Resultado esperado:** `publicado` en la terminal. En la consola, `Ready` es 1.

### 3 — El consumidor lee esa misma cola

**Acción:** en `consumidor.mjs`, sustituye desde el import hasta `assertQueue` por esto y borra `const cola = 'PON_AQUI_LA_COLA'`. El `consume` se queda.

```js
import amqp from 'amqplib';
import { cola } from './mensaje.mjs';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();

// La misma cadena que usó el publicador. assertQueue aquí no crea otra cola:
// se engancha a `trabajos`, que ya tiene el mensaje en Ready.
await ch.assertQueue(cola, { durable: true });
```

```bash
npm run consumir
```

Al guardar `consumidor.mjs`, o un fichero que ya importe, el proceso se recarga solo. No hace falta Ctrl+C ni volver a lanzar `npm run consumir`. La cola sigue en RabbitMQ.

**Por qué:** al reconocer el mensaje (`ack`), RabbitMQ lo quita de Ready. El cuerpo que imprime es el que publicó el paso anterior.

**Resultado esperado:** la terminal imprime `esperando trabajos` y `{"tarea":"barrer"}`. En la consola, `Ready` vuelve a 0. Deja este proceso en marcha.

### 4 — Publica con el consumidor en marcha

**Acción:** en otra terminal, desde esta carpeta, `npm run publicar`.

**Por qué:** con alguien escuchando, el aviso no se queda en Ready: pasa al proceso.

**Resultado esperado:** otra línea `{"tarea":"barrer"}` en el consumidor. `Ready` sigue en 0.

## Así se ve

El publicador dice `publicado`. El consumidor imprime `{"tarea":"barrer"}` una vez por cada publicación.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Otra cola no recibe el mensaje**
En `publicador.mjs`, usa la cadena `otras` en `assertQueue` y en `sendToQueue`, y publica. El consumidor sigue leyendo `cola` desde `mensaje.mjs`.
→ El consumidor no imprime. En la consola aparece la cola `otras` con Ready 1. Vuelve a dejar `cola` en el publicador.

## Reto

### 1 — Otra tarea, el mismo consumidor

Con el consumidor en marcha y el publicador otra vez usando `cola`, cambia el cuerpo del acuerdo para que la tarea sea `fregar` y publica otra vez.

<details>
<summary>Ver solución</summary>

En `mensaje.mjs`:

```js
// Mismo acuerdo, otra tarea. El consumidor sigue leyendo esta constante.
export const cuerpo = JSON.stringify({ tarea: 'fregar' });
```

```bash
npm run publicar
```

El consumidor imprime `{"tarea":"fregar"}`. En la consola, `Ready` sigue en 0: había alguien escuchando `trabajos`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ECONNREFUSED` | El `until` no terminó | Espera el ping y repite |
| Ready no baja | El consumidor está en otra cola, o no hace `ack` | Misma cadena `trabajos` y `ch.ack(msg)` |
| `cola` ya está declarada | Quedó el `const cola = 'PON_AQUI_LA_COLA'` junto al import | Borra esa línea. La cola llega de `mensaje.mjs` |
