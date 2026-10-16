# Laboratorio: el evento no sale del proceso

El ejemplo de EventEmitter ya escucha y emite en el mismo fichero. Aquí el emisor dispara `sensor` y nadie escucha. El otro fichero es otro proceso.

### Objetivo

Ver `sala lab` en el mismo proceso y comprobar que `oyente.mjs` no imprime ese aviso.

### Punto de partida

```bash
cd labs/M03-comunicacion-entre-servicios/lab-eventos
node emisor.mjs
```

Termina sin imprimir `sala lab`.

### 1 — Escucha en el mismo fichero

**Acción:** en `emisor.mjs`, antes del `emit`:

```js
bus.on('sensor', (aviso) => {
  console.log('sala', aviso.sala);
});
```

```bash
node emisor.mjs
```

**Por qué:** el `bus` de este fichero es el único que recibe el `emit`.

**Resultado esperado:** `sala lab`.

### 2 — Un segundo oyente, el mismo proceso

**Acción:** añade otro `bus.on('sensor', ...)` que imprima `registro lab`. Vuelve a ejecutar.

**Por qué:** en el mismo objeto puedes tener dos funciones. Siguen siendo un solo proceso.

**Resultado esperado:** dos líneas, `sala lab` y `registro lab`.

### 3 — El otro proceso

**Acción:** en `oyente.mjs`, antes del `setInterval`, suscríbete al mismo nombre:

```js
bus.on('sensor', (aviso) => {
  console.log('sala', aviso.sala);
});
```

Arranca `node oyente.mjs`. En otra terminal, `node emisor.mjs`.

**Por qué:** cada `new EventEmitter()` es un bus distinto. El nombre `sensor` no cruza procesos. Para eso está la cola del laboratorio de RabbitMQ.

**Resultado esperado:** `emisor.mjs` imprime sus dos líneas. `oyente.mjs` no imprime `sala lab`. Páralo con Ctrl+C.

## Comprueba tu entendimiento

**Quitar los `on` del emisor**
Borra los dos `bus.on` de `emisor.mjs`, deja el `emit`, ejecuta `node emisor.mjs`.
→ Silencio. Emitir sin oyente en ese objeto no falla y no llega a ningún sitio.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `oyente.mjs` imprime el aviso | Estás mirando la terminal del emisor | El oyente es el proceso que no termina solo |
| `Cannot find module` | No estás en esta carpeta | `cd` a `lab-eventos` |
