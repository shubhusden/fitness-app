import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://i.ytimg.com https://*.googleusercontent.com",
              "media-src 'self'",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
              "connect-src 'self' https://api.groq.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
