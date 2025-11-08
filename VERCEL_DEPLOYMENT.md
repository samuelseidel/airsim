# AirSim - Vercel Deployment Guide

## 🚀 Quick Deployment

Vercel provides the easiest and fastest way to deploy AirSim with zero configuration.

---

## Method 1: Automatic Deployment (Recommended)

### First-Time Setup

1. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Authorize Vercel to access your repositories

2. **Import Project**:
   - Click "New Project" or "Add New..."
   - Select "Project"
   - Find and import your `airsim` repository
   - Vercel automatically detects it's a Vite project

3. **Configure (Optional)**:
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-configured)
   - **Output Directory**: `dist` (auto-configured)
   - **Install Command**: `npm install` (auto-configured)

   All settings are pre-configured via `vercel.json`, so you can skip this step!

4. **Deploy**:
   - Click "Deploy"
   - Wait ~30-60 seconds
   - Your game is live! 🎉

### Your Live URL

After deployment, you'll get:
- **Production**: `https://airsim.vercel.app` (or custom domain)
- **Preview**: Unique URL for each PR

### Automatic Updates

Every time you push to `main`:
1. Vercel automatically detects the push
2. Builds your project
3. Deploys to production
4. Takes ~30-60 seconds

Every pull request gets:
- Unique preview URL
- Automatic deployment
- Preview before merging

---

## Method 2: Vercel CLI Deployment

### Install Vercel CLI

```bash
npm i -g vercel
```

### First Deployment

```bash
# Navigate to project directory
cd airsim

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - What's your project's name? airsim
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### Deploy to Production

```bash
# Deploy to production
vercel --prod
```

### View Deployments

```bash
# List all deployments
vercel ls

# Open latest deployment in browser
vercel open
```

---

## Configuration

### vercel.json

The project includes `vercel.json` with optimized settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Key Features**:
- ✅ **SPA Routing**: All routes redirect to index.html
- ✅ **Asset Caching**: 1-year cache for hashed assets
- ✅ **Auto-Detection**: Framework preset automatically detected
- ✅ **Optimized Headers**: Best practices for performance

### Environment Variables (Optional)

If you need environment variables:

1. **Via Dashboard**:
   - Go to Project Settings
   - Click "Environment Variables"
   - Add your variables

2. **Via CLI**:
   ```bash
   vercel env add VITE_API_URL
   ```

---

## Custom Domain

### Add Custom Domain

1. **Via Dashboard**:
   - Go to Project Settings
   - Click "Domains"
   - Add your domain (e.g., `airsim.com`)
   - Follow DNS configuration instructions

2. **Via CLI**:
   ```bash
   vercel domains add airsim.com
   ```

### DNS Configuration

Vercel provides options:
- **Option 1**: Point nameservers to Vercel (easiest)
- **Option 2**: Add CNAME record to your DNS

---

## Performance Features

### What Vercel Provides

✅ **Global CDN**:
- Deployed to 100+ edge locations worldwide
- Automatic geo-replication
- Sub-100ms response times globally

✅ **Automatic HTTPS**:
- SSL certificates auto-provisioned
- HTTP/2 enabled
- TLS 1.3 support

✅ **Build Optimization**:
- Parallel builds
- Incremental builds
- Build caching

✅ **Smart CDN**:
- Asset optimization
- Automatic compression (Brotli/gzip)
- Image optimization (if using images)

✅ **Zero Configuration**:
- No build configs needed
- Framework auto-detection
- Optimal settings out-of-box

---

## Monitoring & Analytics

### Built-in Analytics

1. **Enable Analytics**:
   - Go to Project Settings
   - Click "Analytics"
   - Enable Web Analytics

2. **View Metrics**:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Performance Monitoring

Vercel automatically tracks:
- Build times
- Deployment success rate
- Error rates
- Web Vitals (Core Web Vitals)

---

## Troubleshooting

### Build Fails

**Check build logs**:
```bash
vercel logs
```

**Common issues**:
1. Missing dependencies → Run `npm install` locally
2. Build errors → Run `npm run build` locally to test
3. Memory limits → Optimize bundle size

### Runtime Errors

**Check function logs**:
```bash
vercel logs --follow
```

**Common issues**:
1. IndexedDB in private mode → Expected, show user message
2. CORS errors → Configure in vercel.json headers
3. Route 404s → Check rewrites in vercel.json

### Performance Issues

**Check bundle size**:
```bash
npm run build
```

Look for warnings about chunk sizes.

**Solutions**:
- Code splitting
- Lazy loading components
- Tree shaking unused code

---

## Comparison: Vercel vs GitHub Pages

| Feature | Vercel | GitHub Pages |
|---------|--------|--------------|
| Setup | One-click | Manual config |
| Deploy Speed | 30-60s | 2-3 minutes |
| CDN | Global (100+ locations) | Limited |
| HTTPS | Auto (free) | Auto (free) |
| Custom Domain | Easy | Moderate |
| Preview Deploys | Yes (automatic) | No |
| Build Logs | Full logs | Limited |
| Analytics | Built-in | Requires setup |
| SPA Support | Perfect | Requires workarounds |
| Cost | Free for hobby | Free |

**Winner**: Vercel for modern web apps ✅

---

## Best Practices

### Before Deploying

1. **Test locally**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Check build size**:
   - Keep JavaScript bundle < 500KB
   - Optimize images
   - Remove unused dependencies

3. **Test in production mode**:
   - IndexedDB works
   - Routes work correctly
   - Performance is good

### After Deploying

1. **Set up monitoring**:
   - Enable Vercel Analytics
   - Monitor error rates
   - Track Core Web Vitals

2. **Configure domain**:
   - Add custom domain
   - Set up DNS
   - Enable HTTPS

3. **Monitor performance**:
   - Check Lighthouse scores
   - Monitor bundle sizes
   - Watch build times

---

## FAQ

### Q: Is Vercel free?

**A**: Yes! The Hobby plan includes:
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- All core features

### Q: Can I use my own domain?

**A**: Yes! Add any custom domain for free.

### Q: What happens to PR deployments?

**A**: Each PR gets a unique preview URL that's automatically updated on new commits.

### Q: How do I roll back a deployment?

**A**: Via dashboard → Deployments → Select previous → Promote to Production

Or via CLI:
```bash
vercel rollback
```

### Q: Can I deploy from a branch other than main?

**A**: Yes! Configure in Project Settings → Git.

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## Summary

**Vercel deployment is:**
- ✅ **Easy**: One-click setup
- ✅ **Fast**: 30-60 second deploys
- ✅ **Automatic**: Push to deploy
- ✅ **Optimized**: Global CDN, auto-HTTPS
- ✅ **Free**: Hobby plan perfect for AirSim

**Get started in 3 steps:**
1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Click Deploy

Your game will be live in under a minute! 🚀

---

*Last Updated: 2025-11-08*
