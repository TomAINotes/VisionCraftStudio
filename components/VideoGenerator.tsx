import React, { useState, useEffect } from 'react';
import { generateVideoFromImage } from '../services/geminiService';
import { ImageFile } from '../types';
import { VEO_LOADING_MESSAGES } from '../constants';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import { Film, Download } from 'lucide-react';

interface VideoGeneratorProps {
    resetKeySelection?: () => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ resetKeySelection }) => {
    const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        let intervalId: number;
        if (isLoading) {
            setLoadingMessage(VEO_LOADING_MESSAGES[0]);
            let messageIndex = 1;
            intervalId = window.setInterval(() => {
                setLoadingMessage(VEO_LOADING_MESSAGES[messageIndex % VEO_LOADING_MESSAGES.length]);
                messageIndex++;
            }, 5000);
        }
        return () => clearInterval(intervalId);
    }, [isLoading]);

    const handleFileUpload = (fileData: ImageFile) => {
        setSourceImage(fileData);
        setGeneratedVideoUrl(null);
        setError(null);
    };
    
    const handleProgress = (message: string) => {
        console.log("Video Progress:", message);
    };

    const handleGenerate = async () => {
        if (!sourceImage || !prompt) return;

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        try {
            const videoUrl = await generateVideoFromImage(sourceImage, prompt, aspectRatio, handleProgress);
            setGeneratedVideoUrl(videoUrl);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate video. ${errorMessage}`);
            if (resetKeySelection && errorMessage.includes("API key not found")) {
                resetKeySelection();
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-8">
            {!sourceImage && (
                <ImageUploader 
                    onFileUpload={handleFileUpload}
                    title="Upload an image to start your video"
                    subtitle="Drag & drop or click to select a file"
                />
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Spinner size={48} />
                    <p className="mt-4 text-lg font-semibold text-gray-800 font-heading">Video Generation in Progress</p>
                    <p className="mt-2 text-gray-500">{loadingMessage}</p>
                </div>
            )}
            
            {error && !isLoading && <div className="text-center p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>}

            {sourceImage && !isLoading && !generatedVideoUrl && (
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold font-heading">Starting Image</h3>
                        <img src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`} alt="Source" className="w-full rounded-lg border border-gray-200" />
                        <button onClick={() => { setSourceImage(null); setGeneratedVideoUrl(null); setPrompt(''); }} className="w-full text-center mt-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200">Upload a different image</button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="prompt" className="block text-lg font-semibold mb-2 font-heading">Describe the video scene</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'A cinematic shot of this object floating in space', 'The camera slowly zooms out...'"
                                className="w-full h-28 p-3 bg-white border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 font-heading">Aspect Ratio</h3>
                            <div className="flex space-x-4">
                                {(['16:9', '9:16'] as const).map(ratio => (
                                    <button 
                                        key={ratio} 
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`px-4 py-2 rounded-md border text-sm transition-colors duration-200 ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 hover:border-gray-400'}`}
                                    >
                                        {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate} 
                            disabled={!prompt}
                            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            <Film size={20} className="mr-2"/>
                            <span>Generate Video</span>
                        </button>
                    </div>
                </div>
            )}

            {generatedVideoUrl && !isLoading && (
                 <div className="max-w-3xl mx-auto space-y-4 animate-fadeInUp">
                    <h2 className="text-2xl font-bold text-center font-heading">Your Video is Ready!</h2>
                    <video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-xl border border-gray-200 shadow-sm" />
                    <div className="flex flex-col sm:flex-row gap-4">
                         <a 
                            href={generatedVideoUrl} 
                            download={`visioncraft-video-${Date.now()}.mp4`}
                            className="flex-1 text-center flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800 text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        >
                            <Download size={18} />
                            <span>Download Video</span>
                        </a>
                         <button 
                            onClick={() => {setSourceImage(null); setGeneratedVideoUrl(null); setPrompt('')}}
                            className="flex-1 text-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200">
                            Create Another Video
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default VideoGenerator;