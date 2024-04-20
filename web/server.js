const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Добавляем модуль path для работы с путями файлов
const my_crypto = require('./crypto');

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: '1234'
};

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Предоставляем статические файлы из папки 'public'

const httpsServer = https.createServer(options, app);

// Подключение к БД SQLite
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Подключение к SQLite базе данных успешно установлено.');
});

// Создание таблицы если ее нет
db.run('CREATE TABLE IF NOT EXISTS records (login TEXT PRIMARY KEY, public_key TEXT)');

// Запись данных в БД
app.post('/addRecord', (req, res) => {
    const { login, publicKey } = req.body;
    const sql = 'INSERT INTO records (login, public_key) VALUES (?, ?)';
    db.run(sql, [login, publicKey], (err) => {
        if (err) {
            res.status(500).send({error: err.message});
            return console.error(err.message);
        }
        res.send({message: 'Запись добавлена login: ' + login + ' publicKey: ' + publicKey});
    });
});

// Проверка записи в БД
app.get('/checkRecord', (req, res) => {
    const { login } = req.query;
    const { publicKey } = req.query;
    const sql = 'SELECT * FROM records WHERE login = ? AND public_key = ?';
    db.get(sql, [login, publicKey], (err, row) => {
        if (err) {
            res.status(500).send({error: err.message});
            return console.error(err.message);
        }
        if (row) {
            res.send({found: true, data: row});
        } else {
            res.send({message: 'Запись не найдена login: ' + login + ' publicKeyHash: ' + publicKey});
        }
    });
});


// Проверка записи в БД
app.get('/loginStart', (req, res) => {
    const { login } = req.query;
    const sql = 'SELECT * FROM records WHERE login = ?';
    db.get(sql, [login], (err, row) => {
        if (err) {
            res.status(500).send({error: err.message});
            return console.error(err.message);
        }
        if (row) {
            console.log(row.public_key, login);
            const randomData = my_crypto.GetDataForAuth(login, row.public_key);
            res.send({found: true, data: randomData});
        } else {
            res.send({message: 'Запись не найдена login: ' + login});
        }
    });
});


// Проверка записи в БД
app.get('/loginEnd', (req, res) => {
    const { login } = req.query;
    const { cryptedData } = req.query;
    const sql = 'SELECT * FROM records WHERE login = ?';
    db.get(sql, [login], (err, row) => {
        if (err) {
            res.status(500).send({error: err.message});
            return console.error(err.message);
        }
        if (row) {
            const loginStatus = my_crypto.ValidateDataForAuth(login, row.public_key, cryptedData)
            res.send({found: true, data: loginStatus});
        } else {
            res.send({message: 'Запись не найдена login: ' + login});
        }
    });
});

// Отдача index.html при переходе на корень сайта
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Убедитесь, что путь корректен
});

httpsServer.listen(port, () => {
  console.log(`Сервер запущен на https://localhost:${port}`);
});

// Закрытие базы данных при завершении работы сервера
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Подключение к SQLite базе данных закрыто.');
    });
    process.exit(1);
});