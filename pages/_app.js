import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080c10" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="BazaarPulse" />
        <meta property="og:site_name" content="BazaarPulse" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://bazaarpulse.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@bazaarpulse" />
        <meta name="twitter:image" content="https://bazaarpulse.vercel.app/og-image.png" />
        <link rel="canonical" href="https://bazaarpulse.vercel.app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
