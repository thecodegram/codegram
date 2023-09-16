# Use the official Node.js LTS (Long-Term Support)
FROM --platform=linux/amd64 node:18-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install \
     && npm install typescript -g


# Copy the rest of the application files to the container
COPY . .

# Convert TS to JS
RUN npm run build

# Expose the port your Node.js application is listening on
EXPOSE 8080

# Define the command to start your Node.js application
CMD ["node", "dist/server.js"]
