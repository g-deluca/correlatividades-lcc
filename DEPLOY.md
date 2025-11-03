# Deployment Guide

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

### Setup Instructions

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Name it `correlatividades` (or change the base path in `vite.config.ts`)
   - Don't initialize with README or .gitignore

2. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/correlatividades.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Build and deployment":
     - Source: Select "GitHub Actions"
   - The site will be available at: `https://YOUR_USERNAME.github.io/correlatividades/`

### Automatic Deployment

Once configured, every push to the `main` branch will automatically:
1. Build the project
2. Deploy to GitHub Pages
3. Make the site live within a few minutes

### Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
npm run deploy
```

This will build and push to the `gh-pages` branch.

### Important Notes

- The base path in `vite.config.ts` is set to `/correlatividades/`
- If you rename your repository, update the `base` path accordingly
- GitHub Actions needs write permissions for Pages (already configured in workflow)

### Troubleshooting

If deployment fails:
1. Check Actions tab in your GitHub repository for error logs
2. Ensure GitHub Pages is enabled in repository settings
3. Verify the workflow has proper permissions
4. Make sure the base path matches your repository name
