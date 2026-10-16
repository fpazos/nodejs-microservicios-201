# CPU, y Node frente a Java, Python y Go

[← I/O no bloqueante](00-io-no-bloqueante.md) · [Siguiente página →](../M02-apis-rest-express/00-rutas-http.md)

Un proceso de Node ejecuta JavaScript en un solo hilo. Puede atender varias peticiones a la vez porque, cuando una se queda esperando a la red, devuelve el control y ese mismo hilo sigue con otra. Un cálculo no espera a nadie. Fibonacci de 40 puede vivir dentro de una función `async`, pero si dentro no hay ningún `await` el hilo no se suelta hasta que el número está calculado, y `/salud` se queda parado detrás de `/informe`. Node aguanta muchas peticiones cuando cada una hace poca CPU y mucha espera. Un lote de cálculo largo, en ese mismo hilo, detiene el servicio entero mientras dura.

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
