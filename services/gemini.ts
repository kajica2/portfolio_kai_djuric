import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Project } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const projectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A creative and professional title for the project derived from the URL or slug.",
    },
    description: {
      type: Type.STRING,
      description: "A compelling 2-sentence marketing description of what this project likely does.",
    },
    category: {
      type: Type.STRING,
      enum: ['Web App', 'Mobile App', 'Library', 'Design', 'Other'],
      description: "The category of the project.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 relevant keywords or tags.",
    },
    techStack: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Inferred technologies based on the URL (e.g., Vercel, Netlify, Cloud Run, React, Python).",
    },
  },
  required: ["title", "description", "category", "tags", "techStack"],
};

const batchSchema: Schema = {
  type: Type.ARRAY,
  items: projectSchema,
};

export const analyzeUrlsBatch = async (urls: string[]): Promise<Partial<Project>[]> => {
  if (urls.length === 0) return [];

  const prompt = `
    Analyze the following list of URLs and generate a professional portfolio entry for each.
    If the URL is generic or inaccessible, infer the likely purpose from the domain name, slug, or path.
    Be creative but professional. Use 'Web App' as the default category if unsure.
    
    URLs:
    ${urls.map(u => `- ${u}`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: batchSchema,
        systemInstruction: "You are an expert tech portfolio manager. Your job is to make every project link look exciting and professional.",
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    // Map back to include the original URL since the AI might not return it exactly as input
    return data.map((item: any, index: number) => ({
      ...item,
      url: urls[index], // robustly link back to original input order
      status: 'Live',
    }));
  } catch (error) {
    console.error("Gemini Batch Analysis Failed:", error);
    // Fallback for demo purposes if API fails
    return urls.map(url => ({
      title: "New Project",
      description: "Project details could not be generated at this time.",
      url: url,
      tags: ["Pending"],
      techStack: ["Unknown"],
      category: "Other",
      status: "In Progress"
    }));
  }
};

export const analyzeZipProjects = async (projectsData: { filename: string, content: string }[]): Promise<Partial<Project>[]> => {
  if (projectsData.length === 0) return [];

  const prompt = `
    Analyze the following project file contents (derived from ZIP uploads) and generate a professional portfolio entry for each.
    Based on the README and package.json content, determine the likely title, description, and tech stack.
    
    Projects:
    ${projectsData.map((p, i) => `
    Project ${i + 1} Filename: ${p.filename}
    Content Snippets:
    ${p.content}
    -------------------
    `).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: batchSchema,
        systemInstruction: "You are an expert code auditor and portfolio manager. Analyze the code snippets provided to create impressive portfolio entries.",
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    return data.map((item: any) => ({
      ...item,
      url: '#', // No live URL for zip uploads
      status: 'Archived', // Default status for zips
    }));
  } catch (error) {
    console.error("Gemini Zip Analysis Failed:", error);
    return projectsData.map(p => ({
      title: p.filename.replace('.zip', ''),
      description: "Analysis failed. Please try again.",
      url: '#',
      tags: ["Upload"],
      techStack: ["Unknown"],
      category: "Other",
      status: "Archived"
    }));
  }
};