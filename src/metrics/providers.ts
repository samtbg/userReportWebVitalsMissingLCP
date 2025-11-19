// src/metrics/providers.ts

import { metrics } from "@opentelemetry/api";
import { ExportResult, ExportResultCode } from "@opentelemetry/core"; 
import { MeterProvider, PeriodicExportingMetricReader, PushMetricExporter, ResourceMetrics } from "@opentelemetry/sdk-metrics";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

// --- Mock Exporter Logic ---
class MockMetricExporter implements PushMetricExporter {
    export(metrics: ResourceMetrics, resultCallback: (result: ExportResult) => void): void {
        const receivedMetrics = metrics.scopeMetrics
            .flatMap(sm => sm.metrics)
            .map(m => m.descriptor.name);

        if (receivedMetrics.length > 0) {
            console.log("--- OTel Flush Initiated ---");
            console.log(`✅ METRICS SENT: ${receivedMetrics.join(', ')}`);
            console.log("----------------------------");
        } else {
            console.log("--- OTel Flush Initiated (NO METRICS SENT) ---");
        }
        
        resultCallback({ code: ExportResultCode.SUCCESS });
    }
    forceFlush(): Promise<void> { return Promise.resolve(); }
    shutdown(): Promise<void> { return Promise.resolve(); }
}

const mockExporter = new MockMetricExporter();

// --- Provider Logic ---

let metricReader: PeriodicExportingMetricReader | null = null;
let isMetricsInitialized = false;

const resourceClientMetrics = (
  project: string,
  environment: string,
) => resourceFromAttributes({ [ATTR_SERVICE_NAME]: project, environment });

export const registerClientMetrics = (
  clientMetricsEnabled: boolean,
  project: string,
  environment: string,
): void => {
  if (isMetricsInitialized || !clientMetricsEnabled) {
    return;
  }
  isMetricsInitialized = true;

  const exportInterval = 1000 * 10;

  const newMetricReader = new PeriodicExportingMetricReader({
    exporter: mockExporter,
    exportIntervalMillis: exportInterval,
  });

  metricReader = newMetricReader;

  const meterProvider = new MeterProvider({
    resource: resourceClientMetrics(project, environment),
    readers: [metricReader],
  });

  metrics.setGlobalMeterProvider(meterProvider);
};

export const flushClientMetrics = (): void => {
  if (!metricReader) {
    return;
  }
  console.log("Forcing OTel flush...");
  metricReader.forceFlush();
};
