import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  src: string;
  thumbnail?: string;
  title: string;
  description: string;
  category?: string;
}

interface MediaTabsProps {
  photos: MediaItem[];
  videos: MediaItem[];
}

const MediaTabs = ({ photos, videos }: MediaTabsProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentMedia = activeTab === 'photos' ? photos : videos;
  
  // Get unique categories
  const categories = ['all', ...new Set(currentMedia.map(item => item.category).filter(Boolean))];
  
  // Filter media by category
  const filteredMedia = selectedCategory === 'all' 
    ? currentMedia 
    : currentMedia.filter(item => item.category === selectedCategory);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredMedia.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'photos'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Photos ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'videos'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Videos ({videos.length})
          </button>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.map((item, index) => (
          <div
            key={item.id}
            className="group cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
            onClick={() => openLightbox(index)}
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={item.thumbnail || item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary-600 ml-1" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
              {item.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                  {item.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No {activeTab} available in this category.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && filteredMedia.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Arrows */}
            {filteredMedia.length > 1 && (
              <>
                <button
                  onClick={prevItem}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextItem}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Media Content */}
            <div className="max-w-4xl max-h-full flex flex-col items-center">
              {filteredMedia[currentIndex]?.type === 'video' ? (
                <video
                  src={filteredMedia[currentIndex].src}
                  controls
                  className="max-w-full max-h-[70vh] rounded-lg"
                  autoPlay
                />
              ) : (
                <img
                  src={filteredMedia[currentIndex]?.src}
                  alt={filteredMedia[currentIndex]?.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}
              
              {/* Media Info */}
              <div className="mt-4 text-center text-white max-w-2xl">
                <h3 className="text-xl font-semibold mb-2">{filteredMedia[currentIndex]?.title}</h3>
                <p className="text-gray-300">{filteredMedia[currentIndex]?.description}</p>
                {filteredMedia.length > 1 && (
                  <p className="text-sm text-gray-400 mt-2">
                    {currentIndex + 1} of {filteredMedia.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaTabs;