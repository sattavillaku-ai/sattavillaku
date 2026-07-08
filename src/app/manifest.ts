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
        src: '/images/sattavillaku-logo.jpeg',
        sizes: '256x256',
        type: 'image/jpeg',
      },
    ],
  };
}
