# 🎓 Certificate Blockchain System

Um sistema de certificação acadêmica descentralizado que utiliza a tecnologia blockchain para garantir a autenticidade, imutabilidade e transparência de certificados. Este projeto integra um backend robusto em Node.js, um frontend reativo em Vue.js e um Smart Contract na blockchain para um registro seguro.

---

## ✨ Funcionalidades Principais

* 📜 **Emissão e Gestão de Certificados:** Instituições podem criar e gerenciar os "moldes" dos cursos e emitir certificados digitais para os alunos.
* 🔒 **Registro em Blockchain:** O hash de cada certificado pode ser registrado em um Smart Contract, garantindo sua integridade e provendo uma camada extra de validação.
* 🔐 **Autenticação e Autorização:** Sistema seguro de login com JWT (via Cookies `HttpOnly`) e um mecanismo de renovação de token (Refresh Token).
* 👥 **Permissões por Papel (RBAC):** Níveis de acesso distintos para `ADMIN`, `STAFF` (funcionário da instituição) e `STUDENT`, garantindo que cada usuário só possa realizar as ações permitidas.
* 🏛️ **Gerenciamento Completo:** CRUDs completos e seguros para Usuários, Instituições e Cursos.
* 📄 **Documentação de API Interativa:** Interface Swagger para explorar e testar todos os endpoints do backend de forma fácil e intuitiva.
* ✅ **Testes Automatizados:** Suíte de testes de integração com Jest e Supertest para garantir a confiabilidade e a estabilidade do backend.

---

## 🛠️ Tecnologias Utilizadas

| Área              | Tecnologias                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| 💻 **Backend** | Node.js, Express, Prisma, PostgreSQL, JWT, Zod, Bcrypt                   |
| 🎨 **Frontend** | Vue.js 3 (Composition API), Vite, Pinia, Axios, Ethers.js                |
| ⛓️ **Blockchain** | Solidity, Hardhat, Ethers.js                                             |
| 🚀 **Infraestrutura** | Docker, Docker Compose                                                   |

---

## 🏗️ Arquitetura do Projeto

O sistema é dividido em três componentes principais que rodam em contêineres Docker independentes:

1.  **Frontend (Vue.js):** A interface do usuário que consome a API do backend. É responsável por toda a interação visual.
2.  **Backend (Node.js):** O cérebro da aplicação. Expõe uma API RESTful para o frontend, gerencia a lógica de negócio, interage com o banco de dados PostgreSQL e se comunica com o Smart Contract.
3.  **Blockchain (Hardhat):** Um nó local da blockchain Ethereum que roda em ambiente de desenvolvimento, onde o Smart Contract é implantado para testes.

---

## 🚀 Como Iniciar (Getting Started)

### Pré-requisitos
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/) (v18 ou superior)
* [Docker](https://www.docker.com/products/docker-desktop/) e [Docker Compose](https://docs.docker.com/compose/)

### 🐳 Rodando o Projeto Completo com Docker (Recomendado)

Esta é a forma mais simples e rápida de rodar todo o ambiente (backend, frontend e banco de dados).

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git](https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git)
    cd NOME_DO_REPOSITORIO
    ```

2.  **Configure as Variáveis de Ambiente do Backend:**
    Na pasta `backend`, renomeie o arquivo `.env.example` para `.env` e preencha as variáveis necessárias. Para desenvolvimento, os valores padrão devem funcionar.
    ```bash
    cd backend
    mv .env.example .env
    cd .. 
    ```

3.  **Construa e inicie os contêineres:**
    Na raiz do projeto, execute o comando:
    ```bash
    docker-compose up --build -d
    ```
    O `-d` (detached) executa os contêineres em segundo plano.

4.  **Pronto!** A aplicação estará disponível nos seguintes endereços:
    * **Frontend (Vue.js):** `http://localhost:5173`
    * **Backend (Node.js API):** `http://localhost:8000/api`
    * **Documentação da API (Swagger):** `http://localhost:8000/api-docs`

Para ver os logs do backend:
```bash
docker-compose logs -f backend
```

Para parar todos os contêineres:

```bash
docker-compose down
```

### 🔧 Rodando Manualmente cada Serviço

Se preferir rodar cada parte separadamente sem Docker.

#### Backend

```bash
cd backend
npm install
# Garanta que o banco de dados PostgreSQL está rodando e o .env está configurado
npx prisma migrate deploy
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Blockchain (Nó Local)

```bash
cd blockchain
npm install
npx hardhat node
```

Em outro terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

-----

## ✅ Testes

Para rodar a suíte de testes de integração do backend, navegue até a pasta do backend e execute:

```bash
cd backend
npm test
```