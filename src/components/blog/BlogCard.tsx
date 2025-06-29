import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { BlogPost } from '../../data/blogPosts';
import { formatDate } from '../../utils/dateFormatter';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'az' | 'en' | 'tr';
  
  return (
    <article 
      className={`bg-white rounded-lg shadow-sm overflow-hidden group ${
        featured ? 'md:col-span-2' : ''
      }`}
      data-aos="fade-up"
    >
      <div className="relative">
        <Link to={`/blog/${post.slug}`}>
          <img 
            src={post.image} 
            alt={post.title[currentLang]} 
            className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        <div className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-semibold uppercase tracking-wider py-1 px-2 rounded">
          {post.category.name[currentLang]}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <div className="flex items-center mr-4">
            <Calendar size={16} className="mr-1" />
            {formatDate(post.date, currentLang)}
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            {post.readTime} {currentLang === 'en' ? 'min read' : currentLang === 'tr' ? 'dk okuma' : 'dəq oxuma'}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          <Link to={`/blog/${post.slug}`} className="hover:text-primary-600 transition-colors">
            {post.title[currentLang]}
          </Link>
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt[currentLang]}
        </p>
        
        <Link 
          to={`/blog/${post.slug}`}
          className="text-primary-600 font-medium inline-flex items-center hover:text-primary-700"
        >
          {t('home.blog.readMore')}
          <span className="ml-1">→</span>
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;