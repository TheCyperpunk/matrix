# Deployment Guide

## Production Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_MATRIX_HOMESERVER_URL`: `https://matrix.org`
     - `NEXT_PUBLIC_MATRIX_BASE_URL`: `https://matrix-client.matrix.org`
     - `SESSION_SECRET`: Generate a secure random string (see below)
   - Click "Deploy"

3. **Generate Secure Session Secret**
   ```bash
   # Using OpenSSL (Linux/Mac)
   openssl rand -base64 32

   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

   # Using PowerShell (Windows)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

#### Vercel Configuration

Create `vercel.json` (optional):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

### Option 2: Netlify

#### Steps:

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   Set the same environment variables as Vercel

3. **netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

---

### Option 3: Railway

#### Steps:

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo

2. **Environment Variables**
   Add the same environment variables

3. **Deploy**
   Railway will automatically detect Next.js and deploy

---

### Option 4: Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  matrix-chat:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_MATRIX_HOMESERVER_URL=https://matrix.org
      - NEXT_PUBLIC_MATRIX_BASE_URL=https://matrix-client.matrix.org
      - SESSION_SECRET=${SESSION_SECRET}
    restart: unless-stopped
```

#### Build and Run

```bash
# Build
docker build -t matrix-chat .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_MATRIX_HOMESERVER_URL=https://matrix.org \
  -e NEXT_PUBLIC_MATRIX_BASE_URL=https://matrix-client.matrix.org \
  -e SESSION_SECRET=your-secret-here \
  matrix-chat

# Or use docker-compose
docker-compose up -d
```

---

### Option 5: Traditional VPS (DigitalOcean, AWS, etc.)

#### Prerequisites
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy

#### Steps:

1. **Install Dependencies**
   ```bash
   npm install
   npm run build
   ```

2. **Install PM2**
   ```bash
   npm install -g pm2
   ```

3. **Create PM2 Ecosystem File**
   
   `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'matrix-chat',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         NEXT_PUBLIC_MATRIX_HOMESERVER_URL: 'https://matrix.org',
         NEXT_PUBLIC_MATRIX_BASE_URL: 'https://matrix-client.matrix.org',
         SESSION_SECRET: 'your-secret-here'
       }
     }]
   }
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   
   `/etc/nginx/sites-available/matrix-chat`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable Site and Restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/matrix-chat /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Environment Variables Checklist

Before deploying, ensure these are set:

- [ ] `NEXT_PUBLIC_MATRIX_HOMESERVER_URL` - Matrix homeserver URL
- [ ] `NEXT_PUBLIC_MATRIX_BASE_URL` - Matrix client base URL
- [ ] `SESSION_SECRET` - Secure random string (min 32 characters)

## Security Checklist

- [ ] Generate a strong `SESSION_SECRET`
- [ ] Enable HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Review and update CORS settings if needed
- [ ] Enable security headers (see below)

## Security Headers

Add to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

export default nextConfig;
```

## Performance Optimization

1. **Enable Compression**
   - Vercel/Netlify: Automatic
   - Nginx: Enable gzip

2. **CDN Configuration**
   - Static assets automatically cached
   - Configure cache headers if needed

3. **Database Connection Pooling**
   - Not applicable (using Matrix.org API)

## Monitoring

### Recommended Tools
- **Vercel Analytics**: Built-in for Vercel deployments
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: User analytics

### Health Check Endpoint

Create `app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

## Backup Strategy

Since this app uses Matrix.org as the backend:
- Messages are stored on Matrix.org servers
- No local database to backup
- User sessions can be recreated by logging in again

## Scaling Considerations

1. **Horizontal Scaling**: Deploy multiple instances behind a load balancer
2. **Session Persistence**: Use Redis for session storage (future enhancement)
3. **CDN**: Serve static assets from CDN
4. **Matrix Homeserver**: Consider self-hosting for better control

## Troubleshooting Deployment Issues

### Build Fails
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Restart the application after changing variables
- Check deployment platform's environment variable settings

### Session Issues
- Verify `SESSION_SECRET` is set correctly
- Check cookie settings (secure flag in production)
- Ensure HTTPS is enabled

## Post-Deployment Checklist

- [ ] Test login functionality
- [ ] Test signup functionality
- [ ] Test room creation
- [ ] Test messaging
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify HTTPS is working
- [ ] Test session persistence
- [ ] Monitor error logs

## Rollback Strategy

### Vercel
- Use Vercel dashboard to rollback to previous deployment

### PM2
```bash
pm2 stop matrix-chat
git checkout <previous-commit>
npm install
npm run build
pm2 restart matrix-chat
```

### Docker
```bash
docker pull <previous-image-tag>
docker-compose up -d
```

---

## Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Test locally first with `npm run build && npm start`
- Verify all environment variables are set correctly

---

**Recommended Platform**: Vercel (easiest and most reliable for Next.js)

**Estimated Deployment Time**: 5-10 minutes with Vercel
