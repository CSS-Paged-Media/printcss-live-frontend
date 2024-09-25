import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CodeEditor = () => {
  const [html, setHtml] = useState('<div class="break"></div><span class="head"><b>Max Mustermann</b><br />a fancy and long title</span><br />max.mustermann@example.com<br />Mobile +49 123 4567 8901<br />www.example.com<br /><span class="foot">Example Company<br />Busystreet 5 &middot; 00001 Gotham</span>');
  const [css, setCss] = useState('@page{size:3.5in 2in;marks:crop;bleed:0.125in;margin:0.25in;} @page:first{background:rgb(188, 11, 6);background-image:url(https://azettl.github.io/html2pdf/assets/img/html2pdf.guru.png);background-position: center;background-repeat: no-repeat;margin:0;}body{font-size:10pt;}b{color:rgb(188, 11, 6);font-size:1.5rem;}.head{display:inline-block;margin-bottom: .5rem;}.foot{display:inline-block;margin-top: .75rem;border-left:.25rem solid rgb(188, 11, 6);padding-left:.5rem;}.break{page-break-after: always;break-after: always;}');
  const [js, setJs] = useState('/* Put your JavaScript here! But be aware that not all rendering tools are supporting JavaScript. */');
  const previewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('html');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    updatePreview();
  }, [html, css, js, isFullscreen]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleEditorDidMount = (editor, monaco) => {
    // Format the code immediately after the editor is mounted
    setTimeout(() => {
      editor.getAction('editor.action.formatDocument').run();
    }, 100);
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
        onMount={handleEditorDidMount}
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
              <span className="py-2 bg-gray-700">Preview <i>powered by paged.js</i></span>
              <button className="reload p-1" onClick={updatePreview}>
                <i className="bi bi-arrow-clockwise"></i> Reload
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                ref={previewRef}
                title="preview"
                className="w-full h-full bg-white border-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;