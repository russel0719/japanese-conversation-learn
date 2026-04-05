/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/japanese-conversation-learn' : '',
  assetPrefix: isProd ? '/japanese-conversation-learn/' : '',
};

export default nextConfig;
