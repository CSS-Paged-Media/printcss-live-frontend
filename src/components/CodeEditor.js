import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CodeEditor = () => {
  const [html, setHtml] = useState('Enter your HTML here');
  const [css, setCss] = useState('@page{ margin: 2cm; }');
  const [js, setJs] = useState('// Enter your JavaScript here');
  const previewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('html');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    updatePreview();
  }, [html, css, js, isFullscreen]);

  const updatePreview = () => {
    if (previewRef.current) {
      const previewDocument = previewRef.current.contentDocument;
      previewDocument.open();
      previewDocument.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${css}</style>
            <script src="./assets/scripts/paged.polyfill.js"></script>
          </head>
          <body>
            ${html}
            <script>${js}</script>
            <script>
              window.addEventListener('load', async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
                const paged = new Paged.Previewer();
                await paged.preview(document.body.innerHTML, []);
              });
            </script>
          </body>
        </html>
      `);
      previewDocument.close();
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