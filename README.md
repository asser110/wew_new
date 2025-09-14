# Clutch - Discord-like Platform

A modern Discord-inspired platform with retro pixel aesthetics and smooth typing animations.

## Features

- 🎮 Retro pixel font styling with Press Start 2P
- ⚡ Smooth typing animations
- 🎨 Modern dark theme with ambient effects
- 📱 Fully responsive design
- 🐳 Docker containerized for easy deployment

## Quick Start

### Using Docker (Recommended)

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build and run manually:**
   ```bash
   # Build the image
   docker build -t clutch-app .
   
   # Run the container
   docker run -p 3000:80 clutch-app
   ```

3. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Docker Configuration

- **Multi-stage build** for optimized production images
- **Nginx** web server for fast static file serving
- **Gzip compression** enabled for better performance
- **Security headers** configured
- **Client-side routing** support for SPA

## Production Deployment

The Docker container is production-ready with:
- Optimized Nginx configuration
- Static asset caching
- Security headers
- Gzip compression
- Health checks ready

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Docker** for containerization
- **Nginx** for production serving