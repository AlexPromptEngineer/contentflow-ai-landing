# Первое размещение на Railway

Подготовка: 26 октября 2026 года. Push и деплой не выполнялись.

## Решение

Отдельный сервис лендинга, исходники исключительно из отдельного GitHub-репозитория.
Создать отдельный Railway-проект, чтобы изолировать лендинг от основного ContentFlow AI.
Astro собирает статический dist. Railpack устанавливает зависимости по package-lock.json,
выполняет npm run build и раздаёт результат встроенным Caddy.
Node нужен только для сборки. Дополнительные npm-зависимости, база данных и volumes не нужны.
Это простой экономичный вариант внутри Railway; стоимость зависит от плана, ресурсов и трафика.

astro.config.js явно задаёт static и позволяет Railpack обнаружить Astro.
railway.toml задаёт сборщик, сборку и healthcheck главной страницы.
Custom Start Command оставлять пустым: Railpack автоматически запускает Caddy.
Стандартный Caddy слушает :{$PORT:80} на всех интерфейсах.
PORT предоставляет Railway, вручную задавать его не требуется. HTTPS обеспечивает Railway.
Staticfile отключает подстановку главной для неизвестных URL: они получают 404.

## Проверка и ограничения

Node 24.x, npm ci, npm run check, npm run build.
package-lock.json фиксирует зависимости; не обновлять пакеты при публикации.
Исходники, тексты, стили, изображения, package.json и lock-файл включаются в Git.
dist, node_modules, .astro, .local-node, .deployment-check и .env исключены.
Метаданные Windows *:Zone.Identifier также исключены.
Локальная .local-node не является зависимостью сайта в production.

Форма уже отключена и показывает сообщение о разработке.
Версия подходит для демонстрации, но заявки не отправляет.
Подключение доставки заявок остаётся отдельной задачей.

## GitHub — после подтверждения владельца

GitHub-репозиторий пока не создан, origin не задан.
1. Создать пустой репозиторий contentflow-ai-landing без README, .gitignore и лицензии.
2. В /home/alex/contentflow-ai-landing выполнить git remote add origin <URL>.
3. Проверить git remote -v и git status; ветка main.
4. Только после подтверждения выполнить git push -u origin main.

## Railway — после подтверждения публикации

Выбор репозитория может сразу запустить деплой. До подтверждения эти действия не выполнять.

1. Dashboard → New Project → Deploy from GitHub repo.
2. Подключить GitHub; при необходимости Configure GitHub App и предоставить доступ только к репозиторию лендинга.
3. Выбрать contentflow-ai-landing: создаются новый проект и отдельный сервис.
4. Сервис → Settings → Source: проверить репозиторий, ветку main и Root Directory /.
   Это корень репозитория, не локальный путь /home/alex/contentflow-ai-landing.
5. Settings → Build: Railpack, конфигурация /railway.toml, Build Command npm run build.
   Settings → Deploy: Custom Start Command оставить пустым.
6. Variables: переменные приложения не нужны. Не копировать настройки основного сервиса.
7. Дождаться успешной сборки и активного deployment в Deployments.
8. Settings → Networking → Public Networking → Generate Domain.
   Если запрошен Target Port, указать порт Caddy из логов, соответствующий PORT Railway.
9. Открыть HTTPS-адрес *.up.railway.app и проверить главную, стили, меню, FAQ,
   переходы CTA и уведомление отключённой формы. Неизвестный URL должен вернуть 404.

railway up не использовать. Последующие публикации идут из GitHub main.
Push в подключённую ветку обычно запускает автодеплой.

## Источники

- https://railpack.com/languages/node/#static-sites
- https://github.com/railwayapp/railpack/blob/main/core/providers/node/Caddyfile.template
- https://docs.railway.com/config-as-code/reference
- https://docs.railway.com/deployments/github-autodeploys
- https://docs.railway.com/networking/domains/railway-domains

## Результат локальной проверки

- Node v24.19.0, npm 11.17.0.
- Чистый npm ci: 266 пакетов; новых зависимостей в package.json не добавлено.
- npm run check: 0 ошибок, 0 предупреждений, 0 подсказок.
- npm run build: static, одна страница index.html.
- Контрольные суммы всех исходников src и файлов public сохранены без изменений.
- Все локальные ссылки на ресурсы и якоря в HTML разрешаются, форма одна.
- В исходниках и lock-файле нет ссылок на localhost, локальные пути и file-зависимости.
- Контейнер Railway локально не запускался: Docker недоступен в WSL.
  Автоматический запуск Caddy и PORT сверены с документацией Railpack;
  окончательная проверка runtime выполняется при первом разрешённом деплое.
- Полная проверка пробелов первого коммита показывает существующие CRLF и пустые
  строки в исходных файлах; они сохранены, чтобы не менять содержимое вне задачи.
