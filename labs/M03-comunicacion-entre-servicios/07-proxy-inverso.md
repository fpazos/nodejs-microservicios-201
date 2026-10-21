# Proxy inverso

[← Gateway](06-gateway.md) · [Siguiente página →](08-gateway-haproxy.md)

El gateway de la página anterior reenvía así: `fetch` al servicio de dentro, `await respuesta.text()` y luego `res.send`. Es almacenar y reenviar. El gateway recibe el cuerpo entero, lo guarda en memoria y solo entonces empieza a mandarlo. Mientras tanto el cliente espera sin recibir nada.

Con un JSON corto no importa. Con una respuesta que se genera poco a poco (una exportación, un informe, un fichero) hay dos tramos lentos: el servicio tarda en producirla y el cliente tarda en descargarla. Si el gateway almacena antes de reenviar, esos dos tiempos se suman y la latencia se dobla.

Un proxy inverso no guarda el cuerpo. Abre la petición al servicio de dentro y encadena (pipe) la respuesta hacia el cliente según llega. Los dos tramos se solapan, así que el total es el del tramo más lento, no la suma. De paso, el proxy reenvía cualquier método, la ruta, las cabeceras y el cuerpo de la petición sin que tengas que escribir una ruta por cada camino.

| | Gateway a mano (06) | Proxy inverso |
|---|---|---|
| Primer byte al cliente | Cuando el servicio termina | En cuanto el servicio escribe |
| Tiempo total | Generar + descargar | El mayor de los dos |
| Memoria en el gateway | La respuesta entera | Un trozo cada vez |
| Rutas | Una por camino y método | Un prefijo entero |

En Node, `http-proxy-middleware` monta un proxy inverso dentro de Express con una línea: `app.use('/proxy', createProxyMiddleware({ target: 'http://informe:3001' }))`. NGINX, Envoy o Kong hacen lo mismo como productos aparte, y el principio es el mismo: encadenar, no almacenar.

El gateway a mano sigue teniendo su sitio cuando de verdad tiene que mirar el cuerpo, por ejemplo para juntar dos respuestas en una o quitar campos. Ese trabajo exige tener el cuerpo entero, y por eso cuesta la espera.

## Ejemplo

La demostración está en [Proxy inverso](../../ejemplos/03-proxy-inverso/README.md). Un cliente que lee a 100 KB/s pide el mismo informe de 200 KB por las dos entradas. `/a-mano` tarda unos 4 s y el primer byte llega a los 2 s. `/proxy` tarda unos 2 s y el primer byte llega casi al instante.

## Laboratorio

[Facturas](lab-proxy/README.md). El gateway reenvía `/api/facturas/csv` a mano y tarda unos 4 s con el cliente lento. Añades un proxy inverso en `/proxy` y mides el mismo CSV en unos 2 s. Después ves que `/proxy/resumen` funciona sin haber escrito esa ruta.
