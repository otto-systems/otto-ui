import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';

const rootElement = document.getElementById('splash-root');

if (!rootElement) {
  throw new Error('Splash root element was not found');
}

function Splash(): JSX.Element {
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState('0.0.0');

  useEffect(() => {
    const offReady = window.ottoHelper.splash.onReady(() => {
      setReady(true);
      setTimeout(() => {
        window.close();
      }, 280);
    });

    const offVersion = window.ottoHelper.splash.onVersion((nextVersion) => {
      setVersion(nextVersion);
    });

    return () => {
      offReady();
      offVersion();
    };
  }, []);

  const dots = useMemo(() => {
    return ready ? 'Done' : 'Initializing...';
  }, [ready]);

  return (
    <div className="splash-shell">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="card"
      >
        <svg width="88" height="88" viewBox="0 0 88 88" aria-label="OttoHelper Logo" role="img">
          <defs>
            <linearGradient id="otto-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="72" height="72" rx="18" fill="url(#otto-grad)" />
          <path
            d="M27 45c0-9.4 7.6-17 17-17s17 7.6 17 17-7.6 17-17 17-17-7.6-17-17Zm17-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"
            fill="white"
            opacity="0.95"
          />
        </svg>

        <h1>OttoHelper</h1>

        <motion.p
          key={dots}
          initial={{ opacity: 0.15 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="status"
        >
          {dots}
        </motion.p>

        <div className="progress-track">
          <motion.div
            className="progress-bar"
            initial={{ x: '-45%' }}
            animate={{ x: '145%' }}
            transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <span className="version">v{version}</span>
      </motion.div>
    </div>
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Splash />
  </React.StrictMode>,
);

const style = document.createElement('style');
style.textContent = `
  :root {
    color-scheme: light dark;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #splash-root {
    margin: 0;
    width: 100%;
    height: 100%;
    font-family: 'Inter', sans-serif;
  }

  body {
    display: grid;
    place-items: center;
    background: transparent;
  }

  .splash-shell {
    width: 100%;
    height: 100%;
    padding: 20px;
    display: grid;
    place-items: center;
  }

  .card {
    width: 100%;
    max-width: 460px;
    min-height: 300px;
    border-radius: 24px;
    border: 1px solid rgba(100, 116, 139, 0.22);
    display: grid;
    place-items: center;
    text-align: center;
    padding: 28px 28px 34px;
    position: relative;
    backdrop-filter: blur(6px);
  }

  h1 {
    margin: 14px 0 8px;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 0.01em;
  }

  .status {
    margin: 0;
    font-size: 14px;
    min-height: 20px;
  }

  .progress-track {
    margin-top: 14px;
    width: 210px;
    height: 5px;
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    position: absolute;
    inset: 0;
    width: 40%;
    border-radius: 999px;
  }

  .version {
    position: absolute;
    right: 18px;
    bottom: 14px;
    font-size: 12px;
    opacity: 0.8;
  }

  @media (prefers-color-scheme: dark) {
    body {
      background: #0f0f0f;
      color: #ffffff;
    }

    .card {
      background: radial-gradient(circle at top, rgba(14, 116, 144, 0.18), rgba(15, 15, 15, 0.96));
    }

    .status,
    .version {
      color: rgba(255, 255, 255, 0.85);
    }

    .progress-track {
      background: rgba(148, 163, 184, 0.25);
    }

    .progress-bar {
      background: linear-gradient(90deg, #67e8f9, #38bdf8);
    }
  }

  @media (prefers-color-scheme: light) {
    body {
      background: #ffffff;
      color: #111827;
    }

    .card {
      background: radial-gradient(circle at top, rgba(14, 165, 233, 0.14), rgba(255, 255, 255, 0.96));
    }

    .status,
    .version {
      color: rgba(17, 24, 39, 0.8);
    }

    .progress-track {
      background: rgba(148, 163, 184, 0.35);
    }

    .progress-bar {
      background: linear-gradient(90deg, #06b6d4, #0284c7);
    }
  }
`;
document.head.appendChild(style);
