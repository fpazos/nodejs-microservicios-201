# Helm y réplicas

[← Página anterior](03-lab-kubernetes.md) · [Siguiente página →](../M07-monitorizacion-y-logging/README.md)

Vas a instalar `catalogo` con un chart de Helm, a poner tres réplicas y a ver que el Service reparte. El autoescalado queda declarado, a la espera de métricas que este kind no tiene.

### Objetivo

Ver al menos dos valores distintos de `pod` al pedir `/salud` seis veces, y un HorizontalPodAutoscaler `catalogo` con mínimo 2.

### Punto de partida

```bash
mkdir -p ~/nexo/m06-helm && cd ~/nexo/m06-helm
helm version
kind delete cluster --name nexo
kind create cluster --name nexo
```

- kind, kubectl y Helm 3.
- Esta página reconstruye la imagen y el clúster. No depende del Pod del lab anterior.

### En qué consiste

El chart lleva Deployment, Service y HPA. Instalas con dos réplicas, subes a tres, y preguntas el Service desde dentro del clúster.

### 1 — Escribe la aplicación

**Acción:** guarda `server.mjs`, `package.json` y `Dockerfile` (los mismos papeles que en el despliegue anterior: Express en `0.0.0.0:3001`).

`server.mjs`:

```js
import express from 'express';

const app = express();
app.get('/salud', (req, res) => {
  res.json({ ok: true, pod: process.env.HOSTNAME });
});
app.listen(3001, '0.0.0.0', () => console.log('catalogo en 3001'));
```

`package.json`:

```json
{
  "name": "catalogo",
  "type": "module",
  "dependencies": { "express": "^5.1.0" }
}
```

`Dockerfile`:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.mjs ./
EXPOSE 3001
CMD ["node", "server.mjs"]
```

**Por qué:** `/salud` devuelve el nombre del Pod. Sin eso, tres réplicas serían invisibles desde fuera.

**Resultado esperado:** los tres ficheros en `~/nexo/m06-helm`.

### 2 — Carga la imagen

**Acción:**

```bash
docker build -t nexo-catalogo:lab .
kind load docker-image nexo-catalogo:lab --name nexo
```

**Por qué:** Helm no empuja la imagen a un registro. El nodo tiene que tenerla ya, igual que en el `kubectl apply`.

**Resultado esperado:** kind confirma la carga.

### 3 — Escribe el chart

**Acción:** crea esta estructura.

`chart/Chart.yaml`:

```yaml
apiVersion: v2
name: catalogo
description: Catalogo de Nexo
version: 0.1.0
appVersion: "1"
```

`chart/values.yaml`:

```yaml
replicaCount: 2
image: nexo-catalogo:lab
```

`chart/templates/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalogo
spec:
  replicas: {{ .Values.replicaCount }}
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
          image: {{ .Values.image }}
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3001
```

`chart/templates/service.yaml`:

```yaml
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

`chart/templates/hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: catalogo
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: catalogo
  minReplicas: 2
  maxReplicas: 4
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

**Por qué:** el número de réplicas es un valor del chart, no un YAML distinto por entorno. El HPA observa el mismo Deployment. Sin metrics-server, no sube ni baja réplicas: el objeto existe y lo dice.

**Resultado esperado:** `helm template chart` imprime los tres documentos sin error.

### 4 — Instala

**Acción:**

```bash
helm upgrade --install catalogo chart
kubectl rollout status deployment/catalogo
kubectl get deploy,svc,hpa
```

**Por qué:** `upgrade --install` sirve la primera vez y las siguientes. El Deployment queda en 2, que es `replicaCount`.

**Resultado esperado:** dos Pods Ready. El HPA `catalogo` aparece. `TARGETS` puede ser `<unknown>`: este kind no publica la métrica de CPU. `MINPODS` es 2 y `MAXPODS` es 4.

### 5 — Sube a tres réplicas

**Acción:**

```bash
kubectl scale deployment/catalogo --replicas=3
kubectl rollout status deployment/catalogo
kubectl get pods -l app=catalogo
```

**Por qué:** esto es el scale que el HPA haría si tuviera métricas. El Service no cambia de nombre: reparte entre los Pods que lleven la etiqueta.

**Resultado esperado:** tres Pods `Running`.

### 6 — Pide la salud seis veces desde dentro

**Acción:**

```bash
kubectl run cliente --rm -i --restart=Never --image=curlimages/curl -- \
  sh -c 'for i in 1 2 3 4 5 6; do curl -s http://catalogo:3001/salud; echo; done'
```

**Por qué:** `port-forward` clava una conexión a un solo Pod. Desde un Pod, el DNS `catalogo` es el Service, y kube-proxy reparte. Por eso aparecen nombres de Pod distintos.

**Resultado esperado:** seis líneas `{"ok":true,"pod":"catalogo-…"}`. Al menos dos valores de `pod` distintos.

> [!TIP]
> Si las seis líneas coinciden, repite el bucle. Con tres Pods y el reparto por conexión, una tanda corta puede caer en el mismo.

## Comprueba tu entendimiento

**Helm es quien instaló el Deployment**
```bash
helm list
```
→ Una release `catalogo`, estado `deployed`.

## Reto

### 1 — Vuelve a dos por el valor del chart

Cambia `replicaCount` a 2 y reinstala, sin `kubectl scale`.

<details>
<summary>Ver solución</summary>

En `chart/values.yaml`, `replicaCount: 2`. Luego:

```bash
helm upgrade --install catalogo chart
kubectl rollout status deployment/catalogo
kubectl get pods -l app=catalogo
```

Quedan dos Pods. El HPA sigue con mínimo 2. El valor del chart ha fijado el Deployment; no ha hecho falta editar `deployment.yaml`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Pods en `ImagePullBackOff` | Falta `kind load`, o la etiqueta de la imagen no es `nexo-catalogo:lab` | Repite el paso 2 y `helm upgrade --install` |
| `TARGETS` `<unknown>` | No hay metrics-server | Es lo esperado en este kind. El reparto se ve en el paso 6, no en el HPA |
| El cliente no resuelve `catalogo` | El Service no existe o el Pod `cliente` se lanzó en otro namespace | `kubectl get svc catalogo` en el namespace `default` |
