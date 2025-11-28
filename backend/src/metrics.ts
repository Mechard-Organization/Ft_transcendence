// backend/src/metrics.ts
import client from "prom-client";

// Intervalle de collecte des métriques par défaut de Node
client.collectDefaultMetrics({
  prefix: "ft_transcendence_",
});

// Compteur de requêtes HTTP
export const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Nombre total de requêtes HTTP",
  labelNames: ["method", "route", "status"] as const,
});

// Histogramme des temps de réponse
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Durée des requêtes HTTP en secondes",
  labelNames: ["method", "route", "status"] as const,
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Compteur d’erreurs applicatives (optionnel mais cool)
export const httpErrorCounter = new client.Counter({
  name: "http_errors_total",
  help: "Nombre total d'erreurs applicatives",
  labelNames: ["method", "route", "type"] as const,
});

// Export du registre pour /metrics
export const register = client.register;
