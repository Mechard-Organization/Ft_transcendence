# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: abutet <abutet@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/11/12 13:14:27 by abutet            #+#    #+#              #
#    Updated: 2025/11/12 13:14:32 by abutet           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# =========================
# ft_transcendence Makefile
# =========================

# --- Config projet ---
PROJECT := ft_transcendence
COMPOSE := docker compose -p $(PROJECT)
IMAGES	:= docker images
VOLUMES	:= docker volumes
SYSTEM  := docker system

# --- Helpers ---
# Permet: make logs nginx  -> nginx est interprété comme service
ARGS := $(filter-out $@,$(MAKECMDGOALS))
SERVICE ?= $(firstword $(ARGS))

# Couleurs
BLUE := \033[1;34m
GREEN := \033[1;32m
YELLOW := \033[1;33m
RED := \033[1;31m
RESET := \033[0m

# =========================
# Cible par défaut
# =========================

all: start

# =========================
# Aide
# =========================

help:
	@echo ""
	@echo "$(BLUE)$(PROJECT) — Commandes Docker Compose$(RESET)"
	@echo ""
	@echo "$(YELLOW)Démarrage & cycle de vie$(RESET)"
	@echo "  make up                 # démarre en détaché"
	@echo "  make down               # stop + remove (garde volumes)"
	@echo "  make stop [svc]         # stop (global ou service)"
	@echo "  make start  		     # start (global ou service)"
	@echo "  make restart            # redémarre tout"
	@echo ""
	@echo "$(YELLOW)Debug & état$(RESET)"
	@echo "  make ps [svc]           # liste conteneurs"
	@echo "  make logs [svc]         # logs (global ou service)"
	@echo "  make status             # équivalent rapide de 'ps'"
	@echo "  make exec SERVICE=svc   # shell /bin/sh dans un conteneur"
	@echo ""
	@echo "$(YELLOW)Build & images$(RESET)"
	@echo "  make build [svc]        # build"
	@echo "  make pull               # pull des images"
	@echo "  make images             # liste images"
	@echo "  make volumes            # liste volumes"
	@echo ""
	@echo "$(YELLOW)Nettoyage$(RESET)"
	@echo "  make clean              # down -v (supprime volumes des services)"
	@echo "  make fclean             # clean + rm data/db et data/"
	@echo "  make prune              # reset total (images, caches, volumes non utilisés)"
	@echo "  make re                 # prune + up (repart propre)"
	@echo ""

# =========================
# Démarrage / Arrêt
# =========================

prepare:
	@mkdir -p data
	@mkdir -p data/db

up: prepare
	@$(COMPOSE) up -d

start: build up

down:
	@$(COMPOSE) down $(if $(SERVICE),$(SERVICE),)

stop:
	@$(COMPOSE) stop $(if $(SERVICE),$(SERVICE),)

restart: down up

re: prune up

# =========================
# Build / Images / Volumes
# =========================

build:
	@$(COMPOSE) build $(if $(SERVICE),$(SERVICE),)

pull:
	@$(COMPOSE) pull

images:
	@$(IMAGES) | grep $(PROJECT) || true

volumes:
	@$(VOLUMES) ls | grep $(PROJECT) || true

# =========================
# Logs / PS / Status / Exec
# =========================

logs:
	@$(COMPOSE) logs -f --tail=200 $(if $(SERVICE),$(SERVICE),)

ps:
	@$(COMPOSE) ps $(if $(SERVICE),$(SERVICE),)

status: ps

# Ouvre un shell dans le conteneur d'un service (défaut: /bin/sh)
# Usage: make exec SERVICE=nginx
exec:
ifdef SERVICE
	@$(COMPOSE) exec $(SERVICE) /bin/sh
else
	@echo "$(RED)Spécifie un service: make exec SERVICE=<nom_service>$(RESET)"; exit 1
endif

# =========================
# Nettoyage
# =========================

clean: down
	@$(COMPOSE) down -v

fclean: clean
	@rm -rf data/db
	@rm -rf data
	@$(COMPOSE) rm -fsv || true

prune: down fclean
	@$(SYSTEM) prune -af --volumes

# =========================
# Phony (sécurité)
# =========================
.PHONY: all help prepare up down stop restart re build pull images volumes logs ps status exec clean fclean prune