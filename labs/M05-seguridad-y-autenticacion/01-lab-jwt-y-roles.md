# JWT y roles

[← Página anterior](00-identidad-en-nexo.md) · [Siguiente página →](02-lab-oauth-passport.md)

Vas a emitir un token para Ana y otro para Luis, y a dejar que solo el rol `operador` cambie el stock de `NX-1`.

### Objetivo

Conseguir un 200 en el PUT de Ana, un 403 en el de Luis y un 401 si no hay token.

### Punto de partida

```bash
mkdir -p ~/nexo/m05-jwt && cd ~/nexo/m05-jwt
npm init -y
npm pkg set type=module
npm install express@5 jsonwebtoken
```

- Puerto 3001 libre.
- Secreto de laboratorio: `nexo-lab-secreto`. Clave de las dos cuentas: `nexo-lab`.

### En qué consiste

Un POST `/sesion` firma el token. Un middleware verifica la firma y, en el PUT, exige el rol `operador`.

### 1 — Escribe el servicio

**Acción:** guarda `server.mjs`.

```js
import express from 'express';
import jwt from 'jsonwebtoken';

const SECRETO = 'nexo-lab-secreto';
const cuentas = { ana: 'operador', luis: 'cliente' };
let stock = 40;

const app = express();
app.use(express.json());

app.post('/sesion', (req, res) => {
  const rol = cuentas[req.body.sub];
  if (!rol || req.body.clave !== 'nexo-lab') {
    res.status(401).json({ error: 'credenciales' });
    return;
  }
  const token = jwt.sign({ sub: req.body.sub, rol }, SECRETO, { expiresIn: '15m' });
  res.json({ token });
});

function exigir(rolExigido) {
  return (req, res, next) => {
    const cabecera = req.header('authorization') || '';
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
    try {
      const payload = jwt.verify(token, SECRETO);
      if (rolExigido && payload.rol !== rolExigido) {
        res.status(403).json({ error: 'rol insuficiente' });
        return;
      }
      req.usuario = payload;
      next();
    } catch {
      res.status(401).json({ error: 'token no valido' });
    }
  };
}

app.get('/productos/NX-1', exigir(), (req, res) => {
  res.json({ sku: 'NX-1', stock, sub: req.usuario.sub });
});

app.put('/productos/NX-1', exigir('operador'), (req, res) => {
  stock = req.body.stock;
  res.json({ sku: 'NX-1', stock });
});

app.listen(3001, () => console.log('catalogo en 3001'));
```

**Por qué:** firmar y verificar viven en el servicio. El cliente no decide su rol: lo pone el POST `/sesion` a partir de la cuenta. El PUT no mira el nombre, mira el rol.

**Resultado esperado:** `server.mjs` en la carpeta.

### 2 — Arranca

**Acción:**

```bash
node server.mjs
```

**Por qué:** los `curl` hablan con el puerto 3001.

**Resultado esperado:** `catalogo en 3001`.

### 3 — Pide el token de Ana y cambia el stock

**Acción:**

```bash
TOKEN=$(curl -s -H 'Content-Type: application/json' \
  -d '{"sub":"ana","clave":"nexo-lab"}' \
  http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"stock":35}' \
  http://127.0.0.1:3001/productos/NX-1
```

**Por qué:** Ana es `operador`. El carné que acaba de firmar el servicio le abre el PUT.

**Resultado esperado:** 200 y `{ "sku": "NX-1", "stock": 35 }`.

### 4 — Pide el token de Luis y repite el PUT

**Acción:**

```bash
TOKEN=$(curl -s -H 'Content-Type: application/json' \
  -d '{"sub":"luis","clave":"nexo-lab"}' \
  http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"stock":1}' \
  http://127.0.0.1:3001/productos/NX-1
```

**Por qué:** Luis está autenticado y aun así no opera el almacén. 403 es autorización, no un fallo de firma.

**Resultado esperado:** 403 y `{"error":"rol insuficiente"}`. El stock no pasa a 1.

### 5 — Llama sin token

**Acción:**

```bash
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/productos/NX-1
```

**Por qué:** sin carné el servicio no sabe quién llama. Eso es 401, distinto del 403 de Luis.

**Resultado esperado:** 401 y `{"error":"token no valido"}`.

## Comprueba tu entendimiento

**Luis sí puede leer**
Con el `TOKEN` de Luis todavía en la terminal:
```bash
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3001/productos/NX-1
```
→ 200, `stock` 35 (el de Ana) y `sub` igual a `luis`.

## Reto

### 1 — Un token firmado con otro secreto

Fabrica un token con el rol `operador` y el secreto `otro`, y haz el PUT.

<details>
<summary>Ver solución</summary>

```bash
FALSO=$(node --input-type=module -e "import jwt from 'jsonwebtoken'; process.stdout.write(jwt.sign({sub:'ana',rol:'operador'},'otro',{expiresIn:'15m'}))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $FALSO" \
  -H 'Content-Type: application/json' -d '{"stock":1}' \
  http://127.0.0.1:3001/productos/NX-1
```

Responde 401. El payload dice `operador`, la firma no es la de `nexo-lab-secreto`, y el middleware no llega a mirar el rol.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| 401 con el token de Ana | Falta el prefijo `Bearer ` | La cabecera es `Authorization: Bearer ` y el token |
| `TOKEN` vacío | El POST `/sesion` no devolvió JSON | Prueba el `curl` del POST solo; la clave es `nexo-lab` |
| Luis recibe 200 en el PUT | `exigir('operador')` no está en esa ruta | El PUT usa `exigir('operador')`; el GET usa `exigir()` |
