import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeContext";
import { ToastProvider } from "./components/ToastProvider";

export const metadata: Metadata = {
  title: "NourishFit — Your Fitness Companion",
  description:
    "Track calories, follow guided workouts, and reach your fitness goals with an AI-powered personal coach.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#d4a853",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0 }}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}