import express from 'express';
import swaggerUi from 'swagger-ui-express';
import routes from './src/routes';
import { swaggerSpec } from './src/docs/swagger';

const app = express();

app.use(express.json());

// CORS liberado: permite chamar a API de outro host (ex.: Swagger local -> produção)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_req, res) => { res.json(swaggerSpec); });
app.use(routes);

export default app;
