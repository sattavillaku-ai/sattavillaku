import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'சட்டவிளக்கு — சட்டமும் சமூகமும்',
    short_name: 'சட்டவிளக்கு',
    description: 'செய்தி, அரசியல் மற்றும் சட்ட விழிப்புணர்வுக்கான தமிழ் இணைய இதழ்.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a2e',
    theme_color: '#1a1a2e',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
