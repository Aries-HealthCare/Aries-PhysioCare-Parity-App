import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { RequestCallbackProvider } from "@/components/request-callback-provider";
import { ProviderAuthProvider } from "@/services/provider-auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://app.ariesphysiocare.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AriesXpert Partner',
  },
  title: {
    default: 'AriesXpert | Healthcare Provider Clinical Workstation',
    template: '%s | AriesXpert',
  },
  description: 'AriesXpert Clinical Parity Web App for verified physiotherapists, doctors, nurses, and healthcare specialists across India.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${outfit.variable} ${spaceGrotesk.variable}`}
      style={{ backgroundColor: '#030712', colorScheme: 'dark' }}
    >
      <body className="antialiased min-h-screen bg-[#030712] text-foreground flex flex-col selection:bg-teal-500 selection:text-white">
        <ThemeProvider>
          <RequestCallbackProvider>
            <ProviderAuthProvider>
              {children}
              <Toaster />
            </ProviderAuthProvider>
          </RequestCallbackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
