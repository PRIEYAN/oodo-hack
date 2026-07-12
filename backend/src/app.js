import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'transitops-api' }));

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(errorHandler);

export default app;
