import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';

const ErrorModal = ({ show, handleClose, error }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
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
    javascriptFromTemplate = '' } = location.state || {
      htmlFromTemplate: '<div class="break"></div>\n<span class="head">\n\t<b>Max Mustermann</b>\n\t<br />\n\ta fancy and long title\n</span>\n<br />\nmax.mustermann@example.com\n<br />\nMobile +49 123 4567 8901\n<br />\nwww.example.com\n<br />\n<span class="foot">\n\tExample Company\n\t<br />\n\tBusystreet 5 &middot; 00001 Gotham\n</span>',
      cssFromTemplate: '@page{\n\tsize:3.5in 2in;\n\tmarks:crop;\n\tbleed:0.125in;\n\tmargin:0.25in;\n} \n\n@page:first{\n\tbackground:rgb(188, 11, 6);\n\tbackground-image:url(https://azettl.github.io/html2pdf/assets/img/html2pdf.guru.png);\n\tbackground-position: center;\n\tbackground-repeat: no-repeat;\n\tmargin:0;\n}\n\nbody{\n\tfont-size:10pt;\n}\n\nb{\n\tcolor:rgb(188, 11, 6);\n\tfont-size:1.5rem;\n}\n\n.head{\n\tdisplay:inline-block;\n\tmargin-bottom: .5rem;\n}\n\n.foot{\n\tdisplay:inline-block;\n\tmargin-top: .75rem;\n\tborder-left:.25rem solid rgb(188, 11, 6);\n\tpadding-left:.5rem;\n}\n\n.break{\n\tpage-break-after: always;\n\tbreak-after: always;\n}',
      javascriptFromTemplate: '/* \n\tPut your JavaScript here!\n\n\tBut be aware that not all rendering tools \n\tare supporting JavaScript. \n*/'
    }; 

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
  
  const backendUrl = process.env.REACT_APP_PRINTCSS_BACKEND_URL;

  useEffect(() => {
    updatePreview();
  }, [html, css, js, isFullscreen]);

  useEffect(() => {
    reload();
  }, [selectedTool, activeRenderingTab]);  // Trigger whenever tool or PDF tab changes

  // New effect to reload preview on app load
  useEffect(() => {
    // Short timeout to ensure the app is fully rendered
    const timer = setTimeout(() => {
      updatePreview();
    }, 100);

    fetchSupportedTools();

    return () => clearTimeout(timer);
  }, []);

  const reload = () => {
    if (activeRenderingTab === 'pdf') {
        generatePdf();
    }else{
        updatePreview();
    }
  };

  const updatePreview = () => {
    if (previewRef.current) {
      const previewDocument = previewRef.current.contentDocument;
      
      // Clear the existing content
      previewDocument.open();
      previewDocument.write('');
      previewDocument.close();
  
      // Small delay to ensure clearing is complete
      setTimeout(() => {
        // Write new content
        previewDocument.open();
        previewDocument.write(`
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
        `);
        previewDocument.close();

        var cssLink = document.createElement('link');
        cssLink.href = '/assets/styles/interface.css'; 
        cssLink.rel = 'stylesheet'; 
        cssLink.type = 'text/css'; 
        var jsLink = document.createElement('script');
        jsLink.src = '/assets/scripts/paged.polyfill.js'; 

        previewDocument.head.appendChild(cssLink);
        previewDocument.head.appendChild(jsLink);
      }, 0);
    }
  };

  const fetchSupportedTools = async () => {
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

      // Send request to backend for PDF generation
      const response = await axios.post(`${backendUrl}/generate_pdf`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // If the response is not 200, handle the error
      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Create a URL for the generated PDF
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);  // Set the PDF URL to the state
    } catch (error) {
      setShowErrorModal(true);  // Show the modal
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
                        generatePdf();  // Generate PDF on clicking the PDF tab
                    }}
                >
                    PDF
                </button>
                {/* Dropdown for tool selection */}
                {activeRenderingTab === 'pdf' && pdfUrl && (
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-50">
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
      {/* Error Modal */}
      <ErrorModal show={showErrorModal} handleClose={handleErrorModalClose} error={errorDetails} />
    </div>
  );
};

export default CodeEditor;