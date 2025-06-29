import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import { getRecentBlogPosts } from '../../data/blogPosts';
import BlogCard from '../blog/BlogCard';

const BlogSection = memo(() => {
  const { t } = useTranslation();
  
  // Get recent posts with performance optimization
  const recentPosts = getRecentBlogPosts(3);

  return (
    <section className="section bg-gray-50">
      <div className="container">
        <SectionHeading 
          title={t('home.blog.title')}
          centered={true}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map((post, index) => (
            <BlogCard 
              key={post.id} 
              post={post} 
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            to="/blog" 
            className="btn btn-outline inline-flex items-center hover:bg-primary-600 hover:text-white transition-all duration-300"
          >
            {t('home.blog.viewAll')}
            <ChevronRight size={20} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
});

BlogSection.displayName = 'BlogSection';

export default BlogSection;