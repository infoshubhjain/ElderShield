#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REQUIRED_TOOLS=("node" "npm")
SERVER_PORT_DEFAULT=4000
WEB_PORT_DEFAULT=5173
ENV_FILE="server/.env"

check_tools() {
  echo "→ Checking required system tools..."
  for tool in "${REQUIRED_TOOLS[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
      echo -e "${RED}✗ Required tool not found: $tool${NC}"
      exit 1
    fi
  done
  echo -e "${GREEN}✓ All system tools found${NC}"
}

kill_port_process() {
  local port=$1
  if command -v lsof &> /dev/null; then
    if lsof -i ":$port" > /dev/null 2>&1; then
      local pid=$(lsof -i ":$port" -t | head -n 1)
      if [ -n "$pid" ]; then
        kill -9 "$pid" 2>/dev/null || true
        sleep 0.5
      fi
    fi
  elif command -v ss &> /dev/null; then
    if ss -tlnp 2>/dev/null | grep ":$port " > /dev/null; then
      ss -tlnp 2>/dev/null | grep ":$port " | awk '{print $NF}' | cut -d'=' -f2 | cut -d'/' -f1 | xargs -r kill -9 2>/dev/null || true
      sleep 0.5
    fi
  elif command -v fuser &> /dev/null; then
    fuser -k "$port/tcp" 2>/dev/null || true
    sleep 0.5
  fi
}

find_free_port() {
  local port=$1
  local max_attempts=10
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    kill_port_process "$port"

    if command -v lsof &> /dev/null; then
      if ! lsof -i ":$port" > /dev/null 2>&1; then
        echo "$port"
        return 0
      fi
    elif command -v ss &> /dev/null; then
      if ! ss -tlnp 2>/dev/null | grep ":$port " > /dev/null; then
        echo "$port"
        return 0
      fi
    elif command -v fuser &> /dev/null; then
      if ! fuser "$port/tcp" > /dev/null 2>&1; then
        echo "$port"
        return 0
      fi
    else
      echo "$port"
      return 0
    fi

    port=$((port + 1))
    attempt=$((attempt + 1))
  done

  echo "$port"
}

resolve_ports() {
  echo "→ Resolving ports..."

  if [ -z "$(command -v lsof)" ] && [ -z "$(command -v ss)" ] && [ -z "$(command -v fuser)" ]; then
    echo -e "${YELLOW}⚠ No port detection tool available (lsof, ss, fuser). Skipping port cleanup.${NC}"
  fi

  SERVER_PORT=$(find_free_port "$SERVER_PORT_DEFAULT")
  WEB_PORT=$(find_free_port "$WEB_PORT_DEFAULT")
  export PORT="$SERVER_PORT"
  export VITE_PORT="$WEB_PORT"
  echo -e "${GREEN}✓ Server port: $SERVER_PORT, Web port: $WEB_PORT${NC}"
}

check_env() {
  echo "→ Checking environment variables..."

  if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ Missing required file: $ENV_FILE${NC}"
    echo "   Create server/.env with:"
    echo "   JWT_SECRET=change-me"
    echo "   WEB_ORIGIN=http://localhost:$WEB_PORT"
    echo "   DATABASE_URL=file:./dev.db"
    exit 1
  fi

  set +e
  source "$ENV_FILE" 2>/dev/null
  set -e

  local required_vars=("JWT_SECRET" "WEB_ORIGIN" "DATABASE_URL")
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo -e "${RED}✗ Missing environment variable: $var${NC}"
      exit 1
    fi
  done

  echo -e "${GREEN}✓ Environment variables configured${NC}"
}

setup_dependencies() {
  echo "→ Setting up dependencies..."

  if [ ! -d "node_modules" ]; then
    npm install --silent 2>&1 | grep -v "^$" | tail -5 || true
  else
    echo "  Reusing existing node_modules"
  fi

  echo -e "${GREEN}✓ Dependencies installed${NC}"
}

setup_database() {
  echo "→ Initializing database..."

  if [ ! -f "server/prisma/dev.db" ]; then
    (cd server && npm run prisma:generate --silent 2>&1 || true)
  fi

  echo -e "${GREEN}✓ Database initialized${NC}"
}

start_app() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${GREEN}● ElderShield${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Backend:  http://localhost:$PORT"
  echo "  Frontend: http://localhost:$VITE_PORT"
  echo ""

  PORT="$PORT" npm run dev:server &
  SERVER_PID=$!

  sleep 2

  VITE_PORT="$VITE_PORT" npm run dev:web &
  WEB_PID=$!

  trap "kill $SERVER_PID $WEB_PID 2>/dev/null; wait 2>/dev/null; exit 0" INT TERM

  wait
}

check_tools
resolve_ports
check_env
setup_dependencies
setup_database
start_app
