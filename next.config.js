
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fhceygcanwphiskpqora.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'akbzqpuhmkkgybeuvfkf.supabase.co', // Added from user's Supabase URL
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'matiasp.sirv.com',
        port: '',
        pathname: '/sss/**',
      },
      {
        protocol: 'https',
        hostname: 'openweathermap.org', // Added for weather icons
        port: '',
        pathname: '/img/wn/**',
      }
    ],
  },
};

export default nextConfig;

    