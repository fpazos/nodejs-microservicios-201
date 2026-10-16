# Rutas HTTP con Express

Una nota vive en memoria. Cada verbo hace una cosa: GET lee, POST crea (201), PUT sustituye, DELETE borra (204). Un id que no está responde 404.

## Cómo ejecutarlo

```bash
cd ejemplos/02-rutas-http
npm install
npm start
```

```bash
curl -s -D - -H 'Content-Type: application/json' -d '{"id":"n1","texto":"comprar cafe"}' http://127.0.0.1:3001/notas
echo
curl -s http://127.0.0.1:3001/notas/n1
echo
curl -s -X PUT -H 'Content-Type: application/json' -d '{"texto":"comprar te"}' http://127.0.0.1:3001/notas/n1
echo
curl -s -D - -o /dev/null -X DELETE http://127.0.0.1:3001/notas/n1
curl -s -D - -o /dev/null http://127.0.0.1:3001/notas/n1
```

## Qué se ve

201 con la nota, luego el texto nuevo, luego 204 y un 404. GET `/notas` antes del alta devuelve `[]`.

Este ejemplo no valida el cuerpo ni pide clave. Eso está en los dos ejemplos siguientes. El laboratorio del módulo junta las tres cosas sobre otro recurso.
