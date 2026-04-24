#!/bin/bash

echo "============================================"
echo "  AI Localization & Translation Agency"
echo "  Starting Application..."
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Kill processes on ports 3000, 3001
echo -e "${YELLOW}Cleaning up used ports...${NC}"
for port in 3000 3001; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo -e "${RED}Killing process on port $port (PID: $pid)${NC}"
    kill -9 $pid 2>/dev/null
  fi
done
sleep 1

# Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}PostgreSQL is not installed. Please install it first.${NC}"
  exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
  echo -e "${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
    echo -e "${RED}Could not start PostgreSQL. Please start it manually.${NC}"
    exit 1
  }
  sleep 2
fi

# Create database if not exists
echo -e "${BLUE}Setting up database...${NC}"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'ai_localization_agency'" 2>/dev/null | grep -q 1 || \
  createdb -U postgres ai_localization_agency 2>/dev/null || \
  psql -tc "SELECT 1 FROM pg_database WHERE datname = 'ai_localization_agency'" 2>/dev/null | grep -q 1 || \
  createdb ai_localization_agency 2>/dev/null

# Install dependencies
echo -e "${BLUE}Installing server dependencies...${NC}"
cd server && npm install --silent 2>&1 | tail -1
echo -e "${BLUE}Installing client dependencies...${NC}"
cd ../client && npm install --silent 2>&1 | tail -1
cd ..

# Seed database
echo -e "${GREEN}Seeding database...${NC}"
cd server/seeds && node seed.js
cd ../..

# Start server with nodemon (auto-reload)
echo -e "${GREEN}Starting backend server on port 3001...${NC}"
cd server && npx nodemon index.js &
SERVER_PID=$!
cd ..

# Wait for server to be ready
sleep 3

# Start client with hot reload
echo -e "${GREEN}Starting frontend on port 3000...${NC}"
cd client && BROWSER=none npm start &
CLIENT_PID=$!
cd ..

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Application is starting up!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "${BLUE}  Frontend:  http://localhost:3000${NC}"
echo -e "${BLUE}  Backend:   http://localhost:3001${NC}"
echo -e "${YELLOW}  Login:     admin@agency.com / password123${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Both servers support hot-reload.${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"

# Trap to clean up on exit
trap "echo -e '\n${RED}Shutting down...${NC}'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for processes
wait
