import express from 'express';   // Use import instead of require
import { createServer } from 'http';
import { Server } from 'socket.io';
import mysql from 'mysql2';  // This works because it's CommonJS compatible
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';  // Import UUID as ES Module

// Create app and server
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',  // Angular frontend
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// POST /transactions
app.post('/alert', (req, res) => {
  const { medicine_id, type, quantity, source, reference, note } = req.body;

  if (!['IN', 'OUT', 'ADJUST', 'TRANSFER'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  const id = uuidv4();

  const sql = `
    INSERT INTO inventory
    (id, medicine_id, type, quantity, source, reference, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [id, medicine_id, type, quantity, source, reference, note], (err, result) => {
    if (err) {
      console.error('Error inserting transaction:', err.message);
      return res.status(500).json({ error: err.message });
    }

    io.emit('alert', {
  medicine_id: result.medicine_id,
  type: result.type,
  quantity: result.quantity,
  source: result.source,
  reference: result.reference,
  note: result.note
});


    res.status(201).json({ message: 'Transaction saved', id:'' });
  });
});

app.get('/alert', (req, res) => {
  const { medicine_id, type } = req.query;
  let sql = `SELECT * FROM inventory WHERE 1=1`;
  const params = [];

  if (medicine_id) {
    sql += ` AND medicine_id = ?`;
    params.push(medicine_id);
  }

  if (type) {
    sql += ` AND type = ?`;
    params.push(type);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching alert:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/stock/:medicine_id', (req, res) => {
  const medicine_id = req.params.medicine_id;

  const sql = `
    SELECT
      SUM(CASE WHEN type IN ('IN', 'ADJUST') THEN quantity ELSE 0 END) -
      SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) AS stock
    FROM inventory
    WHERE medicine_id = ?`;

  db.query(sql, [medicine_id], (err, results) => {
    if (err) {
      console.error('Error calculating stock:', err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json({ medicine_id, stock: results[0].stock || 0 });
  });
});

// MySQL connection setup
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'N1ck3lsm@11',
  database: 'quickpharma'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.emit('alert', 'Welcome! This is a real-time alert.');

  socket.broadcast.emit('alert', 'A new user has joined.');

  db.query('SELECT * FROM alerts', (err, results) => {
    if (!err) {
      socket.emit('initialAlerts', results);
    } else {
      console.error('Error fetching alerts:', err.message);
    }
  });

  socket.on('newAlert', (message) => {
    if (!message) return;

    db.query('INSERT INTO alerts (message) VALUES (?)', [message], (err, result) => {
      if (!err) {
        const alertData = { id: result.insertId, message };

        io.emit('alert', alertData);
        console.log('Alert saved and broadcasted:', alertData);
      } else {
        console.error('Error saving alert:', err.message);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
