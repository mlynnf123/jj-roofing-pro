/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/**/*.wasm', './node_modules/**/*.node'],
    },
  },
};

export default nextConfig;