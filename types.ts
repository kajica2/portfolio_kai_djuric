export interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: 'Web App' | 'Mobile App' | 'Library' | 'Design' | 'Other';
  status: 'Live' | 'In Progress' | 'Archived';
  techStack: string[];
}

export interface ProcessingStatus {
  total: number;
  completed: number;
  isProcessing: boolean;
}