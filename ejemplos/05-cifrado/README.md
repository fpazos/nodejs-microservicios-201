# bcrypt, crypto y TLS

bcrypt guarda la contraseña para comprobarla: no se descifra. AES-256-GCM cifra la dirección y sí se recupera, con la misma clave, el IV y la etiqueta. TLS cifra el canal.

## Cómo ejecutarlo

```bash
cd ejemplos/05-cifrado
npm install
npm run clave
npm run cifrar
npm run leer
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 1 -nodes -subj "/CN=localhost"
npm start
```

```bash
curl -sk https://127.0.0.1:3443/salud
echo
```

## Qué se ve

Un hash que empieza por `$2`, `coincide true`, `otra false`, `Calle Mayor 1`, y por HTTPS `{"ok":true}`. `curl` sin `-k` rechaza el certificado: lo has firmado tú y el sistema no lo conoce.

`key.pem`, `cert.pem`, `clave.bin` y `direccion.bin` son de este ejemplo. No se versionan si los generas en local; no hace falta subirlos.
