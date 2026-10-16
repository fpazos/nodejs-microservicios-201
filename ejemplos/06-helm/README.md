# Helm, réplicas y autoescalado

El chart instala el mismo `eco` del ejemplo de Kubernetes. `replicaCount` sale de `values.yaml`. El HPA declara un mínimo de 2 y un máximo de 4. En kind, sin metrics-server, el objetivo de CPU se queda en `<unknown>`: el objeto existe y no mueve réplicas. El reparto se ve al subir réplicas a mano y preguntar el Service desde dentro del clúster.

Reutiliza la imagen `ms-eco:lab` y el clúster `ms` del ejemplo de Kubernetes. Si no los tienes:

```bash
cd ejemplos/06-kubernetes
docker build -t ms-eco:lab .
kind create cluster --name ms
kind load docker-image ms-eco:lab --name ms
```

## Cómo ejecutarlo

```bash
cd ejemplos/06-helm
helm upgrade --install eco chart
kubectl rollout status deployment/eco
kubectl get deploy,hpa
kubectl scale deployment/eco --replicas=3
kubectl rollout status deployment/eco
kubectl run cliente --rm -i --restart=Never --image=curlimages/curl -- \
  sh -c 'for i in 1 2 3 4 5 6; do curl -s http://eco:3001/eco; echo; done'
```

## Qué se ve

Dos Pods tras el install. El HPA `eco` con MINPODS 2. Tras el scale, tres Pods. En las seis líneas, al menos dos valores distintos de `pod`.
