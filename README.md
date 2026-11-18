# Сайт семинаров + админка Decap CMS

Как это работает: тексты и картинки лежат в `content/*.json` и `static/`. Когда вы сохраняете правку в админке (`/admin`), Decap делает коммит в GitHub, Netlify видит коммит, запускает `node build.js` и публикует обновлённый сайт (около минуты).

## Структура

- `content/*.json` — все тексты сайта (правятся через админку)
- `static/images/`, `static/video/` — картинки и видео
- `static/css/style.css`, `static/js/app.js` — оформление и логика формы
- `static/admin/` — админка (`index.html` и `config.yml`)
- `build.js` — собирает `dist/index.html` из контента
- `netlify.toml` — настройки сборки Netlify

## Запуск за 6 шагов

1. **GitHub.** Создайте репозиторий и загрузите в него все файлы проекта (ветка `main`).
2. **Netlify.** Add new project → Import from Git → выберите репозиторий. Команда сборки и папка публикации подтянутся из `netlify.toml`.
3. **OAuth-приложение на GitHub.** GitHub → Settings → Developer settings → OAuth Apps → New OAuth App:
   - Homepage URL: адрес вашего сайта на Netlify
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   Сохраните, скопируйте Client ID и создайте Client Secret.
4. **Подключите его к Netlify.** Настройки проекта → Access & security → OAuth → Install provider → GitHub, вставьте Client ID и Secret.
5. **Поправьте `static/admin/config.yml`:** в `repo` впишите `ваш-логин/название-репозитория`, в `site_url` и `display_url` адрес сайта. Закоммитьте.
6. Откройте `https://ваш-сайт/admin/`, нажмите Login with GitHub.

Редактировать смогут те, у кого есть аккаунт GitHub с правом записи в репозиторий (добавьте их в Settings → Collaborators).

## Правка на своём компьютере (по желанию)

```
npx decap-server        # в одном окне
node build.js && npx serve dist   # в другом, затем http://localhost:3000/admin/
```

## Что важно знать

- В текстах `**слово**` превращается в жирное (поля «Вводный текст» и «Текст про календарь»).
- Поля «Код варианта» и «Какой это семинар» не меняйте: от них зависят цвета карточек и кнопки «Записаться».
- Адрес Google-таблицы, ID пикселя Meta и номер WhatsApp лежат в «Общие настройки».
- Предпросмотра внутри админки нет: результат виден на сайте после публикации.
