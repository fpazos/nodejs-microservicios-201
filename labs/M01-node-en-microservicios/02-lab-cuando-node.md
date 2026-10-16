# Cuándo Node

[← Página anterior](01-lab-concurrencia.md) · [Siguiente página →](../M02-apis-rest-express/README.md)

Vas a ocupar el hilo con un cálculo y a ver que `/salud` se para, aunque la función esté marcada como `async`. Con eso sitúas el catálogo de Nexo frente a Java, Python y Go.

### Objetivo

Dejar un servidor en el que `fibonacci` bloquea `/salud`, y decidir qué runtime encaja en tres trabajos de Nexo.

### Punto de partida

```bash
mkdir -p ~/nexo/m01-cpu && cd ~/nexo/m01-cpu
```

- Node.js 22. Puerto 3001 libre.
- Esta página no usa el código del lab anterior.

### En qué consiste

Arrancas un servidor con una ruta de cálculo y otra de salud, mides `/salud` durante el cálculo y cierras con tres casos: el API, un informe pesado y un chat de seguimiento.

### 1 — Crea el servidor de cálculo

**Acción:** guarda esto como `cpu.mjs`.

```js
import { createServer } from 'node:http';

function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

const server = createServer(async (req, res) => {
  if (req.url === '/informe') {
    const valor = fib(40);
    res.end(String(valor));
    return;
  }
  res.end('ok');
});

server.listen(3001, () => console.log('cpu en 3001'));
```

**Por qué:** `fib(40)` es el informe de rutas que alguien podría intentar meter en el mismo proceso del catálogo. La función es `async` y, aun así, no hay ningún `await`: el hilo no se suelta.

**Resultado esperado:** existe `cpu.mjs`.

### 2 — Arráncalo

**Acción:**

```bash
node cpu.mjs
```

**Por qué:** hay que tener el puerto abierto para medir el bloqueo.

**Resultado esperado:** `cpu en 3001`.

### 3 — Pide el informe y la salud a la vez

**Acción:** en otra terminal,

```bash
curl -s -w '\n%{time_total}s informe\n' http://127.0.0.1:3001/informe &
curl -s -w '\n%{time_total}s salud\n' http://127.0.0.1:3001/salud &
wait
```

**Por qué:** este es el síntoma de meter trabajo de CPU en el proceso que atiende la red de Nexo. El número de Fibonacci acaba saliendo; la salud no se adelanta.

**Resultado esperado:** `/salud` tarda lo mismo que `/informe`, del orden de un segundo o más, según la máquina. El cuerpo del informe es `102334155`. El de la salud es `ok`, y llega tarde.

> [!TIP]
> Si `fib(40)` tarda demasiado en el aula, cambia el argumento a `38` en los dos sitios: la llamada y, si comparas, el resultado. El bloqueo se ve igual.

### 4 — Contrasta con una salud en reposo

**Acción:** cuando los `curl` hayan terminado y el servidor siga en marcha,

```bash
curl -s -w '\n%{time_total}s salud\n' http://127.0.0.1:3001/salud
```

**Por qué:** confirma que el proceso está bien. El retraso del paso anterior venía del cálculo, no de un puerto caído.

**Resultado esperado:** `ok` y un tiempo muy bajo.

## Comprueba tu entendimiento

**El async no parte el cálculo**
Abre `cpu.mjs` y localiza `async (req, res)` y la llamada `fib(40)`.
→ No hay `await` entre el inicio del cálculo y `res.end`. Por eso `/salud` espera.

## Reto

### 1 — Tres trabajos de Nexo

Asigna runtime a cada trabajo y di por qué en una frase. Los runtimes son Node.js, Java, Python y Go. Puedes repetir.

1. API del catálogo: muchas lecturas de stock, cada una espera a MongoDB.
2. Optimizar la ruta de 2 000 paradas en un batch nocturno.
3. Chat de seguimiento del repartidor: muchas conexiones abiertas y mensajes pequeños.

<details>
<summary>Ver solución</summary>

1. **Node.js.** El tiempo se va en I/O. El bucle atiende más lecturas mientras MongoDB responde. Java o Go también sirven; Python con `asyncio` también. El encaje de Node es directo.
2. **Go o Java.** Es CPU. En Node pararía el API si compartiera proceso, como acaba de pasar con `fib(40)`. Python necesitaría varios procesos por el GIL.
3. **Node.js o Go.** Muchas conexiones y poca CPU: el mismo patrón que el plazo con `setTimeout`. Java lo resuelve con un runtime de I/O no bloqueante; también vale, con más maquinaria.

PayPal usó Node en la capa de experiencia de cuenta, y Netflix en parte del borde de interfaz, por el patrón 1 y el 3: mucha red, poca CPU por petición. El batch del punto 2 no es ese caso.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `/informe` tarda varios minutos | `fib` con un número mayor que 40, o una máquina justa | Usa `fib(38)` |
| `ok` sale al instante durante el informe | El `curl` de salud se lanzó cuando el cálculo ya había terminado | Lanza los dos en el mismo bloque, con `&` y `wait` |
| `Cannot find module` | No estás en `~/nexo/m01-cpu` | `cd ~/nexo/m01-cpu` y vuelve a arrancar |
