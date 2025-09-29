# Clutch - Next.js Discord-like Platform

A modern Discord-inspired platform built with Next.js, TypeScript, and Tailwind CSS featuring retro pixel aesthetics.

## Features

- 🎮 Retro pixel font styling with Press Start 2P
- ⚡ Smooth typing animations
- 🎨 Modern dark theme with ambient effects
- 📱 Fully responsive design
- 🔐 Email verification login system
- ⚡ Next.js 15 with App Router
- 🛡️ TypeScript for type safety

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Tech Stack

- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Press Start 2P** font for retro aesthetics

## Project Structure

```
clutch-nextjs/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       └── LoginPage.tsx
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Login System

The application includes a complete email verification login system:
- Email/password authentication
- 6-digit verification code system
- Secure token storage
- Error handling and validation

To connect to a backend, update the API endpoints in `LoginPage.tsx`.