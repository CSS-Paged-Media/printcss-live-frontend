import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import { Document, Page } from 'react-pdf';

const CodeEditor = () => {
  const [html, setHtml] = useState('<div class="break"></div>\n<span class="head">\n\t<b>Max Mustermann</b>\n\t<br />\n\ta fancy and long title\n</span>\n<br />\nmax.mustermann@example.com\n<br />\nMobile +49 123 4567 8901\n<br />\nwww.example.com\n<br />\n<span class="foot">\n\tExample Company\n\t<br />\n\tBusystreet 5 &middot; 00001 Gotham\n</span>');
  const [css, setCss] = useState('@page{\n\tsize:3.5in 2in;\n\tmarks:crop;\n\tbleed:0.125in;\n\tmargin:0.25in;\n} \n\n@page:first{\n\tbackground:rgb(188, 11, 6);\n\tbackground-image:url(https://azettl.github.io/html2pdf/assets/img/html2pdf.guru.png);\n\tbackground-position: center;\n\tbackground-repeat: no-repeat;\n\tmargin:0;\n}\n\nbody{\n\tfont-size:10pt;\n}\n\nb{\n\tcolor:rgb(188, 11, 6);\n\tfont-size:1.5rem;\n}\n\n.head{\n\tdisplay:inline-block;\n\tmargin-bottom: .5rem;\n}\n\n.foot{\n\tdisplay:inline-block;\n\tmargin-top: .75rem;\n\tborder-left:.25rem solid rgb(188, 11, 6);\n\tpadding-left:.5rem;\n}\n\n.break{\n\tpage-break-after: always;\n\tbreak-after: always;\n}');
  const [js, setJs] = useState('/* \n\tPut your JavaScript here!\n\n\tBut be aware that not all rendering tools \n\tare supporting JavaScript. \n*/');
  const previewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('html');
  const [activeRenderingTab, setActiveRenderingTab] = useState('preview');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    updatePreview();
  }, [html, css, js, isFullscreen]);

  // New effect to reload preview on app load
  useEffect(() => {
    // Short timeout to ensure the app is fully rendered
    const timer = setTimeout(() => {
      updatePreview();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
      const formData = new FormData();
      const blob = new Blob([inputHtml], { type: 'text/html' });
      formData.append('input_file', blob);
      formData.append('tool', 'weasyprint');

      // Send request to backend for PDF generation
      const response = await axios.post('http://localhost:5000/generate_pdf', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Create a URL for the generated PDF
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);  // Set the PDF URL to the state
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
        <button 
          onClick={toggleFullscreen} 
          className="ml-auto p-2"
        >
          <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
        </button>
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
              </div>
              <button className="reload p-1" onClick={updatePreview}>
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
              {activeRenderingTab === 'pdf' && pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="pdf-viewer"
                  className="w-full h-full bg-white border-none"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;