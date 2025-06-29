import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bone, 
  Activity, 
  Hand, 
  Heart, 
  Zap, 
  Baby,
  ChevronRight 
} from 'lucide-react';

const CategorySidebar = memo(() => {
  const { t } = useTranslation();
  const location = useLocation();

  const categories = [
    {
      id: 'shoulder-pain',
      title: t('symptoms.shoulder.title'),
      path: '/symptoms/shoulder-pain',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'elbow-conditions',
      title: t('symptoms.elbow.title'),
      path: '/symptoms/elbow-conditions',
      icon: Zap,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'wrist-hand',
      title: t('symptoms.wristHand.title'),
      path: '/symptoms/wrist-hand',
      icon: Hand,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      id: 'hip-problems',
      title: t('symptoms.hip.title'),
      path: '/symptoms/hip-problems',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'knee-conditions',
      title: t('symptoms.knee.title'),
      path: '/symptoms/knee-conditions',
      icon: Bone,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'foot-ankle',
      title: t('symptoms.footAnkle.title'),
      path: '/symptoms/foot-ankle',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'pediatric-orthopedics',
      title: t('symptoms.pediatric.title'),
      path: '/symptoms/pediatric-orthopedics',
      icon: Baby,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        {t('symptoms.categories.title')}
      </h3>
      
      <div className="space-y-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = location.pathname === category.path;
          
          return (
            <Link
              key={category.id}
              to={category.path}
              className={`
                flex items-center justify-between p-4 rounded-lg border transition-all duration-200 group hover:shadow-sm
                ${isActive 
                  ? `${category.bgColor} ${category.borderColor} ${category.color} shadow-sm` 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  size={20} 
                  className={isActive ? category.color : 'text-gray-500 group-hover:text-gray-700'} 
                />
                <span className={`font-medium text-sm ${isActive ? category.color : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {category.title}
                </span>
              </div>
              <ChevronRight 
                size={16} 
                className={`transition-transform duration-200 ${isActive ? `${category.color} transform rotate-90` : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'}`} 
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
});

CategorySidebar.displayName = 'CategorySidebar';

export default CategorySidebar;