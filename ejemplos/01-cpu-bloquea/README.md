# Cuando el trabajo es CPU

`/informe` calcula un Fibonacci en el mismo proceso que `/salud`. La función del servidor es `async` y no hay ningún `await`: el hilo sigue ocupado.

## Cómo ejecutarlo

Para el proceso del ejemplo anterior si sigue en el puerto 3001.

```bash
cd ejemplos/01-cpu-bloquea
node cpu.mjs
```

```bash
curl -s -w '\n%{time_total}s informe\n' http://127.0.0.1:3001/informe &
curl -s -w '\n%{time_total}s salud\n' http://127.0.0.1:3001/salud &
wait
```

## Qué se ve

`/informe` responde `102334155`. `/salud` no se adelanta: espera a que termine el cálculo.

| Runtime | Mucha red, poca CPU por petición | Un cálculo largo |
|---------|----------------------------------|------------------|
| Node.js | El bucle sigue atendiendo mientras la red responde | Para el proceso, como este `/informe` |
| Java | Hilos o un runtime de I/O no bloqueante | Varios hilos, más memoria por servicio |
| Python | `asyncio` para la red; el GIL limita el bytecode en un proceso | Varios procesos |
| Go | Muchas goroutines sobre pocos hilos | También reparte CPU |

Node se ha usado en bordes de mucha conexión y poca CPU (la capa de cuenta de PayPal, parte del borde de interfaz de Netflix). Un batch de cálculo no es ese caso.
