import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CodeEditor from './components/CodeEditor';

function App() {
  return (
    <Router>
      <div className="flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<CodeEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;