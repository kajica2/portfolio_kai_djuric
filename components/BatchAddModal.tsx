import React, { useState, useCallback } from 'react';
import { X, Sparkles, Loader2, Link as LinkIcon, AlertCircle, UploadCloud, FileArchive } from 'lucide-react';
import { analyzeUrlsBatch, analyzeZipProjects } from '../services/gemini';
import { Project } from '../types';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';

interface BatchAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProjects: (projects: Project[]) => void;
}

export const BatchAddModal: React.FC<BatchAddModalProps> = ({ isOpen, onClose, onAddProjects }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const zips = Array.from(e.dataTransfer.files).filter((file: any) => 
        file.name.toLowerCase().endsWith('.zip')
      );
      
      if (zips.length !== e.dataTransfer.files.length) {
         setError("Some files were ignored. Only .zip files are supported.");
      } else {
         setError(null);
      }
      
      if (zips.length > 0) {
        setUploadedFiles(prev => [...prev, ...zips]);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const zips = Array.from(e.target.files).filter((file: any) => 
        file.name.toLowerCase().endsWith('.zip')
      );
      setUploadedFiles(prev => [...prev, ...zips]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const extractZipContent = async (file: File): Promise<{ filename: string, content: string }> => {
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      
      let extractedText = "";
      
      // Look for key files
      const readmeFile = Object.values(content.files).find((f: any) => f.name.toLowerCase().includes('readme'));
      const packageJson = Object.values(content.files).find((f: any) => f.name.toLowerCase().endsWith('package.json'));
      
      if (readmeFile) {
        const text = await (readmeFile as any).async("string");
        extractedText += `\n--- README.md ---\n${text.substring(0, 5000)}`; // Limit context
      }
      
      if (packageJson) {
        const text = await (packageJson as any).async("string");
        extractedText += `\n--- package.json ---\n${text}`;
      }
      
      if (!extractedText) {
        extractedText = "No README or package.json found. Infer from filename.";
      }

      return {
        filename: file.name,
        content: extractedText
      };
    } catch (e) {
      console.error("Error reading zip", e);
      return { filename: file.name, content: "Error reading file." };
    }
  };

  const handleProcess = async () => {
    const urls = input
      .split(/[\n,]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (urls.length === 0 && uploadedFiles.length === 0) {
      setError("Please enter a URL or upload a ZIP file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    let newProjects: Project[] = [];

    try {
      // Process URLs
      if (urls.length > 0) {
        const urlResults = await analyzeUrlsBatch(urls);
        const urlProjects = urlResults.map(p => ({
          id: uuidv4(),
          title: p.title || 'Untitled Project',
          description: p.description || 'No description available.',
          url: p.url || '#',
          tags: p.tags || [],
          category: (p.category as any) || 'Other',
          status: 'Live' as const,
          techStack: p.techStack || []
        }));
        newProjects = [...newProjects, ...urlProjects];
      }

      // Process Files
      if (uploadedFiles.length > 0) {
        const fileContexts = await Promise.all(uploadedFiles.map(extractZipContent));
        const fileResults = await analyzeZipProjects(fileContexts);
        
        const fileProjects = fileResults.map(p => ({
          id: uuidv4(),
          title: p.title || 'Untitled Project',
          description: p.description || 'No description available.',
          url: '#',
          tags: p.tags || [],
          category: (p.category as any) || 'Other',
          status: 'Archived' as const, // Zips are usually archives or local code
          techStack: p.techStack || []
        }));
        newProjects = [...newProjects, ...fileProjects];
      }

      onAddProjects(newProjects);
      setInput('');
      setUploadedFiles([]);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to process projects. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Sparkles className="text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Batch Add Projects</h2>
              <p className="text-sm text-slate-400">Add URLs or upload ZIPs to build your portfolio.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* URL Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project URLs
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-slate-500">
                <LinkIcon size={16} />
              </div>
              <textarea
                className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 font-mono text-sm leading-relaxed resize-none"
                placeholder="https://my-cool-project.vercel.app, https://github.com/my-username/repo"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-slate-500 text-xs font-medium uppercase">OR</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* File Upload Section */}
          <div className="mb-4">
             <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Project Archives (.zip)
            </label>
            <div 
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".zip"
                multiple
                disabled={isProcessing}
              />
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                <UploadCloud size={32} className={dragActive ? "text-indigo-400" : "text-slate-500"} />
                <p className="text-sm font-medium">
                  <span className="text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">
                  ZIP files only. We'll analyze README & package.json.
                </p>
              </div>
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800 p-2 px-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileArchive size={16} className="text-amber-500 shrink-0" />
                      <span className="text-sm text-slate-300 truncate">{file.name}</span>
                      <span className="text-xs text-slate-500 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button 
                      onClick={() => removeFile(idx)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      disabled={isProcessing}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white font-medium text-sm transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            onClick={handleProcess}
            disabled={isProcessing || (!input.trim() && uploadedFiles.length === 0)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Portfolio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};