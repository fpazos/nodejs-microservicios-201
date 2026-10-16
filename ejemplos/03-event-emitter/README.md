# EventEmitter

El aviso `alarma` solo existe en el objeto `bus` de ese proceso. Otro `node` con el mismo nombre de evento no comparte el objeto.

## Cómo ejecutarlo

```bash
cd ejemplos/03-event-emitter
node mismo-proceso.mjs
```

Imprime `oyente hall` y termina.

```bash
node otro-proceso.mjs
```

Déjalo en marcha. En otra terminal, desde la misma carpeta:

```bash
node mismo-proceso.mjs
```

## Qué se ve

`mismo-proceso.mjs` imprime el aviso en su terminal. `otro-proceso.mjs` no imprime nada. El nombre `alarma` no es una cola.
