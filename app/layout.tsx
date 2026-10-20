import './globals.css';
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'KhelaBela — Local-Only Bangladeshi Paper Games',
  description: 'Play traditional classroom paper games offline: Paper Cricket with a spinning pen clock, Chor Police with folded chits, and Dots & Boxes on ruled paper.',
  manifest: '/manifest.json',
  themeColor: '#047857',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
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
