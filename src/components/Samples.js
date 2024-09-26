import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper function to dynamically import JSON and preview files from public folder
const loadTemplateFiles = async () => {
  const templateContext = require.context('../../public/assets/templates', false, /\.json$/); // Only load .json files

  const templates = await Promise.all(
    templateContext.keys().map(async (key) => {
      const fileName = key.replace('./', ''); // Remove leading './'
      const templateData = await fetch(`/assets/templates/${fileName}`).then((response) => response.json());
  
      // Return null for invalid templates
      if (!templateData.title) {
        return null; // Skip invalid entries
      }
  
      const previewImage = `/assets/templates/${fileName.replace('.json', '.png')}`; // Get corresponding .png file
  
      return { ...templateData, previewImage, fileName: fileName.replace('.json', '') };
    })
  );
  
  // Filter out null entries (invalid templates)
  const validTemplates = templates.filter(template => template !== null);
  
  return validTemplates;
};

const Samples = () => {
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]); // For filtered samples
  const [categories, setCategories] = useState([]); // To store all categories
  const [searchTerm, setSearchTerm] = useState(''); // Search term
  const [selectedCategory, setSelectedCategory] = useState('All'); // For category filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const openEditor = (sample) => {
    navigate('/editor', { state: { htmlFromTemplate: sample.html, cssFromTemplate: sample.css, javascriptFromTemplate: sample.javascript } });
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const templates = await loadTemplateFiles();
        setSamples(templates);

        // Extract unique categories for filtering
        const uniqueCategories = ['All', ...new Set(templates.map(sample => sample.category || 'Uncategorized'))];
        setCategories(uniqueCategories);

        setFilteredSamples(templates); // Initially, show all templates
        setLoading(false);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Handle Search
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = samples.filter(sample => {
      const matchesTitle = sample.title.toLowerCase().includes(lowercasedSearchTerm);
      const matchesCategory = sample.category?.toLowerCase().includes(lowercasedSearchTerm);
      const matchesWorksBestWith = sample.works_best_with?.some(wbw => wbw.toLowerCase().includes(lowercasedSearchTerm)); // Updated for array search
      const matchesSelectedCategory = selectedCategory === 'All' || sample.category === selectedCategory;

      return (matchesTitle || matchesCategory || matchesWorksBestWith) && matchesSelectedCategory;
    });

    setFilteredSamples(filtered);
  }, [searchTerm, selectedCategory, samples]);

  return (
    <>
      <h2 className="text-2xl font-bold mt-8 mb-4">Templates</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by title, category, works best with..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 mb-4 w-full rounded border border-gray-300"
      />

      {/* Category Filter */}
      <div className="mb-4">
        <label className="mr-2">Filter by category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 rounded border border-gray-300"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-red-500">Error loading samples: {error.message}</div>
      )}

      {loading ? (
        <p>Loading samples...</p>
      ) : (
        <div className="samples-list grid grid-cols-6 gap-8 mb-8">
          {filteredSamples.length > 0 ? filteredSamples.map((sample, index) => (
            <div key={index} className="sample-card bg-gray-700 p-4 rounded">
              {/* Display the preview image */}
              <div className="preview mb-4">
                <img src={sample.previewImage} alt={sample.title} className="max-h-32 max-w-32 rounded mx-auto" />
              </div>
              
              {/* Button to open the editor */}
              <button
                onClick={() => openEditor(sample)}  // Open editor with state
                className="w-full block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center mb-2"
              >
                {sample.title}
              </button>

              {/* Category and Works Best With Labels */}
              {sample.category && (
                <p className="text-sm text-gray-300 mb-1">Category: <span className="text-white">{sample.category}</span></p>
              )}
              {sample.works_best_with && sample.works_best_with.length > 0 && (
                <p className="text-sm text-gray-300">Works Best With: 
                  <span className="text-white"> {sample.works_best_with.join(', ')}</span> {/* Join array elements */}
                </p>
              )}
            </div>
          )) : (
            <p>No samples found.</p>
          )}
        </div>
      )}
    </>
  );
};

export default Samples;
