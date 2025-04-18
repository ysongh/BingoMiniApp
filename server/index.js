import express from 'express';
 import cors from 'cors';
 import dotenv from 'dotenv';
 import pkg from 'body-parser';
 
 dotenv.config();
 
 const { json } = pkg;
 const app = express();
 const port = 4000;
 
 app.use(cors());
 
 app.use(json());
 
 app.get('/', (req, res) => res.send('It Work'));
 
 app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ message: 'Something went wrong!' });
 });
 
 app.listen(port, () => {
     console.log(`Server is running on port ${port}`);
 });
 