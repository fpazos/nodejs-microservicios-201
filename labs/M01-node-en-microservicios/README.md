# M01 — Node.js en la arquitectura de microservicios

[← Inicio](../../README.md) · [Siguiente módulo →](../M02-apis-rest-express/README.md)

Node atiende muchas conexiones mientras espera a la red. Un cálculo en el mismo hilo deja de atender. Este módulo no tiene laboratorio: los dos ejemplos se ejecutan y se contrastan.

## Qué aprenderás

- Qué hace el I/O no bloqueante cuando una respuesta tarda.
- Por qué `async` no suelta el hilo si no hay un `await`.
- En qué se apoyan Java, Python y Go para el mismo problema.

## Ejemplos

| Ejemplo | Qué hay |
|---------|---------|
| [I/O no bloqueante](../../ejemplos/01-io-no-bloqueante/README.md) | Un bucle frente a un temporizador |
| [CPU](../../ejemplos/01-cpu-bloquea/README.md) | Fibonacci en la misma ruta que `/salud`, y la comparación con otros runtimes |

→ Empieza por **[I/O no bloqueante](../../ejemplos/01-io-no-bloqueante/README.md)**.
