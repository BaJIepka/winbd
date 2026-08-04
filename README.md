# winbd — новостной сервис (тестовое задание)

Полноценное fullstack-приложение для создания и публикации новостных статей: REST API на Node.js/Express + Mongoose и React-редактор с поддержкой изображений, форматированного текста, цитат, блоков кода и файлов.

**Продакшн:** https://winbd.vindover.ru
**Swagger / OpenAPI:** https://winbd.vindover.ru/api-docs

Оригинальный текст задания — [`Тестовое_разработчик.pdf`](./Тестовое_разработчик.pdf).

## От автора

Задание рассчитано на достаточно компактное решение (Firebase как backend, `now.sh`/Vercel как хостинг). Я решил сделать его как production-проект: TypeScript на бэкенде и фронтенде, полноценные тесты, Docker, CI/CD через GitHub Actions с автодеплоем на собственный VPS, HTTPS через certbot, Swagger-документация API. Это заняло больше времени, чем предполагалось заданием, но лучше показывает, как я работаю над реальными проектами.

## Функционал по заданию

### Backend

| # | Требование | Реализовано |
|---|---|---|
| 1 | Регистрация/авторизация, выдача JWT с id пользователя | ✅ `POST /api/auth/register`, `/login`, access + refresh токены |
| 2 | Middleware с проверкой валидного токена для `news` | ✅ `backend/src/middleware/auth.ts`, применён ко всем `/api/news/*` |
| 3 | Создание/редактирование/удаление/публикация новости | ✅ `POST /PUT /DELETE /api/news`, `POST /api/news/:id/publish` |
| 4 | Отложенная публикация по дате-времени | ✅ `POST /api/news/:id/schedule`, `node-cron` (`backend/src/services/scheduler.ts`) проверяет `publishAt` |
| — | JSDoc в коде | ✅ |
| — | Архитектура разработана мной, при реализации использовал Claude Code, проводил ревью и делал правки самостоятельно | ✅ |

Желательное:
- ✅ CORS настроен (`cors`, ограничен `CLIENT_URL`)
- ✅ Загрузка файлов с клиента и раздача статики (`multer` + `/uploads`)
- ✅ Real-time уведомления о создании/изменении/удалении новости — `socket.io`
- API опубликовано не на бесплатном сервисе, а на собственном VPS с HTTPS — сделано осознанно, чтобы показать полный цикл деплоя

### Frontend

| # | Требование | Реализовано |
|---|---|---|
| 1 | Добавление картинок | ✅ inline-изображения и обложка новости |
| 2 | Форматированный текст (выделение, заголовки) | ✅ редактор на Tiptap (bold/italic/underline/заголовки/списки) |
| 3 | Добавление цитат | ✅ blockquote в редакторе |
| 4 | Блоки кода (markdown) | ✅ `code-block-lowlight` с подсветкой синтаксиса |
| 5 | Добавление файлов (pdf, doc и т.п.) | ✅ вложения, раздаются как статика с бэкенда |
| — | React, функциональные компоненты, хуки | ✅ |
| — | Архитектура разработана мной, при реализации использовал Claude Code, проводил ревью и делал правки самостоятельно | ✅ |

Желательное:
- ✅ Предпросмотр статьи перед публикацией
- ✅ SCSS (частично, наряду с Tailwind)
- ✅ Раздел уведомлений/«колокольчик» с real-time обновлениями (`socket.io-client`)
- Backend — не Firebase, а собственный API (см. пункт про production-подход выше)

## Технологический стек

**Backend** (`backend/`)
- Node.js, Express 5, TypeScript
- MongoDB / Mongoose
- JWT (access + refresh), bcrypt
- Zod — валидация, `zod-to-openapi` — генерация OpenAPI-схемы
- Socket.io — real-time уведомления
- Multer — загрузка файлов
- node-cron — отложенная публикация
- Jest, Supertest, mongodb-memory-server — тесты
- ESLint, Prettier

**Frontend** (`frontend/`)
- React 19, TypeScript, Vite
- FSD (Feature-Sliced Design) — структура `app/pages/widgets/features/entities/shared`
- Tiptap — WYSIWYG-редактор новостей
- TanStack Query — работа с сервером, Zustand — клиентское состояние
- React Hook Form + Zod — формы
- Tailwind CSS + Radix UI
- Vitest + Testing Library, Playwright (e2e)

**Инфраструктура**
- Docker + docker-compose (dev и prod конфигурации отдельно)
- GitHub Actions — независимые пайплайны для backend/frontend (test → build & push в GHCR → deploy)
- Nginx (host + внутри frontend-контейнера) + Let's Encrypt (certbot)

## Быстрый старт (dev)

Требуется Docker и Docker Compose.

```bash
cp backend.env.example backend/.env   # при необходимости поправить значения
docker compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Swagger: http://localhost:5000/api-docs

Приложение поднимается в режиме hot-reload (bind mounts из `docker-compose.yml`).

### Без Docker

```bash
# backend
cd backend
npm install
npm run dev      # ts-node-dev, нужен доступный MongoDB (MONGO_URI)

# frontend
cd frontend
npm install
npm run dev       # vite
```

## Тесты

```bash
cd backend && npm test     # jest + mongodb-memory-server
cd frontend && npm test    # vitest
cd frontend && npm run test:e2e   # playwright
```

## Переменные окружения (backend)

См. [`backend.env.example`](./backend.env.example): `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `CLIENT_URL`.

## Деплой и CI/CD

Топология продакшна:

```
интернет
  → host-nginx (TLS через certbot, deploy/nginx/winbd.conf)
  → 127.0.0.1:8080 (frontend-контейнер, docker-compose.prod.yml)
  → nginx внутри frontend-контейнера (frontend/nginx.conf: проксирует /api, /api-docs, /socket.io, /uploads)
  → backend-контейнер
  → mongo-контейнер (только внутри docker-сети, порт наружу не публикуется)
```

`.github/workflows/backend.yml` и `frontend.yml` — независимые пайплайны, триггерятся только на изменения в соответствующей папке (`paths: backend/**` / `frontend/**`):

1. **test** — typecheck, lint, format check, unit-тесты
2. **build-and-push** (только при пуше в `main`) — сборка Docker-образа и пуш в GHCR (`ghcr.io/bajiepka/winbd-{backend,frontend}`)
3. **deploy** — SSH на VPS, `docker compose pull <service> && up -d --no-deps <service>` — второй сервис при этом не перезапускается

Бэкенд и фронтенд деплоятся и версионируются независимо друг от друга.

## Структура репозитория

```
backend/    — Express API (контроллеры, сервисы, модели, роуты, тесты)
frontend/   — React SPA (FSD-архитектура)
deploy/     — конфиг host-nginx для VPS
docker-compose.yml       — dev-окружение
docker-compose.prod.yml  — prod-окружение (образы из GHCR)
```
