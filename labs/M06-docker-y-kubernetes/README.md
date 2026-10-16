# M06 — Docker y Kubernetes

[← Página anterior](../M05-seguridad-y-autenticacion/03-lab-cifrado-y-tls.md) · [Siguiente página →](00-de-proceso-a-cluster.md)

`catalogo` ya responde en una terminal. Nexo lo necesita repetible: una imagen, un Compose con su base, y un Deployment con más de una copia detrás de un Service.

## Qué aprenderás

- Escribir un Dockerfile para una aplicación Node y arrancar el contenedor.
- Unir `catalogo` y MongoDB con Docker Compose.
- Crear un Deployment, un Service y un volumen en Kubernetes.
- Empaquetar el despliegue con Helm, subir réplicas y dejar declarado un autoescalado.

## Teoría

La imagen es el sistema de ficheros más el comando de arranque. El contenedor es esa imagen en ejecución. Compose describe varios contenedores y la red que los une: `catalogo` resuelve el nombre `mongo` sin usar `localhost`.

En Kubernetes el Pod es la unidad que corre. El Deployment mantiene el número de Pods. El Service tiene una dirección estable y reparte entre esos Pods. Un volumen (aquí, un `emptyDir` montado en `/datos` y un PVC pequeño para ver el objeto) es el sitio de los ficheros que no van dentro de la imagen.

Helm guarda esos manifiestos como un chart. Cambiar el número de réplicas es un valor, no un YAML editado a mano en cada entorno.

El autoescalado (HPA) sube o baja réplicas según una métrica. En el laboratorio se declara el objeto y se comprueba que existe; el cambio que sí se ve a simple vista es `kubectl scale` y el reparto del Service entre Pods. kind no trae métricas de CPU listas: el HPA se queda en el mínimo hasta que las hay, y la página lo enseña así.

> [!WARNING]
> Dentro del contenedor el proceso tiene que escuchar en `0.0.0.0`. En `127.0.0.1` solo se ve a sí mismo y el Service no le entrega tráfico.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Del proceso al clúster](00-de-proceso-a-cluster.md) | Qué añade la imagen respecto a `node server.mjs` |
| 01 | [Dockerfile](01-lab-dockerfile.md) | Imagen de `catalogo` y un `curl` al contenedor |
| 02 | [Compose](02-lab-compose.md) | `catalogo` y MongoDB en la misma red |
| 03 | [Kubernetes](03-lab-kubernetes.md) | Deployment, Service y volumen en kind |
| 04 | [Helm y réplicas](04-lab-helm-y-replicas.md) | Chart, tres réplicas, balanceo y HPA |

→ Empieza por **[00 — Del proceso al clúster](00-de-proceso-a-cluster.md)**.
