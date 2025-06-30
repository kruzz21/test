import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, User, Share2, BookOpen, MessageCircle, Instagram, Facebook } from 'lucide-react';
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

  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(post.title[currentLang]);
  const encodedText = encodeURIComponent(post.excerpt[currentLang]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title[currentLang],
          text: post.excerpt[currentLang],
          url: currentUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentUrl);
      alert('Link copied to clipboard!');
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    instagram: 'https://www.instagram.com/uzmantravmatolojiortoped'
  };

  // Convert content to HTML with improved formatting
  const formatContent = (content: string) => {
    return content
      .replace(/\n\n/g, '</p><p class="mb-6 text-gray-700 leading-relaxed">')
      .replace(/\n/g, '<br />')
      .replace(/^/, '<p class="mb-6 text-gray-700 leading-relaxed">')
      .replace(/$/, '</p>')
      .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-2xl font-semibold mt-10 mb-6 text-gray-900 border-l-4 border-primary-500 pl-4">$1</h2>')
      .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-xl font-medium mt-8 mb-4 text-gray-800">$1</h3>')
      .replace(/#### (.*?)(?=\n|$)/g, '<h4 class="text-lg font-medium mt-6 mb-3 text-gray-800">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/- (.*?)(?=\n|$)/g, '<li class="mb-2 text-gray-700">$1</li>')
      .replace(/(<li.*?<\/li>)/g, '<ul class="list-disc list-inside mb-6 space-y-2">$1</ul>')
      .replace(/(<ul.*?<\/ul>)(\s*<ul.*?<\/ul>)/g, '$1$2'); // Merge consecutive lists
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
        <meta property="og:url" content={currentUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title[currentLang]} />
        <meta name="twitter:description" content={post.excerpt[currentLang]} />
        <meta name="twitter:image" content={post.image} />
        <meta name="author" content={post.author} />
        <meta name="article:published_time" content={post.date} />
        <meta name="article:author" content={post.author} />
        <meta name="article:section" content={post.category.name[currentLang]} />
        <link rel="canonical" href={currentUrl} />
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
              <span className="inline-block bg-primary-600 text-white text-xs font-semibold uppercase tracking-wider py-2 px-4 rounded-full shadow-lg">
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
              <article className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(post.content[currentLang]) }}
                />
              </article>
              
              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleShare}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Share2 size={16} className="mr-2" />
                      Share
                    </button>
                    
                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle size={16} className="mr-2" />
                      WhatsApp
                    </a>
                    
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Facebook size={16} className="mr-2" />
                      Facebook
                    </a>
                    
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Twitter
                    </a>
                    
                    <a
                      href={shareLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                    
                    <a
                      href={shareLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <Instagram size={16} className="mr-2" />
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Author Bio */}
              <div className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    GE
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {post.author}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {currentLang === 'en' 
                        ? 'Orthopedics and Traumatology Specialist with 25+ years of experience in arthroscopic surgery, joint replacements, and pediatric orthopedics. Specializes in minimally invasive techniques and patient-centered care.'
                        : currentLang === 'tr'
                        ? 'Artroskopik cerrahi, eklem replasmanları ve pediatrik ortopedi alanında 25+ yıllık deneyime sahip Ortopedi ve Travmatoloji Uzmanı. Minimal invaziv teknikler ve hasta odaklı bakım konusunda uzmanlaşmıştır.'
                        : 'Artroskopik cərrahiyyə, oynaq əvəzlənməsi və pediatrik ortopediya sahəsində 25+ illik təcrübəyə malik Ortopediya və Travmatologiya mütəxəssisi. Minimal invaziv texnikalar və xəstə mərkəzli qayğı sahəsində ixtisaslaşmışdır.'
                      }
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
                    <a href="#overview" className="block text-gray-600 hover:text-primary-600 transition-colors">
                      Overview
                    </a>
                    <a href="#procedure" className="block text-gray-600 hover:text-primary-600 transition-colors">
                      Surgical Procedure
                    </a>
                    <a href="#recovery" className="block text-gray-600 hover:text-primary-600 transition-colors">
                      Recovery Process
                    </a>
                    <a href="#outcomes" className="block text-gray-600 hover:text-primary-600 transition-colors">
                      Expected Outcomes
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