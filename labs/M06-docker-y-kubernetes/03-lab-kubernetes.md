# Kubernetes

[← Página anterior](02-lab-compose.md) · [Siguiente página →](04-lab-helm-y-replicas.md)

Vas a desplegar `catalogo` en un clúster kind: un Deployment, un Service y un volumen que conserva una nota cuando el Pod se borra.

### Objetivo

Recibir el JSON de `NX-1` a través del Service y, después de borrar el Pod, seguir leyendo `/datos/nota.txt` con el texto `PED-1001`.

### Punto de partida

```bash
mkdir -p ~/nexo/m06-k8s && cd ~/nexo/m06-k8s
kind version
kubectl version --client
kind delete cluster --name nexo
kind create cluster --name nexo
```

- Docker, kind y kubectl.
- `kind create cluster` termina cuando imprime que ya puedes usar el clúster. El contexto pasa a llamarse `kind-nexo`.
- Esta página construye su imagen. No reutiliza el contenedor de Compose.

### En qué consiste

Construyes la imagen, la cargas en kind (kind no ve el Docker del host por el nombre) y aplicas el manifiesto. Escribes una nota en el volumen, borras el Pod y la vuelves a leer.

### 1 — Escribe la aplicación

**Acción:** guarda `server.mjs`, `package.json` y `Dockerfile`.

```js
import express from 'express';

const app = express();
app.get('/productos/NX-1', (req, res) => {
  res.json({ sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40, pod: process.env.HOSTNAME });
});
app.listen(3001, '0.0.0.0', () => console.log('catalogo en 3001'));
```

```json
{
  "name": "catalogo",
  "type": "module",
  "dependencies": { "express": "^5.1.0" }
}
```

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.mjs ./
EXPOSE 3001
CMD ["node", "server.mjs"]
```

**Por qué:** `HOSTNAME` dentro del Pod es el nombre del Pod. Así se ve que la respuesta sale de Kubernetes y no de un `node` local. Esta imagen no cambia a `USER node`: el volumen se monta como root y el laboratorio escribe ahí.

**Resultado esperado:** los tres ficheros están en `~/nexo/m06-k8s`.

### 2 — Construye y carga la imagen en kind

**Acción:**

```bash
docker build -t nexo-catalogo:lab .
kind load docker-image nexo-catalogo:lab --name nexo
```

**Por qué:** el nodo de kind tiene su propio almacén de imágenes. Sin `kind load`, el Pod se queda en `ImagePullBackOff` buscando `nexo-catalogo:lab` en un registro público.

**Resultado esperado:** kind imprime que la imagen se ha cargado.

### 3 — Escribe el manifiesto

**Acción:** guarda `catalogo.yaml`.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: catalogo-datos
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalogo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: catalogo
  template:
    metadata:
      labels:
        app: catalogo
    spec:
      containers:
        - name: catalogo
          image: nexo-catalogo:lab
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3001
          volumeMounts:
            - name: datos
              mountPath: /datos
      volumes:
        - name: datos
          persistentVolumeClaim:
            claimName: catalogo-datos
---
apiVersion: v1
kind: Service
metadata:
  name: catalogo
spec:
  selector:
    app: catalogo
  ports:
    - port: 3001
      targetPort: 3001
```

**Por qué:** el Deployment mantiene el Pod. El Service selecciona la etiqueta `app: catalogo`. El PVC pide disco al storage class por defecto de kind; el fichero que escribas en `/datos` no está en la capa de la imagen.

**Resultado esperado:** `catalogo.yaml` en la carpeta.

### 4 — Aplica y espera

**Acción:**

```bash
kubectl apply -f catalogo.yaml
kubectl rollout status deployment/catalogo
kubectl get pvc,pods,svc
```

**Por qué:** `rollout status` espera a que el Pod esté Ready. Si sigues antes, el `curl` habla con un Service sin destinos.

**Resultado esperado:** el rollout termina. El PVC está `Bound`. Hay un Pod `catalogo-…` en `Running` y un Service `catalogo` con `CLUSTER-IP`.

### 5 — Entra por el Service

**Acción:**

```bash
kubectl port-forward svc/catalogo 3001:3001
```

En otra terminal:

```bash
curl -s http://127.0.0.1:3001/productos/NX-1
echo
```

**Por qué:** el Service no está publicado en el host. `port-forward` es el túnel de laboratorio. El JSON incluye `pod` con el nombre del Pod: la petición la ha atendido el contenedor de dentro del clúster.

**Resultado esperado:** `sku` `NX-1`, `stock` 40 y un `pod` que empieza por `catalogo-`.

Para el `port-forward` con Ctrl+C cuando termines el `curl`, o déjalo si vas a repetir.

### 6 — Escribe en el volumen y borra el Pod

**Acción:**

```bash
kubectl exec deploy/catalogo -- sh -c 'echo PED-1001 > /datos/nota.txt'
kubectl delete pod -l app=catalogo
kubectl rollout status deployment/catalogo
kubectl exec deploy/catalogo -- cat /datos/nota.txt
```

**Por qué:** borrar el Pod no borra el PVC. El Deployment crea otro Pod, monta el mismo volumen y la nota sigue. Con un `emptyDir`, ese `cat` fallaría: el disco habría muerto con el Pod.

**Resultado esperado:** `PED-1001`. El Pod del `exec` final tiene otro nombre que el que borraste (`kubectl get pods`).

## Comprueba tu entendimiento

**El Service apunta a la etiqueta**
```bash
kubectl get endpoints catalogo
```
→ Hay una IP y el puerto 3001. Si el selector no coincidiera con `app: catalogo`, la lista de endpoints estaría vacía.

## Reto

### 1 — Un emptyDir no conserva la nota

Cambia el volumen del manifiesto a `emptyDir`, aplica, escribe otra nota, borra el Pod y vuelve a leer.

<details>
<summary>Ver solución</summary>

Sustituye el bloque `volumes` por:

```yaml
      volumes:
        - name: datos
          emptyDir: {}
```

```bash
kubectl apply -f catalogo.yaml
kubectl rollout status deployment/catalogo
kubectl exec deploy/catalogo -- sh -c 'echo temporal > /datos/nota.txt'
kubectl delete pod -l app=catalogo
kubectl rollout status deployment/catalogo
kubectl exec deploy/catalogo -- cat /datos/nota.txt
```

El `cat` responde que no existe el fichero. `emptyDir` vive lo que vive el Pod. El PVC del paso 6 no.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ImagePullBackOff` | La imagen no se cargó en kind, o `imagePullPolicy` es `Always` | Repite `kind load` y deja `IfNotPresent` |
| `port-forward` conecta y `curl` da error | El Pod no está Ready | `kubectl rollout status deployment/catalogo` y `kubectl logs deploy/catalogo` |
| El PVC se queda en `Pending` | El clúster no tiene storage class por defecto | `kubectl get storageclass`. En kind tiene que aparecer una marcada `(default)` |
