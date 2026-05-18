.PHONY: install-web install-android run-web run-android

FRONTEND_DIR := frontend
BACKEND_DIR  := backend
VENV_DIR     := $(BACKEND_DIR)/.venv

ifeq ($(OS),Windows_NT)
    PYTHON := $(VENV_DIR)/Scripts/python
    PIP    := $(VENV_DIR)/Scripts/pip
else
    PYTHON := $(VENV_DIR)/bin/python
    PIP    := $(VENV_DIR)/bin/pip
endif

# ── Setup ──────────────────────────────────────────────────────────────────────

install-web:
	@echo "=== Checking required tools ==="
	@command -v node   > /dev/null 2>&1 || (echo "[ERROR] Node.js not found — install from https://nodejs.org" && exit 1)
	@command -v npm    > /dev/null 2>&1 || (echo "[ERROR] npm not found — comes with Node.js"                  && exit 1)
	@command -v python > /dev/null 2>&1 || (echo "[ERROR] Python not found — install from https://python.org"  && exit 1)
	@echo "  node   $$(node --version)"
	@echo "  npm    $$(npm --version)"
	@echo "  python $$(python --version)"
	@echo ""
	@echo "=== Backend ==="
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "  Creating virtual environment..."; \
		python -m venv $(VENV_DIR); \
	else \
		echo "  Virtual environment already exists."; \
	fi
	@echo "  Installing packages..."
	@$(PIP) install -r $(BACKEND_DIR)/requirements.txt -q
	@echo "  Applying migrations..."
	@cd $(BACKEND_DIR) && ../$(PYTHON) manage.py migrate
	@echo ""
	@echo "=== Frontend ==="
	@echo "  Installing packages..."
	@cd $(FRONTEND_DIR) && npm install
	@echo ""
	@echo "Setup complete. Run 'make run-web' to start."

install-android: install-web
	@echo ""
	@echo "=== Android ==="
	@command -v adb > /dev/null 2>&1 || (echo "[ERROR] adb not found — install Android Studio or standalone SDK" && exit 1)
	@echo "  adb    $$(adb version | head -1)"
	@echo "  Syncing Capacitor..."
	@cd $(FRONTEND_DIR) && npx cap sync android
	@echo ""
	@echo "Android setup complete. Run 'make run-android' to launch the emulator."

# ── Run ────────────────────────────────────────────────────────────────────────

run-web:
	@[ -d "$(FRONTEND_DIR)/node_modules" ] || (echo "[ERROR] Frontend not set up. Run 'make install-web' first." && exit 1)
	@echo "Opening frontend in a separate window (API: remote)..."
	$(eval WINDIR := $(shell cygpath -w $(CURDIR)))
	@powershell -NoProfile -Command "Start-Process cmd -ArgumentList '/k', 'scripts\run-frontend.bat' -WorkingDirectory '$(WINDIR)'"
	@sleep 4 && powershell -NoProfile -Command "Start-Process 'http://localhost:5173'"

run-android:
	node scripts/emulator.js
