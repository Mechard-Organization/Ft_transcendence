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

COMPOSE = docker compose -p ft_transcendence
SYSTEM	= docker system -p ft_transcendence

%:
	@:

all: up

up:
	mkdir -p data
	mkdir -p data/db
	$(COMPOSE) up -d

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps $(filter-out $@,$(MAKECMDGOALS))

stop:
	$(COMPOSE) stop $(filter-out $@,$(MAKECMDGOALS))


down: stop
	$(COMPOSE) down

clean: down
	$(COMPOSE) down -v

fclean : clean
	rm -rf data/db
	rm -rf data
	$(COMPOSE) rm -v

prune: down fclean
	$(SYSTEM) prune -af --volumes

restart: down up

re: prune all

.PHONY: all prepare_directories build up down strop start restart re status remove clean prune bashmariadb bashnginx bashwordpress
