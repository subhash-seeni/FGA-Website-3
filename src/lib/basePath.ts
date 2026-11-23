/**
 * Resolves static asset paths with robust support for GitHub Pages subpath deployment.
 * Handles both build-time inlining and runtime browser detection.
 */
export function getAssetPath(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  let basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // Runtime fallback: if basePath is empty but running on a GitHub Pages domain (*.github.io)
  if (!basePath && typeof window !== 'undefined') {
    if (window.location.hostname.endsWith('github.io')) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      // If the first segment is the repository name (not a known top-level page route)
      if (
        segments.length > 0 &&
        !['about', 'lease', 'apply', 'verify', 'api', 'images'].includes(segments[0])
      ) {
        basePath = `/${segments[0]}`;
      }
    }
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Prevent double prefixing if path already includes the basePath
  if (basePath && (cleanPath === basePath || cleanPath.startsWith(`${basePath}/`))) {
    return cleanPath;
  }

  return `${basePath}${cleanPath}`;
}
