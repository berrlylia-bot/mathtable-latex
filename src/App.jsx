import { useState, useRef, useEffect } from 'react';
import { Table2, RefreshCw, Download, FileCode, Send, Monitor } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import TableGenerator from './components/TableGenerator';
import { generateFullDocument } from './utils/latexGenerator';
import './index.css';

// Minimum screen width for the app (tablet size)
const MIN_SCREEN_WIDTH = 768;

function App() {
  const [tableType, setTableType] = useState('both');
  const [tableData, setTableData] = useState(null);
  const [renderedImage, setRenderedImage] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);
  const refreshTriggerRef = useRef(null);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsScreenTooSmall(window.innerWidth < MIN_SCREEN_WIDTH);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const tableTypeOptions = [
    { value: 'sign', label: 'Sign', icon: '±' },
    { value: 'variation', label: 'Variation', icon: '↗↘' },
    { value: 'both', label: 'Both', icon: '∑' },
  ];

  const handleRefresh = () => {
    if (refreshTriggerRef.current) {
      refreshTriggerRef.current();
    }
  };

  const downloadTex = () => {
    if (!tableData) return;
    const code = generateFullDocument(tableData);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'math_table.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadImage = () => {
    if (!renderedImage) return;
    const link = document.createElement('a');
    link.href = renderedImage;
    link.download = 'math_table.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Small screen blocker overlay
  if (isScreenTooSmall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center border border-white/20 shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Monitor size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Larger Screen Required</h1>
          <p className="text-gray-300 mb-6 leading-relaxed">
            MathTable LaTeX Generator is designed for PC and tablet screens.
            Please use a device with a larger display for the best experience.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span>Minimum width: {MIN_SCREEN_WIDTH}px</span>
          </div>
          <a
            href="https://t.me/mathnoorlatex"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
          >
            <Send size={18} />
            Contact Developer on Telegram
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col">
      {/* Modern Toolbar with Glassmorphism */}
      <header className="toolbar-glass sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo with gradient */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Table2 size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-lg tracking-tight">MathTable</span>
              <span className="text-xs text-gray-500 -mt-0.5">LaTeX Generator</span>
            </div>
          </div>

          {/* Table Type Selector - Modern Pills */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Table Type</span>
            <div className="flex rounded-2xl bg-gray-100/80 p-1 gap-1">
              {tableTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTableType(option.value)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl flex items-center gap-2 ${tableType === option.value
                    ? 'bg-white text-gray-800 shadow-md shadow-gray-200/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                  <span className="text-xs opacity-60">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons - Refresh, Download Image, Download LaTeX */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="toolbar-btn"
              disabled={isRendering}
              title="Refresh preview"
            >
              <RefreshCw size={18} className={isRendering ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{isRendering ? 'Rendering...' : 'Refresh'}</span>
            </button>

            <div className="w-px h-6 bg-gray-200"></div>

            <button
              onClick={downloadImage}
              className="toolbar-btn-primary"
              disabled={!renderedImage}
              title="Download PNG image"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download Image</span>
            </button>

            <button
              onClick={downloadTex}
              className="toolbar-btn"
              disabled={!tableData}
              title="Download LaTeX file"
            >
              <FileCode size={18} />
              <span className="hidden sm:inline">Download LaTeX</span>
            </button>

            <div className="w-px h-6 bg-gray-200"></div>

            {/* Telegram Link */}
            <a
              href="https://t.me/mathnoorlatex"
              target="_blank"
              rel="noopener noreferrer"
              className="toolbar-btn flex items-center gap-2"
              title="Contact Developer on Telegram"
            >
              <Send size={18} className="text-blue-500" />
              <span className="hidden sm:inline">Telegram</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content - Side by Side */}
      <main className="flex-1 p-4 sm:p-6">
        <ErrorBoundary showDetails={true}>
          <TableGenerator
            tableType={tableType}
            onTableDataChange={setTableData}
            onImageRendered={setRenderedImage}
            onRenderingChange={setIsRendering}
            refreshTriggerRef={refreshTriggerRef}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
