import React from 'react';
import { ExternalLink, Github, Trash2, Zap } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  // Generate a consistent placeholder image based on the ID or Title
  const seed = project.id ? project.id.substring(0, 5) : 'default';
  const imageUrl = `https://picsum.photos/seed/${seed}/600/400`;

  return (
    <div className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60" />
        <img 
          src={imageUrl} 
          alt={project.title || 'Project'} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 z-20">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
            project.status === 'Live' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
            project.status === 'Archived' ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' :
            'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            {project.status || 'Live'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-medium text-indigo-400 mb-1 block uppercase tracking-wider">
              {project.category || 'Other'}
            </span>
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
              {project.title || 'Untitled Project'}
            </h3>
          </div>
          <a 
            href={project.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <ExternalLink size={18} />
          </a>
        </div>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {project.description || 'No description provided.'}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(project.techStack || []).map((tech, idx) => (
            <span key={idx} className="flex items-center text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
              <Zap size={10} className="mr-1 text-yellow-500" />
              {tech}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
          <div className="flex gap-2">
            {(project.tags || []).map((tag, i) => (
              <span key={i} className="text-xs text-slate-500">#{tag}</span>
            ))}
          </div>
          <button 
            onClick={() => onDelete(project.id)}
            className="text-slate-500 hover:text-red-400 transition-colors"
            title="Remove Project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};