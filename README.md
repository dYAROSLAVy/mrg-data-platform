## MRG Data Platform

Небольшой стек для загрузки XLSX и визуализации данных (React + NestJS + Postgres). В репозитории добавлен пример данных для быстрой проверки.

## Run

### 0) Requirements

- Docker Desktop ≥ 4.x
- (optional) Node.js LTS if хотите локально запускать линтеры/скрипты

### 1) Environment

**Быстрый старт (без создания `.env`):**

```bash
ENV_FILE=.env.example \
docker compose --env-file .env.example down -v
ENV_FILE=.env.example \
docker compose --env-file .env.example up -d --build
ENV_FILE=.env.example \
docker compose --env-file .env.example exec backend npm run migration:run
```

### 2) URLs

- **Frontend:** http://localhost:3000
- **Backend health:** http://localhost:8080/health → `{ "ok": true }`
- **PostgreSQL (Adminer):** http://localhost:8081  
  Server: `db` · System: `PostgreSQL` · User/Pass: `mrg`/`mrg` · DB: `mrg`

## Демо-данные

В репозитории есть пример файла: `examples/Данные.xlsx`.

### Вариант A — через интерфейс

1. Откройте **Frontend**: http://localhost:3000
2. Используйте форму загрузки XLSX (кнопка «Загрузить XLSX») и выберите файл `examples/Данные.xlsx`.

### Вариант B — через API (cURL)

```bash
curl -X POST \
  -F "file=@examples/Данные.xlsx" \
  http://localhost:8080/api/upload/xlsx
```

После успешной загрузки данные станут доступны в списке строк и графиках. Для просмотра содержимого БД можно использовать Adminer (см. URLs выше).

### 3) Полезные команды

```bash
# остановить и удалить контейнеры/тома
docker compose down -v

# перезапуск backend
docker compose restart backend

# логи
docker compose logs -f backend
```

## API (кратко)

- `POST /api/upload/xlsx` — загрузка XLSX (multipart/form-data: `file`)
- `GET  /api/rows` — список строк с пагинацией/поиском/фильтрами
- `GET  /api/rows/years` — доступные годы
- `GET  /api/rows/series?pipelineId=&year=` — данные для графика

> Ошибки валидации приходят структурированно (400) с пояснением и, при импорте, номером строки Excel.

## Lint & Format

```bash
npm i
npm run lint
npm run format
npm run typecheck
```
