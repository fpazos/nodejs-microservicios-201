// Un solo sitio para el acuerdo. Publicador y consumidor leen estas
// dos constantes: si cada uno nombrara la cola por su lado, el mensaje
// se publicaría donde nadie lee.
export const cola = 'trabajos';
export const cuerpo = JSON.stringify({ tarea: 'barrer' });
export const cuerpo2 = JSON.stringify({ tarea: 'limpiar' });
export const cuerpo3 = JSON.stringify({ tarea: 'aspirar' });
export const cuerpo4 = JSON.stringify({ tarea: 'vaciar basura' });
