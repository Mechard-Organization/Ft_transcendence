# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mechard <mechard@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/11/12 13:14:27 by abutet            #+#    #+#              #
#    Updated: 2025/12/04 15:22:43 by mechard          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# =========================
# ft_transcendence Makefile
# =========================

# --- Project configuration ---
PROJECT := ft_transcendence
COMPOSE := docker compose -p $(PROJECT)
IMAGES  := docker images
VOLUMES := docker volume
SYSTEM  := docker system

# --- Helpers ---
# Allows: make logs nginx  -> nginx is interpreted as a service
ARGS := $(filter-out $@,$(MAKECMDGOALS))
SERVICE ?= $(firstword $(ARGS))

# Colors
BLUE := \033[1;34m
GREEN := \033[1;32m
YELLOW := \033[1;33m
RED := \033[1;31m
RESET := \033[0m

# =========================
# Default target
# =========================

all: start

# =========================
# Help
# =========================

help:
	@echo ""
	@echo "$(BLUE)$(PROJECT) — Docker Compose Commands$(RESET)"
	@echo ""
	@echo "$(YELLOW)Startup & lifecycle$(RESET)"
	@echo "  make up                 # start in detached mode"
	@echo "  make down               # stop + remove (keeps volumes)"
	@echo "  make stop [svc]         # stop (all or a specific service)"
	@echo "  make start              # build + up (handy shortcut)"
	@echo "  make resume [svc]       # docker compose start (restart without recreating)"
	@echo "  make restart            # restart everything"
	@echo ""
	@echo "$(YELLOW)Debug & status$(RESET)"
	@echo "  make ps [svc]           # list containers"
	@echo "  make logs [svc]         # show logs (all or specific service)"
	@echo "  make status             # quick alias for 'ps'"
	@echo "  make exec SERVICE=svc   # open a /bin/sh shell inside a container"
	@echo ""
	@echo "$(YELLOW)Build & images$(RESET)"
	@echo "  make build [svc]        # build"
	@echo "  make pull               # pull images"
	@echo "  make images             # list project images"
	@echo "  make volumes            # list project volumes"
	@echo ""
	@echo "$(YELLOW)Cleanup$(RESET)"
	@echo "  make clean              # down -v (remove service volumes)"
	@echo "  make fclean             # clean + rm data/db and data/"
	@echo "  make prune              # full reset (images, cache, unused volumes)"
	@echo "  make re                 # prune + up (start clean)"
	@echo ""

# =========================
# Start / Stop
# =========================

prepare:
	@chmod 777 ./srcs/config/database

up: prepare
	@$(COMPOSE) up -d

start: build up

down:
	@$(COMPOSE) down

resume:
	@$(COMPOSE) start $(if $(SERVICE),$(SERVICE),)

stop:
	@$(COMPOSE) stop $(if $(SERVICE),$(SERVICE),)

restart: down up

re: prune up

rebirth: fprune up

# =========================
# Build / Images / Volumes
# =========================

build:
	@$(COMPOSE) build $(if $(SERVICE),$(SERVICE),)

pull:
	@$(COMPOSE) pull

images:
	@$(COMPOSE) images || $(IMAGES) | grep $(PROJECT) || true

volumes:
	@$(VOLUMES) ls --filter label=com.docker.compose.project=$(PROJECT) || true

# =========================
# Logs / PS / Status / Exec
# =========================

logs:
	@$(COMPOSE) logs -f --tail=200 $(if $(SERVICE),$(SERVICE),)

ps:
	@$(COMPOSE) ps $(if $(SERVICE),$(SERVICE),)

status: ps

# Opens a shell inside a service container (default: /bin/sh)
# Usage: make exec SERVICE=nginx
exec:
ifdef SERVICE
	@$(COMPOSE) exec $(SERVICE) /bin/sh
else
	@echo "$(RED)Spécifie un service: make exec SERVICE=<nom_service>$(RESET)"; exit 1
endif

# =========================
# Cleanup
# =========================

clean:
	@$(COMPOSE) down -v

fclean: clean
	@rm -rf srcs/config/database/data
	@$(COMPOSE) rm -fsv || true

prune: down clean
	@$(SYSTEM) prune -af --volumes

fprune: down fclean
	@$(SYSTEM) prune -af --volumes

# =========================
# Phony (safety)
# =========================

.PHONY: all help prepare up down stop restart re build pull images volumes logs ps status exec clean fclean prune start resume
