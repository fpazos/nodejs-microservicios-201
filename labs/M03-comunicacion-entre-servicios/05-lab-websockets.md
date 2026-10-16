# WebSockets

[← Página anterior](04-lab-grpc.md) · [Siguiente página →](../M04-estado-y-persistencia/README.md)

Vas a mantener abierta la pantalla de seguimiento de Nexo y a empujar el estado de `PED-1001` cuando pase a `en-reparto`.

### Objetivo

Ver dos mensajes en el cliente: primero `aceptado`, después `en-reparto`, sin hacer un GET nuevo.

### Punto de partida

```bash
mkdir -p ~/nexo/m03-ws && cd ~/nexo/m03-ws
npm init -y
npm pkg set type=module
npm install ws
```

- Puerto 3003 libre.

### En qué consiste

Levantas un `WebSocketServer`, conectas un cliente y dejas que el servidor escriba el segundo estado un segundo después.

### 1 — Escribe el servidor

**Acción:** guarda `servidor.mjs`.

```js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3003 });
console.log('ws en 3003');

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ id: 'PED-1001', estado: 'aceptado' }));
  setTimeout(() => {
    socket.send(JSON.stringify({ id: 'PED-1001', estado: 'en-reparto' }));
  }, 1000);
});
```

**Por qué:** la pantalla no pregunta. El canal queda abierto y `notificaciones` escribe cuando el estado cambia. El temporizador sustituye, en el lab, al momento en que el repartidor recoge el paquete.

**Resultado esperado:** `servidor.mjs` creado.

### 2 — Escribe el cliente

**Acción:** guarda `cliente.mjs`.

```js
import WebSocket from 'ws';

const ws = new WebSocket('ws://127.0.0.1:3003');

ws.on('message', (datos) => {
  console.log(datos.toString());
});
```

**Por qué:** este proceso es el navegador del cliente de Nexo. Se suscribe una vez y recibe los dos estados.

**Resultado esperado:** `cliente.mjs` creado.

### 3 — Arranca el servidor

**Acción:**

```bash
node servidor.mjs
```

**Por qué:** el cliente no tiene a quién conectarse si el puerto 3003 está cerrado.

**Resultado esperado:** `ws en 3003`.

### 4 — Conecta el cliente

**Acción:** en otra terminal, desde `~/nexo/m03-ws`,

```bash
node cliente.mjs
```

**Por qué:** al conectar, el servidor manda el estado actual y, un segundo después, el siguiente. Eso es el canal bidireccional que un GET suelto no mantiene: el servidor puede escribir cuando quiera.

**Resultado esperado:** dos líneas. La primera `{"id":"PED-1001","estado":"aceptado"}`. La segunda `{"id":"PED-1001","estado":"en-reparto"}`.

### 5 — Cierra el cliente y mira el servidor

**Acción:** Ctrl+C en el cliente. El servidor sigue en marcha. Vuelve a ejecutar `node cliente.mjs`.

**Por qué:** cada conexión recibe la secuencia. No es una cola: si nadie está conectado en ese segundo, ese empujón no queda guardado para más tarde. Para no perder el hecho está el lab de RabbitMQ o el de Kafka.

**Resultado esperado:** otra vez las dos líneas, en orden.

## Comprueba tu entendimiento

**Sin servidor no hay estado**
Para `servidor.mjs` y ejecuta `node cliente.mjs`.
→ El cliente termina con `ECONNREFUSED` hacia el puerto 3003.

## Reto

### 1 — El cliente pregunta el estado

Haz que, al conectar, el cliente envíe `{"pedir":"PED-1001"}` y el servidor responda `{"id":"PED-1001","estado":"aceptado"}` solo si recibe ese texto.

<details>
<summary>Ver solución</summary>

Sustituye el manejador de conexión por:

```js
wss.on('connection', (socket) => {
  socket.on('message', (datos) => {
    const pedido = JSON.parse(datos.toString());
    if (pedido.pedir === 'PED-1001') {
      socket.send(JSON.stringify({ id: 'PED-1001', estado: 'aceptado' }));
    }
  });
});
```

Y en el cliente, dentro de `ws.on('open', …)`:

```js
ws.on('open', () => {
  ws.send(JSON.stringify({ pedir: 'PED-1001' }));
});
```

Al arrancar, sale una línea con `aceptado`. El canal sirve en los dos sentidos: el cliente escribe y el servidor responde por el mismo socket.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ECONNREFUSED` | El servidor no está, o el cliente apunta a otro puerto | La URL es `ws://127.0.0.1:3003` |
| Solo llega `aceptado` | Has parado el cliente antes del segundo | Espera un segundo |
| `Cannot use import` | El fichero no es módulo | `npm pkg set type=module` y nombres `.mjs` o `.js` con ese flag |
