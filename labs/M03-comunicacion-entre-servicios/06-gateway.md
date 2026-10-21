# Gateway

[← Consul](05-consul.md) · [Siguiente página →](07-proxy-inverso.md)

El cliente de fuera no tiene por qué conocer cada servicio. El gateway es el único puerto publicado. Mira el camino y reenvía.

| Camino de fuera | Servicio de dentro | Qué responde |
|-----------------|--------------------|--------------|
| `GET /api/clima/hoy` en el 8080 | `clima` en el 3001 | Madrid, nubes |
| `GET /api/cotizaciones/usd` en el 8080 | `cotizaciones` en el 3002 | EURUSD, 1.08 |

Los puertos 3001 y 3002 no están publicados en el host. Un `curl` directo no conecta. El cliente solo ve el 8080.

Cada servicio tiene su Dockerfile en su carpeta. El gateway es otro proceso Express: no es un producto aparte. Kong o NGINX como plataforma quedan fuera. Aquí se ve el papel: un proceso delante, dos detrás, un contrato de caminos.

El descubrimiento dice dónde está un servicio. El gateway dice por dónde entra el cliente. Hacen preguntas distintas.

Cuando un mismo camino tiene dos procesos y un check de salud, ese papel lo hace HAProxy con un fichero. Está en [Gateway con HAProxy](08-gateway-haproxy.md).

## Ejemplo

La demostración está en [Gateway](../../ejemplos/03-gateway/README.md). Los dos `curl` al 8080 devuelven el clima y la cotización. El `curl` a `http://127.0.0.1:3001/hoy` no conecta.

## Laboratorio

[Agenda y tiempo](lab-gateway/README.md). Esos dos servicios ya responden: la cita de hoy y el tiempo de mañana. El gateway solo tiene `/salud`. Los caminos `/api/agenda/hoy` y `/api/tiempo/manana` se añaden en `gateway/server.mjs`, que el Compose monta y arranca con `node --watch`. Los nombres de dentro son `agenda` y `tiempo`.
