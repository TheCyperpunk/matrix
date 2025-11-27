# Quick Start Guide

## Running the Application

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Test Accounts

Since registration on matrix.org may be restricted, here are some options:

### Option 1: Use an Existing Matrix Account
If you already have a Matrix account from Element or another client, you can use those credentials.

### Option 2: Create an Account via Element
1. Go to [https://app.element.io](https://app.element.io)
2. Create an account there
3. Use those credentials in this app

### Option 3: Try Registration
Try the signup page - it may work depending on matrix.org's current policies.

## Quick Test Flow

1. **Login/Signup** → Enter credentials
2. **Create a Room** → Click "+ Create" button
3. **Send Messages** → Type and press Enter
4. **Join Public Rooms** → Use room aliases like `#matrix:matrix.org`

## Common Issues

### "Registration failed"
- Matrix.org may have restricted registrations
- Use an existing account or create one via Element

### "Login failed"
- Check your username (don't include @ symbol)
- Verify your password
- Make sure you're using a matrix.org account

### Page won't load
- Check if dev server is running (`npm run dev`)
- Check browser console for errors
- Try clearing cookies and reloading

## Environment Variables

The `.env.local` file should contain:

```env
NEXT_PUBLIC_MATRIX_HOMESERVER_URL=https://matrix.org
NEXT_PUBLIC_MATRIX_BASE_URL=https://matrix-client.matrix.org
SESSION_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Need Help?

Check the main README.md for detailed documentation.
