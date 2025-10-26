import { Link } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Samples from './Samples'

const Home = () => {
  return (
    <div class="p-8 flex flex-col items-center justify-center bg-gray-800 text-white">
      <h1 class="text-4xl font-bold mb-4">Welcome to the PrintCSS Playground</h1>
      <p class="text-xl mb-8">A simple, yet powerful editor for designing and previewing print-ready web layouts with live rendering.</p>
      
      {/* Link to the editor */}
      <Link to="/editor" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
        Go to Editor
      </Link>

      <div class="flex mt-8 space-x-4">
        <a
          href="https://github.com/CSS-Paged-Media"
          class="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="bi bi-github text-xl mr-2"></i>
          GitHub
        </a>

        <a
          href="https://discord.gg/sAHAQdh"
          class="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="bi bi-discord text-xl mr-2"></i>
          Discord
        </a>
      </div>
      <Samples />
    </div>
  )
}

export default Home
