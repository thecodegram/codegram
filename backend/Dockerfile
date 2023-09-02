# Use the official Node.js LTS (Long-Term Support) image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Convert TS to JS
RUN npm run build

# Copy the rest of the application files to the container
COPY . .

# Expose the port your Node.js application is listening on
EXPOSE 3000

# Define the command to start your Node.js application
CMD ["node", "dist/server.js"]
