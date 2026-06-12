/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['ta'],
    defaultLocale: 'ta',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
