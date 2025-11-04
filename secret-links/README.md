# Secret Link Generator

A secure web application that generates temporary secret links that expire every 15 minutes. Only accessible by the administrator with a master password.

## Features

🔐 **Master Password Protection** - Only you can access the generator
⏰ **15-Minute Expiration** - Links automatically expire for security
🔗 **Unique URLs** - Each link has a unique UUID identifier
📊 **Real-time Tracking** - See active/expired links with countdown timers
🗑️ **Auto Cleanup** - Remove expired links with one click
📋 **Easy Copy** - One-click copy to clipboard
💾 **Local Storage** - Links persist in browser storage

## Setup

1. **Install dependencies:**
   ```bash
   cd secret-links
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   ```
   http://localhost:3002
   ```

## Usage

### 1. Login
- Enter the master password: `clutch2024!`
- Only you have access to generate links

### 2. Generate Secret Links
- Click "Generate Link" to create a new secret URL
- Each link expires in exactly 15 minutes
- Links are unique and cannot be guessed

### 3. Share Secret Links
- Copy the generated URL and share it securely
- Recipients can access the secret content until expiration
- Links show real-time countdown timers

### 4. Manage Links
- View all active and expired links
- Delete individual links manually
- Clear all expired links at once
- See statistics (active/expired/total)

## Security Features

- **Master Password Protection** - Only authorized access
- **Automatic Expiration** - Links die after 15 minutes
- **Unique Identifiers** - UUID-based URLs prevent guessing
- **Local Storage** - No server-side data storage
- **Real-time Validation** - Links checked on every access

## Link Structure

Generated links follow this pattern:
```
http://localhost:3002/secret/[unique-uuid]
```

Example:
```
http://localhost:3002/secret/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Secret Content

When someone accesses a valid link, they see:
- ✅ Access confirmation
- 📊 Link metadata (creation time, expiration)
- ⏰ Real-time countdown
- 🔐 Secret content/data
- ⚠️ Security warnings

## Production Deployment

For production use:

1. **Change the master password** in `src/app/page.tsx`
2. **Use environment variables** for sensitive data
3. **Add HTTPS** for secure transmission
4. **Consider server-side storage** for persistence
5. **Add rate limiting** for additional security

## Master Password

**Default:** `clutch2024!`

⚠️ **Important:** Change this password before deploying to production!

## Port Configuration

The application runs on port **3002** to avoid conflicts with other services:
- Clutch main app: `localhost:3000`
- Backend server: `localhost:3001`
- Secret links: `localhost:3002`