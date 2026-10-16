# bcrypt, crypto y TLS

[← OAuth](01-oauth.md) · [Siguiente página →](../M06-docker-y-kubernetes/00-dockerfile.md)

Tres cifras distintas, para tres cosas distintas.

**La contraseña.** bcrypt guarda un hash. `clave-de-eva` produce una cadena que empieza por `$2`. Comprobar es volver a hashear y comparar. No hay operación inversa: del hash no sale la clave. Otra clave da `false`.

**Un campo que sí hay que recuperar.** AES-256-GCM cifra la dirección. Para abrirla hacen falta la misma clave, el IV de 12 bytes y la etiqueta de 16. El fichero del ejemplo junta IV, etiqueta y texto cifrado. `leer` recupera `Calle Mayor 1`. Si falta la etiqueta, o la clave es otra, no sale el texto.

**El canal.** TLS cifra lo que viaja entre el cliente y el proceso. El certificado del ejemplo lo firma openssl para `localhost`, un día, sin frase de paso. `curl` con `-k` acepta esa firma. Sin `-k` lo rechaza: el sistema no conoce a quien firmó. En un servicio real el certificado lo firma una autoridad que el cliente ya tiene. El puerto del ejemplo es 3443.

| Qué | ¿Se recupera el original? | Dónde vive |
|-----|---------------------------|------------|
| bcrypt | No | En la base, en lugar de la clave |
| AES-256-GCM | Sí, con la clave, el IV y la etiqueta | El campo |
| TLS | El cliente ve el HTTP en claro después de descifrar el canal | El viaje |

## Ejemplo

La demostración está en [bcrypt, crypto y TLS](../../ejemplos/05-cifrado/README.md). Se ve el hash, `coincide true`, `otra false`, la calle descifrada y `{"ok":true}` por HTTPS.

No hay laboratorio. Las tres salidas se generan al ejecutar el ejemplo.
