# Concurrencia

[← Página anterior](00-io-no-bloqueante.md) · [Siguiente página →](02-lab-cuando-node.md)

Vas a dejar dos servidores del plazo de Nexo y a comprobar cuál deja responder `/salud` mientras el plazo sigue pendiente.

### Objetivo

Ver `ok` de `/salud` antes de que termine un `/plazo` de tres segundos, en el servidor que suelta el hilo, y ver lo contrario en el que lo ocupa.

### Punto de partida

```bash
mkdir -p ~/nexo/m01-concurrencia && cd ~/nexo/m01-concurrencia
node -v
```

- Node.js 22.
- Puerto 3001 libre. Si un proceso lo usa, páralo con Ctrl+C en esa terminal.
- No hace falta la página anterior: los ficheros se crean aquí.

### En qué consiste

Escribes el servidor que espera en un bucle, lanzas dos `curl` y anotas el orden. Luego paras ese proceso, escribes el servidor con `setTimeout` y repites los dos `curl`.

### 1 — Crea el servidor que ocupa el hilo

**Acción:** guarda esto como `bloqueante.mjs`.

```js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === '/plazo') {
    const hasta = Date.now() + 3000;
    while (Date.now() < hasta) {}
    res.end('plazo-listo');
    return;
  }
  res.end('ok');
});

server.listen(3001, () => console.log('bloqueante en 3001'));
```

**Por qué:** este es el transportista mal integrado. La espera no es una operación de red: es un bucle que no suelta el hilo, así que el stock y la salud de Nexo quedan detrás.

**Resultado esperado:** el fichero está en `~/nexo/m01-concurrencia/bloqueante.mjs`.

### 2 — Arráncalo

**Acción:**

```bash
node bloqueante.mjs
```

**Por qué:** hace falta el proceso escuchando antes de medir el orden de las respuestas.

**Resultado esperado:** una línea `bloqueante en 3001`. La terminal queda ocupada. Abre otra para los `curl`.

### 3 — Pide el plazo y la salud a la vez

**Acción:** en la otra terminal,

```bash
curl -s -w '\n%{time_total}s plazo\n' http://127.0.0.1:3001/plazo &
curl -s -w '\n%{time_total}s salud\n' http://127.0.0.1:3001/salud &
wait
```

**Por qué:** si el hilo está dentro del bucle, la salud no puede adelantarse. Es el fallo que verían los clientes del catálogo mientras alguien consulta un plazo.

**Resultado esperado:** las dos líneas tardan en torno a tres segundos. `ok` no aparece al instante. `plazo-listo` y `ok` salen cuando el bucle acaba.

### 4 — Para ese proceso y crea el servidor de red

**Acción:** en la terminal del servidor, Ctrl+C. Guarda esto como `red.mjs`.

```js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === '/plazo') {
    setTimeout(() => res.end('plazo-listo'), 3000);
    return;
  }
  res.end('ok');
});

server.listen(3001, () => console.log('red en 3001'));
```

**Por qué:** `setTimeout` registra la espera y devuelve el control. Es el mismo hueco que deja un `await` de una llamada HTTP al transportista.

**Resultado esperado:** el fichero `red.mjs` está junto a `bloqueante.mjs`. El puerto 3001 ya no tiene el proceso anterior.

### 5 — Arranca el servidor de red

**Acción:**

```bash
node red.mjs
```

**Por qué:** hay que repetir la medición sobre el modelo que sí usa Nexo en el borde.

**Resultado esperado:** `red en 3001`.

### 6 — Repite las dos peticiones

**Acción:** en la otra terminal, el mismo bloque de `curl` del paso 3.

**Por qué:** la diferencia tiene que verse en el tiempo de `/salud`, no en el texto del plazo. El plazo sigue tardando tres segundos: lo que cambia es que el catálogo no se queda detrás.

**Resultado esperado:** `ok` y un tiempo de `/salud` muy por debajo de un segundo. `plazo-listo` llega después, cerca de los tres segundos.

## Comprueba tu entendimiento

**La salud no espera al plazo**
Con `red.mjs` en marcha, ejecuta solo `curl -s -w '\n%{time_total}\n' http://127.0.0.1:3001/salud` mientras no hay ningún `/plazo` en curso.
→ El cuerpo es `ok` y el tiempo es una fracción de segundo.

## Reto

### 1 — Un tercer cliente

Con `red.mjs` arrancado, lanza tres `/plazo` en paralelo y, en medio, un `/salud`.

<details>
<summary>Ver solución</summary>

```bash
curl -s http://127.0.0.1:3001/plazo &
curl -s http://127.0.0.1:3001/plazo &
curl -s http://127.0.0.1:3001/plazo &
curl -s -w '\n%{time_total}s salud\n' http://127.0.0.1:3001/salud &
wait
```

`/salud` sigue respondiendo `ok` al momento. Los tres plazos terminan cada uno con `plazo-listo`. El bucle de eventos ha registrado tres esperas; no las ha puesto en fila dentro del hilo.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `EADDRINUSE` al arrancar | El servidor anterior sigue en 3001 | Ctrl+C en su terminal, o `fuser -k 3001/tcp` |
| `/salud` tarda también con `red.mjs` | Sigue corriendo `bloqueante.mjs` | Mira el log: tiene que decir `red en 3001` |
| `curl` no imprime nada y vuelve al momento | El `&` lanzó el trabajo y no esperaste | Añade `wait` al final del bloque |
