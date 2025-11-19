// src/metrics/WebVitals.tsx

"use client";

import { useEffect, useCallback } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import { metrics } from "@opentelemetry/api";
import { registerClientMetrics, flushClientMetrics } from "./providers";

const WEB_VITALS_METER = "web-vitals-meter";
const PROJECT = "nextjs-lcp-repro";
const ENVIRONMENT = "bug-test";

export const WebVitals: React.FC = () => {
  const pathname = usePathname();
  const clientMetricsEnabled = true;

  // 1. Initial Registration
  useEffect(() => {
    registerClientMetrics(clientMetricsEnabled, PROJECT, ENVIRONMENT);
  }, [clientMetricsEnabled]);

  const handleFlush = useCallback(() => {
    flushClientMetrics();
  }, []);

  // 2. Original Flush Logic
  useEffect(() => {
    let hasFlushed = false;
    const flushOnce = () => {
      if (!hasFlushed) {
        hasFlushed = true;
        handleFlush();
      }
    };

    const timerId = setTimeout(() => {
      console.log(`10-second timer fired at ${new Date().toLocaleTimeString()}.`);
      flushOnce();
    }, 10000);

    return () => {
      clearTimeout(timerId);
      flushOnce();
    };
  }, [pathname, handleFlush]);


  // 3. Web Vitals Reporting (Updated to include TTFB, FCP, LCP)
  useReportWebVitals((metric) => {
    // Only record the metrics relevant to the test
    if (!['TTFB', 'FCP', 'LCP'].includes(metric.name)) return;

    const name = metric.name;
    const description = metric.name;
    const value = metric.value;

    const meter = metrics.getMeter(WEB_VITALS_METER);
    const histogram = meter.createHistogram(name, description);

    histogram.record(value, {
      page_path: pathname,
      metric_name: metric.name,
    });
    
    console.log(`Callback Fired: ${metric.name} recorded into OTel buffer at ${new Date().toLocaleTimeString()}`);
    console.log(`${metric.name} Value: ${value}`);
  });

  return null;
};
