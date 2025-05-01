const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Expose uploads folder to public
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    res.send({ filename: req.file.filename });
});

// Download route
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);

    res.download(filepath, filename, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error downloading file.');
        } else {
            console.log('File sent successfully.');
        }
    });
});

// Real-time connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('file-shared', (data) => {
        // Broadcast the shared file to others
        socket.broadcast.emit('receive-file', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start server with dynamic port (for Render)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
