#!/usr/bin/env bash
# Para contenedores de este curso (nombre que empieza por ms-) y borra el clúster kind de las prácticas.
set -u
ids="$(docker ps -aq --filter name=ms- 2>/dev/null || true)"
if [ -n "$ids" ]; then
  docker rm -f $ids
fi
if command -v kind >/dev/null 2>&1; then
  kind delete cluster --name ms >/dev/null 2>&1 || true
fi
echo "Entorno limpio: contenedores ms- y clúster kind ms."
