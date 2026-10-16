/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Bus forms carry photos and six documents (each up to 5 MB).
      bodySizeLimit: "40mb",
    },
  },
};

export default nextConfig;
