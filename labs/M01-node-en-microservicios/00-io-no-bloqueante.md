# I/O no bloqueante

[← Módulo](README.md) · [Siguiente página →](01-cpu-y-otros-runtimes.md)

Un microservicio pasa casi todo el tiempo esperando: a la base, a otro servicio, al cliente. Node ejecuta el JavaScript en un solo hilo y, aun así, puede llevar varias de esas esperas a la vez. Cuando una petición se queda a la espera de la red, devuelve el control; el sistema operativo avisará al llegar el dato, y mientras tanto el mismo hilo acepta la siguiente. Si la espera se escribe como un bucle que no devuelve el control, el proceso deja de atender. Marcar la función como `async` no lo evita: sin un punto en el que suelte el hilo, el bucle sigue dentro de la misma llamada.

## Qué se mira

| Programa | Cómo espera 3 segundos | Qué le pasa a `/salud` |
|----------|------------------------|------------------------|
| `bloqueante.mjs` | Un bucle en el hilo | Espera lo mismo que `/plazo` |
| `red.mjs` | `setTimeout`, el mismo papel que una respuesta de red que todavía no ha llegado | Responde `ok` al momento |

`/plazo` tarda en los dos. La diferencia es si, durante esos 3 segundos, el proceso puede decir que sigue vivo.

## Ejemplo

La demostración está en [I/O no bloqueante](../../ejemplos/01-io-no-bloqueante/README.md). Primero el bucle, con los dos `curl` a la vez. Después el temporizador, con los mismos `curl`.

Con el bucle, los dos tiempos se parecen. Con el temporizador, `/salud` vuelve enseguida y `plazo-listo` llega unos 3 segundos después.

Este módulo no tiene laboratorio. El contraste con un cálculo de CPU está en la página siguiente.
