# Middleware

Tres funciones ven la petición antes que la ruta, o solo algunas rutas. `morgan` escribe una línea por petición. `compression` negocia gzip. La clave `x-api-key: clave-informes` protege `/informes` y no protege `/salud`.

## Cómo ejecutarlo

```bash
cd ejemplos/02-middleware
npm install
npm start
```

```bash
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/salud
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/informes
curl -s -D - -o /tmp/informes.gz -H 'x-api-key: clave-informes' -H 'Accept-Encoding: gzip' \
  http://127.0.0.1:3001/informes
echo
file /tmp/informes.gz
```

## Qué se ve

`/salud` responde 200 sin clave. `/informes` sin clave responde 401. Con la clave, la cabecera `Content-Encoding` es `gzip` y `file` describe el cuerpo como gzip. En la terminal del servidor hay una línea de morgan por cada petición.
