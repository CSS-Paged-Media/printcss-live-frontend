import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Ensure bootstrap icons are imported

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to the PrintCSS Playground</h1>
      <p className="text-xl mb-8">A simple, yet powerful editor for designing and previewing print-ready web layouts with live rendering.</p>
      
      {/* Link to the editor */}
      <Link to="/editor" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
        Go to Editor
      </Link>

      <div className="flex mt-8 space-x-4">
        {/* Link to GitHub repo with GitHub icon */}
        <a
          href="https://github.com/CSS-Paged-Media"
          className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bi bi-github text-xl mr-2"></i>
          GitHub
        </a>

        {/* Link to Discord with Discord icon */}
        <a
          href="https://discord.gg/sAHAQdh"
          className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bi bi-discord text-xl mr-2"></i>
          Discord
        </a>
      </div>
    </div>
  );
};

export default Home;
