# Dockerfile

[← Página anterior](00-de-proceso-a-cluster.md) · [Siguiente página →](02-lab-compose.md)

Vas a meter el catálogo de Nexo en una imagen y a pedir `NX-1` al contenedor, no a un `node` de la máquina.

### Objetivo

Recibir `{"sku":"NX-1","nombre":"Sobre 1 kg","stock":40}` desde `http://127.0.0.1:3001/productos/NX-1`, con el proceso dentro de un contenedor.

### Punto de partida

```bash
mkdir -p ~/nexo/m06-docker && cd ~/nexo/m06-docker
docker rm -f nexo-catalogo >/dev/null 2>&1 || true
```

- Docker en marcha. Puerto 3001 libre.
- Esta carpeta no necesita `npm install` en el host: la imagen instala.

### En qué consiste

Escribes un servidor mínimo, el Dockerfile, construyes `nexo-catalogo:lab` y publicas el puerto.

### 1 — Escribe el servidor

**Acción:** guarda `server.mjs`.

```js
import express from 'express';

const app = express();
const productos = [{ sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 }];

app.get('/productos/:sku', (req, res) => {
  const item = productos.find((p) => p.sku === req.params.sku);
  if (!item) {
    res.status(404).json({ error: 'sku no encontrado' });
    return;
  }
  res.json(item);
});

app.listen(3001, '0.0.0.0', () => console.log('catalogo en 3001'));
```

**Por qué:** `0.0.0.0` es la pieza que falla si se deja en localhost. El contenedor tiene su propia interfaz de loopback; el puerto publicado entra por la interfaz externa del contenedor.

**Resultado esperado:** `server.mjs` en la carpeta.

### 2 — Escribe el manifiesto de paquetes

**Acción:** guarda `package.json`.

```json
{
  "name": "catalogo",
  "type": "module",
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

**Por qué:** la imagen ejecuta `npm install` dentro. El host no tiene por qué tener Node.

**Resultado esperado:** `package.json` junto al servidor.

### 3 — Escribe el Dockerfile

**Acción:** guarda `Dockerfile`.

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.mjs ./
USER node
EXPOSE 3001
CMD ["node", "server.mjs"]
```

**Por qué:** la base ya trae Node 22. Copiar el manifiesto antes que el código aprovecha la caché de capas cuando solo cambia `server.mjs`. `USER node` evita dejar el proceso como root. `EXPOSE` documenta el puerto; quien lo publica es el `-p` del `run`.

**Resultado esperado:** un fichero llamado exactamente `Dockerfile`.

### 4 — Construye la imagen

**Acción:**

```bash
docker build -t nexo-catalogo:lab .
```

**Por qué:** sin etiqueta, el laboratorio siguiente no sabe qué arrancar. `nexo-catalogo:lab` es el nombre fijo de este curso.

**Resultado esperado:** la última línea dice que la imagen se exportó, o `naming to docker.io/library/nexo-catalogo:lab`. `docker image ls nexo-catalogo` muestra la etiqueta `lab`.

### 5 — Arranca el contenedor y pide el SKU

**Acción:**

```bash
docker run -d --name nexo-catalogo -p 3001:3001 nexo-catalogo:lab
curl -s http://127.0.0.1:3001/productos/NX-1
echo
```

**Por qué:** este `curl` entra desde el host. Si el proceso escuchara solo en `127.0.0.1` dentro del contenedor, aquí habría conexión rechazada o timeout.

**Resultado esperado:** el JSON de `NX-1` con stock 40.

## Comprueba tu entendimiento

**El proceso es el del contenedor**
```bash
docker exec nexo-catalogo ps
```
→ Hay un proceso `node server.mjs`. No hace falta Node en el host para ese `curl`.

## Reto

### 1 — Cambia el stock sin reconstruir a ciegas

Sube el stock del array a 35, reconstruye y vuelve a pedir el SKU. El contenedor anterior tiene que sustituirse: un `docker run` con el mismo nombre choca.

<details>
<summary>Ver solución</summary>

En `server.mjs`, `stock: 35`. Luego:

```bash
docker build -t nexo-catalogo:lab .
docker rm -f nexo-catalogo
docker run -d --name nexo-catalogo -p 3001:3001 nexo-catalogo:lab
curl -s http://127.0.0.1:3001/productos/NX-1
```

El JSON trae `stock` 35. La imagen nueva no sustituye al contenedor que ya estaba corriendo: hay que borrarlo y crearlo.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `curl` no conecta | El proceso escucha en 127.0.0.1, o falta `-p 3001:3001` | `app.listen(3001, '0.0.0.0', …)` y el `-p` |
| `Conflict. The container name is already in use` | Quedó `nexo-catalogo` | `docker rm -f nexo-catalogo` |
| `Cannot find module 'express'` | `npm install` no está en la imagen, o `COPY` fue antes y no se rehízo | El Dockerfile del paso 3 y `docker build` otra vez |
