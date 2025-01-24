/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:true,
    basePath:'/docviewer',
    assetPrefix:'/docviewer',
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
      },
};

export default nextConfig;




/** @type {import('next').NextConfig} */
