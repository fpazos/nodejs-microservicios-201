# Del proceso al clúster

[← Página anterior](README.md) · [Siguiente página →](01-lab-dockerfile.md)

`catalogo` hasta ahora era `node server.mjs` en una terminal, con Node instalado en esa máquina. Nexo necesita el mismo proceso en cualquier sitio, y más de una copia.

## Punto de partida

```bash
docker info
```

- Docker responde.
- Esta página no construye la imagen: nombra qué cambia en cada salto. El Dockerfile se escribe en el laboratorio siguiente.

## Recorrido

1. En la terminal, el proceso hereda el Node del sistema, el código de la carpeta y el puerto 3001. Si otra persona no tiene la rama 22, o no tiene el fichero, el catálogo no arranca igual.

2. La imagen cierra eso. Parte de `node:22-alpine`, copia `package.json` y `server.mjs`, instala y define `CMD ["node", "server.mjs"]`. `docker run -p 3001:3001` publica el puerto. Dentro, el proceso tiene que escuchar en `0.0.0.0`: `127.0.0.1` sería el propio contenedor, y el `-p` no entregaría tráfico.

3. Compose añade MongoDB. `catalogo` no usa `127.0.0.1` para la base: usa el nombre del servicio, `mongo`. Compose crea la red en la que ese nombre resuelve. Los dos contenedores se levantan con un solo `docker compose up`.

4. Kubernetes separa «qué quiero» de «qué está corriendo». Un Deployment con `replicas: 2` pide dos Pods. Si uno muere, el Deployment lo repone. Un Service `catalogo` tiene una dirección estable y reparte entre los Pods que llevan la etiqueta `app: catalogo`. El cliente habla con el Service, no con el nombre de un Pod.

5. El disco del contenedor se va con él. Un volumen montado en `/datos` es el sitio de una nota que tiene que sobrevivir al borrado del Pod. Helm guarda el Deployment, el Service y el número de réplicas como un chart, para no reeditar el YAML a mano en cada aula.

6. Subir réplicas a mano es `kubectl scale`. El autoescalado es un HorizontalPodAutoscaler que mira una métrica y hace ese scale. En el laboratorio de un nodo la métrica de CPU no está servida: el objeto se declara y se ve; el reparto que sí se observa es el del Service entre los Pods ya creados.

## Qué queda visto

Imagen, Compose, Deployment y Service son cuatro sitios distintos donde vive `catalogo`. El laboratorio [01 — Dockerfile](01-lab-dockerfile.md) construye el primero y lo abre con `curl`.
