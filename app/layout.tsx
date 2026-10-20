import './globals.css';
import type {Metadata, Viewport} from 'next';

export const viewport: Viewport = {
  themeColor: '#047857',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://khela-bela.vercel.app'),
  title: {
    default: 'KhelaBela — Local-Only Bangladeshi Paper Games',
    template: '%s | KhelaBela',
  },
  description:
    'Play traditional classroom paper games offline: Paper Cricket with a spinning pen clock, Chor Police with folded chits, and Dots & Boxes on ruled paper.',
  applicationName: 'KhelaBela',
  authors: [{name: 'KhelaBela', url: 'https://khela-bela.vercel.app'}],
  creator: 'KhelaBela',
  publisher: 'KhelaBela',
  keywords: [
    'Bangladeshi paper games',
    'Paper Cricket',
    'Chor Police',
    'Dots and Boxes',
    'খেলাবেলা',
    'KhelaBela',
    'classroom games',
    'offline games',
    'pass and play',
    'traditional games',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [{url: '/favicon.png', type: 'image/png'}],
    shortcut: '/favicon.png',
    apple: [{url: '/favicon.png', sizes: '351x352', type: 'image/png'}],
  },
  alternates: {
    canonical: 'https://khela-bela.vercel.app/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['bn_BD'],
    url: 'https://khela-bela.vercel.app/',
    siteName: 'KhelaBela',
    title: 'KhelaBela — Local-Only Bangladeshi Paper Games',
    description:
      'Play traditional classroom paper games offline: Paper Cricket with a spinning pen clock, Chor Police with folded chits, and Dots & Boxes on ruled paper.',
    images: [
      {
        url: '/favicon.png',
        width: 351,
        height: 352,
        alt: 'KhelaBela Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'KhelaBela — Local-Only Bangladeshi Paper Games',
    description:
      'Play traditional classroom paper games offline: Paper Cricket with a spinning pen clock, Chor Police with folded chits, and Dots & Boxes on ruled paper.',
    images: ['/favicon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main className="mx-auto min-h-screen max-w-xl p-4 sm:p-6">{children}</main>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js');});}",
          }}
        />
      </body>
    </html>
  );
}
