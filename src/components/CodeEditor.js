import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CodeEditor = () => {
  const [html, setHtml] = useState('Enter your HTML here');
  const [css, setCss] = useState('@page{ margin: 2cm; }');
  const [js, setJs] = useState('// Enter your JavaScript here');
  const previewRef = useRef(null);
  const [editorStates, setEditorStates] = useState({
    html: { collapsed: false, fullscreen: false },
    css: { collapsed: false, fullscreen: false },
    js: { collapsed: false, fullscreen: false }
  });

  useEffect(() => {
    updatePreview();
  }, [html, css, js]);

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

  const toggleEditorState = (editor, state) => {
    setEditorStates(prevStates => ({
      ...prevStates,
      [editor]: {
        ...prevStates[editor],
        [state]: !prevStates[editor][state]
      }
    }));
  };

  const renderEditor = (type, value, setValue) => (
    <div className={`flex-1 flex flex-col ${editorStates[type].fullscreen ? 'fixed inset-0 z-50 bg-gray-800' : ''}`}>
      <div className="box-heading flex justify-between items-center p-2">
        <span>{type.toUpperCase()}</span>
        <div>
          <button onClick={() => toggleEditorState(type, 'collapsed')} className="mr-2 p-1">
            <i className={`bi ${editorStates[type].collapsed ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
          <button onClick={() => toggleEditorState(type, 'fullscreen')} className="p-1">
            <i className={`bi ${editorStates[type].fullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
          </button>
        </div>
      </div>
      <div className={`flex-1 ${editorStates[type].collapsed ? 'hidden' : ''}`}>
        <Editor
          height="100%"
          defaultLanguage={type}
          value={value}
          onChange={setValue}
          theme="vs-dark"
          options={{ minimap: { enabled: false } }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <div className="flex-1 flex">
        <div className="w-1/2 flex flex-col">
          {renderEditor('html', html, setHtml)}
          {renderEditor('css', css, setCss)}
          {renderEditor('js', js, setJs)}
        </div>
        <div className="w-1/2 p-4 flex flex-col">
          <div className="box-heading flex justify-between items-center p-2">
            <span>Preview <i>powered by paged.js</i></span>
            <button className="reload p-1" onClick={updatePreview}>
              <i className="bi bi-arrow-clockwise"></i> Reload
            </button>
          </div>
          <div className="flex-1">
            <iframe
              ref={previewRef}
              title="preview"
              className="w-full h-full bg-white border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;