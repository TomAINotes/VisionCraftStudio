
export interface SceneTemplate {
  id: string;
  name: string;
  prompt: string;
  category?: string;
}

export interface GeneratedImage {
  id: string;
  src: string; // base64 data URL
  prompt: string;
}

export interface ImageFile {
  file: File;
  base64: string;
  mimeType: string;
}