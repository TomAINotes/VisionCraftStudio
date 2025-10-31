import React, { useState } from 'react';
import Header from './components/Header';
import TabButton from './components/TabButton';
import ProductScenes from './components/ProductScenes';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import ApiKeySelector from './components/ApiKeySelector';
import { Camera, Film, Pencil } from 'lucide-react';

type Tab = 'scenes' | 'editor' | 'video';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('scenes');

  const renderContent = () => {
    switch (activeTab) {
      case 'scenes':
        return <ApiKeySelector><ProductScenes /></ApiKeySelector>;
      case 'editor':
        return <ApiKeySelector><ImageEditor /></ApiKeySelector>;
      case 'video':
        return <ApiKeySelector><VideoGenerator /></ApiKeySelector>;
      default:
        return <ApiKeySelector><ProductScenes /></ApiKeySelector>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-8 flex justify-center border-b border-gray-200">
          <div className="flex space-x-2 md:space-x-8">
            <TabButton 
              label="Product Scenes" 
              isActive={activeTab === 'scenes'} 
              onClick={() => setActiveTab('scenes')}
              icon={<Camera size={18} />}
            />
            <TabButton 
              label="Image Editor" 
              isActive={activeTab === 'editor'} 
              onClick={() => setActiveTab('editor')}
              icon={<Pencil size={18} />}
            />
            <TabButton 
              label="Video Generator" 
              isActive={activeTab === 'video'} 
              onClick={() => setActiveTab('video')}
              icon={<Film size={18} />}
            />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto animate-fadeInUp will-change-transform">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;