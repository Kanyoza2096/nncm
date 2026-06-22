import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types';
import { blogService } from '../../services/blog';
import { getImageUrl } from '../../lib/image-utils';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const fetched = await blogService.getBlogPosts(true);
        setPosts(fetched);
      } catch (err) {
        console.error("Critical failure during blog fetch:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
      <div className="text-center mb-16">
        <span className="text-xs font-black text-indigo-600 tracking-widest uppercase">Church Narratives</span>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 mt-1">Impact News & Updates</h1>
      </div>
      
      {loading ? (
        <div className="mt-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group">
              <div 
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full"
              >
                <div className="h-52 bg-slate-100 relative overflow-hidden">
                  <img src={getImageUrl(post.featuredImage) || 'https://images.unsplash.com/photo-1469571486090-e5996073efed?auto=format&fit=crop&w=600&q=80'} alt={post.title} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-md text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                      {post.category || 'Discipleship'}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{post.title}</h3>
                  <p className="mt-3 text-slate-500 text-xs font-light line-clamp-3 leading-relaxed flex-1">{post.excerpt}</p>
                  
                  <div className="mt-6 flex items-center justify-between text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                    <span>Read Narrative</span>
                    <span className="text-lg">&rarr;</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <p className="text-slate-400 font-medium italic text-sm">No impact narratives have been published to the portal yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
