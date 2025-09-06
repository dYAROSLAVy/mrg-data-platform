## Run

```bash
docker compose down -v
docker compose up -d --build
docker compose exec backend npm run migration:run
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/health → `{ "ok": true }`
- DB: • System: PostgreSQL
  • Server: db
  • Username/Password: mrg / mrg
  • Database: mrg

## Lint & Format

```bash
npm i
npm run lint
npm run format
```
