.PHONY: help up down test lint seed clean

# Variable definitions
COMPOSE_FILE = docker-compose.yml

help:
	@echo "MonitorX Monorepo Commands:"
	@echo "  make up      - Start all services with docker-compose"
	@echo "  make down    - Stop all services"
	@echo "  make test    - Run tests for backend, agent, and frontend modules"
	@echo "  make lint    - Run linter checks (ruff/black for Python, eslint/prettier for TS)"
	@echo "  make seed    - Populate database with initial seed data"
	@echo "  make clean   - Remove build artifacts and temporary files"

up:
	docker compose -f $(COMPOSE_FILE) up -d --build

down:
	docker compose -f $(COMPOSE_FILE) down --remove-orphans

test: test-backend test-agent test-frontend

test-backend:
	@echo "Running backend tests..."
	@if [ -d "ecommerce/backend" ] && [ -f "ecommerce/backend/pytest.ini" ]; then \
		pytest ecommerce/backend ; \
	else \
		echo "Backend tests skipped (pytest target pending setup)"; \
	fi

test-agent:
	@echo "Running monitoring agent tests..."
	@if [ -d "monitoring-agent" ] && [ -f "monitoring-agent/pytest.ini" ]; then \
		pytest monitoring-agent ; \
	else \
		echo "Agent tests skipped (pytest target pending setup)"; \
	fi

test-frontend:
	@echo "Running frontend tests..."
	@if [ -d "ecommerce/frontend" ] && [ -f "ecommerce/frontend/package.json" ]; then \
		npm --prefix ecommerce/frontend test ; \
	else \
		echo "Frontend tests skipped (npm test pending setup)"; \
	fi

lint: lint-python lint-frontend

lint-python:
	@echo "Running Python linter..."
	@which ruff > /dev/null 2>&1 && ruff check . || echo "ruff not installed locally"
	@which black > /dev/null 2>&1 && black --check . || echo "black not installed locally"

lint-frontend:
	@echo "Running TS/Frontend linter..."
	@if [ -d "ecommerce/frontend" ] && [ -f "ecommerce/frontend/package.json" ]; then \
		npm --prefix ecommerce/frontend run lint ; \
	fi
	@if [ -d "monitorx/frontend" ] && [ -f "monitorx/frontend/package.json" ]; then \
		npm --prefix monitorx/frontend run lint ; \
	fi

seed:
	@echo "Seeding initial data..."
	@docker compose exec -T backend python manage.py seed_data || echo "Backend container not running for seed"

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
