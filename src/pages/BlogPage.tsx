import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import BlogCard from '../components/blog/BlogCard';
import { blogPosts, categories } from '../data/blogPosts';

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'az' | 'en' | 'tr';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Filter blog posts based on search query and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title[currentLang].toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt[currentLang].toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>{`${t('nav.blog')} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('blog.title')}</h1>
          <p className="text-xl text-primary-100">{t('blog.subtitle')}</p>
        </div>
      </div>
      
      {/* Blog Content */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Search Bar for Mobile */}
              <div className="mb-8 lg:hidden">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('blog.searchPlaceholder')}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>
              
              {/* Featured Post */}
              {filteredPosts.length > 0 && (
                <div className="mb-10">
                  <BlogCard post={filteredPosts[0]} featured />
                </div>
              )}
              
              {/* Blog Posts Grid */}
              {filteredPosts.length > 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredPosts.slice(1).map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                )
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Search Bar */}
              <div className="hidden lg:block mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('blog.searchPlaceholder')}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>
              
              {/* Categories */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">{t('blog.categories')}</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                        selectedCategory === null
                          ? 'bg-primary-50 text-primary-600'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name[currentLang]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recent Posts */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">{t('blog.recentPosts')}</h3>
                <ul className="space-y-4">
                  {blogPosts.slice(0, 5).map((post) => (
                    <li key={post.id} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <a 
                        href={`/blog/${post.slug}`}
                        className="flex items-start group"
                      >
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-4">
                          <img 
                            src={post.image} 
                            alt={post.title[currentLang]}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {post.title[currentLang]}
                          </h4>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;