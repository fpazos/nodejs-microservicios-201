# Joi y códigos de estado

El cuerpo de un contacto es `email` y `edad`. Joi lo rechaza antes de guardarlo. El middleware de cuatro argumentos traduce el fallo a HTTP. Express 5 entrega una excepción de ruta a ese middleware.

## Cómo ejecutarlo

```bash
cd ejemplos/02-joi-errores
npm install
npm start
```

```bash
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"email":"no-es","edad":-1}' http://127.0.0.1:3001/contactos
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"email":"ana@ejemplo.test","edad":30}' http://127.0.0.1:3001/contactos
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/romper
```

## Qué se ve

400 con el mensaje de Joi, 201 con el contacto, 500 con `fallo inesperado`. El proceso sigue en marcha después del 500.
