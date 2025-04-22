import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'body-parser';
import mongoose from 'mongoose';
import gameRoutes from './routes/game.js';
 
dotenv.config();

const { json } = pkg;
const app = express();
const port = 4000;

app.use(cors());
app.use(json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/game', gameRoutes);

app.get('/', (req, res) => res.send('It Work'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
