# EventEmitter

[← Página anterior](00-tres-formas-de-hablar.md) · [Siguiente página →](02-lab-rabbitmq.md)

Vas a avisar, dentro de un solo proceso, de que existe `PED-1001`, y a comprobar que otro proceso no se entera.

### Objetivo

Ver en la misma terminal la línea `notificaciones PED-1001`, y ver que un segundo `node` suscrito al mismo nombre de evento no imprime nada.

### Punto de partida

```bash
mkdir -p ~/nexo/m03-eventos && cd ~/nexo/m03-eventos
```

- Node.js 22. Sin npm y sin Docker: `EventEmitter` viene en el runtime.

### En qué consiste

Un fichero emite y escucha. Otro fichero solo escucha, en otro proceso, y se queda en silencio.

### 1 — Crea el proceso que emite y escucha

**Acción:** guarda esto como `mismo-proceso.mjs`.

```js
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();

bus.on('pedido:creado', (pedido) => {
  console.log('notificaciones', pedido.id, pedido.sku);
});

bus.emit('pedido:creado', { id: 'PED-1001', sku: 'NX-1' });
```

**Por qué:** así es el monolito de Nexo. El alta y el aviso son dos funciones que comparten memoria. Funciona, y no cruza la frontera del proceso.

**Resultado esperado:** el fichero está en la carpeta.

### 2 — Ejecútalo

**Acción:**

```bash
node mismo-proceso.mjs
```

**Por qué:** hay que ver el aviso antes de compararlo con el proceso aislado.

**Resultado esperado:** una línea `notificaciones PED-1001 NX-1`. El programa termina.

### 3 — Crea un listener en otro fichero

**Acción:** guarda esto como `otro-proceso.mjs`.

```js
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();

bus.on('pedido:creado', (pedido) => {
  console.log('notificaciones', pedido.id);
});

setInterval(() => {}, 1000);
```

**Por qué:** este objeto `bus` es otro. Aunque el nombre del evento coincida, no está conectado al emisor. El `setInterval` solo mantiene el proceso vivo para que se vea que sigue sin imprimir.

**Resultado esperado:** `otro-proceso.mjs` creado.

### 4 — Arranca el listener y, en otra terminal, el emisor

**Acción:**

```bash
node otro-proceso.mjs
```

En otra terminal, desde la misma carpeta:

```bash
node mismo-proceso.mjs
```

**Por qué:** este es el límite. `notificaciones` ya no vive en el proceso de `pedidos`. El evento no atraviesa esa frontera, así que Nexo necesita un buzón.

**Resultado esperado:** `mismo-proceso.mjs` imprime `notificaciones PED-1001 NX-1` en su terminal. `otro-proceso.mjs` no imprime el pedido. Para el listener con Ctrl+C.

## Comprueba tu entendimiento

**El nombre del evento no es una cola**
En `otro-proceso.mjs` el evento se llama `pedido:creado`, igual que en el emisor.
→ No aparece `PED-1001` en esa terminal. Cada `new EventEmitter()` es un bus distinto.

## Reto

### 1 — Dos oyentes en el mismo proceso

Haz que, además de `notificaciones`, un segundo `bus.on` imprima `auditoria PED-1001`.

<details>
<summary>Ver solución</summary>

En `mismo-proceso.mjs`, antes del `emit`:

```js
bus.on('auditoria', (pedido) => {
  console.log('auditoria', pedido.id);
});
bus.on('pedido:creado', (pedido) => {
  console.log('auditoria', pedido.id);
});
```

Basta el segundo `on` sobre `pedido:creado`. Al ejecutar, salen dos líneas: la de notificaciones y `auditoria PED-1001`. Siguen siendo el mismo proceso.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `otro-proceso.mjs` también imprime el pedido | Estás mirando la terminal del emisor | El listener es el proceso que no termina solo |
| El listener termina al instante | Falta el `setInterval` (o un `setTimeout` largo) | Déjalo como en el paso 3 |
| `ERR_UNKNOWN_FILE_EXTENSION` | El fichero se llama `.js` y el proyecto no es módulo | Usa el nombre `.mjs` |
