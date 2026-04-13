import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NourishFit — Your Fitness Companion",
  description:
    "Track calories, follow guided workouts, and reach your fitness goals with an AI-powered personal coach.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: "#0b0a08", color: "#f0ebe0", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}