import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// Constrói o caminho para o arquivo swagger.yml de forma segura
const swaggerFilePath = path.resolve(process.cwd(), 'src/docs/swagger.yml');

// Lê e faz o parse do arquivo YAML
const swaggerDocument = yaml.load(fs.readFileSync(swaggerFilePath, 'utf8'));

export const swaggerDocs = (app) => {
  // Rota para a documentação da API
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`📄 Swagger docs available at http://localhost:8000/api-docs`);
};