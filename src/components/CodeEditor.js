import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  const [html, setHtml] = useState('<!-- Enter your HTML here -->');
  const [css, setCss] = useState('/* Enter your CSS here */');
  const [js, setJs] = useState('// Enter your JavaScript here');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOutput(`
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
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <div className="flex-1 flex">
        <div className="w-1/2 flex flex-col">
          <div className="flex-1">
            <Editor
              height="33%"
              defaultLanguage="html"
              defaultValue={html}
              onChange={setHtml}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
          </div>
          <div className="flex-1">
            <Editor
              height="33%"
              defaultLanguage="css"
              defaultValue={css}
              onChange={setCss}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
          </div>
          <div className="flex-1">
            <Editor
              height="33%"
              defaultLanguage="javascript"
              defaultValue={js}
              onChange={setJs}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
          </div>
        </div>
        <div className="w-1/2 p-4">
          <h3 className="text-xl font-bold mb-2">Preview</h3>
          <iframe
            title="preview"
            srcDoc={output}
            className="w-full h-full bg-white border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;