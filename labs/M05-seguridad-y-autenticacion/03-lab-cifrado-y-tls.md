# Cifrado y TLS

[← Página anterior](02-lab-oauth-passport.md) · [Siguiente página →](../M06-docker-y-kubernetes/README.md)

Vas a guardar la contraseña de Ana de forma que no se pueda leer, a cifrar la dirección del pedido para poder recuperarla y a servir `/salud` por HTTPS.

### Objetivo

Comprobar la contraseña con bcrypt, recuperar `Calle Mayor 1` solo con la clave que cifró, y recibir `{"ok":true}` en `https://127.0.0.1:3443/salud`.

### Punto de partida

```bash
mkdir -p ~/nexo/m05-cifrado && cd ~/nexo/m05-cifrado
npm init -y
npm pkg set type=module
npm install bcrypt express@5
```

- Puerto 3443 libre.
- `openssl version` responde.

### En qué consiste

Primero la contraseña, después el campo `direccion`, después el certificado y el servidor HTTPS.

### 1 — Guarda la contraseña

**Acción:** guarda `clave.mjs` y ejecútalo.

```js
import bcrypt from 'bcrypt';

const hash = await bcrypt.hash('clave-de-ana', 10);
console.log(hash);
console.log('coincide', await bcrypt.compare('clave-de-ana', hash));
console.log('otra', await bcrypt.compare('otra', hash));
```

```bash
node clave.mjs
```

**Por qué:** bcrypt no cifra para descifrar. Guarda un hash con sal. Nexo comprueba la contraseña y no la recupera. El `10` es el coste: más alto, más lento de probar a la fuerza.

**Resultado esperado:** una línea que empieza por `$2b$10$`, luego `coincide true` y `otra false`.

### 2 — Cifra la dirección

**Acción:** guarda `direccion.mjs` y ejecútalo.

```js
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const clave = randomBytes(32);
const iv = randomBytes(12);
const cifrador = createCipheriv('aes-256-gcm', clave, iv);
const cifrado = Buffer.concat([
  cifrador.update('Calle Mayor 1', 'utf8'),
  cifrador.final(),
]);
const tag = cifrador.getAuthTag();

writeFileSync('direccion.bin', Buffer.concat([iv, tag, cifrado]));
writeFileSync('clave.bin', clave);
console.log('guardado', cifrado.length, 'bytes de cifra');
```

```bash
node direccion.mjs
```

**Por qué:** la dirección sí hay que mostrarla al repartidor. Por eso es cifrado reversible, no bcrypt. AES-256-GCM necesita la clave, el IV y la etiqueta de autenticación: si alguien toca el binario, descifrar falla.

**Resultado esperado:** `guardado` y un tamaño en bytes. Existen `direccion.bin` y `clave.bin`. `direccion.bin` no contiene el texto `Calle Mayor 1` en claro (`grep -a "Calle" direccion.bin` no lo encuentra).

### 3 — Descifra con la misma clave

**Acción:** guarda `leer.mjs` y ejecútalo.

```js
import { createDecipheriv } from 'node:crypto';
import { readFileSync } from 'node:fs';

const clave = readFileSync('clave.bin');
const datos = readFileSync('direccion.bin');
const iv = datos.subarray(0, 12);
const tag = datos.subarray(12, 28);
const cifrado = datos.subarray(28);
const desc = createDecipheriv('aes-256-gcm', clave, iv);
desc.setAuthTag(tag);
console.log(Buffer.concat([desc.update(cifrado), desc.final()]).toString('utf8'));
```

```bash
node leer.mjs
```

**Por qué:** el servicio que escribe y el que lee comparten la clave. En Nexo esa clave no iría en el mismo disco que el pedido; aquí está en `clave.bin` para que el laboratorio pueda cerrar el círculo.

**Resultado esperado:** `Calle Mayor 1`.

### 4 — Crea el certificado de laboratorio

**Acción:**

```bash
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 1 -nodes -subj "/CN=localhost"
```

**Por qué:** TLS cifra el canal. El certificado dice quién presenta el puerto 3443. `-nodes` deja la clave sin passphrase para que el proceso arranque solo. Caduca en un día: es de laboratorio.

**Resultado esperado:** `key.pem` y `cert.pem` en la carpeta. Openssl imprime el progreso de la generación.

### 5 — Sirve la salud por HTTPS

**Acción:** guarda `server.mjs`, arráncalo y, en otra terminal, llama con `curl`.

```js
import https from 'node:https';
import { readFileSync } from 'node:fs';
import express from 'express';

const app = express();
app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

https.createServer({
  key: readFileSync('key.pem'),
  cert: readFileSync('cert.pem'),
}, app).listen(3443, () => console.log('tls en 3443'));
```

```bash
node server.mjs
curl -sk https://127.0.0.1:3443/salud
echo
```

**Por qué:** `-k` acepta el certificado que acabas de firmar tú. Sin esa opción, el cliente no confía en él. El JSON de la salud ya no viaja en HTTP plano.

**Resultado esperado:** `{"ok":true}`.

## Comprueba tu entendimiento

**El certificado no está en la lista de confianza del sistema**
```bash
curl -sS https://127.0.0.1:3443/salud
```
→ `curl` termina con error de certificado (código 60). El canal existe; falta confiar en quien lo firma. Con `-k` el paso 5 sí respondía.

## Reto

### 1 — Una clave que no es la que cifró

Copia `leer.mjs` a `leer-mal.mjs` y usa `randomBytes(32)` en lugar de `clave.bin`.

<details>
<summary>Ver solución</summary>

Sustituye la lectura de la clave por:

```js
import { createDecipheriv, randomBytes } from 'node:crypto';
const clave = randomBytes(32);
```

`node leer-mal.mjs` lanza `Unsupported state or unable to authenticate data`. GCM no devuelve un texto casi correcto: o es la clave y la etiqueta, o no descifra.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `coincidir` siempre false | Se compara contra el texto del hash mal copiado, o se ha vuelto a hacer `hash` y se compara con el anterior | Usa el `hash` que imprime esa misma ejecución |
| `bad decrypt` al leer | `direccion.bin` no se generó con esta `clave.bin` | Vuelve a ejecutar `node direccion.mjs` y luego `node leer.mjs` |
| `EADDRINUSE` en 3443 | Quedó un `server.mjs` anterior | Ctrl+C en esa terminal |
