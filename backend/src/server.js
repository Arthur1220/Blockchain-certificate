import express from 'express';
import 'dotenv/config';
import 'express-async-errors'; // Importa para capturar erros em rotas async
import cookieParser from 'cookie-parser'; // Importa o parser de cookies
import morgan from 'morgan'; // Importa o middleware de logging

// Importa as configurações
import { helmetConfig } from './config/helmet.js';
import { corsConfig } from './config/cors.js';
import { limiter } from './config/rateLimit.js';
import { swaggerDocs } from './config/swagger.js';

// Importa o tratador de erros e as rotas
import { errorHandler } from './middlewares/errorHandler.js';
import mainRouter from './routes/index.js'; // Usaremos um roteador principal

// --- Inicialização da Aplicação ---
const app = express();

// --- Middlewares Essenciais ---
app.use(morgan('dev')); // 0. Middleware de logging
app.use(helmetConfig); // 1. Segurança com Helmet
app.use(corsConfig); // 2. Configurações de CORS
app.use(limiter); // 3. Limite de requisições
app.use(cookieParser()); // 4. Parser de cookies
app.use(express.json()); // 5. Parser de JSON
app.use(express.urlencoded({ extended: true })); // 6. Parser de URL-encoded bodies

// --- Rotas da API ---
// Todas as nossas rotas começarão com /api
app.use('/api', mainRouter);

// --- Configuração do Swagger ---
swaggerDocs(app);

// --- Tratamento de Erros ---
// Deve ser o último middleware a ser adicionado
app.use(errorHandler);

// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});