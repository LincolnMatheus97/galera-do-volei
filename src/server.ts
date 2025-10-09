import express from 'express';
import routes from './presentation/routes/index.routes.js';
import { logMiddleware } from './presentation/middleware/log.middleware.js';
import { globalErrorMiddleware } from './presentation/middleware/globalError.middleware.js';
import { authMiddleware } from './presentation/middleware/auth.middleware.js';

const app = express();

app.use(express.json());
app.use(logMiddleware);
app.use(authMiddleware);
app.use(routes);

app.use(globalErrorMiddleware);

// --- Inicialização do Servidor ---
const PORT = 3333;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});