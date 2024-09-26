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
        setLoading(false);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mt-8 mb-4">Templates</h2>
      <p className="text-xl mb-8">Click on a template to open it in the editor.</p>

      {error && (
        <div className="text-red-500">Error loading samples: {error.message}</div>
      )}

      {loading ? (
        <p>Loading samples...</p>
      ) : (
        <div className="samples-list grid grid-cols-6 gap-8">
          {samples.length > 0 ? samples.map((sample, index) => (
            <div key={index} className="sample-card bg-gray-700 p-4 rounded">
              {/* Display the preview image */}
              <div className="preview mb-4">
                <img src={sample.previewImage} alt={sample.title} className="max-h-32 max-w-32 rounded mx-auto" />
              </div>
              
              {/* Button to open the editor */}
              <button
                onClick={() => openEditor(sample)}  // Open editor with state
                className="w-full block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
              >
                {sample.title}
              </button>
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
