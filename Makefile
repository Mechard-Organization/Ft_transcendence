SHELL := /bin/bash

# Couleurs
GREEN=\033[0;32m
CYAN=\033[0;36m
NC=\033[0m

# Containers
EDGE=ft_edge

.PHONY: help certs up down rebuild logs reload clean prune

help:
	@echo -e "$(CYAN)Cibles disponibles:$(NC)"
	@echo "  make certs   - Génère des certificats dev (docker/certs/dev.crt/dev.key)"
	@echo "  make up      - Build & démarre la stack en arrière-plan"
	@echo "  make down    - Stoppe et supprime les containers"
	@echo "  make rebuild - Rebuild sans cache & relance"
	@echo "  make logs    - Affiche les logs (suivi)"
	@echo "  make reload  - Reload Nginx (edge)"
	@echo "  make clean   - Supprime volumes anonymes (dangereux)"
	@echo "  make prune   - Nettoyage images/volumes non utilisés"

certs:
	@mkdir -p docker/certs
	@if command -v mkcert >/dev/null 2>&1; then \
	  echo -e "$(GREEN)[mkcert]$(NC) Génération certifs pour localhost..."; \
	  mkcert -install >/dev/null 2>&1 || true; \
	  mkcert -key-file docker/certs/dev.key -cert-file docker/certs/dev.crt localhost 127.0.0.1 ::1; \
	else \
	  echo -e "$(GREEN)[openssl]$(NC) mkcert introuvable, fallback openssl..."; \
	  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
	    -keyout docker/certs/dev.key -out docker/certs/dev.crt \
	    -subj "/C=FR/ST=IDF/L=Paris/O=Dev/CN=localhost"; \
	fi
	@echo -e "$(GREEN)Certificats OK -> docker/certs$(NC)"

up:
	docker compose --env-file .env up -d --build
	@echo -e "$(GREEN)Up -> https://localhost$(NC)"

down:
	docker compose down

rebuild:
	docker compose build --no-cache
	docker compose up -d

logs:
	docker compose logs -f

reload:
	-docker exec $(EDGE) nginx -s reload || true

clean:
	docker compose down -v

prune:
	docker system prune -f
