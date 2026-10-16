# Pods, Deployments, Services y volúmenes

[← Compose](01-compose.md) · [Siguiente página →](03-helm-y-replicas.md)

En el clúster el proceso vive en un Pod. El Deployment dice cuántos quieres y con qué imagen, y si uno desaparece crea otro. El Service no busca el Pod por su nombre: elige por etiqueta, y en el ejemplo `eco` elige `app: eco`. kind no ve las imágenes del Docker del host, así que hay que construir `ms-eco:lab` y cargarla con `kind load` en el clúster `ms`. `imagePullPolicy: IfNotPresent` usa esa imagen local.

Qué sobrevive al Pod lo decide el volumen. Un PVC montado en `/datos` conserva `nota.txt` cuando el Pod se borra y el Deployment crea otro. Un `emptyDir` nace y muere con el Pod, y el `cat` no encontraría el fichero. `kubectl port-forward` publica el Service en el host mientras el comando sigue en marcha, y el JSON de `/eco` trae el nombre del Pod que respondió.

## Ejemplo

La demostración está en [Kubernetes](../../ejemplos/06-kubernetes/README.md). Se escribe `nota` en `/datos/nota.txt`, se borra el Pod y el Pod nuevo sigue teniendo el fichero.

## Laboratorio

[Kind](lab-kind/README.md). La imagen es `ms-eco-lab:lab`, distinta de la del ejemplo. El Deployment etiqueta `app: eco`. El Service selecciona `app: eco-mal`. El arreglo es la etiqueta. Después se sube a tres réplicas y se pregunta el Service desde un Pod de dentro, para ver más de un nombre en las respuestas.
