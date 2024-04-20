const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Добавляем модуль path для работы с путями файлов

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Предоставляем статические файлы из папки 'public'

// Подключение к БД SQLite
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Подключение к SQLite базе данных успешно установлено.');
});

// Создание таблицы если ее нет
db.run('CREATE TABLE IF NOT EXISTS records (login TEXT PRIMARY KEY, public_key_hash TEXT)');

// Запись данных в БД
app.post('/addRecord', (req, res) => {
    const { login, publicKeyHash } = req.body;
    const sql = 'INSERT INTO records (login, public_key_hash) VALUES (?, ?)';
    db.run(sql, [login, publicKeyHash], (err) => {
        if (err) {
            res.status(500).send({error: err.message});
            return console.error(err.message);
        }
        res.send({message: 'Запись добавлена login: ' + login + ' publicKeyHash: ' + publicKeyHash});
    });
});

// Проверка записи в БД
app.get('/checkRecord', (req, res) => {
    const { login } = req.query;
    const { publicKeyHash } = req.query;
    const sql = 'SELECT * FROM records WHERE login = ? AND public_key_hash = ?';
    db.get(sql, [login, publicKeyHash], (err, row) => {
        if (err) {
            res.status(500).send({error: err.message});
            return console.error(err.message);
        }
        if (row) {
            res.send({found: true, data: row});
        } else {
            res.send({message: 'Запись не найдена login: ' + login + ' publicKeyHash: ' + publicKeyHash});
        }
    });
});

// Отдача index.html при переходе на корень сайта
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Убедитесь, что путь корректен
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
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