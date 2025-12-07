import express from 'express';
import routes from '../presentation/routes/index.routes.js';
import { logMiddleware } from '../presentation/middleware/log.middleware.js';
import { globalErrorMiddleware } from '../presentation/middleware/globalError.middleware.js';

const app = express();

app.use(express.json());
app.use(logMiddleware);

app.use(routes);

app.use(globalErrorMiddleware);

export { app };