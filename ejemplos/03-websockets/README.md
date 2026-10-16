# WebSocket

El canal queda abierto. El servidor escribe al conectar y vuelve a escribir cuando el cliente manda un texto. No hace falta un GET nuevo.

## Cómo ejecutarlo

```bash
cd ejemplos/03-websockets
npm install
npm run servidor
```

```bash
npm run cliente
```

## Qué se ve

Dos líneas: `{"sala":"general","texto":"hola"}` y `{"sala":"general","texto":"buenos dias","eco":true}`.

Si paras el cliente antes de que nadie escuche, ese empujón no queda guardado. Para no perder un hecho está la cola del ejemplo de RabbitMQ.
