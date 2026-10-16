// --import carga esto antes de Express. Si el SDK arrancara dentro de
// server.mjs, el primer GET podría no quedar instrumentado. El exportador
// habla OTLP HTTP con el 4318 de Jaeger, no con la UI del 16686.
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://127.0.0.1:4318/v1/traces' }),
  instrumentations: [getNodeAutoInstrumentations()], // el span del GET lo abre la librería, no la ruta
});
sdk.start();
