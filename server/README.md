# Clutch Backend Server

Backend API server for the Clutch platform with email verification authentication.

## Features

- 🔐 Email verification authentication
- 📧 Real email sending with Gmail SMTP
- 🗄️ Supabase database integration
- 🛡️ JWT token authentication
- 🚦 Rate limiting for security
- ⚡ Express.js REST API

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Settings > API to get your keys
3. Go to SQL Editor and run the migration file: `supabase/migrations/create_users_and_verification.sql`

### 3. Configure Email (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"
3. Use this app password in your `.env` file

### 4. Environment Variables

Create a `.env` file in the server directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 5. Run the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### POST `/api/auth/send-verification`
Send verification code to email
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

#### POST `/api/auth/verify-login`
Verify code and login
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### User

#### GET `/api/user/profile`
Get user profile (requires Bearer token)

### Health Check

#### GET `/health`
Server health status

## Testing

1. Start the backend server: `npm run dev`
2. Start the Next.js frontend: `cd ../clutch-nextjs && npm run dev`
3. Go to `http://localhost:3000`
4. Click "Login" and enter any email/password
5. Check your email for the verification code
6. Enter the code to complete login

## Database Schema

### Users Table
- `id` - UUID primary key
- `email` - Unique email address
- `password` - Hashed password
- `username` - Display name
- `status` - User status (online/offline/away/busy)
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp

### Verification Codes Table
- `id` - UUID primary key
- `email` - Email address
- `code` - 6-digit verification code
- `expires_at` - Code expiration time (10 minutes)
- `created_at` - Code creation timestamp

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (5 requests per 15 minutes)
- Email masking in responses
- Automatic code expiration
- Row Level Security (RLS) in Supabase

## Email Template

The verification emails are sent with a retro pixel-style HTML template matching the Clutch aesthetic.