import express from 'express';
import { Pool } from 'pg';

const app = express();
const port = 3000;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'mydatabase',
});

app.use(express.json());

// Route to return information about myself
app.get('/awesome/applicants/me', (req, res) => {
    const myInfo = {
        name: 'Erich',
        age: 32,
        email: 'erichjohnengler@gmail.com',
        bio: 'I love science, technology and video games!'
    };

    res.json(myInfo);
});

// GET all users
app.get('/awesome/applicants', async (req, res) => {
    try {
        const result = await pool
            .query('SELECT * FROM userinfo');
            res.json(result.rows);
    } catch (error) {
        console.log('Error querying data:', error);
        res.sendStatus(500);
    }
});

// GET a specific user by ID
app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool
            .query('SELECT * FROM userinfo WHERE id = $1', [userId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.log('Error querying the database:', error);
        res.sendStatus(500);
    }
});

// Create a new user (POST)
app.post('/awesome/applicants', async (req, res) => {
    console.log('Received POST request for creating a new user')
    const { name, age, email } = req.body;
    try {
        const result = await pool
            .query('INSERT INTO userinfo (name, age, email) VALUES ($1, $2, $3) RETURNING *',
            [name, age, email]
            );
            res.json(result.rows[0]);
    } catch (error) {
        console.log('Error creating new user:', error);
        res.sendStatus(500);
    }
})

// Update a user by ID (PUT)
app.put('/awesome/applicants/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, age, email } = req.body;
    try {
        const result = await pool
            .query('UPDATE userinfo SET name = $2, age = $3, email = $4 WHERE id = $1 RETURNING *',
            [userId, name, age, email]
            );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.log('Error updating user:', error);
        res.sendStatus(500);
    }
});

// Delete a user by ID
app.delete('/awesome/applicants/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool
            .query('DELETE FROM userinfo WHERE id = $1 RETURNING *',
            [userId]
            );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ message: 'User deleted successfully.' });
        }
    } catch (error) {
        console.log('Error deleting user:', error);
        res.sendStatus(500);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});