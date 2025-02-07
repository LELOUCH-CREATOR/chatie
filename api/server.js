const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const session = require('express-session');
const bcrypt = require('bcrypt');

// In-memory user storage (replace with a database in production)
const users = new Map();
const activeUsers = new Map();

app.use(express.json());
app.use(express.static(__dirname));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Authentication middleware
const authenticateUser = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

// Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/chat.html');
    } else {
        res.sendFile(__dirname + '/indexx.html');
    }
});

app.get('/chat.html', authenticateUser, (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (users.has(username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.set(username, hashedPassword);
        req.session.user = username;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = users.get(username);

    if (!hashedPassword) {
        return res.status(400).json({ error: 'User not found' });
    }

    try {
        const match = await bcrypt.compare(password, hashedPassword);
        if (match) {
            req.session.user = username;
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/current-user', (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('user connected', (username) => {
        activeUsers.set(socket.id, username);
        io.emit('user list', Array.from(activeUsers.values()));
    });

    socket.on('chat message', (message) => {
        const username = activeUsers.get(socket.id);
        socket.broadcast.emit('chat message', {
            username: username,
            message: message
        });
    });

    socket.on('disconnect', () => {
        activeUsers.delete(socket.id);
        io.emit('user list', Array.from(activeUsers.values()));
        console.log('A user disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 