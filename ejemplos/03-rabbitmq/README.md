# RabbitMQ

Un aviso entra en la cola `avisos` y otro proceso lo lee. Si el consumidor no está, el mensaje espera. Consola: http://127.0.0.1:15672 (`guest` / `guest`).

## Cómo ejecutarlo

```bash
cd ejemplos/03-rabbitmq
docker compose up -d
until docker exec ms-rabbit-avisos rabbitmq-diagnostics -q ping; do sleep 2; done
npm install
npm run consumir
```

En otra terminal, desde la misma carpeta:

```bash
npm run publicar
```

Para ver que la cola guarda el aviso, para el consumidor (Ctrl+C), publica otra vez y mira la cola `avisos` en la consola. `Ready` es 1. Vuelve a arrancar `npm run consumir` y pasa a 0.

## Qué se ve

El publicador imprime `publicado`. El consumidor imprime `{"zona":"hall"}`.
