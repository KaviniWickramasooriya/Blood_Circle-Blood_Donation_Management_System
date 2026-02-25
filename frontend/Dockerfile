# Use official Node.js image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Vite dev server listens on (default for Vite)
EXPOSE 5173

# Command to run your app in development mode
CMD ["npm", "run", "dev"]