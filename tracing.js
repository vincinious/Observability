const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");

module.exports = (serviceName) => {
    // Configured Jaeger Exporter
    const jaegerExporter = new JaegerExporter({
        endpoint: "http://localhost:14268/api/traces", // Jaeger's default endpoint for receiving traces
    });

    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    // Added the Jaeger Exporter to the provider
    provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
    provider.register();

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    return trace.getTracer(serviceName);
};
