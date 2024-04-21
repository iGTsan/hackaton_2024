const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Устанавливаем директорию для загруженных файлов
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
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
    // В файл req.file хранится информация о загруженном файле
    console.log('File uploaded:', req.file);
    res.send('File uploaded successfully');
});

// Порт, на котором будет работать сервер
const PORT = 3001;

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
