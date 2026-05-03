/** @type {import('next').NextConfig} */
const nextConfig = {
  // This line silences the error you are seeing
  turbopack: {}, 
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    config.resolve.fallback = { 
      fs: false, 
      path: false 
    };
    return config;
  },
};

export default nextConfig;