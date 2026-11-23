/** @type {import('next').NextConfig} */
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
const isUserOrOrgSite = repoName.endsWith('.github.io');

// Priority:
// 1. Explicit NEXT_PUBLIC_BASE_PATH if provided
// 2. Extracted repo name if running in GitHub Actions and not a *.github.io user site
// 3. Empty string (default for local dev or custom domain)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : (process.env.GITHUB_ACTIONS && repoName && !isUserOrOrgSite ? `/${repoName}` : '');

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
