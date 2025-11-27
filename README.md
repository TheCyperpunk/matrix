# Matrix Chat Application

A modern, production-ready chat application built with Next.js 14 and Matrix.org protocol.

## Features

✅ **Authentication**
- Matrix.org login and registration
- Secure session management with HttpOnly cookies
- Auto-restore sessions on page reload
- Protected routes with middleware

✅ **Real-time Chat**
- Live message synchronization
- Typing indicators
- Read receipts
- Unread message counts
- Auto-reconnect on network issues

✅ **Room Management**
- Create private rooms
- Join rooms by ID or alias
- Leave rooms
- View room members
- Display last messages

✅ **Modern UI**
- Beautiful glassmorphism design
- Dark mode interface
- Responsive layout
- Smooth animations
- Custom scrollbars

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Matrix.org (matrix-js-sdk)
- **Auth**: JWT with HttpOnly cookies (jose)
- **State Management**: React Hooks

## Project Structure

```
matrix/
├── app/
│   ├── chat/
│   │   ├── [roomId]/
│   │   │   └── page.tsx          # Individual room page
│   │   └── page.tsx               # Main chat page
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── signup/
│   │   └── page.tsx               # Signup page
│   ├── profile/
│   │   └── page.tsx               # User profile page
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page (redirects)
│   └── globals.css                # Global styles
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx          # Login form component
│   │   └── SignupForm.tsx         # Signup form component
│   └── chat/
│       ├── ChatLayout.tsx         # Main chat layout
│       ├── RoomList.tsx           # Room list sidebar
│       ├── RoomPage.tsx           # Room page client component
│       ├── MessageList.tsx        # Message list with real-time updates
│       ├── MessageInput.tsx       # Message input with typing indicators
│       ├── TypingIndicator.tsx    # Typing indicator component
│       └── Modals.tsx             # Create/Join room modals
├── lib/
│   └── matrix/
│       ├── client.ts              # Matrix client factory
│       ├── session.ts             # Session management
│       └── actions.ts             # Server actions
├── hooks/
│   └── useMatrixClient.ts         # Custom Matrix client hook
├── middleware.ts                  # Route protection middleware
└── .env.local                     # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory**

```bash
cd matrix
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

The `.env.local` file has been created with the following variables:

```env
# Matrix Configuration
NEXT_PUBLIC_MATRIX_HOMESERVER_URL=https://matrix.org
NEXT_PUBLIC_MATRIX_BASE_URL=https://matrix-client.matrix.org

# Session Secret (generate a random string for production)
SESSION_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
```

**Important**: For production, generate a secure random string for `SESSION_SECRET`:

```bash
# Generate a secure secret (Linux/Mac)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating an Account

1. Click "Sign up" on the login page
2. Enter a username and password
3. Click "Create Account"

**Note**: Registration on matrix.org may be restricted or require additional verification. If you encounter issues:
- Try using an existing Matrix account
- Consider setting up a different homeserver
- Check Matrix.org's current registration policies

### Logging In

1. Enter your Matrix username (without the @ symbol)
2. Enter your password
3. Click "Sign In"

### Using the Chat

1. **Create a Room**: Click the "+ Create" button in the sidebar
2. **Join a Room**: Click "Join" and enter a room ID (e.g., `!roomid:matrix.org`) or alias (e.g., `#alias:matrix.org`)
3. **Send Messages**: Type in the message input and press Enter or click the send button
4. **View Profile**: Click your avatar in the top-left corner

## Key Features Explained

### Session Management

- Sessions are stored in **HttpOnly cookies** for security
- JWT tokens are used with 7-day expiration
- Automatic session restoration on page reload
- Secure logout clears both client and server sessions

### Real-time Sync

- Matrix client starts syncing on login
- Live updates for new messages
- Typing indicators show when others are typing
- Read receipts are sent automatically
- Unread counts update in real-time

### Route Protection

- Middleware protects `/chat` and `/profile` routes
- Unauthenticated users are redirected to `/login`
- Authenticated users accessing `/login` or `/signup` are redirected to `/chat`

## API Integration

The app uses the official `matrix-js-sdk` to communicate with Matrix.org:

- **Authentication**: `client.login()` and `client.register()`
- **Messaging**: `client.sendTextMessage()`
- **Sync**: `client.startClient()` with event listeners
- **Rooms**: `client.createRoom()`, `client.joinRoom()`, `client.leave()`
- **Typing**: `client.sendTyping()`
- **Read Receipts**: `client.sendReadReceipt()`

## Troubleshooting

### Registration Issues

If you can't register on matrix.org:
- Matrix.org sometimes restricts registrations
- Try logging in with an existing account
- Consider using a different homeserver by changing `NEXT_PUBLIC_MATRIX_HOMESERVER_URL`

### Connection Issues

If the client won't sync:
- Check your internet connection
- Verify the homeserver URL is correct
- Check browser console for errors
- Try logging out and back in

### Build Errors

If you encounter TypeScript errors:
```bash
npm run build
```

This will show any type errors that need to be fixed.

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Make sure to set these in your production environment:
- `NEXT_PUBLIC_MATRIX_HOMESERVER_URL`: Your Matrix homeserver URL
- `SESSION_SECRET`: A secure random string (minimum 32 characters)

### Deployment Platforms

This app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Any Node.js hosting platform**

## Security Considerations

1. **Session Secret**: Always use a strong, random secret in production
2. **HTTPS**: Always use HTTPS in production for secure cookie transmission
3. **Cookie Settings**: Cookies are set to `httpOnly`, `secure` (in production), and `sameSite: 'lax'`
4. **No Client-Side Token Storage**: Access tokens are never stored in localStorage

## Future Enhancements

Potential features to add:
- [ ] File upload support
- [ ] Image/video messages
- [ ] Emoji picker
- [ ] Message reactions
- [ ] User presence indicators
- [ ] Push notifications
- [ ] Voice/video calls
- [ ] End-to-end encryption UI
- [ ] Room settings and permissions
- [ ] User search and invites

## License

MIT License - feel free to use this project as you wish.

## Support

For issues with:
- **This app**: Check the code and console for errors
- **Matrix.org**: Visit [matrix.org/docs](https://matrix.org/docs)
- **Matrix SDK**: Check [matrix-js-sdk documentation](https://matrix-org.github.io/matrix-js-sdk/)

---

Built with ❤️ using Next.js 14 and Matrix.org
