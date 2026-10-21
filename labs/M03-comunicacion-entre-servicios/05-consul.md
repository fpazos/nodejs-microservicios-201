# Consul

[← WebSockets](04-websockets.md) · [Siguiente página →](06-gateway.md)

Hasta aquí cada cliente lleva escrita la dirección del otro. Cuando el servicio se mueve, hay que cambiar esa dirección en todos los que le llaman.

Consul es el listín. El servicio, al arrancar, se registra: nombre, dirección, puerto y un check HTTP. El cliente no llama a una URL fija del negocio. Pregunta a Consul quién está `passing` con ese nombre y usa la dirección que le devuelven.

El check tiene que poder fallar. Por eso el proceso escucha antes de registrarse: si se apunta en el listín y todavía no acepta conexiones, el check lo marca mal y el cliente no lo elige.

En el ejemplo el servicio se llama `reloj` y corre con dos réplicas. Cada una se registra con el mismo nombre y con su propio ID (`reloj-<hostname>`), su IP en la red de Compose y un check a `http://<su IP>:3001/salud`. El nombre de Docker `reloj` no vale como dirección: resuelve a cualquiera de las dos, y el listín tiene que distinguirlas. La UI de Consul está en el puerto 8500. El puerto del reloj no se publica en el host: quien lo encuentra es quien pregunta al listín.

El temario de comunicación no nombraba el descubrimiento. Sin listín, el resto de mecanismos siguen necesitando la dirección a mano.

## Ejemplo

La demostración está en [Consul](../../ejemplos/03-consul/README.md). En los logs, cada réplica dice `registrado en consul`. Luego el cliente imprime seis horas, y el `id` alterna entre las dos instancias. En la UI el servicio tiene dos instancias en passing.

## Laboratorio

[Prefijos](lab-consul/README.md). El servicio ya responde `+34` en el puerto 3001 y no se registra. El cliente llama a `http://127.0.0.1:3001/codigo` escrito a mano. El registro usa la dirección `127.0.0.1` para que el cliente del host pueda llamarlo, y el check `http://prefijos:3001/salud` para que Consul, dentro de Docker, llegue al proceso. Al terminar, el cliente imprime `descubierto`.
