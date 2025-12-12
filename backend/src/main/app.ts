import express from 'express';
import cors from 'cors';
import routes from '../presentation/routes/index.routes.js';
import { logMiddleware } from '../presentation/middleware/log.middleware.js';
import { globalErrorMiddleware } from '../presentation/middleware/globalError.middleware.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'is-moderador']
}));

app.use(express.json());
app.use(logMiddleware);

app.use(routes);

app.use(globalErrorMiddleware);

export { app };