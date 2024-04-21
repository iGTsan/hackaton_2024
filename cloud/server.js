const express = require('express');
const multer = require('multer');
const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: '1234'
};

const httpsServer = https.createServer(options, app);

// Подключение к БД SQLite
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Подключение к SQLite базе данных успешно установлено.');
});

// Создание таблицы если ее нет
db.run('CREATE TABLE IF NOT EXISTS users (login TEXT PRIMARY KEY, password_hash TEXT)');

// Устанавливаем директорию для загруженных файлов
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, req.body.username + '.txt');
    }
});
const upload = multer({ storage: storage });

// Статический сервер для отдачи статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Обрабатываем GET-запрос для отдачи HTML-страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обрабатываем POST-запрос для загрузки файла
app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Uploaded file:', req.body.username, req.body.password);
    // В файл req.file хранится информация о загруженном файле
    console.log('File uploaded:', req.file);
    res.send('File uploaded successfully');
});

// Порт, на котором будет работать сервер
const PORT = 3001;


httpsServer.listen(PORT, () => {
    console.log(`Сервер запущен на https://localhost:${PORT}`);
  });
