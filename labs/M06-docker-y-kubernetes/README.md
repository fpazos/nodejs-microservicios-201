# M06 — Docker y Kubernetes

[← M05](../M05-seguridad-y-autenticacion/README.md) · [Siguiente página →](00-dockerfile.md)

Hasta aquí Compose levantaba brokers y bases sin que abriéramos la imagen. Este módulo mira qué hay dentro de esa imagen, cómo Compose les pone nombre en una red, y cómo el mismo proceso pasa a un clúster con Kubernetes y Helm. Dentro del contenedor el proceso escucha en `0.0.0.0`, porque en `127.0.0.1` el puerto publicado en el host no le entrega tráfico.

## Páginas

| # | Página | Después de explicarla |
|---|--------|------------------------|
| 00 | [Dockerfile](00-dockerfile.md) | [Ejemplo](../../ejemplos/06-dockerfile/README.md) |
| 01 | [Compose](01-compose.md) | [Ejemplo](../../ejemplos/06-compose/README.md) |
| 02 | [Kubernetes](02-kubernetes.md) | [Ejemplo](../../ejemplos/06-kubernetes/README.md) · [laboratorio con kind](lab-kind/README.md) |
| 03 | [Helm y réplicas](03-helm-y-replicas.md) | [Ejemplo](../../ejemplos/06-helm/README.md) |

→ Empieza por **[Dockerfile](00-dockerfile.md)**.
