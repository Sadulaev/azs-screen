# МУСТАНГ — табло цен на топливо

Веб-табло для Сбер ТВ + админка смены цен/фона/раскладки.  
Прод-домен: **https://mustang.easydev.tech**

| URL | Назначение |
|-----|------------|
| `/` или `/display` | Полноэкранный экран для ТВ |
| `/admin` | Админка (пароль из `.env`) |

## Быстрый прод (Docker + nginx + Let's Encrypt)

На сервере (Linux), DNS `mustang.easydev.tech` → IP сервера, порты 80/443 открыты:

```bash
cp .env.example .env
# отредактируй ADMIN_PASSWORD, JWT_SECRET, CERTBOT_EMAIL

chmod +x scripts/*.sh
./scripts/up-prod.sh
```

`up-prod.sh` сам выпустит сертификат при первом запуске (через certbot) и поднимет весь стек с HTTPS.

> Важно: сервис `certbot` в compose **только продлевает** уже выпущенный сертификат (`renew`).  
> Первый выпуск — только через `./scripts/init-letsencrypt.sh` (или `./scripts/up-prod.sh` без существующего cert).

Если certbot падает при выпуске (часто при **antiddos.pw**):
1. Let's Encrypt должен открыть `http://mustang.easydev.tech/.well-known/acme-challenge/...` на вашем nginx.
2. Временно укажите A-запись домена **напрямую на IP VPS** (минуя antiddos) → запустите `./scripts/init-letsencrypt.sh` → верните защиту.
3. Либо в antiddos разрешите проксирование `/.well-known/acme-challenge/`.

Только HTTP (без TLS), например для проверки:

```bash
docker compose up -d --build
```

Обновление после правок кода:

```bash
git pull
./scripts/up-prod.sh
```

Перевыпуск сертификата вручную:

```bash
./scripts/init-letsencrypt.sh
```


## Локальная разработка

Терминал 1 — API:

```bash
cd api
npm install
npm run dev
```

Терминал 2 — frontend:

```bash
cd frontend
npm install
npm run dev
```

Открыть: http://localhost:5173/display и http://localhost:5173/admin  
Пароль по умолчанию: `mustang2024` (или из `.env`).

## Возможности админки

- цены и названия топлива
- загрузка фона
- раскладка: сетка 2×3 / список + лого слева
- сброс к дефолту

ТВ-экран опрашивает `/api/config` каждые 5 секунд.

## UI/UX добивка

См. [PROMPT_UI_UX.md](./PROMPT_UI_UX.md) — готовый промпт для Agent mode.

## Стек

- API: Node.js + Express + JSON-хранилище (`data/`)
- Frontend: Vite + React
- Прод: Docker Compose → nginx (TLS) → frontend + api, certbot renew
