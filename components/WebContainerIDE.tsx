"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Eye,
  Code2,
  Download,
  Copy,
  Check,
} from "lucide-react";
import type { ComponentProps } from "react";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import Editor from "@monaco-editor/react";

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
            "react-router-dom": "^6.23.1",
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
          contents: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pricing', element: <PricingPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);`,
        },
      },
      "App.jsx": {
        file: {
          contents: `import { Outlet, Link } from 'react-router-dom';
import LocationSync from './LocationSync';

export default function App() {
  return (
    <div>
      <LocationSync />
      <nav className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex gap-6 items-center">
          <Link to="/" className="text-white font-bold text-lg hover:text-purple-300 transition-colors">
            Home
          </Link>
          <Link to="/pricing" className="text-white font-bold text-lg hover:text-purple-300 transition-colors">
            Pricing
          </Link>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}`,
        },
      },
      "index.css": {
        file: {
          contents: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
        },
      },
      "LocationSync.jsx": {
        file: {
          contents: `import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function LocationSync() {
  const location = useLocation();

  useEffect(() => {
    window.parent.postMessage({
      type: 'pathChange',
      path: location.pathname,
    }, '*');
  }, [location.pathname]);

  return null;
}`,
        },
      },
      pages: {
        directory: {
          "HomePage.jsx": {
            file: {
              contents: `import { useState } from 'react'

export default function HomePage() {
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
          "PricingPage.jsx": {
            file: {
              contents: `export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Our Pricing</h1>
        <p className="text-gray-600 mb-8 text-lg">Simple and transparent pricing for everyone.</p>
        <div className="bg-gray-200 rounded-2xl p-8">
          <h2 className="text-3xl font-semibold text-gray-700">Pro Plan</h2>
          <p className="text-6xl font-bold text-purple-600 my-4">$10/mo</p>
          <p className="text-gray-500">Includes all features and unlimited projects.</p>
        </div>
      </div>
    </div>
  );
}`,
            },
          },
        },
      },
    },
  },
};

export type LogEntry = {
  level: "log" | "warn" | "error";
  message: string;
  timestamp: Date;
};

type FileTreeItem = {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeItem[];
};

type CodeEditorProps = {
  filesContent: { [key: string]: string };
  onFileChange: (filename: string, newCode: string) => void;
  activeFile: string;
  onFileSelect: (filename: string) => void;
};

const WebPreviewContext = createContext<{
  baseUrl: string;
  relativePath: string;
  iframeRef: React.RefObject<HTMLIFrameElement>;
} | null>(null);

const useWebPreview = () => {
  const context = useContext(WebPreviewContext);
  if (!context)
    throw new Error("useWebPreview must be used within a WebPreview");
  return context;
};

const WebPreviewNavigation = (props: ComponentProps<"div">) => (
  <div
    className={cn(
      "flex items-center gap-3 border-b border-[#2a2a2a] bg-[#0a0a0a] p-2",
      props.className
    )}
    {...props}
  />
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
    if (event.key === "Enter") {
      setRelativePath(inputValue);
    }
  };

  return (
    <Input
      className="h-8 w-96 text-sm bg-[#1a1a1a] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#6a6a6a] focus-visible:ring-0 focus-visible:ring-offset-0"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Enter a path, e.g., /pricing"
    />
  );
};

const WebPreviewBody = (props: ComponentProps<"iframe">) => {
  const { baseUrl, relativePath, iframeRef } = useWebPreview();
  const src = baseUrl ? `${baseUrl}${relativePath}` : undefined;

  return (
    <iframe
      ref={iframeRef}
      className={cn("size-full bg-[#0a0a0a]", props.className)}
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
    <Collapsible
      className="border-t border-[#2a2a2a] bg-[#0a0a0a]"
      onOpenChange={setConsoleOpen}
      open={consoleOpen}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between p-2 text-left text-sm font-medium text-[#e5e5e5] hover:bg-[#1a1a1a]">
          Console
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              consoleOpen && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="max-h-48 overflow-y-auto overflow-x-hidden border-t border-[#2a2a2a] bg-[#0a0a0a] p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-[#6a6a6a]">No console output</p>
        ) : (
          logs.map((log, index) => (
            <div
              className={cn(
                "whitespace-pre-wrap",
                log.level === "error" && "text-red-400",
                log.level === "warn" && "text-yellow-400",
                log.level === "log" && "text-[#b5b5b5]"
              )}
              key={`${log.timestamp.getTime()}-${index}`}
            >
              <span className="mr-2 text-[#6a6a6a]">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span>{log.message}</span>
            </div>
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

function FileTreeNode({
  item,
  level,
  onSelect,
  activeFile,
}: {
  item: FileTreeItem;
  level: number;
  onSelect: (path: string) => void;
  activeFile: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!item.isDirectory) {
    return (
      <button
        onClick={() => onSelect(item.path)}
        className={cn(
          "w-full text-left px-2 py-1 text-sm flex items-center gap-2 hover:bg-[#1a1a1a] rounded text-[#b5b5b5]",
          activeFile === item.path && "bg-[#2a2a2a] text-[#e5e5e5]"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <span className="text-[#6a6a6a]">📄</span>
        <span>{item.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-2 py-1 text-sm flex items-center gap-1 hover:bg-[#1a1a1a] rounded text-[#e5e5e5]"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="text-[#6a6a6a]">📁</span>
        <span>{item.name}</span>
      </button>
      {isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeNode
              key={child.path}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              activeFile={activeFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CodeEditor({
  filesContent,
  onFileChange,
  activeFile,
  onFileSelect,
}: CodeEditorProps) {
  const activeFileContent = filesContent[activeFile] || "";
  const [copied, setCopied] = useState(false);

  const fileTree: FileTreeItem[] = [
    {
      name: "src",
      path: "src",
      isDirectory: true,
      children: [
        { name: "App.jsx", path: "src/App.jsx", isDirectory: false },
        {
          name: "LocationSync.jsx",
          path: "src/LocationSync.jsx",
          isDirectory: false,
        },
        { name: "index.css", path: "src/index.css", isDirectory: false },
        {
          name: "pages",
          path: "src/pages",
          isDirectory: true,
          children: [
            {
              name: "HomePage.jsx",
              path: "src/pages/HomePage.jsx",
              isDirectory: false,
            },
            {
              name: "PricingPage.jsx",
              path: "src/pages/PricingPage.jsx",
              isDirectory: false,
            },
          ],
        },
      ],
    },
  ];

  const getLanguage = (filename: string) => {
    if (filename.endsWith(".jsx") || filename.endsWith(".js"))
      return "javascript";
    if (filename.endsWith(".tsx") || filename.endsWith(".ts"))
      return "typescript";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".json")) return "json";
    if (filename.endsWith(".html")) return "html";
    return "javascript";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeFileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.split("/").pop() || "file.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full bg-[#0a0a0a] text-white overflow-hidden">
      <div className="w-64 border-r border-[#2a2a2a] overflow-y-auto bg-[#0a0a0a]">
        <div className="p-3 border-b border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-[#e5e5e5]">Files</h3>
        </div>
        <div className="p-2">
          {fileTree.map((item) => (
            <FileTreeNode
              key={item.path}
              item={item}
              level={0}
              onSelect={onFileSelect}
              activeFile={activeFile}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-[#1e1e1e]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          <span className="text-sm text-[#b5b5b5]">{activeFile}</span>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-[#2a2a2a] text-[#b5b5b5] hover:text-[#e5e5e5]"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#2a2a2a] text-[#e5e5e5] border-[#3a3a3a]">
                  <p>{copied ? "Copied!" : "Copy code"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-[#2a2a2a] text-[#b5b5b5] hover:text-[#e5e5e5]"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#2a2a2a] text-[#e5e5e5] border-[#3a3a3a]">
                  <p>Download file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex-1">
          <Editor
            height="100%"
            theme="vs-dark"
            path={activeFile}
            language={getLanguage(activeFile)}
            value={activeFileContent}
            onChange={(value) => onFileChange(activeFile, value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: "on",
              folding: true,
              bracketPairColorization: {
                enabled: true,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function WebContainerIDE() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const webcontainerInstanceRef = useRef<WebContainer | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState("Initializing...");
  const [baseUrl, setBaseUrl] = useState("");
  const [relativePath, setRelativePath] = useState("/");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [activeFile, setActiveFile] = useState("src/App.jsx");

  const [filesContent, setFilesContent] = useState({
    "src/App.jsx": files.src.directory["App.jsx"].file.contents,
    "src/index.css": files.src.directory["index.css"].file.contents,
    "src/pages/HomePage.jsx":
      files.src.directory.pages.directory["HomePage.jsx"].file.contents,
    "src/pages/PricingPage.jsx":
      files.src.directory.pages.directory["PricingPage.jsx"].file.contents,
    "src/LocationSync.jsx":
      files.src.directory["LocationSync.jsx"].file.contents,
  });

  const addToLogs = (message: string, level: LogEntry["level"] = "log") => {
    const cleanMessage = message
      .replace(
        /[\u001b\u009b][[()#;?]*.{0,2}(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      )
      .trim();
    if (cleanMessage) {
      setLogs((prevLogs) => [
        ...prevLogs.slice(-100),
        { message: cleanMessage, level, timestamp: new Date() },
      ]);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (baseUrl && event.origin !== new URL(baseUrl).origin) {
        return;
      }

      if (event.data.type === "pathChange") {
        setRelativePath(event.data.path);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [baseUrl]);

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
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              addToLogs(data);
            },
          })
        );
        if ((await installProcess.exit) !== 0)
          throw new Error("Installation failed.");

        setStatus("Starting Vite dev server...");
        const devProcess = await instance.spawn("pnpm", ["run", "dev"]);
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              addToLogs(data);
            },
          })
        );

        instance.on("server-ready", (port: number, serverUrl: string) => {
          setStatus("Live preview is running!");
          setBaseUrl(serverUrl);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatus(`Error: ${message}`);
        addToLogs(message, "error");
      }
    }
    initWebContainer();
    return () => {
      webcontainerInstanceRef.current?.teardown();
      webcontainerInstanceRef.current = null;
    };
  }, []);

  const handleFileChange = (filename: string, newCode: string) => {
    setFilesContent((prev) => ({ ...prev, [filename]: newCode }));
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

  const handlePublish = () => {
    alert("Publishing feature coming soon!");
  };

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a]">
      <WebPreviewContext.Provider value={{ baseUrl, relativePath, iframeRef }}>
        <div className="flex size-full flex-col bg-[#0a0a0a]">
          <WebPreviewNavigation>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={cn(
                        "h-8 w-8 p-0 border-0",
                        activeTab === "preview"
                          ? "bg-[#2a2a2a] text-[#e5e5e5]"
                          : "bg-transparent text-[#6a6a6a] hover:bg-[#1a1a1a] hover:text-[#b5b5b5]"
                      )}
                      variant="ghost"
                      onClick={() => setActiveTab("preview")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#2a2a2a] text-[#e5e5e5] border-[#3a3a3a]">
                    <p>Preview</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={cn(
                        "h-8 w-8 p-0 border-0",
                        activeTab === "code"
                          ? "bg-[#2a2a2a] text-[#e5e5e5]"
                          : "bg-transparent text-[#6a6a6a] hover:bg-[#1a1a1a] hover:text-[#b5b5b5]"
                      )}
                      variant="ghost"
                      onClick={() => setActiveTab("code")}
                    >
                      <Code2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#2a2a2a] text-[#e5e5e5] border-[#3a3a3a]">
                    <p>Code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-6 bg-[#2a2a2a] mx-1" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-8 w-8 p-0 bg-transparent text-[#6a6a6a] hover:bg-[#1a1a1a] hover:text-[#b5b5b5] border-0"
                      variant="ghost"
                      onClick={reloadIframe}
                      disabled={!baseUrl}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#2a2a2a] text-[#e5e5e5] border-[#3a3a3a]">
                    <p>Reload Preview</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex-1 flex justify-center">
              <WebPreviewUrl
                relativePath={relativePath}
                setRelativePath={setRelativePath}
              />
            </div>

            <Button
              onClick={handlePublish}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm border-0"
            >
              Publish
            </Button>
          </WebPreviewNavigation>

          <div className="flex-1 overflow-hidden relative bg-[#0a0a0a]">
            <div
              className={cn(
                "absolute inset-0",
                activeTab !== "preview" && "hidden"
              )}
            >
              {baseUrl ? (
                <WebPreviewBody />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#0a0a0a]">
                  <p className="text-[#6a6a6a]">{status}</p>
                </div>
              )}
            </div>
            <div
              className={cn(
                "absolute inset-0",
                activeTab !== "code" && "hidden"
              )}
            >
              <CodeEditor
                filesContent={filesContent}
                onFileChange={handleFileChange}
                activeFile={activeFile}
                onFileSelect={setActiveFile}
              />
            </div>
          </div>

          <WebPreviewConsole logs={logs} />
        </div>
      </WebPreviewContext.Provider>
    </div>
  );
}

export type WebPreviewNavigationButtonProps = ComponentProps<typeof Button> & {
  tooltip?: string;
};
export type WebPreviewConsoleProps = ComponentProps<"div"> & {
  logs?: LogEntry[];
};