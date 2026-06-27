import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, BookOpen } from 'lucide-react';
import { BlogPost } from '../../types';
import Markdown from 'react-markdown';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { blogService } from '../../services/blog';
import { getImageUrl } from '../../lib/image-utils';

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        const fetched = await blogService.getBlogPostById(id);
        setPost(fetched);
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  useDocumentMeta({
    title: post?.title || 'Article Detail',
    description: post?.summary || post?.content?.slice(0, 150) || 'Read our latest blog post.',
    ogTitle: post ? `${post.title} - New Nature In Christ Ministry` : undefined,
    ogDescription: post?.summary || post?.content?.slice(0, 150) || 'Read our latest blog post.',
    ogImage: post?.featuredImage ? getImageUrl(post.featuredImage) : undefined,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-slate-900">Narrative Not Found</h1>
        <Link to="/blog" className="text-indigo-600 mt-4 inline-block font-bold hover:underline">Return to index</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/blog" className="inline-flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-10 group transition-all">
          <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Articles
        </Link>
        
        <div className="mb-12">
          <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">{post.category || 'Impact Report'}</span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">{post.title}</h1>
          <div className="flex items-center gap-6 mt-8 font-black text-[9px] uppercase tracking-widest text-slate-400">
            <div className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              {post.authorName || 'Administrator'}
            </div>
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {post.featuredImage && (
          <div className="w-full aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-slate-100">
             <img src={getImageUrl(post.featuredImage) || 'https://images.unsplash.com/photo-1469571486090-e5996073efed?auto=format&fit=crop&w=800&q=80'} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="prose prose-slate max-w-none prose-sm sm:prose-base prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600 prose-img:rounded-3xl">
          <div className="markdown-body select-text">
            <Markdown>{post.content}</Markdown>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center font-black text-indigo-600 border border-indigo-100">
                 {post.authorName?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">About author</p>
                <p className="font-bold text-slate-900 text-sm">{post.authorName || 'NNCM Administrator'}</p>
              </div>
           </div>
           <Link to="/give" className="px-6 py-3 bg-[#020617] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Support this work
           </Link>
        </div>
      </div>
    </div>
  );
}
