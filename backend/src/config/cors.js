import cors from 'cors';

const corsOptions = {
  origin: '*', // Exemplo: 'http://meufrontend.com'
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

export const corsConfig = cors(corsOptions);