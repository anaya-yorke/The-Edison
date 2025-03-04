import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Custom404() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '0 2rem',
      background: 'linear-gradient(135deg, #121212 0%, #2a0e61 100%)'
    }}>
      <Head>
        <title>404 - Page Not Found | The Edison</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Head>

      <h1 style={{
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '2rem',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #FF00FF, #8A2BE2)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.5)'
      }}>
        404 - Page Not Found
      </h1>
      
      <p style={{
        fontSize: '1.2rem',
        marginBottom: '2rem',
        color: '#F5F5F5',
        maxWidth: '600px'
      }}>
        The essay formatting page you're looking for seems to have disappeared into the void.
      </p>
      
      <button
        onClick={() => router.push('/')}
        style={{
          background: 'linear-gradient(90deg, #FF00FF, #8A2BE2)',
          border: '1px solid #F5F5F5',
          color: '#F5F5F5',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out',
          fontFamily: "'Press Start 2P', cursive",
          borderRadius: '4px'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Return to Formatter
      </button>
    </div>
  );
} 