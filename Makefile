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

all: up

up:
	docker compose up -d --build

down:
	docker compose down

stop:
	docker compose stop

restart: down up

re: clean all

status:
	docker compose ps -a

clean:
	docker compose down -v

fclean : clean

prune: down fclean
	docker system prune --all --force

bash:
	docker exec -it trancendence-web-1 bash

.PHONY: all prepare_directories build up down strop start restart re status remove clean prune bashmariadb bashnginx bashwordpress
