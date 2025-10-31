import React, { useState } from 'react';
import { generateImageWithPrompt } from '../services/geminiService';
import { ImageFile, GeneratedImage } from '../types';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import { Sparkles, Download } from 'lucide-react';

const ImageEditor: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (fileData: ImageFile) => {
        try {
            setSourceImage(fileData);
            setGeneratedImage(null);
            setError(null);
            setPrompt('');
        } catch (error) {
            console.error('Error handling file upload:', error);
            setError('Failed to process the uploaded image. Please try again.');
            setSourceImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!sourceImage || !prompt) return;

        setIsLoading(true);
        setError(null);
        try {
            const fullPrompt = `${prompt}. Maintain the style and composition of the original image unless specified otherwise.`;
            const generatedData = await generateImageWithPrompt(sourceImage, fullPrompt);
            setGeneratedImage({
                id: new Date().toISOString(),
                src: `data:image/png;base64,${generatedData}`,
                prompt,
            });
        } catch (e) {
            console.error(e);
            setError('Failed to generate image. Please try a different prompt or image.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage.src;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            {!sourceImage && (
                <ImageUploader 
                    onFileUpload={handleFileUpload}
                    title="Upload an image to edit"
                    subtitle="Drag & drop or click to select a file"
                />
            )}

            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>}

            {sourceImage && (
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                             <h3 className="text-lg font-semibold font-heading">Original Image</h3>
                            <img src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`} alt="Source" className="w-full rounded-lg border border-gray-200" />
                            <button onClick={() => { setSourceImage(null); setGeneratedImage(null); setPrompt(''); }} className="w-full text-center mt-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200">Upload a different image</button>
                        </div>
                        <div className="space-y-4">
                             <h3 className="text-lg font-semibold font-heading">Describe your edits</h3>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'Add a retro filter', 'Make the background a snowy mountain', 'Change the color to blue'"
                                className="w-full h-28 p-3 bg-white border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                            <button 
                                onClick={handleGenerate} 
                                disabled={isLoading || !prompt}
                                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isLoading ? <><Spinner size={20} /><span className="ml-2">Generating...</span></> : <><Sparkles size={20} className="mr-2"/><span>Generate</span></>}
                            </button>
                        </div>
                    </div>

                    {generatedImage && (
                         <div className="space-y-4 pt-6 border-t border-gray-200 animate-fadeInUp">
                            <h3 className="text-lg font-semibold font-heading">Edited Image</h3>
                            <img src={generatedImage.src} alt="Generated" className="w-full rounded-lg border border-gray-200" />
                            <button onClick={handleDownload} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 rounded-lg transition-colors duration-200">
                                <Download size={18} />
                                <span>Download Edited Image</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageEditor;