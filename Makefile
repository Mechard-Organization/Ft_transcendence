
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


clean: down
	docker compose rm -f

fclean: clean
	docker compose down -v --remove-orphans

prune: fclean
	docker system prune -af --volumes

bash:
	docker exec -it trancendence-web-1 bash


.PHONY: all prepare_directories build up down strop start restart re status remove clean prune bashmariadb bashnginx bashwordpress
