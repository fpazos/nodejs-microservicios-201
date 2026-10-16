# Laboratorio: el Service no encuentra los Pods

El ejemplo de Kubernetes ya aplica un manifiesto que funciona, con volumen incluido. Aquí la imagen y el Deployment están bien, pero el Service selecciona `app: eco-mal` y los Pods llevan `app: eco`, así que el Service no encuentra a nadie. kind usa el clúster `ms`. Hasta este módulo, Compose se arrancaba sin mirar el clúster. Esta es la práctica con kind.

### Objetivo

Ver el JSON de `/eco` a través del Service y, con tres réplicas, dos nombres de Pod distintos al preguntar desde dentro del clúster.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M06-docker-y-kubernetes/lab-kind
docker build -t ms-eco-lab:lab .
kind create cluster --name ms
kind load docker-image ms-eco-lab:lab --name ms
kubectl apply -f k8s.yaml
kubectl rollout status deployment/eco
kubectl get endpoints eco
```

El Deployment llega a Ready. `ENDPOINTS` está vacío: el selector no coincide.

### 1 — Alinea el selector

**Acción:** en `k8s.yaml`, el `selector` del Service pasa de `app: eco-mal` a `app: eco`.

```bash
kubectl apply -f k8s.yaml
kubectl get endpoints eco
```

**Por qué:** el Service no busca por nombre de Deployment. Busca Pods con esas etiquetas.

**Resultado esperado:** una IP y el puerto 3001.

### 2 — Entra por el Service

**Acción:**

```bash
kubectl port-forward svc/eco 3001:3001
```

En otra terminal: `curl -s http://127.0.0.1:3001/eco`.

**Por qué:** el puerto 3001 del host no está publicado por un Service de tipo NodePort. El forward es el túnel de esta práctica.

**Resultado esperado:** `{"pod":"eco-..."}`. Para el forward con Ctrl+C cuando hayas visto el JSON.

### 3 — Tres réplicas, preguntando desde un Pod

**Acción:** en `k8s.yaml` pon `replicas: 3`. Crea `desde-dentro.yaml` con esto.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cliente
spec:
  restartPolicy: Never
  containers:
    - name: curl
      image: curlimages/curl
      command: ["sh", "-c", "for i in 1 2 3 4 5 6; do curl -s http://eco:3001/eco; echo; done"]
```

```bash
kubectl apply -f k8s.yaml
kubectl rollout status deployment/eco
kubectl delete pod cliente --ignore-not-found
kubectl apply -f desde-dentro.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/cliente
kubectl logs cliente
```

**Por qué:** `port-forward` se queda en un Pod. Desde otro Pod, el nombre `eco` es el Service y reparte.

**Resultado esperado:** seis líneas y, entre ellas, al menos dos valores de `pod`.

El HPA y Helm están en `ejemplos/06-helm`. El volumen que sobrevive al Pod está en `ejemplos/06-kubernetes`.

## Así se ve

El Service tiene endpoints y, entre las seis líneas, aparecen al menos dos nombres de Pod.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Volver a romper el selector**
Cambia otra vez a `app: eco-mal`, aplica y `kubectl get endpoints eco`.
→ La lista queda vacía. Los Pods siguen Running. Nadie les envía tráfico por el Service.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ImagePullBackOff` | La imagen no se cargó en kind | `kind load docker-image ms-eco-lab:lab --name ms` y borra el Pod |
| `endpoints` vacío después del paso 1 | El apply no cogió el fichero, o la etiqueta del Pod no es `app: eco` | `kubectl get pods --show-labels` |
