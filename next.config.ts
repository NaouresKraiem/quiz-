/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    // Similar to <React.StrictMode> in React

  images: {
   // remotePatterns allows more flexibility than "domains"

    remotePatterns: [
      {
        protocol: "https",  // Only allow images loaded over HTTPS
        hostname: "images.unsplash.com",  // Only allow images from unsplash.com
      },
     { protocol: 'https', hostname: '*.supabase.co' },       // allow Supabase images (wildcard subdomains)
    //  { protocol: 'https', hostname: '*.supabase.in' },       // another Supabase domain
    ],
  },
}

module.exports = nextConfig