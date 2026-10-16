# CPU, y Node frente a Java, Python y Go

[← I/O no bloqueante](00-io-no-bloqueante.md) · [Siguiente página →](../M02-apis-rest-express/00-rutas-http.md)

El I/O no bloqueante deja el hilo libre cuando la espera es de red. Un cálculo lo ocupa. Fibonacci de 40 cabe en una función `async` y, si no hay ningún `await`, el hilo no se suelta: `/salud` espera a que termine `/informe`.

Ese es el límite del modelo. Node encaja cuando cada petición hace poca CPU y mucha red. Un batch de cálculo en el mismo proceso para el servicio entero.

| Runtime | Mucha red, poca CPU por petición | Un cálculo largo |
|---------|----------------------------------|------------------|
| Node.js | El bucle sigue atendiendo mientras la red responde | Para el proceso, como `/informe` |
| Java | Hilos, o un runtime de I/O no bloqueante | Varios hilos, más memoria por servicio |
| Python | `asyncio` para la red. El GIL limita el bytecode de un proceso | Varios procesos |
| Go | Muchas goroutines sobre pocos hilos | También reparte CPU |

En la industria, Node aparece en bordes de mucha conexión y poca CPU: la capa de cuenta de PayPal, parte del borde de interfaz de Netflix. El trabajo pesado de esos sistemas vive en otros procesos.

## Ejemplo

La demostración está en [Cuando el trabajo es CPU](../../ejemplos/01-cpu-bloquea/README.md). `/informe` responde `102334155`. `/salud`, lanzado a la vez, no se adelanta.

Este módulo se mira y se contrasta. No tiene laboratorio.
