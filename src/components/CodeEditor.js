import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  const [html, setHtml] = useState('Enter your HTML here');
  const [css, setCss] = useState('@page{ margin: 2cm; }');
  const [js, setJs] = useState('// Enter your JavaScript here');
  const previewRef = useRef(null);

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

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <div className="flex-1 flex">
        <div className="w-1/2 flex flex-col">
          <div className="flex-1">
            <div className="box-heading">HTML</div>
            <Editor
              height="33%"
              defaultLanguage="html"
              value={html}
              onChange={setHtml}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
          </div>
          <div className="flex-1">
            <div className="box-heading">CSS</div>
            <Editor
              height="33%"
              defaultLanguage="css"
              value={css}
              onChange={setCss}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
          </div>
          <div className="flex-1">
            <div className="box-heading">JavaScript</div>
            <Editor
              height="33%"
              defaultLanguage="javascript"
              value={js}
              onChange={setJs}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
          </div>
        </div>
        <div className="w-1/2 p-4">
          <div className="box-heading">
            Preview <i>powered by paged.js</i>
            <button className="reload" onClick={updatePreview}>Reload</button>
          </div>
          <iframe
            ref={previewRef}
            title="preview"
            className="w-full h-full bg-white border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;