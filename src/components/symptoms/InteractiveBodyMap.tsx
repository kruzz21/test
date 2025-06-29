import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Baby } from 'lucide-react';

interface TooltipData {
  title: string;
  description: string;
  bodyPart: string;
}

const InteractiveBodyMap = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleBodyPartClick = (bodyPart: string) => {
    const linkMap: { [key: string]: string } = {
      'shoulder': '/symptoms/shoulder-pain',
      'elbow': '/symptoms/elbow-conditions',
      'wrist-hand': '/symptoms/wrist-hand',
      'hip': '/symptoms/hip-problems',
      'knee': '/symptoms/knee-conditions',
      'foot-ankle': '/symptoms/foot-ankle',
      'pediatric-orthopedics': '/symptoms/pediatric-orthopedics'
    };
    
    navigate(linkMap[bodyPart] || '/symptoms');
  };

  const handleBodyPartHover = (bodyPart: string, event: React.MouseEvent) => {
    const tooltipData: TooltipData = {
      title: t(`symptoms.bodyMap.tooltips.${bodyPart}.title`),
      description: t(`symptoms.bodyMap.tooltips.${bodyPart}.description`),
      bodyPart
    };

    const rect = mapRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }

    setTooltip(tooltipData);
    setHoveredPart(bodyPart);
  };

  const closeTooltip = () => {
    setTooltip(null);
    setHoveredPart(null);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mapRef.current && !mapRef.current.contains(event.target as Node)) {
        closeTooltip();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Define body part styles with hover effects
  const getBodyPartStyle = (bodyPart: string) => {
    const baseColors: { [key: string]: string } = {
      'shoulder': '#3b82f6',
      'elbow': '#10b981',
      'wrist-hand': '#f59e0b',
      'hip': '#a855f7',
      'knee': '#ef4444',
      'foot-ankle': '#22c55e'
    };

    const isHovered = hoveredPart === bodyPart;
    const baseColor = baseColors[bodyPart] || '#6b7280';
    
    return {
      fill: isHovered ? baseColor : `${baseColor}40`,
      stroke: baseColor,
      strokeWidth: isHovered ? '3' : '2',
      opacity: isHovered ? 0.8 : 0.6,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto" ref={mapRef}>
      {/* Single Front View - Properly Centered */}
      <div className="relative">
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">
          {t('symptoms.bodyMap.title')}
        </h3>
        <div className="relative bg-gray-50 rounded-lg p-8">
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Base SVG Body - Using Front.svg */}
              <img 
                src="/img/Front.svg" 
                alt="Front body view"
                className="w-full h-auto object-contain mx-auto"
              />
              
              {/* Interactive overlay SVG for clickable areas - precisely positioned */}
              <svg 
                viewBox="0 0 400 800" 
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              >
                {/* Interactive Body Parts - Front View - Perfectly aligned */}
                
                {/* Left Shoulder - positioned exactly on the shoulder joint */}
                <ellipse 
                  cx="130" cy="175" rx="28" ry="22"
                  style={{ ...getBodyPartStyle('shoulder'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('shoulder')}
                  onMouseEnter={(e) => handleBodyPartHover('shoulder', e)}
                  onMouseLeave={closeTooltip}
                />
                
                {/* Right Shoulder - positioned exactly on the shoulder joint */}
                <ellipse 
                  cx="270" cy="175" rx="28" ry="22"
                  style={{ ...getBodyPartStyle('shoulder'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('shoulder')}
                  onMouseEnter={(e) => handleBodyPartHover('shoulder', e)}
                  onMouseLeave={closeTooltip}
                />

                {/* Left Elbow - positioned exactly on the elbow joint */}
                <circle 
                  cx="95" cy="275" r="18"
                  style={{ ...getBodyPartStyle('elbow'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('elbow')}
                  onMouseEnter={(e) => handleBodyPartHover('elbow', e)}
                  onMouseLeave={closeTooltip}
                />
                
                {/* Right Elbow - positioned exactly on the elbow joint */}
                <circle 
                  cx="305" cy="275" r="18"
                  style={{ ...getBodyPartStyle('elbow'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('elbow')}
                  onMouseEnter={(e) => handleBodyPartHover('elbow', e)}
                  onMouseLeave={closeTooltip}
                />

                {/* Left Wrist/Hand - positioned exactly on the wrist area */}
                <ellipse 
                  cx="70" cy="375" rx="15" ry="20"
                  style={{ ...getBodyPartStyle('wrist-hand'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('wrist-hand')}
                  onMouseEnter={(e) => handleBodyPartHover('wrist-hand', e)}
                  onMouseLeave={closeTooltip}
                />
                
                {/* Right Wrist/Hand - positioned exactly on the wrist area */}
                <ellipse 
                  cx="330" cy="375" rx="15" ry="20"
                  style={{ ...getBodyPartStyle('wrist-hand'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('wrist-hand')}
                  onMouseEnter={(e) => handleBodyPartHover('wrist-hand', e)}
                  onMouseLeave={closeTooltip}
                />

                {/* Hip Area - positioned exactly on the pelvis/hip region */}
                <ellipse 
                  cx="200" cy="315" rx="35" ry="18"
                  style={{ ...getBodyPartStyle('hip'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('hip')}
                  onMouseEnter={(e) => handleBodyPartHover('hip', e)}
                  onMouseLeave={closeTooltip}
                />

                {/* Left Knee - positioned exactly on the knee joint */}
                <circle 
                  cx="175" cy="475" r="20"
                  style={{ ...getBodyPartStyle('knee'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('knee')}
                  onMouseEnter={(e) => handleBodyPartHover('knee', e)}
                  onMouseLeave={closeTooltip}
                />
                
                {/* Right Knee - positioned exactly on the knee joint */}
                <circle 
                  cx="225" cy="475" r="20"
                  style={{ ...getBodyPartStyle('knee'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('knee')}
                  onMouseEnter={(e) => handleBodyPartHover('knee', e)}
                  onMouseLeave={closeTooltip}
                />

                {/* Left Foot/Ankle - positioned exactly on the ankle area */}
                <ellipse 
                  cx="165" cy="615" rx="16" ry="22"
                  style={{ ...getBodyPartStyle('foot-ankle'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('foot-ankle')}
                  onMouseEnter={(e) => handleBodyPartHover('foot-ankle', e)}
                  onMouseLeave={closeTooltip}
                />
                
                {/* Right Foot/Ankle - positioned exactly on the ankle area */}
                <ellipse 
                  cx="235" cy="615" rx="16" ry="22"
                  style={{ ...getBodyPartStyle('foot-ankle'), pointerEvents: 'auto' }}
                  onClick={() => handleBodyPartClick('foot-ankle')}
                  onMouseEnter={(e) => handleBodyPartHover('foot-ankle', e)}
                  onMouseLeave={closeTooltip}
                />
              </svg>
            </div>

            {/* Pediatric Orthopedics Button - Bottom Right Corner - Hoverable & Transparent */}
            <button
              onClick={() => handleBodyPartClick('pediatric-orthopedics')}
              onMouseEnter={(e) => handleBodyPartHover('pediatric-orthopedics', e)}
              onMouseLeave={closeTooltip}
              className="absolute bottom-4 right-4 bg-yellow-400 bg-opacity-60 hover:bg-opacity-90 text-yellow-900 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2 text-sm font-medium border border-yellow-500 backdrop-blur-sm"
            >
              <Baby size={20} />
              <span>{t('symptoms.pediatric.title')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div 
          className="absolute z-50 bg-white rounded-lg shadow-xl p-4 max-w-xs border border-gray-200 pointer-events-none"
          style={{
            left: `${Math.min(tooltipPosition.x, 300)}px`,
            top: `${Math.max(tooltipPosition.y - 80, 10)}px`,
            transform: tooltipPosition.x > 300 ? 'translateX(-100%)' : 'none'
          }}
        >
          <h3 className="font-semibold text-gray-900 mb-2">{tooltip.title}</h3>
          <p className="text-sm text-gray-600">{tooltip.description}</p>
        </div>
      )}

      {/* Legend - All Translated */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-blue-200 border border-blue-400 mr-2"></div>
          <span>{t('symptoms.bodyMap.tooltips.shoulder.title')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-emerald-200 border border-emerald-400 mr-2"></div>
          <span>{t('symptoms.bodyMap.tooltips.elbow.title')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-amber-200 border border-amber-400 mr-2"></div>
          <span>{t('symptoms.bodyMap.tooltips.wrist-hand.title')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-purple-200 border border-purple-400 mr-2"></div>
          <span>{t('symptoms.bodyMap.tooltips.hip.title')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-red-200 border border-red-400 mr-2"></div>
          <span>{t('symptoms.bodyMap.tooltips.knee.title')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-200 border border-green-400 mr-2"></div>
          <span>{t('symptoms.bodyMap.tooltips.foot-ankle.title')}</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBodyMap;