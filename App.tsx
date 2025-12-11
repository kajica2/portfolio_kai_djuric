import React, { useState, useEffect } from 'react';
import { Project } from './types';
import { ProjectCard } from './components/ProjectCard';
import { BatchAddModal } from './components/BatchAddModal';
import { Plus, LayoutGrid, Github, Twitter, Terminal, Box } from 'lucide-react';

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Virtual Lexicon',
    description: 'A cutting-edge linguistics tool deployed on Google Cloud Run, featuring real-time collaborative dictionary editing.',
    url: 'https://virtual-lexicon-176960048944.us-west1.run.app',
    tags: ['AI', 'Linguistics'],
    category: 'Web App',
    status: 'Live',
    techStack: ['Cloud Run', 'React', 'Node.js']
  },
  {
    id: '2',
    title: 'Kai Djuric Projects',
    description: 'Personal engineering portfolio showcasing various web deployments and experimental projects hosted on Vercel.',
    url: 'https://vercel.com/kai-djurics-projects',
    tags: ['Portfolio', 'Vercel'],
    category: 'Other',
    status: 'Live',
    techStack: ['Vercel', 'Next.js']
  },
  {
    id: '3',
    title: 'AI Studio Lilac',
    description: 'An intelligent media upload and processing interface for AI workflows, streamlined for developer productivity.',
    url: 'https://aistudio-lilac.vercel.app/upload',
    tags: ['AI', 'Upload', 'Tool'],
    category: 'Web App',
    status: 'In Progress',
    techStack: ['React', 'Vercel AI SDK']
  },
  {
    id: '4',
    title: 'Suno Architect',
    description: 'Generative architectural design system deployed on Cloud Run, leveraging advanced spatial models for creative layouts.',
    url: 'https://suno-architect-176960048944.us-west1.run.app',
    tags: ['Architecture', 'Generative AI'],
    category: 'Web App',
    status: 'Live',
    techStack: ['Cloud Run', 'Python', 'FastAPI']
  },
  {
    id: '5',
    title: 'Bard Bars',
    description: 'An AI-powered poetry remixer that transforms epic verses into modern lyrical flows, deployed on Cloud Run.',
    url: 'https://bard-bars-epic-poetry-remix-176960048944.us-west1.run.app',
    tags: ['AI', 'Poetry', 'Remix'],
    category: 'Web App',
    status: 'Live',
    techStack: ['Cloud Run', 'React', 'Python']
  },
  {
    id: '6',
    title: 'Cosmography: The Map of Realms',
    description: 'An interactive 3D atlas visualizing fictional universes and celestial coordinates, offering an immersive navigation experience.',
    url: 'https://cosmography-the-map-of-realms-176960048944.us-west1.run.app/',
    tags: ['3D', 'Interactive', 'Maps'],
    category: 'Web App',
    status: 'Live',
    techStack: ['Cloud Run', 'React', 'Three.js']
  }
];

const App: React.FC = () => {
  // Initialize state from local storage, falling back to INITIAL_PROJECTS if empty or invalid
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('portfolio-projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed)) {
          // If local storage has fewer items than initial (e.g. first load after code update), merge new ones
          // This is a simple check; for production, you might want more robust merging logic
          if (parsed.length < INITIAL_PROJECTS.length && parsed.length > 0) {
             // Optional: Decide if you want to force update or respect user deletions.
             // For this specific request, we just return parsed to respect user state,
             // OR you can clear localStorage manually to see the new hardcoded item.
             // To ensure the user sees the new item without clearing cache, we can merge by ID:
             const existingIds = new Set(parsed.map((p: Project) => p.id));
             const newItems = INITIAL_PROJECTS.filter(p => !existingIds.has(p.id));
             return [...parsed, ...newItems];
          }
          return parsed;
        }
      }
      return INITIAL_PROJECTS;
    } catch (error) {
      console.error("Failed to load projects from local storage:", error);
      return INITIAL_PROJECTS;
    }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('All');

  // Persist projects to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('portfolio-projects', JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save projects to local storage:", error);
    }
  }, [projects]);

  const handleAddProjects = (newProjects: Project[]) => {
    setProjects(prev => [...newProjects, ...prev]);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const categories = ['All', 'Web App', 'Mobile App', 'Design', 'Other'];
  
  const filteredProjects = (filter === 'All' ? projects : projects.filter(p => p.category === filter)) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20">
                <Box size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Portfol.io
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden md:flex items-center gap-2 bg-white text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-lg shadow-white/5"
              >
                <Plus size={16} />
                Add Project
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-medium mb-6">
            <SparkleIcon />
            Powered by Gemini 2.5 Flash
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Showcase your work <br />
            <span className="text-indigo-500">at the speed of AI.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Batch import your projects simply by pasting URLs. Our AI agent analyzes, categorizes, and generates descriptions for your portfolio instantly.
          </p>
          <button 
             onClick={() => setIsModalOpen(true)}
             className="md:hidden flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-all"
          >
            <Plus size={18} />
            Add New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="text-slate-500 text-sm font-medium">
            {filteredProjects.length} Projects
          </div>
        </div>

        {/* Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Terminal size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or add a new project.</p>
            <button 
              onClick={() => { setFilter('All'); setIsModalOpen(true); }}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
            >
              Add your first project &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </main>

      <BatchAddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddProjects={handleAddProjects}
      />

    </div>
  );
};

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
  </svg>
);

export default App;