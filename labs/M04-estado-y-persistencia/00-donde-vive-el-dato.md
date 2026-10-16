# Dónde vive el dato

[← Página anterior](README.md) · [Siguiente página →](01-lab-mongodb-mongoose.md)

Nexo ya no puede guardar el catálogo en un array del proceso. Cada dato tiene un sitio, y la pantalla que lee el pedido no tiene por qué leer el mismo sitio donde se escribió.

## Punto de partida

- Node.js 22 y Docker disponibles (`docker info` termina sin error).
- Esta página no arranca los motores: nombra el mapa. Cada laboratorio levanta el suyo.

```bash
mkdir -p ~/nexo/m04-demo
```

## Recorrido

1. El producto `NX-1` es un documento: `sku`, `nombre`, `stock`. No hay un join que lo defina. MongoDB guarda ese documento y Mongoose lo describe en el código de `catalogo`. Si el proceso de Node se mata, el documento sigue en el contenedor de MongoDB.

2. El pedido `PED-1001` es una fila: identificador, SKU y estado. PostgreSQL impone esa fila. Sequelize es el acceso desde `pedidos`: define el modelo y llama a `sync` en el laboratorio para crear la tabla. En un entorno compartido esa creación iría en una migración; aquí el laboratorio es de un solo nodo y la tabla nace con el proceso.

3. Redis guarda una copia. La clave `stock:NX-1` evita ir a MongoDB en cada lectura del catálogo. La clave `pedido:PED-1001` es otra cosa: no acelera la tabla, es el modelo de lectura. Quien consulta el estado lee Redis. Quien acepta el pedido escribe PostgreSQL.

4. Entre el `INSERT` y el `SET` de Redis hay un intervalo. Un GET en ese intervalo no ve el pedido. Los dos almacenes no se actualizan en la misma operación. Esa distancia es la consistencia eventual. No se arregla releyendo «más fuerte» el mismo sitio: se conoce, y la pantalla la trata (reintenta, o muestra «aceptando»).

5. CQRS pone nombre a la separación. El comando es `POST /pedidos`. La consulta es `GET /pedidos/PED-1001` contra la proyección. No comparten modelo: uno habla SQL, el otro habla de una clave.

## Qué queda visto

El catálogo y el pedido no viven juntos, y la lectura caliente tampoco vive en la tabla. El laboratorio [01 — MongoDB y Mongoose](01-lab-mongodb-mongoose.md) deja el primer documento sobreviviendo a un reinicio del proceso Node.
