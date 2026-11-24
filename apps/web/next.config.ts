import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    localPatterns: [{ pathname: '/products/**', search: '' }],
    qualities: [75],
  },
};

export default nextConfig;
