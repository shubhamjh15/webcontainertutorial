"use client";

// --- UI Component Imports ---
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, RefreshCwIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';

// --- WebContainer and Editor Imports ---
import { WebContainer } from "@webcontainer/api";
import Editor from "@monaco-editor/react";

// --- The complete file structure for the Vite project ---
const files = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "vite-react-app",
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite --host",
            build: "vite build",
            preview: "vite preview --host",
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.0.0",
            vite: "^4.3.9",
            autoprefixer: "^10.4.14",
            postcss: "^8.4.24",
            tailwindcss: "^3.3.2",
          },
        },
        null,
        2
      ),
    },
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
    },
  },
  "tailwind.config.js": {
    file: {
      contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    },
  },
  "postcss.config.js": {
    file: {
      contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    },
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
</html>`,
    },
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
)`,
        },
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
}`,
        },
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
}`,
        },
      },
    },
  },
};

// --- Types for our state ---
export type LogEntry = {
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: Date;
};

type CodeEditorProps = {
  filesContent: { [key: string]: string };
  onFileChange: (filename: string, newCode: string) => void;
};

// --- UI Components ---
const WebPreviewContext = createContext<{
  baseUrl: string;
  relativePath: string;
  iframeRef: React.RefObject<HTMLIFrameElement>;
} | null>(null);

const useWebPreview = () => {
  const context = useContext(WebPreviewContext);
  if (!context) throw new Error('useWebPreview must be used within a WebPreview');
  return context;
};

const WebPreviewNavigation = (props: ComponentProps<'div'>) => (
  <div className={cn('flex items-center gap-1 border-b p-2', props.className)} {...props} />
);

const WebPreviewUrl = ({
  relativePath,
  setRelativePath,
}: {
  relativePath: string;
  setRelativePath: (path: string) => void;
}) => {
  const [inputValue, setInputValue] = useState(relativePath);

  useEffect(() => {
    setInputValue(relativePath);
  }, [relativePath]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setRelativePath(inputValue);
    }
  };

  return (
    <Input
      className="h-8 flex-1 text-sm"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Enter a path, e.g., /about"
    />
  );
};

const WebPreviewBody = (props: ComponentProps<'iframe'>) => {
  const { baseUrl, relativePath, iframeRef } = useWebPreview();
  const src = baseUrl ? `${baseUrl}${relativePath}` : undefined;

  return (
    <iframe
      ref={iframeRef}
      className={cn('size-full bg-white', props.className)}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
      src={src}
      title="Preview"
      {...props}
    />
  );
};

const WebPreviewConsole = ({ logs = [], ...props }: WebPreviewConsoleProps) => {
  const [consoleOpen, setConsoleOpen] = useState(false);
  return (
    <Collapsible className="border-t" onOpenChange={setConsoleOpen} open={consoleOpen} {...props}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between p-2 text-left text-sm font-medium hover:bg-muted/50">
          Console
          <ChevronDownIcon className={cn('h-4 w-4 transition-transform', consoleOpen && 'rotate-180')} />
        </button>
      </CollapsibleTrigger>
      {/* --- FIX 2: Added overflow-x-hidden to prevent horizontal scroll --- */}
      <CollapsibleContent className="max-h-48 overflow-y-auto overflow-x-hidden border-t p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No console output</p>
        ) : (
          logs.map((log, index) => (
            <div
              className={cn(
                'whitespace-pre-wrap', // This ensures text wraps
                log.level === 'error' && 'text-red-500',
                log.level === 'warn' && 'text-yellow-500',
              )}
              key={`${log.timestamp.getTime()}-${index}`}
            >
              <span className="mr-2 text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
              <span>{log.message}</span>
            </div>
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

function CodeEditor({ filesContent, onFileChange }: CodeEditorProps) {
  const [activeFile, setActiveFile] = useState("src/App.jsx");
  const activeFileContent = filesContent[activeFile] || "";

  const getLanguage = (filename: string) => {
    if (filename.endsWith(".jsx")) return "jsx";
    if (filename.endsWith(".css")) return "css";
    return "javascript";
  };

  return (
    <div className="flex h-full bg-gray-800 text-white rounded-lg overflow-hidden">
      <div className="w-48 border-r border-gray-700 p-2 overflow-y-auto">
        <h3 className="text-lg font-bold mb-2 text-gray-300">Files</h3>
        <ul>
          {Object.keys(filesContent).map((filename) => (
            <li key={filename}>
              <button
                onClick={() => setActiveFile(filename)}
                className={`w-full text-left px-2 py-1 rounded text-sm ${
                  activeFile === filename ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
              >
                {filename}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          theme="vs-dark"
          path={activeFile}
          language={getLanguage(activeFile)}
          value={activeFileContent}
          onChange={(value) => onFileChange(activeFile, value || "")}
        />
      </div>
    </div>
  );
}

// --- FIX 1: Helper function to strip ANSI color codes ---
const stripAnsiCodes = (str: string) => {
  // This regex removes ANSI escape sequences used for color, bolding, etc.
  return str.replace(
    /[\u001b\u009b][[()#;?]*.{0,2}(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );
};

// --- The Main Integrated Component ---
export default function WebContainerIDE() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const webcontainerInstanceRef = useRef<WebContainer | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState("Initializing...");
  const [baseUrl, setBaseUrl] = useState("");
  const [relativePath, setRelativePath] = useState("/");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  
  const [filesContent, setFilesContent] = useState({
    "src/App.jsx": files.src.directory["App.jsx"].file.contents,
    "src/index.css": files.src.directory["index.css"].file.contents,
  });

  const addToLogs = (message: string, level: LogEntry['level'] = 'log') => {
    // Clean the message before adding it to the state
    const cleanMessage = stripAnsiCodes(message).trim();
    if (cleanMessage) { // Only add non-empty logs
      setLogs(prevLogs => [...prevLogs.slice(-100), { message: cleanMessage, level, timestamp: new Date() }]);
    }
  };

  useEffect(() => {
    async function initWebContainer() {
      if (webcontainerInstanceRef.current) return;
      try {
        setStatus("Booting WebContainer...");
        const instance = await WebContainer.boot();
        webcontainerInstanceRef.current = instance;

        setStatus("Mounting files...");
        await instance.mount(files);

        setStatus("Installing dependencies...");
        const installProcess = await instance.spawn("pnpm", ["install"]);
        installProcess.output.pipeTo(new WritableStream({ write(data) { addToLogs(data); } }));
        if ((await installProcess.exit) !== 0) throw new Error("Installation failed.");
        
        setStatus("Starting Vite dev server...");
        const devProcess = await instance.spawn("pnpm", ["run", "dev"]);
        devProcess.output.pipeTo(new WritableStream({ write(data) { addToLogs(data); } }));

        instance.on("server-ready", (port: number, serverUrl: string) => {
          setStatus("Live preview is running!");
          setBaseUrl(serverUrl);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatus(`Error: ${message}`);
        addToLogs(message, 'error');
      }
    }
    initWebContainer();
    return () => {
      webcontainerInstanceRef.current?.teardown();
      webcontainerInstanceRef.current = null;
    };
  }, []);

  const handleFileChange = (filename: string, newCode: string) => {
    setFilesContent(prev => ({ ...prev, [filename]: newCode }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (webcontainerInstanceRef.current) {
        await webcontainerInstanceRef.current.fs.writeFile(filename, newCode);
      }
    }, 500);
  };

  const reloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = `${baseUrl}${relativePath}`;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <WebPreviewContext.Provider value={{ baseUrl, relativePath, iframeRef }}>
        <div className="flex size-full flex-col rounded-lg border bg-card">
          <WebPreviewNavigation>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-8 w-8 p-0"
                    variant="ghost"
                    onClick={reloadIframe}
                    disabled={!baseUrl}
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Reload Preview</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <WebPreviewUrl relativePath={relativePath} setRelativePath={setRelativePath} />
          </WebPreviewNavigation>

          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2',
                activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2',
                activeTab === 'code' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Code
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className={cn("absolute inset-0", activeTab !== 'preview' && 'hidden')}>
              {baseUrl ? <WebPreviewBody /> : <div className="flex h-full items-center justify-center"><p className="text-muted-foreground">{status}</p></div>}
            </div>
            <div className={cn("absolute inset-0", activeTab !== 'code' && 'hidden')}>
              <CodeEditor filesContent={filesContent} onFileChange={handleFileChange} />
            </div>
          </div>

          <WebPreviewConsole logs={logs} />
        </div>
      </WebPreviewContext.Provider>
    </div>
  );
}

// --- Prop Types for UI Components ---
export type WebPreviewNavigationButtonProps = ComponentProps<typeof Button> & {
  tooltip?: string;
};
export type WebPreviewConsoleProps = ComponentProps<'div'> & {
  logs?: LogEntry[];
};