# Laboratorio: el evento no sale del proceso

El ejemplo de EventEmitter ya escucha y emite en el mismo fichero. Aquí `emisor.mjs` dispara `sensor` y nadie escucha. Tú creas el oyente y lo enganchas con dos líneas. `oyente.mjs` es otro proceso.

### Objetivo

Ver `sala lab` en el mismo proceso y comprobar que `oyente.mjs` no imprime ese aviso.

### Punto de partida

```bash
cd labs/M03-comunicacion-entre-servicios/lab-eventos
node emisor.mjs
```

Termina sin imprimir `sala lab`.

### 1 — Crea `escucha.mjs` y enganchalo

**Acción:** crea `escucha.mjs` con esto.

```js
export function escuchar(bus) {
  bus.on('sensor', (aviso) => {
    console.log('sala', aviso.sala);
  });
}
```

En `emisor.mjs`, añade el import junto al otro, y la llamada antes del `emit`.

```js
import { escuchar } from './escucha.mjs';
```

```js
escuchar(bus);
bus.emit('sensor', { sala: 'lab' });
```

```bash
node emisor.mjs
```

**Por qué:** el `bus` de este fichero es el único que recibe el `emit`. El oyente tiene que estar registrado antes de emitir.

**Resultado esperado:** `sala lab`.

### 2 — Un segundo oyente, el mismo proceso

**Acción:** en `escucha.mjs`, añade otro `bus.on` dentro de `escuchar`.

```js
bus.on('sensor', (aviso) => {
  console.log('registro', aviso.sala);
});
```

Vuelve a ejecutar `node emisor.mjs`.

**Por qué:** en el mismo objeto puedes tener dos funciones. Siguen siendo un solo proceso.

**Resultado esperado:** dos líneas, `sala lab` y `registro lab`.

### 3 — El otro proceso

**Acción:** en `oyente.mjs`, antes del `setInterval`, añade esto.

```js
bus.on('sensor', (aviso) => {
  console.log('sala', aviso.sala);
});
```

Arranca `node oyente.mjs`. En otra terminal, `node emisor.mjs`.

**Por qué:** cada `new EventEmitter()` es un bus distinto. El nombre `sensor` no cruza procesos. Para eso está la cola del laboratorio de RabbitMQ.

**Resultado esperado:** `emisor.mjs` imprime sus dos líneas. `oyente.mjs` no imprime `sala lab`. Páralo con Ctrl+C.

## Si quieres probar

En `emisor.mjs`, mueve `escuchar(bus)` a después del `emit` y vuelve a ejecutar. El aviso ya salió antes de que nadie escuchara: silencio, y el proceso termina. Déjalo otra vez antes del `emit`.

## Así se ve

`node emisor.mjs` imprime las dos líneas. `oyente.mjs`, en la otra terminal, no imprime `sala lab`.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Quitar el enganche**
Comenta `escuchar(bus)`, deja el `emit`, ejecuta `node emisor.mjs`.
→ Silencio. Emitir sin oyente en ese objeto no falla y no llega a ningún sitio.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `oyente.mjs` imprime el aviso | Estás mirando la terminal del emisor | El oyente es el proceso que no termina solo |
| `Cannot find module` | Falta `escucha.mjs` o no estás en esta carpeta | El fichero al lado de `emisor.mjs` |
