# M01 — Node.js en la arquitectura de microservicios

[← Página anterior](../../README.md) · [Siguiente página →](00-io-no-bloqueante.md)

Nexo va a atender a muchos clientes mirando el stock a la vez. Este módulo mira el proceso Node que hay debajo: qué ocurre cuando una llamada de red tarda, y qué ocurre cuando el proceso se pone a calcular.

## Qué aprenderás

- Cómo el modelo de I/O no bloqueante deja libre el hilo mientras llega una respuesta de red.
- Por qué esa forma de trabajar encaja en un microservicio que casi solo habla con otros.
- En qué se apoyan Java, Python y Go para el mismo problema, y en qué trabajo Node deja de encajar.
- Qué tipo de servicio de la industria se ha llevado a Node por esa razón.

## Teoría

Node ejecuta tu JavaScript en un hilo. Cuando el código pide red o disco, el runtime registra la operación y sigue atendiendo otras. Cuando la operación termina, la continuación entra en la cola del bucle de eventos.

Eso importa en un microservicio porque la mayor parte del tiempo el proceso está esperando: a la base de datos, a otro servicio, al broker. Mientras espera, puede aceptar más peticiones.

| Runtime | Cómo aguanta muchas operaciones de red | Qué mirar cuando el trabajo es CPU |
|---------|----------------------------------------|-------------------------------------|
| Node.js | Bucle de eventos y I/O no bloqueante | Un cálculo largo para todo el proceso |
| Java | Hilos por petición o un pool, más un runtime con I/O no bloqueante (Netty, virtual threads) | Muchos hilos y más memoria por servicio |
| Python | `asyncio` para I/O; el GIL limita el paralelismo de bytecode en un proceso | Varios procesos, no varios hilos de CPU |
| Go | Goroutines: muchas tareas ligeras sobre pocos hilos del sistema | Encaja bien en red y también en CPU paralela |

Casos públicos en los que Node se ha usado como borde de red o como API de producto: la capa de experiencia de cuenta de PayPal y parte del borde de interfaz de Netflix. El patrón es el mismo que el de Nexo: muchas conexiones, poca CPU por petición, mucho tiempo esperando a otro sistema. Un transcodificador de vídeo o un cálculo de rutas no es ese patrón.

> [!NOTE]
> `async` marca que una función puede soltar el hilo en un `await`. Si dentro hay un bucle que no espera a nadie, el proceso sigue ocupado.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [I/O no bloqueante](00-io-no-bloqueante.md) | Dos servidores de Nexo y qué se ve al pedir stock y salud a la vez |
| 01 | [Concurrencia](01-lab-concurrencia.md) | Dejas los dos servidores y comparas las respuestas |
| 02 | [Cuándo Node](02-lab-cuando-node.md) | Un cálculo de CPU bloquea `/salud`; sitúas Java, Python y Go |

→ Empieza por **[00 — I/O no bloqueante](00-io-no-bloqueante.md)**.
