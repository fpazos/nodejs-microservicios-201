# M06 — Docker y Kubernetes

[← M05](../M05-seguridad-y-autenticacion/README.md) · [Siguiente módulo →](../M07-monitorizacion-y-logging/README.md)

Hasta aquí Compose levantaba brokers y bases. Este módulo abre la imagen, el Compose como tema, el clúster y Helm.

Dentro del contenedor el proceso escucha en `0.0.0.0`. En `127.0.0.1` el puerto publicado no le entrega tráfico.

## Ejemplos

| Ejemplo | Qué hay |
|---------|---------|
| [Dockerfile](../../ejemplos/06-dockerfile/README.md) | `ms-hola`, usuario `node` |
| [Compose](../../ejemplos/06-compose/README.md) | Visitas en Redis, por el nombre `redis` |
| [Kubernetes](../../ejemplos/06-kubernetes/README.md) | kind, Deployment, Service y un PVC que conserva una nota |
| [Helm](../../ejemplos/06-helm/README.md) | Dos réplicas, scale a tres, y un HPA que en kind no tiene CPU |

## Laboratorio

[Kind](lab-kind/README.md). El Deployment está bien. El Service selecciona una etiqueta que ningún Pod tiene. Lo corriges y subes a tres réplicas.

→ Empieza por **[Dockerfile](../../ejemplos/06-dockerfile/README.md)**.
