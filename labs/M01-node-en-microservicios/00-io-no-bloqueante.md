# I/O no bloqueante

[← Página anterior](README.md) · [Siguiente página →](01-lab-concurrencia.md)

En Nexo, consultar el plazo de un transportista tarda. Mientras esa respuesta no llega, el resto de clientes sigue pidiendo el stock de `NX-1`. El proceso Node no abre un hilo por cliente: registra la espera y sigue.

## Punto de partida

- Terminal con Node.js 22 (`node -v` muestra la rama 22).
- Carpeta vacía:

```bash
mkdir -p ~/nexo/m01-demo && cd ~/nexo/m01-demo
```

- No hay servicios previos. Los dos programas de esta página se crean aquí.

## Recorrido

1. El fichero `bloqueante.mjs` atiende el puerto 3001. La ruta `/plazo` ocupa el hilo con un bucle de espera. La ruta `/salud` solo responde `ok`.

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

server.listen(3001);
```

2. Con el proceso en marcha, un `curl` a `/plazo` tarda unos tres segundos y escribe `plazo-listo`. Un segundo `curl` a `/salud`, lanzado mientras el primero sigue dentro del bucle, no escribe `ok` hasta que el bucle termina. El hilo está ocupado: no hay I/O, hay espera activa.

3. El fichero `red.mjs` sustituye el bucle por un temporizador. El temporizador es la pieza que, en un servicio real, sería el socket hacia el transportista: el proceso suelta el hilo hasta que algo avisa.

```js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === '/plazo') {
    setTimeout(() => res.end('plazo-listo'), 3000);
    return;
  }
  res.end('ok');
});

server.listen(3001);
```

4. Con este proceso, `/plazo` sigue tardando tres segundos en escribir `plazo-listo`. `/salud`, pedido en ese intervalo, escribe `ok` al momento. La espera está registrada fuera del hilo de JavaScript. Esa es la ventaja cuando el microservicio vive de operaciones de red: acepta más trabajo mientras las respuestas ajenas no han llegado.

5. Los dos programas escuchan el mismo puerto. Solo uno puede estar arrancado. El que usa el bucle y el que usa el temporizador no se diferencian en el JSON de negocio: se diferencian en si el hilo queda libre.

## Qué queda visto

El I/O no bloqueante no acelera el plazo del transportista. Deja que `/salud` y el stock sigan respondiendo mientras ese plazo está pendiente. El laboratorio [01 — Concurrencia](01-lab-concurrencia.md) construye los dos servidores desde cero; se puede hacer sin haber seguido este recorrido.
