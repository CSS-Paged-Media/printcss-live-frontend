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
    <div className="p-16">
        <h2 className="text-2xl font-bold mt-8 mb-4">Templates</h2>
        <div className="mb-4 flex items-center w-full">
            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search by title, category, works best with..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-64 p-2 w-3/4 bg-gray-700 text-white rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
            />

            {/* Category Filter */}
            <div className="flex items-center w-1/4 ml-4">
                <label className="mr-2 text-white font-bold">Category:</label>
                <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 bg-gray-700 text-white rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                {categories.map((category, index) => (
                    <option key={index} value={category}>
                    {category}
                    </option>
                ))}
                </select>
            </div>
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

                    <div className="flex flex-wrap gap-1 mb-2">
                        {/* Category Label */}
                        {sample.category && (
                            <span className="bg-gray-500 text-gray-100 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                {sample.category}
                            </span>
                        )}

                        {/* Works Best With Labels */}
                        {sample.works_best_with && sample.works_best_with.length > 0 && (
                            <>
                                {sample.works_best_with.map((item, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-400 text-gray-900 text-[10px] font-medium px-1.5 py-0.5 rounded"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )) : (
                <p>No samples found.</p>
            )}
            </div>
        )}
    </div>
  );
};

export default Samples;
