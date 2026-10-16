# Kubernetes con kind

Un Deployment mantiene el Pod. El Service `eco` reparte entre los Pods con etiqueta `app: eco`. El PVC montado en `/datos` conserva un fichero cuando el Pod se borra. kind no ve las imágenes del host: hay que cargarlas.

El clúster de las prácticas se llama `ms`.

## Cómo ejecutarlo

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

## Qué se ve

`nota`. El Pod nuevo tiene otro nombre y el fichero sigue. Si el volumen fuera `emptyDir: {}`, el `cat` no encontraría el fichero.
