FROM node:10

# Crear carpeta de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Exponer el puerto que usa el dev-server
EXPOSE 8080

# Comando para correr
CMD ["npm", "run", "dev"]
