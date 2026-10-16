# Kubernetes con kind

El concepto está en [Kubernetes](../../labs/M06-docker-y-kubernetes/02-kubernetes.md).

## Dónde poner el foco

Un Deployment mantiene el Pod. El Service `eco` reparte entre los Pods con etiqueta `app: eco`; el selector del Deployment usa la misma etiqueta. El PVC montado en `/datos` conserva un fichero cuando el Pod se borra. kind no ve las imágenes del host: hay que cargarlas con `kind load`. El clúster de las prácticas se llama `ms`. `imagePullPolicy: IfNotPresent` usa la imagen cargada en el nodo.

## Archivos

| Archivo | Papel |
|---------|-------|
| `server.mjs` | `GET /eco` devuelve `HOSTNAME`, que en el Pod es el nombre del Pod |
| `Dockerfile` | Imagen `ms-eco:lab` |
| `k8s.yaml` | PVC `eco-datos`, Deployment `eco` y Service `eco` |
| `package.json` | Dependencia `express` |

## El código

### `server.mjs`

```js
// HOSTNAME en el Pod es el nombre del Pod: así se ve a cuál respondió el
// Service. 0.0.0.0 porque el port-forward llega por la red del Pod, no
// por el loopback del proceso.
import express from 'express';

const app = express();
app.get('/eco', (req, res) => {
  res.json({ pod: process.env.HOSTNAME || 'local' });
});
app.listen(3001, '0.0.0.0', () => console.log('eco en 3001'));
```

### `k8s.yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: eco-datos
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 10Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eco
spec:
  replicas: 1
  selector:
    matchLabels:
      app: eco # solo adopta Pods con esta etiqueta; tiene que coincidir con template.labels
  template:
    metadata:
      labels:
        app: eco
    spec:
      containers:
        - name: eco
          image: ms-eco:lab
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3001
          volumeMounts:
            - name: datos
              mountPath: /datos
      volumes:
        - name: datos
          persistentVolumeClaim:
            claimName: eco-datos # el claim sigue vivo cuando el Pod se borra
---
apiVersion: v1
kind: Service
metadata:
  name: eco
spec:
  selector:
    app: eco # mismos Pods que el Deployment: sin esta etiqueta el Service no reparte
  ports:
    - port: 3001
      targetPort: 3001
```

## Qué hacer

```bash
cd ejemplos/06-kubernetes
docker build -t ms-eco:lab .
kind delete cluster --name ms
kind create cluster --name ms
kind load docker-image ms-eco:lab --name ms
kubectl apply -f k8s.yaml
kubectl rollout status deployment/eco
kubectl port-forward svc/eco 3001:3001
```

En otra terminal: `curl -s http://127.0.0.1:3001/eco`. El JSON trae `pod` con el nombre del Pod.

Volumen:

```bash
kubectl exec deploy/eco -- sh -c 'echo nota > /datos/nota.txt'
kubectl delete pod -l app=eco
kubectl rollout status deployment/eco
kubectl exec deploy/eco -- cat /datos/nota.txt
```

## Qué observar

`nota`. El JSON del curl trae el nombre del Pod en `pod`.

## Qué validar

El Pod nuevo tiene otro nombre y el fichero sigue: el PVC `eco-datos` no se borra con el Pod. Si el volumen fuera `emptyDir: {}`, el `cat` no encontraría el fichero.

![la nota sobrevive al pod](../img/06-k8s.png)
