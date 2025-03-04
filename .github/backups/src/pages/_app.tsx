import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const basePath = process.env.NODE_ENV === 'production' ? '/The-Edison' : '';
  
  return (
    <>
      <Head>
        <title>The Edison - Essay Formatter</title>
        <meta name="description" content="Never struggle with formatting an essay again" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href={`${basePath}/favicon.ico`} />
        <link rel="icon" type="image/svg+xml" href={`${basePath}/favicon.svg`} />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 