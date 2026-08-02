// pages/admin/blog.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Edit2, Trash2, Save, X, Loader2, FileText, Eye } from 'lucide-react'
import { blogService } from '@/services/blog'
import type { BlogPost } from '@/types'
import { toast } from 'sonner'
import NativeFileUpload from '@/components/NativeFileUpload'
import { getImageUrl } from '@/lib/image-utils'

interface BlogForm {
  title: string; excerpt: string; content: string; category: string
  featuredImage: string; published: boolean; authorName: string
}

const EMPTY_FORM: BlogForm = {
  title: '', excerpt: '', content: '', category: 'Discipleship',
  featuredImage: '', published: false, authorName: 'NNCM Administrator'
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState<BlogForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try { setPosts(await blogService.getBlogPosts()) }
    catch { toast.error('Failed to load blog posts.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  )

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title, excerpt: post.excerpt || '', content: post.content || '',
      category: post.category || '', featuredImage: post.featuredImage || '',
      published: post.published ?? false, authorName: post.authorName || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) { toast.error('Title and content required.'); return }
    setSubmitting(true)
    try {
      if (editingPost) {
        await blogService.updateBlogPost(editingPost.id, formData)
        toast.success('Post updated.')
      } else {
        await blogService.createBlogPost(formData)
        toast.success('Post published.')
      }
      setShowForm(false); setEditingPost(null); setFormData(EMPTY_FORM); fetchPosts()
    } catch { toast.error('Failed to save post.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return
    try { await blogService.deleteBlogPost(post.id); toast.success('Post deleted.'); fetchPosts() }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <>
      <Head><title>Blog — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Blog Posts</h1>
            <p className="text-slate-500 text-sm mt-1">{posts.filter(p => p.published).length} published, {posts.length} total.</p>
          </div>
          <button onClick={() => { setEditingPost(null); setFormData(EMPTY_FORM); setShowForm(true) }} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> New Post
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="blog-search" className="sr-only">Search posts</label>
              <input id="blog-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or category..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Post</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading posts...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No posts found.</td></tr>
                ) : (
                  filtered.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            {post.featuredImage ? <img src={getImageUrl(post.featuredImage)} alt="" className="w-full h-full object-cover" /> : <FileText className="w-5 h-5 m-2.5 text-slate-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{post.title}</p>
                            <p className="text-[10px] text-slate-400">{post.authorName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{post.category || '—'}</span></td>
                      <td className="px-6 py-5"><span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${post.published ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{post.published ? 'Published' : 'Draft'}</span></td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono">{post.publishedAt ? new Date(Number(post.publishedAt)).toLocaleDateString() : '—'}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(post)} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label={`Edit ${post.title}`}><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(post)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400" aria-label={`Delete ${post.title}`}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editingPost ? 'Edit post' : 'New post'}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-extrabold text-slate-900 text-lg">{editingPost ? 'Edit Post' : 'New Post'}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-4" noValidate>
                  <div>
                    <label htmlFor="blog-title" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Title *</label>
                    <input id="blog-title" type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label htmlFor="blog-excerpt" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Excerpt</label>
                    <textarea id="blog-excerpt" rows={2} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label htmlFor="blog-content" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Content (Markdown) *</label>
                    <textarea id="blog-content" rows={8} required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="blog-category" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Category</label>
                      <input id="blog-category" type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="blog-author" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Author</label>
                      <input id="blog-author" type="text" value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input id="blog-published" type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                      <label htmlFor="blog-published" className="text-xs font-bold text-slate-600">Published</label>
                    </div>
                    <NativeFileUpload buttonText="Featured Image" acceptTypes="image/*" folder="blog" onUpload={(url: string) => setFormData({...formData, featuredImage: url})} />
                  </div>
                  {formData.featuredImage && <p className="text-[10px] text-slate-400 font-mono truncate">{formData.featuredImage}</p>}
                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
