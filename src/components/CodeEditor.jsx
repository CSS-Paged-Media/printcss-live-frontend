import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import axios from 'axios'

const ErrorModal = ({ show, handleClose, error }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-md w-1/3">
            <h2 className="text-lg font-bold text-red-600">Error {error.status}</h2>
            <p>{error.message}</p>
            {error.data && <p className="text-sm text-gray-600 max-h-80 overflow-auto">Response: {error.data}</p>}
            <div className="mt-4 flex justify-end">
              <button onClick={handleClose} className="px-4 py-2 bg-red-500 text-white rounded">Close</button>
            </div>
          </div>
        </div>
    );
};

const CodeEditor = () => {
  const location = useLocation();
  const { 
    htmlFromTemplate = '', 
    cssFromTemplate = '', 
    javascriptFromTemplate = '' } = location.state || {};

  const [html, setHtml] = useState(htmlFromTemplate);
  const [css, setCss] = useState(cssFromTemplate);
  const [js, setJs] = useState(javascriptFromTemplate);
  const previewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('html');
  const [activeRenderingTab, setActiveRenderingTab] = useState('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState('weasyprint');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState({ status: '', message: '', data: '' });
  
  const backendUrl = import.meta.env.VITE_PRINTCSS_BACKEND_URL || '';

  useEffect(() => {
    updatePreview();
  }, [html, css, js, isFullscreen]);

  useEffect(() => {
    reload();
  }, [selectedTool, activeRenderingTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 100);

    fetchSupportedTools();

    return () => clearTimeout(timer);
  }, []);

  const reload = () => {
    if (activeRenderingTab === 'pdf') {
        generatePdf();
    } else {
        updatePreview();
    }
  };

  const updatePreview = () => {
    if (previewRef.current) {
      const previewDocument = previewRef.current.contentDocument;
      previewDocument.open();
      previewDocument.write('');
      previewDocument.close();
  
      setTimeout(() => {
        // Try to include the app's compiled CSS inside the iframe so Tailwind utilities work
        // Strategy: if the main document has a compiled CSS <link> (build mode), reuse that href
        // otherwise fall back to gathering inline <style> tags (dev mode) and inject them.
        let appCssHref = null;
        let appCssText = '';

        try {
          const linkEl = document.querySelector('link[rel="stylesheet"][href$=".css"]');
          if (linkEl && linkEl.href) {
            appCssHref = linkEl.href;
          } else {
            // fallback: collect inline style contents
            appCssText = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
          }
        } catch (e) {
          // ignore and fallback to inline styles
          appCssText = '';
        }

        previewDocument.open();
        previewDocument.write(`
          <!DOCTYPE html>
          <html>
            <head>
              ${appCssHref ? `<link rel="stylesheet" href="${appCssHref}">` : `<style>${appCssText}</style>`}
              <style>${css}</style>
            </head>
            <body>
              ${html}
              <script>${js}<'/'+'script>'}
            </body>
          </html>
        `);
        previewDocument.close();

        // Still append the interface.css and paged polyfill for preview fidelity
        var cssLink = document.createElement('link');
        cssLink.href = '/assets/styles/interface.css'; 
        cssLink.rel = 'stylesheet'; 
        cssLink.type = 'text/css'; 
        var jsLink = document.createElement('script');
        jsLink.src = '/assets/scripts/paged.polyfill.js'; 

        // avoid duplicating the same link
        try {
          if (!previewDocument.querySelector(`link[href="${cssLink.href}"]`)) {
            previewDocument.head.appendChild(cssLink);
          }
        } catch (e) {
          // ignore
          previewDocument.head.appendChild(cssLink);
        }

        previewDocument.head.appendChild(jsLink);
      }, 0);
    }
  };

  const fetchSupportedTools = async () => {
    if (!backendUrl) {
      console.warn('No backend URL configured (VITE_PRINTCSS_BACKEND_URL). Skipping supported tools fetch.');
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/supported_tools`);
      setTools(response.data);
    } catch (error) {
      console.error('Error fetching supported tools:', error);
    }
  };

  const generatePdf = async () => {
    const inputHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
    
    try {
      setIsLoading(true);
      const formData = new FormData();
      const blob = new Blob([inputHtml], { type: 'text/html' });
      const file = new File([blob], 'index.html', { type: 'text/html' });

      formData.append('input_file', file);
      formData.append('tool', selectedTool);

      const response = await axios.post(`${backendUrl}/generate_pdf`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
    } catch (error) {
      setShowErrorModal(true);
      setErrorDetails({
        status: error.response?.status || 'Unknown',
        message: error.message,
        data: error.response?.data ? await error.response.data.text() : '',
      });
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const downloadJson = () => {
    const data = { html, css, js };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'printcss_saved_code.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importJson = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setHtml(data.html || '');
          setCss(data.css || '');
          setJs(data.js || '');
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderEditor = (type, value, setValue) => (
    <div className={`flex-1 ${activeTab !== type ? 'hidden' : ''}`}>
      <Editor
        height="100%"
        defaultLanguage={type}
        value={value}
        onChange={setValue}
        theme="vs-dark"
        options={{ minimap: { enabled: false } }}
      />
    </div>
  );

  const editorSection = (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-800' : 'w-1/2'}`}>
      <div className="flex bg-gray-700 items-center">
        {['html', 'css', 'javascript'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? 'bg-gray-600' : 'bg-gray-700'} text-white`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
        <div className="ml-auto flex items-center">
          <button 
            onClick={downloadJson} 
            className="p-2"
            title="Download JSON"
          >
            <i className="bi bi-download"></i>
          </button>
          <label className="p-2 cursor-pointer" title="Import JSON">
            <input
              type="file"
              accept=".json"
              onChange={importJson}
              style={{ display: 'none' }}
            />
            <i className="bi bi-upload"></i>
          </label>
          <button 
            onClick={toggleFullscreen} 
            className="p-2"
            title="Toggle Fullscreen"
          >
            <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
          </button>
        </div>
      </div>
      {renderEditor('html', html, setHtml)}
      {renderEditor('css', css, setCss)}
      {renderEditor('javascript', js, setJs)}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <div className="flex-1 flex">
        {editorSection}
        {!isFullscreen && (
          <div className="w-1/2 flex flex-col">
            <div className="flex bg-gray-700 items-center justify-between px-4">
              <div>          
                <button
                    key="preview"
                    className={`px-4 py-2 ${activeRenderingTab === 'preview' ? 'bg-gray-600' : 'bg-gray-700'} text-white`}
                    onClick={() => setActiveRenderingTab('preview')}
                >
                    Preview
                </button>
                <button
                    key="pdf"
                    className={`px-4 py-2 ${activeRenderingTab === 'pdf' ? 'bg-gray-600' : 'bg-gray-700'} text-white`}
                    onClick={() => {
                        setActiveRenderingTab('pdf');
                        generatePdf();
                    }}
                >
                    PDF
                </button>
                {activeRenderingTab === 'pdf' && tools.length > 0 && (
                    <select
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="ml-2 p-1 bg-gray-600 text-white rounded"
                    >
                    {tools.map(tool => (
                        <option key={tool} value={tool}>
                        {tool}
                        </option>
                    ))}
                    </select>
                )}
              </div>
              <button className="reload p-1" onClick={reload}>
                <i className="bi bi-arrow-clockwise"></i> Reload
              </button>
            </div>
            <div className="flex-1 p-4">
              {activeRenderingTab === 'preview' && (
                <iframe
                  ref={previewRef}
                  title="preview"
                  className="w-full h-full bg-white border-none"
                />
              )}
              {activeRenderingTab === 'pdf' && (
                <>
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/50">
                            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white mb-4"></div>
                            <p className="text-white text-xl font-semibold">Rendering PDF...</p>
                        </div>
                    ) : pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title="pdf-viewer"
                            className="w-full h-full bg-white border-none"
                        />
                    ) : null}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <ErrorModal show={showErrorModal} handleClose={handleErrorModalClose} error={errorDetails} />
    </div>
  )
}

export default CodeEditor
