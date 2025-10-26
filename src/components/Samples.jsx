import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Helper function to dynamically import JSON and preview files from public folder
const loadTemplateFiles = async () => {
  const resp = await fetch('/assets/templates/');
  try {
    const indexResp = await fetch('/assets/templates/index.json');
    if (indexResp.ok) {
      const index = await indexResp.json();
      const templates = await Promise.all(index.map(async (fileName) => {
        const templateData = await fetch(`/assets/templates/${fileName}`).then(r => r.json());
        const previewImage = `/assets/templates/${fileName.replace('.json', '.png')}`;
        return { ...templateData, previewImage, fileName: fileName.replace('.json', '') };
      }));
      return templates.filter(t => t && t.title);
    }
  } catch (e) {
    // fallback to nothing
    console.warn('No templates index found:', e);
  }

  return [];
};

const Samples = () => {
  const [samples, setSamples] = useState([])
  const [filteredSamples, setFilteredSamples] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const openEditor = (sample) => {
    navigate('/editor', { state: { htmlFromTemplate: sample.html, cssFromTemplate: sample.css, javascriptFromTemplate: sample.javascript } })
  }

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const templates = await loadTemplateFiles()
        setSamples(templates)

        const uniqueCategories = ['All', ...new Set(templates.map(s => s.category || 'Uncategorized'))]
        setCategories(uniqueCategories)

        setFilteredSamples(templates)
        setLoading(false)
      } catch (err) {
        console.error('Error loading templates:', err)
        setError(err)
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  useEffect(() => {
    const lower = searchTerm.toLowerCase()
    const filtered = samples.filter(sample => {
      const matchesTitle = sample.title.toLowerCase().includes(lower)
      const matchesCategory = sample.category?.toLowerCase().includes(lower)
      const matchesWorksBestWith = sample.works_best_with?.some(w => w.toLowerCase().includes(lower))
      const matchesSelectedCategory = selectedCategory === 'All' || sample.category === selectedCategory
      return (matchesTitle || matchesCategory || matchesWorksBestWith) && matchesSelectedCategory
    })
    setFilteredSamples(filtered)
  }, [searchTerm, selectedCategory, samples])

  return (
    <div class="p-16">
      <h2 class="text-2xl font-bold mt-8 mb-4">Templates</h2>
      <div class="mb-4 flex items-center w-full">
        <input type="text" placeholder="Search by title, category, works best with..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} class="max-w-64 p-2 w-3/4 bg-gray-700 text-white rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2" />
        <div class="flex items-center w-1/4 ml-4">
          <label class="mr-2 text-white font-bold">Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} class="p-2 bg-gray-700 text-white rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {error && <div class="text-red-500">Error loading samples: {error.message}</div>}

      {loading ? <p>Loading samples...</p> : (
        <div class="samples-list grid grid-cols-6 gap-8 mb-8">
          {filteredSamples.length > 0 ? filteredSamples.map((sample, index) => (
            <div key={index} class="sample-card bg-gray-700 p-4 rounded">
              <div class="preview mb-4">
                <img src={sample.previewImage} alt={sample.title} class="max-h-32 max-w-32 rounded mx-auto" />
              </div>
              <button onClick={() => openEditor(sample)} class="w-full block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center mb-2">{sample.title}</button>
              <div class="flex flex-wrap gap-1 mb-2">
                {sample.category && <span class="bg-gray-500 text-gray-100 text-[10px] font-medium px-1.5 py-0.5 rounded">{sample.category}</span>}
                {sample.works_best_with && sample.works_best_with.length > 0 && sample.works_best_with.map((item, idx) => (
                  <span key={idx} class="bg-gray-400 text-gray-900 text-[10px] font-medium px-1.5 py-0.5 rounded">{item}</span>
                ))}
              </div>
            </div>
          )) : <p>No samples found.</p>}
        </div>
      )}
    </div>
  )
}

export default Samples
