/** @type {import('next').NextConfig} */
const repoFromEnv = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
const repoName = repoFromEnv || (process.env.STATIC_EXPORT === 'true' ? 'FGA-Website-3' : '');
const isUserOrOrgSite = repoName.endsWith('.github.io');

// Priority:
// 1. Explicit NEXT_PUBLIC_BASE_PATH if provided
// 2. Extracted repo name if running in GitHub Actions and not a *.github.io user site
// 3. 'FGA-Website-3' if static export is enabled for GitHub Pages deployment
// 4. Empty string (default for local dev)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : (repoName && !isUserOrOrgSite ? `/${repoName}` : '');

const nextConfig = {
  ...(process.env.STATIC_EXPORT === 'true' ? { output: 'export' } : {}),
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
