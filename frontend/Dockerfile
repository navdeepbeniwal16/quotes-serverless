FROM node:20 as build

# Create dir and install node dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy rest of the application files and build the app
COPY . .
RUN npm run build

# Serve the React app with nginx
FROM nginx:alpine

# Copy the build output to the nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
