# Utiliser une image node officielle comme image de base
FROM node:21.4.0-alpine AS build

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le package.json et le package-lock.json (si présent)
COPY package*.json ./

# Installer les dépendances de l'application
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application React pour la production
RUN npm run build

# Utiliser une image de serveur web pour servir les fichiers statiques
FROM nginx:alpine

# Copier le fichier de configuration nginx personnalisé
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers de build de l'application
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port sur lequel le conteneur va écouter
EXPOSE 80

# Démarrer le serveur Nginx
CMD ["nginx", "-g", "daemon off;"]
