// srcs/server/metrics.ts
import client from "prom-client";

// On utilise le registre global par défaut
export const register = client.register;

// Métriques système Node.js avec un prefix custom
client.collectDefaultMetrics({
  prefix: "ft_transcendence_",
  register,
});

// Compteur de requêtes HTTP
export const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Nombre total de requêtes HTTP",
  labelNames: ["method", "route", "status"] as const,
});

// Histogramme des temps de réponse HTTP
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Durée des requêtes HTTP en secondes",
  labelNames: ["method", "route", "status"] as const,
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Compteur des erreurs logiques
export const httpErrorCounter = new client.Counter({
  name: "http_errors_total",
  help: "Nombre total d'erreurs applicatives",
  labelNames: ["method", "route", "type"] as const,
});
