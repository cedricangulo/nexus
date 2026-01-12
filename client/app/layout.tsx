import type { Metadata } from "next";
import { Geist, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { BoundaryProvider } from "@/components/internal/BoundaryProvider";
import Boundary from "@/components/internal/Boundary";
import BoundaryToggle from "@/components/internal/BoundaryToggle";
import { PushNotificationProvider } from "@/providers/push-notification-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nexus | Capstone Project Progress Monitor",
    template: "%s | Nexus",
  },
  description:
    "Nexus is an internal project monitoring system designed for student teams to track capstone progress using Water-Scrum-Fall methodology. Monitor phases, sprints, deliverables, and team contributions in one unified dashboard.",
  keywords: [
    "capstone project",
    "project management",
    "water scrum fall",
    "wsf methodology",
    "team collaboration",
    "progress tracking",
    "sprint management",
    "deliverable tracking",
  ],
  authors: [{ name: "Nexus Team" }],
  creator: "Nexus",
  publisher: "Nexus",
  metadataBase: new URL("https://nexus.local"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexus.local",
    siteName: "Nexus",
    title: "Nexus | Capstone Project Progress Monitor",
    description:
      "Track your capstone project progress with Nexus. Monitor phases, sprints, deliverables, and team contributions using Water-Scrum-Fall methodology.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexus Project Monitor Dashboard",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nexus",
  },
  other: {
    "X-UA-Compatible": "IE=edge",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${sora.variable} antialiased`}>
        <PushNotificationProvider>
          <BoundaryProvider>
            <Boundary rendering="static" hydration="server">
              <Toaster closeButton expand={true} position="top-right" richColors />
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                disableTransitionOnChange
                enableSystem
              >
                {children}
              </ThemeProvider>
            </Boundary>
            <BoundaryToggle />
          </BoundaryProvider>
        </PushNotificationProvider>
      </body>
    </html>
  );
}
