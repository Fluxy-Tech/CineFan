import express from 'express';
import swaggerUi from 'swagger-ui-express';
import routes from './src/routes';
import { swaggerSpec } from './src/docs/swagger';

const app = express();

app.use(express.json());
app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_req, res) => { res.json(swaggerSpec); });
app.use(routes);

export default app;
