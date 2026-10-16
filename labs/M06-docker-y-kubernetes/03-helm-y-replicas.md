# Helm, réplicas y autoescalado

[← Kubernetes](02-kubernetes.md) · [Siguiente página →](../M07-monitorizacion-y-logging/00-prometheus.md)

Helm instala el mismo `eco` a partir de un chart. `values.yaml` fija `replicaCount: 2` y la imagen `ms-eco:lab`. Cambiar el número de réplicas es cambiar ese valor, o `kubectl scale`, y el Deployment converge. El Service reparte entre los Pods que siguen teniendo la etiqueta. Seis peticiones desde dentro del clúster, a `http://eco:3001/eco`, enseñan al menos dos nombres de Pod.

El HPA declara un mínimo de 2 y un máximo de 4 cuando la CPU pasa del 70 %. El objeto se crea, pero en kind, sin metrics-server, la columna de objetivo se queda en `<unknown>` y el HPA no mueve réplicas. El autoescalado se ve como esa declaración. El reparto, al subir las réplicas a mano.

El chart reutiliza el clúster `ms` y la imagen del ejemplo de Kubernetes.

## Ejemplo

La demostración está en [Helm](../../ejemplos/06-helm/README.md). Tras el install hay dos Pods y el HPA `eco` con mínimo 2. Tras el scale hay tres. Las seis líneas del cliente traen al menos dos valores de `pod`.

El laboratorio de este módulo es el de kind, en la página anterior: allí el selector está mal y las réplicas se suben a tres sobre un Service que ya encuentra Pods. Helm se ejecuta.
