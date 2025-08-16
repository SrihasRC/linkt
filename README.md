# 🌐 Linkt

> Ultra-simple file & clipboard sharing between your devices - no signup required

![Linkt Preview](preview.png)

## ✨ Features

- **🚀 Zero Setup** - No accounts, no passwords, just upload and go
- **📱 Mobile-First** - Works perfectly on phones and tablets
- **🔗 Instant Access** - Share files with simple 6-digit codes
- **📋 Universal Clipboard** - Share text snippets with syntax highlighting
- **📱 QR Codes** - Quick mobile access via QR code scanning
- **⏰ Auto-Expiry** - Files automatically delete after 24 hours
- **🔒 Privacy-Focused** - No tracking, no analytics, minimal logging
- **📱 PWA Ready** - Install as an app on any device
- **🌙 Dark Theme** - Modern glassmorphism design

## 🚀 Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/linkt.git
   cd linkt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

### Production Deployment

#### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/linkt)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Deploy automatically

#### Manual Deployment

```bash
npm run build
npm start
```

## 📖 How to Use

### Upload a File
1. Go to **Upload** tab
2. Drag & drop your file or click to browse
3. Get your 6-digit share code (e.g., `ABC123`)
4. Share the code or scan the QR code

### Access a File
1. Go to **Access** tab  
2. Enter the 6-digit code
3. Download instantly

### Share Text/Clipboard
1. Go to **Clipboard** tab
2. Paste your text or code snippet
3. Get shareable link
4. Access from any device

## 🛠 Tech Stack

- **Frontend**: Next.js 15 + TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **QR Codes**: qrcode
- **Notifications**: Sonner
- **PWA**: next-pwa
- **Storage**: Local file system (production ready)

## 📁 Project Structure

```
linkt/
├── app/
│   ├── api/
│   │   ├── upload/route.ts      # File upload endpoint
│   │   ├── download/[code]/     # File download endpoint
│   │   ├── text/route.ts        # Text sharing endpoint
│   │   ├── text/[code]/         # Text access endpoint
│   │   └── cleanup/route.ts     # Cleanup expired files
│   ├── t/[code]/page.tsx        # Text viewing page
│   ├── globals.css              # Global styles + glassmorphism
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application
├── components/
│   ├── ui/                      # shadcn/ui components
│   └── QRCodeGenerator.tsx      # QR code generation
├── public/
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # PWA icons
└── uploads/                     # File storage (auto-created)
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Optional: Set custom cleanup auth key
CLEANUP_AUTH_KEY=your-secret-key
```

### File Storage

Files are stored in the `uploads/` directory and automatically cleaned up after 24 hours.

### Rate Limits

- **File uploads**: 100MB per file, 500MB per IP per day
- **Upload frequency**: 10 uploads per hour per IP
- **Text sharing**: 1MB per text snippet

## 🚨 Security Features

- File type validation
- Size limits enforcement
- Rate limiting on uploads
- Automatic file expiry
- No permanent data storage
- XSS protection for text content

## 🔄 Automatic Cleanup

Set up a cron job to clean expired files:

```bash
# Add to your crontab (runs every hour)
0 * * * * curl -X POST -H "Authorization: Bearer cleanup-secret-key" https://your-domain.com/api/cleanup
```

## 📱 PWA Installation

### On Mobile:
1. Open Linkt in your browser
2. Tap "Add to Home Screen"
3. Use like a native app

### On Desktop:
1. Open Linkt in Chrome/Edge
2. Click the install button in the address bar
3. Install as desktop app

## 🎨 Customization

### Colors
Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: your-primary-color;
  --background: your-background-color;
  /* ... other colors */
}
```

### File Size Limits
Edit the API routes in `app/api/upload/route.ts`:

```typescript
// Change file size limit (currently 100MB)
if (file.size > 100 * 1024 * 1024) {
  return NextResponse.json({ error: "File too large" });
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the clean icons
- [Vercel](https://vercel.com/) for seamless deployment

---

<div align="center">
  <p>Built with ❤️ for seamless file sharing</p>
  <p>
    <a href="#-linkt">Back to top</a> •
    <a href="https://github.com/yourusername/linkt/issues">Report Bug</a> •
    <a href="https://github.com/yourusername/linkt/issues">Request Feature</a>
  </p>
</div>
