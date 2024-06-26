# VK && stdpd
## Файлы
```/web``` - Web-сервер<br>
```/web/public``` - html страница, css стили и скрипты js (front-end)<br>
```/web/server.js``` - конфигурация сервера<br>
```/web/cert.pem``` - https сертификат<br>
```/web/key.pem``` - https ключ<br>
```/web/crypto.js``` - функции, реализующие криптографические методы<br>
```/web/package.json``` - инструкции для npm<br>
```/web/package-lock.json``` - инструкции для npm<br>

```/cloud``` - облако<br>
```/cloud/public``` - html страница, css стили и скрипты js (front-end)<br>
```/cloud/server.js``` - конфигурация сервера<br>
```/cloud/cert.pem``` - https сертификат<br>
```/cloud/key.pem``` - https ключ<br>
```/cloud/crypto.js``` - функции, реализующие криптографические методы<br>
```/cloud/package.json``` - инструкции для npm<br>
```/cloud/package-lock.json``` - инструкции для npm<br>

## Инфраструктура и развертывание
Сервер доступен для общего пользования по ссылкам:<br>
Web - https://5.35.29.142:3000/ <br>
Cloud - https://5.35.29.142:3001/ <br>

Подготовка:
```
apt-get update
apt-get install npm
]git clone https://github.com/iGTsan/hackaton_2024
```

Для развертывания web-сервера выполнить:
```
cd hackaton/web/
npm install
node server.js
```

Для развертывания облака выполнить:
```
cd hackaton/cloud/
npm install
node server.js
```

## Решение задачи
- [x] Развернуть сервер;
- [x] Реализовать генерацию ключей аутентификации
и саму аутентификацию по стандарту WebAuthn;
- [x] Разработать хранилище ключей аутентификации в облаке и web-сервер;
- [x] Реализовать безопасное клиент-сервеное взаимодействие путем шифрования передаваемых данных и использования https.

### Краткое описание процесса решения
Был развернут сервер с белым ip-адресом, прокинут ssh сервис с аутентификацией по ssh-ключу, созданы пользователи и группы для совместной работы. Работа проводилась с использованием системы контроля версий git. Разработаны и запущены облако с собственным веб-сервером и выделенный веб-сервер (согласно поставленной задаче). Разработаны функции, реализующие криптографические методы. Разработаны функции для взаимодействия с криптографическим контейнером. Реализована поддержка безопасного протокола https. Проведено ручное тестирование сервиса.
