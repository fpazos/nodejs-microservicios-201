# JWT y roles

`eva` es `editor` y puede cambiar el título. `leo` es `lector`: el token es válido y el PUT responde 403. Sin token, 401. El secreto de este ejemplo es `secreto-articulos`. La clave de las dos cuentas es `lab`.

## Cómo ejecutarlo

```bash
cd ejemplos/05-jwt
npm install
npm start
```

```bash
TOKEN=$(curl -s -H 'Content-Type: application/json' -d '{"sub":"eva","clave":"lab"}' http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"titulo":"publicado"}' http://127.0.0.1:3001/articulos/a1
TOKEN=$(curl -s -H 'Content-Type: application/json' -d '{"sub":"leo","clave":"lab"}' http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"titulo":"otro"}' http://127.0.0.1:3001/articulos/a1
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/articulos/a1
```

## Qué se ve

200 y `titulo` `publicado`. Luego 403. Luego 401.

El payload del token se lee sin la clave (`jwt.decode`). La firma solo cuadra con `secreto-articulos`.
