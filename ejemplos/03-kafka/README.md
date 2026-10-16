# Kafka

El mismo tipo de aviso que en RabbitMQ, en un topic. El mensaje no se borra al leerlo: el grupo `lectores` guarda el offset. No hay laboratorio de Kafka; el de cola es el de RabbitMQ.

## Cómo ejecutarlo

```bash
cd ejemplos/03-kafka
docker compose up -d
npm install
npm run consumir
```

El primer arranque del broker tarda. Si el consumidor no conecta, espera y vuelve a lanzarlo. En otra terminal:

```bash
npm run publicar
```

## Qué se ve

`publicado` en una terminal y `{"zona":"hall"}` en la otra.

Para el consumidor y arráncalo otra vez sin publicar. No reimprime el aviso: el offset del grupo ya pasó. Cambia `groupId` a `auditoria` en una copia y sí lo relee. El topic conserva el mensaje; cada grupo tiene su sitio.
