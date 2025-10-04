"use client";
import { useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

const files = {
  "package.json": {
    file: {
      contents: JSON.stringify({
        name: "vite-react-app",
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite --host",
          build: "vite build",
          preview: "vite preview --host"
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.0.0",
          vite: "^4.3.9",
          autoprefixer: "^10.4.14",
          postcss: "^8.4.24",
          tailwindcss: "^3.3.2"
        }
      }, null, 2)
    }
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
    }
  },
  "tailwind.config.js": {
    file: {
      contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}`
    }
  },
  "postcss.config.js": {
    file: {
      contents: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`
    }
  },
  "index.html": {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + Tailwind</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
    }
  },
  src: {
    directory: {
      "main.jsx": {
        file: {
          contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)`
        }
      },
      "App.jsx": {
        file: {
          contents: `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full">
        <h1 className="text-5xl font-bold text-gray-800 mb-4 text-center">Vite + React + Tailwind</h1>
        <p className="text-gray-600 mb-8 text-center text-lg">Running in WebContainer 🚀</p>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-8">
          <p className="text-white text-center text-2xl mb-4">Counter: {count}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setCount(count + 1)} className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-200 shadow-lg">Increment</button>
            <button onClick={() => setCount(0)} className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-200 shadow-lg">Reset</button>
          </div>
        </div>
      </div>
    </div>
  )
}`
        }
      },
      "index.css": {
        file: {
          contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
        }
      }
    }
  }
};

export default function WebContainerVite() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState("Initializing...");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let webcontainerInstance: WebContainer | undefined;

    async function initWebContainer() {
      try {
        setStatus("Booting WebContainer...");
        webcontainerInstance = await WebContainer.boot();

        setStatus("Mounting files...");
        await webcontainerInstance.mount(files);

        // --- CHANGE 1: Use pnpm for installation ---
        setStatus("Installing dependencies with pnpm...");
        const installProcess = await webcontainerInstance.spawn("pnpm", ["install"]);

        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            const output = data.trim();
            // Your custom logging to filter out spinner characters
            if (output && !output.match(/[\|\/\-\\]/)) console.log('[pnpm install]', data);
          }
        }));

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          setStatus(`Installation failed with exit code ${installExitCode}`);
          return;
        }

        // --- CHANGE 2: Use pnpm to run the dev server ---
        setStatus("Starting Vite dev server...");
        const devProcess = await webcontainerInstance.spawn("pnpm", ["run", "dev"]);

        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            const output = data.trim();
            console.log('[pnpm run dev]', data);
            if (output.includes("Local:") || output.includes("ready in")) {
              console.log("Vite server is ready!");
            }
          }
        }));

        webcontainerInstance.on("server-ready", (port: number, url: string) => {
          console.log(`Server ready on port ${port}: ${url}`);
          setStatus(`Vite running on port ${port}`);
          setUrl(url);

          // Your timeout logic is a good safeguard
          setTimeout(() => { if (iframeRef.current) iframeRef.current.src = url; }, 1000);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatus(`Error: ${message}`);
        console.error(err);
      }
    }

    initWebContainer();

    return () => { if (webcontainerInstance) webcontainerInstance.teardown(); };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-lg p-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">WebContainer + Vite + Tailwind</h1>
        <span className="text-sm text-gray-300">{status}</span>
      </div>
      <div className="flex-1 p-4">
        {url ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-2 border-gray-700 rounded-lg bg-white shadow-xl"
            title="Vite App"
            onLoad={() => setError("")}
            onError={(e) => { console.error("Iframe load error:", e); setError("Failed to load app in iframe."); }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-300 text-lg">{status}</p>
            </div>
          </div>
        )}
        {error && <div className="bg-red-500 text-white p-4 mt-2 rounded">{error}</div>}
      </div>
    </div>
  );
}