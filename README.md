# 🗳️ Team Polls - Full Stack Project
This project includes a backend (Node.js + PostgreSQL + Redis) and a frontend (Vite + React) to manage real-time team polls.

## 📦 Backend

### ▶️ Run with Docker (recommended)

Make sure you’re in the project root (where `docker-compose.yml` exists):

```bash
docker-compose up --build

#Build the backend container
#Start PostgreSQL and Redis
#Run all services together



#--------------------------------------------------------------------------------------------------------------------------------

If you prefer running Node.js locally and only use Redis via Docker:
Start Redis in Docker:

docker run --name redis-local -p 6379:6379 -d redis
npm install
npm start

# Ensure your .env or environment variables point to:
REDIS_HOST=localhost
REDIS_PORT=6379

Frontend (Vite + React)
Navigate to the frontend directory (e.g., cd frontend) and run:

npm install
npm run dev



