# I/O no bloqueante

Un proceso Node atiende `/plazo` (tarda 3 segundos) y `/salud`. Hay dos programas. Solo uno puede usar el puerto 3001.

`bloqueante.mjs` espera con un bucle: el hilo no se suelta. `red.mjs` registra la espera con `setTimeout`, que aquí hace de llamada de red todavía no llegada.

## Cómo ejecutarlo

```bash
cd ejemplos/01-io-no-bloqueante
node bloqueante.mjs
```

En otra terminal:

```bash
curl -s -w '\n%{time_total}s plazo\n' http://127.0.0.1:3001/plazo &
curl -s -w '\n%{time_total}s salud\n' http://127.0.0.1:3001/salud &
wait
```

Para el proceso (Ctrl+C) y repite con `node red.mjs` y los mismos `curl`.

## Qué se ve

Con el bucle, `/salud` tarda lo mismo que `/plazo`. Con el temporizador, `/salud` responde `ok` al momento y `plazo-listo` llega unos 3 segundos después.

Este ejemplo no tiene laboratorio. El módulo 1 se mira y se contrasta con el ejemplo de CPU.
