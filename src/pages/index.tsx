import Head from 'next/head'
import App from '../components/ui/EdisonUI'

export default function Home() {
  return (
    <>
      <Head>
        <title>Edison - Document Formatting App</title>
        <meta name="description" content="Format your documents with ease using Edison" />
      </Head>
      <App />
    </>
  )
} 