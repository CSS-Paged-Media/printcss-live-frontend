import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to React Code Editor</h1>
      <p className="text-xl mb-8">A simple, yet powerful code editor with live preview</p>
      <Link to="/editor" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Go to Editor
      </Link>
    </div>
  );
};

export default Home;