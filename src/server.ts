import express from 'express';
import routes from './presentation/routes/index.routes.js';

const app = express();
app.use(express.json());
app.use(routes);

// --- Inicialização do Servidor ---
const PORT = 3333;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});