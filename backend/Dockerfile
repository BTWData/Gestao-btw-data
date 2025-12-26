FROM node:20-alpine

WORKDIR /app

# Instala dependências do sistema necessárias para o Prisma/Bcrypt
RUN apk add --no-cache openssl python3 make g++

COPY package*.json ./

# Instala dependências e gera o Prisma Client
RUN npm ci

COPY . .

# Gera o cliente Prisma durante o build
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build

# --- CORREÇÃO DE PERMISSÃO ---
# Dá permissão total para o usuário node na pasta do app
RUN chown -R node:node /app

# Muda para o usuário seguro
USER node

EXPOSE 3001

# Usa o script start.sh (certifique-se que ele tem permissão de execução: chmod +x start.sh)
CMD ["sh", "start.sh"]