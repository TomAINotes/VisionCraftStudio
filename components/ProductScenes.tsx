import React, { useState, useRef, useMemo } from 'react';
import { SCENE_TEMPLATES } from '../constants';
import { generateImageWithPrompt } from '../services/geminiService';
import { ImageFile, GeneratedImage, SceneTemplate } from '../types';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import { Check, Download, Sparkles, Image as ImageIcon, X, ChevronDown, Settings } from 'lucide-react';
// @ts-ignore
import JSZip from 'jszip';

const ControlSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number; }> = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-3 mt-1">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm w-12 text-center bg-gray-100 border border-gray-200 rounded-md py-1">{value}</span>
        </div>
    </div>
);

const ProductScenes: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [processedImage, setProcessedImage] = useState<ImageFile | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);

  const [scale, setScale] = useState(100);
  const [shadowStrength, setShadowStrength] = useState(50);
  const [backgroundTheme, setBackgroundTheme] = useState('soft neutral background');
  const [accentColor, setAccentColor] = useState('#4f46e5');
  const [logoFile, setLogoFile] = useState<ImageFile | null>(null);
  const [productDescription, setProductDescription] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const groupedTemplates = useMemo(() => {
    // FIX: Explicitly type the accumulator for the `reduce` function to ensure correct type inference for `groupedTemplates`.
    return SCENE_TEMPLATES.reduce<Record<string, SceneTemplate[]>>((acc, template) => {
        const category = template.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(template);
        return acc;
    }, {});
  }, []);

  const handleFileUpload = async (fileData: ImageFile) => {
    setSourceImage(fileData);
    setGeneratedImages([]);
    setError(null);
    setLoadingMessage('Removing background...');
    setIsLoading(true);
    try {
      const removeBgPrompt = "Remove the background of this product image and make it transparent. Maintain the original object's dimensions, colors, and details precisely. The object should be perfectly clean-cut. Output a transparent PNG.";
      const transparentData = await generateImageWithPrompt(fileData, removeBgPrompt);
      setProcessedImage({ ...fileData, base64: transparentData });
    } catch (e) {
      console.error(e);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve({ base64, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
      });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          const file = event.target.files[0];
          if (file.type.startsWith('image/')) {
              const { base64, mimeType } = await fileToBase64(file);
              setLogoFile({ file, base64, mimeType });
          } else {
              alert("Please upload a valid image file for the logo.");
          }
      }
  };

  const applyLogoOverlay = (sceneSrc: string, logo: ImageFile): Promise<string> => {
      return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(sceneSrc);

          const sceneImg = new Image();
          sceneImg.onload = () => {
              canvas.width = sceneImg.width;
              canvas.height = sceneImg.height;
              ctx.drawImage(sceneImg, 0, 0);

              const logoImg = new Image();
              logoImg.onload = () => {
                  const logoMaxSize = Math.min(canvas.width, canvas.height) * 0.1;
                  const scale = Math.min(logoMaxSize / logoImg.width, logoMaxSize / logoImg.height);
                  const logoWidth = logoImg.width * scale;
                  const logoHeight = logoImg.height * scale;
                  const margin = Math.min(canvas.width, canvas.height) * 0.02;

                  ctx.drawImage(logoImg, canvas.width - logoWidth - margin, canvas.height - logoHeight - margin, logoWidth, logoHeight);
                  resolve(canvas.toDataURL('image/png'));
              };
              logoImg.src = `data:${logo.mimeType};base64,${logo.base64}`;
          };
          sceneImg.src = sceneSrc;
      });
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };
  
  const handleSelectAll = () => {
      setSelectedTemplates(new Set(SCENE_TEMPLATES.map(t => t.id)));
  }
  
  const handleClearAll = () => {
      setSelectedTemplates(new Set());
  }
  
  const handleCategorySelect = (category: string, templates: SceneTemplate[]) => {
      const categoryIds = templates.map(t => t.id);
      const allSelected = categoryIds.every(id => selectedTemplates.has(id));
      
      setSelectedTemplates(prev => {
          const newSet = new Set(prev);
          if (allSelected) {
              categoryIds.forEach(id => newSet.delete(id));
          } else {
              categoryIds.forEach(id => newSet.add(id));
          }
          return newSet;
      });
  };

  const handleGenerate = async () => {
    if (!processedImage || selectedTemplates.size === 0) return;
    
    setError(null);
    setIsLoading(true);
    setGeneratedImages([]);
    const templatesToGenerate = SCENE_TEMPLATES.filter(t => selectedTemplates.has(t.id));

    const generationPromises = templatesToGenerate.map(async (template) => {
      setLoadingMessage(`Generating: ${template.name}`);
      
      const shadowPrompt = shadowStrength < 33 ? 'subtle natural shadow' : shadowStrength < 66 ? 'soft natural shadow' : 'defined natural shadow';
      const scalePrompt = scale < 90 ? 'zoomed out to show more of the scene' : scale > 110 ? 'as a close-up macro shot' : 'at a standard distance';
      const productIdentifier = productDescription.trim() ? `a ${productDescription.trim()}` : 'the uploaded product';

      const fullPrompt = `Photoreal product shot of ${productIdentifier}. Place it ${template.prompt}, ${scalePrompt}. The scene is set on ${backgroundTheme}. Composite with matched perspective, ${shadowPrompt}, and subtle reflection. Use a consistent white balance. Feature a subtle brand accent color of ${accentColor}. Keep edges sharp. High detail, 2048x2048 resolution, 1:1 aspect ratio, professional photography, no text, no watermark.`;
      
      try {
        const generatedData = await generateImageWithPrompt(processedImage, fullPrompt);
        let finalImageSrc = `data:image/png;base64,${generatedData}`;
        if (logoFile) finalImageSrc = await applyLogoOverlay(finalImageSrc, logoFile);
        return { id: template.id, src: finalImageSrc, prompt: template.name };
      } catch (err) {
        console.error(`Failed to generate ${template.name}:`, err);
        return null;
      }
    });

    const results = await Promise.all(generationPromises);
    setGeneratedImages(results.filter((res): res is GeneratedImage => res !== null));
    setIsLoading(false);
    setLoadingMessage('');
    if (results.some(r => r === null)) {
        setError('Some scenes could not be generated. Please check your connection and try again.');
    }
  };
  
    const handleDownloadAll = async () => {
        const zip = new JSZip();
        for (const image of generatedImages) {
            const base64Data = image.src.split(',')[1];
            zip.file(`${image.id}.png`, base64Data, { base64: true });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            await new Promise<void>((resolve) => {
                img.onload = async () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    const webpBlob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/webp', 0.9));
                    if(webpBlob) zip.file(`${image.id}.webp`, webpBlob);
                    resolve();
                };
                img.src = image.src;
            });
        }
        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'PrintScenes_Outputs.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

  if (!sourceImage) {
    return <ImageUploader onFileUpload={handleFileUpload} title="Upload your product photo" subtitle="Drag & drop or click to select a PNG or JPG file" />;
  }
  if (isLoading && !processedImage) {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-xl">
            <Spinner size={48} />
            <p className="mt-4 text-lg text-gray-600">{loadingMessage}</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- CONTROLS COLUMN --- */}
        <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 space-y-6">
                 <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 font-heading">Your Product</h3>
                    <div className="p-2 rounded-lg bg-grid bg-gray-100 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]">
                         <img src={`data:image/png;base64,${processedImage!.base64}`} alt="Processed item" className="w-full h-auto object-contain rounded-md" />
                    </div>
                </div>
                <button onClick={() => { setSourceImage(null); setProcessedImage(null); setSelectedTemplates(new Set()); setGeneratedImages([]); setProductDescription(''); }} className="w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200 text-sm">Upload New Product</button>
                
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div>
                        <label htmlFor="product-desc" className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                        <textarea id="product-desc" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="e.g., A blue 3D-printed vase..." className="w-full h-20 p-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-semibold font-heading">Select Scenes</h3>
                            <div className="flex space-x-2">
                                <button onClick={handleSelectAll} className="text-xs font-medium text-indigo-600 hover:underline">Select All</button>
                                <button onClick={handleClearAll} className="text-xs font-medium text-gray-500 hover:underline">Clear</button>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {Object.entries(groupedTemplates).map(([category, templates]) => (
                                <div key={category}>
                                    <div className="flex justify-between items-center mb-1">
                                      <h4 className="text-sm font-semibold text-gray-600">{category}</h4>
                                      <button onClick={() => handleCategorySelect(category, templates)} className="text-xs font-medium text-indigo-600 hover:underline">
                                         {templates.every(t => selectedTemplates.has(t.id)) ? 'Deselect' : 'Select'} All
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {templates.map(template => (
                                            <button key={template.id} onClick={() => toggleTemplate(template.id)} className={`relative p-2 text-left border rounded-md transition-all duration-200 ${selectedTemplates.has(template.id) ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                                                {selectedTemplates.has(template.id) && <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5"><Check size={10} /></div>}
                                                <p className="font-medium text-xs">{template.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <details className="group pt-2 border-t">
                        <summary className="flex items-center justify-between cursor-pointer list-none">
                             <h3 className="text-base font-semibold font-heading">Advanced Controls</h3>
                             <ChevronDown size={20} className="transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="mt-4 space-y-4">
                            <ControlSlider label="Scale (Zoom)" value={scale} onChange={(e) => setScale(Number(e.target.value))} min={80} max={120} />
                            <ControlSlider label="Shadow Strength" value={shadowStrength} onChange={(e) => setShadowStrength(Number(e.target.value))} />
                            <div>
                               <label htmlFor="bg-theme" className="block text-sm font-medium text-gray-700">Background Theme</label>
                               <input id="bg-theme" type="text" value={backgroundTheme} onChange={(e) => setBackgroundTheme(e.target.value)} className="w-full mt-1 p-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" />
                            </div>
                             <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label htmlFor="accent-color" className="block text-sm font-medium text-gray-700">Accent Color</label>
                                     <input id="accent-color" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="mt-1 w-full h-9 p-1 bg-white border border-gray-300 rounded-md cursor-pointer" />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Logo Overlay</label>
                                    <button onClick={() => logoInputRef.current?.click()} className="mt-1 w-full h-9 flex items-center justify-center space-x-2 px-2 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition">
                                        <ImageIcon size={14} />
                                        <span>{logoFile ? 'Change' : 'Upload'}</span>
                                    </button>
                                     <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg" className="hidden" />
                                 </div>
                             </div>
                        </div>
                    </details>
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || selectedTemplates.size === 0}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                     {isLoading ? <><Spinner size={24} /><span className="ml-3">{loadingMessage || 'Generating...'}</span></> : <><Sparkles size={22} className="mr-3"/><span>Generate {selectedTemplates.size} Scene{selectedTemplates.size !== 1 && 's'}</span></>}
                </button>
            </div>
        </div>

        {/* --- RESULTS COLUMN --- */}
        <div className="lg:col-span-8 xl:col-span-9">
            {error && <div className="mb-4 text-center p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>}

            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: selectedTemplates.size || 3 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            )}

            {!isLoading && generatedImages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 font-heading">Your generated scenes will appear here</h3>
                    <p className="mt-1 text-gray-500">Select one or more templates and click "Generate"</p>
                </div>
            )}
            
            {!isLoading && generatedImages.length > 0 && (
                <div className="space-y-4 animate-fadeInUp">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold font-heading">Generated Scenes</h2>
                        <button onClick={handleDownloadAll} className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 rounded-lg transition-colors duration-200">
                            <Download size={18} />
                            <span>Download All</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {generatedImages.map((image) => (
                        <div key={image.id} onClick={() => setZoomedImage(image)} className="group relative rounded-xl overflow-hidden border border-gray-200 aspect-square shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                            <img src={image.src} alt={`Generated scene: ${image.prompt}`} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                                <p className="text-gray-900 text-sm truncate font-medium">{image.prompt}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

      {zoomedImage && (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeInUp"
            onClick={() => setZoomedImage(null)}
        >
            <button 
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                onClick={() => setZoomedImage(null)}
            >
                <X size={32} />
            </button>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                 <img 
                    src={zoomedImage.src} 
                    alt={`Zoomed view: ${zoomedImage.prompt}`} 
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductScenes;