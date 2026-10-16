# M01 — Node.js en la arquitectura de microservicios

[← Inicio](../../README.md) · [Siguiente página →](00-io-no-bloqueante.md)

Node atiende muchas conexiones mientras espera a la red, porque esa espera devuelve el hilo. Un cálculo en el mismo hilo no espera a nadie y, mientras dura, el proceso deja de atender. Este módulo no tiene laboratorio: las dos páginas se explican y se demuestran.

## Qué aprenderás

- Qué hace el I/O no bloqueante cuando una respuesta tarda.
- Por qué `async` no suelta el hilo si no hay un `await`.
- En qué se apoyan Java, Python y Go para el mismo problema.

## Páginas

| # | Página | Después de explicarla |
|---|--------|------------------------|
| 00 | [I/O no bloqueante](00-io-no-bloqueante.md) | [Ejemplo](../../ejemplos/01-io-no-bloqueante/README.md) |
| 01 | [CPU y otros runtimes](01-cpu-y-otros-runtimes.md) | [Ejemplo](../../ejemplos/01-cpu-bloquea/README.md) |

→ Empieza por **[I/O no bloqueante](00-io-no-bloqueante.md)**.
