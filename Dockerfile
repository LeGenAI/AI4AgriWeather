FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the Vite application
RUN npm run build

# Create simple server file
RUN echo 'const express = require("express"); \
const path = require("path"); \
const app = express(); \
const PORT = process.env.PORT || 8080; \
app.use(express.static(path.join(__dirname, "dist"))); \
app.get("*", (req, res) => { \
  res.sendFile(path.join(__dirname, "dist", "index.html")); \
}); \
app.listen(PORT, "0.0.0.0", () => { \
  console.log(`Server running on port ${PORT}`); \
});' > server-simple.js

# Expose port (Railway will set PORT env var)
EXPOSE 8080

# Start the simple server
CMD ["node", "server-simple.js"]