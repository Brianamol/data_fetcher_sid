# Use secure, stable base
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# Copy dependency descriptors
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of your app
COPY . .

# Use non-root user for security (optional but recommended)
RUN useradd --user-group --create-home --shell /bin/false appuser
USER appuser

# Set environment (optional)
ENV NODE_ENV=production

# Start the app
CMD ["node", "index.js"]
