# Estágio 1: Base da nossa imagem
# Usamos uma imagem oficial do Node.js baseada no Alpine Linux, que é leve e segura.
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de dependências primeiro.
# Isso aproveita o cache do Docker. Se não mudarmos as dependências, o Docker não reinstala tudo a cada build.
COPY package*.json ./

# Instala as dependências de produção
RUN npm install

# Copia o restante do código da aplicação para o diretório de trabalho no container
COPY . .

# Comando para aplicar as migrações do Prisma no banco de dados.
RUN npx prisma generate

# Expõe a porta que a nossa aplicação vai usar dentro do container
EXPOSE 8000

# O comando padrão para executar quando o container iniciar
CMD ["sh", "-c", "npm run migrate:deploy && npm run dev"]