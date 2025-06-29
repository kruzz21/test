import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, User, Share2, BookOpen } from 'lucide-react';
import { getBlogPostBySlug, blogPosts, getRecentBlogPosts } from '../data/blogPosts';
import { formatDate } from '../utils/dateFormatter';
import BlogCard from '../components/blog/BlogCard';

const BlogPostPage = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const currentLang = i18n.language as 'az' | 'en' | 'tr';
  
  const post = useMemo(() => slug ? getBlogPostBySlug(slug) : undefined, [slug]);
  
  // Get related posts (same category, excluding current post)
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter(p => p.id !== post.id && p.category.id === post.category.id)
      .slice(0, 3);
  }, [post]);

  const recentPosts = useMemo(() => {
    return getRecentBlogPosts(5).filter(p => p.id !== post?.id);
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title[currentLang],
          text: post.excerpt[currentLang],
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Convert content to HTML with proper formatting
  const formatContent = (content: string) => {
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
      .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  };

  return (
    <>
      <Helmet>
        <title>{`${post.title[currentLang]} | ${t('meta.title')}`}</title>
        <meta name="description" content={post.excerpt[currentLang]} />
        <meta property="og:title" content={post.title[currentLang]} />
        <meta property="og:description" content={post.excerpt[currentLang]} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      {/* Featured Image Header */}
      <div 
        className="pt-24 pb-16 bg-cover bg-center text-white relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${post.image})`,
          minHeight: '60vh'
        }}
      >
        <div className="container h-full flex flex-col justify-end relative">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-white mb-6 hover:text-primary-200 transition-colors group"
          >
            <ChevronLeft size={20} className="mr-1 transition-transform group-hover:-translate-x-1" />
            {t('nav.blog')}
          </Link>
          
          <div className="max-w-4xl">
            <div className="mb-4">
              <span className="inline-block bg-primary-600 text-white text-xs font-semibold uppercase tracking-wider py-2 px-3 rounded-full shadow-lg">
                {post.category.name[currentLang]}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {post.title[currentLang]}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-200 gap-6 mb-4">
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <time dateTime={post.date}>
                  {formatDate(post.date, currentLang)}
                </time>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>
                  {post.readTime} {currentLang === 'en' ? 'min read' : currentLang === 'tr' ? 'dk okuma' : 'dəq oxuma'}
                </span>
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl">
              {post.excerpt[currentLang]}
            </p>
          </div>
        </div>
      </div>
      
      {/* Post Content */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="prose prose-lg prose-primary max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(post.content[currentLang]) }}
                />
              </article>
              
              {/* Share Button */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 font-medium">Share this article:</span>
                    <button
                      onClick={handleShare}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Share2 size={16} className="mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Author Bio */}
              <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    GE
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {post.author}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('home.hero.subtitle')} - 25+ yıllık deneyim ile ortopedi ve travmatoloji alanında uzman.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Table of Contents */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                    <BookOpen size={20} className="mr-2" />
                    Quick Navigation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <a href="#" className="block text-gray-600 hover:text-primary-600 transition-colors">
                      Overview
                    </a>
                    <a href="#" className="block text-gray-600 hover:text-primary-600 transition-colors">
                      Treatment Options
                    </a>
                    <a href="#" className="block text-gray-600 hover:text-primary-600 transition-colors">
                      Recovery Process
                    </a>
                  </div>
                </div>
                
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <Link
                          key={relatedPost.id}
                          to={`/blog/${relatedPost.slug}`}
                          className="block group"
                        >
                          <div className="flex space-x-3">
                            <img
                              src={relatedPost.image}
                              alt={relatedPost.title[currentLang]}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                                {relatedPost.title[currentLang]}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(relatedPost.date, currentLang)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recent Posts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('blog.recentPosts')}</h3>
                  <div className="space-y-4">
                    {recentPosts.slice(0, 4).map((recentPost) => (
                      <Link
                        key={recentPost.id}
                        to={`/blog/${recentPost.slug}`}
                        className="block group"
                      >
                        <div className="flex space-x-3">
                          <img
                            src={recentPost.image}
                            alt={recentPost.title[currentLang]}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                              {recentPost.title[currentLang]}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(recentPost.date, currentLang)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* CTA */}
                <div className="bg-primary-600 text-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">
                    {t('home.cta.title')}
                  </h3>
                  <p className="text-primary-100 mb-4 text-sm">
                    {t('home.cta.description')}
                  </p>
                  <Link 
                    to="/contact" 
                    className="btn bg-white text-primary-600 hover:bg-gray-100 w-full text-center"
                  >
                    {t('home.cta.button')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">More Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default BlogPostPage;