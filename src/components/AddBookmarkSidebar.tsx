'use client'

import { useState, useEffect } from 'react'
import { X, Link as LinkIcon, Tag, Folder, ChevronDown, Code, Palette, Book, Briefcase, GraduationCap, ShoppingBag, Newspaper, Users, Gamepad2 } from 'lucide-react'
import type { Bookmark } from '@/types'

// Category configuration with icons and colors
export const CATEGORIES = [
  { id: 'development', label: 'Development', icon: Code, color: 'text-blue-400' },
  { id: 'design', label: 'Design', icon: Palette, color: 'text-pink-400' },
  { id: 'reference', label: 'Reference', icon: Book, color: 'text-yellow-400' },
  { id: 'work', label: 'Work', icon: Briefcase, color: 'text-orange-400' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-green-400' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-purple-400' },
  { id: 'news', label: 'News', icon: Newspaper, color: 'text-red-400' },
  { id: 'social', label: 'Social', icon: Users, color: 'text-cyan-400' },
  { id: 'entertainment', label: 'Entertainment', icon: Gamepad2, color: 'text-indigo-400' },
  { id: 'other', label: 'Other', icon: Folder, color: 'text-slate-400' },
] as const

export const getCategoryConfig = (categoryId: string) => {
  return CATEGORIES.find(c => c.id === categoryId?.toLowerCase()) || CATEGORIES[CATEGORIES.length - 1]
}

interface AddBookmarkSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSave: (bookmark: { title: string; url: string; tags: string[]; category: string }) => void
  initialData?: Bookmark | null
}

export function AddBookmarkSidebar({ isOpen, onClose, onSave, initialData }: AddBookmarkSidebarProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('Other')

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title)
      setUrl(initialData.url)
      setTags(initialData.tags?.join(', ') || '')
      setCategory(initialData.category || 'Other')
    } else if (!isOpen) {
      setTitle('')
      setUrl('')
      setTags('')
      setCategory('Other')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!title.trim() || !url.trim()) {
      return
    }

    onSave({
      title: title.trim(),
      url: url.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      category,
    })
  }

  const selectedCategory = getCategoryConfig(category)
  const CategoryIcon = selectedCategory.icon

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-1">
                {initialData ? 'Edit Bookmark' : 'Add Bookmark'}
              </h2>
              <p className="text-sm text-slate-400">
                {initialData ? 'Update your bookmark details' : 'Save a new link to your collection'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all"
                placeholder="Enter bookmark title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all"
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, javascript, tutorial"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all"
              />
              <p className="text-xs text-slate-500 mt-2">Separate tags with commas</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-slate-100 transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <CategoryIcon className={`w-4 h-4 ${selectedCategory.color}`} />
                    {selectedCategory.label}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </button>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.label}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview Section */}
            {url && (
              <div className="pt-6 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Preview</h3>
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700/60 flex items-center justify-center flex-shrink-0 border border-slate-600/40">
                      <LinkIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-100 text-sm mb-1 truncate">
                        {title || 'Untitled'}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{url}</p>
                    </div>
                  </div>
                  {tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.split(',').filter(Boolean).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/40 text-slate-400 text-xs rounded-lg">
                      <CategoryIcon className={`w-3 h-3 ${selectedCategory.color}`} />
                      {selectedCategory.label}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-slate-900 pt-6 mt-8 border-t border-slate-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800/60 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium shadow-lg shadow-blue-600/20"
            >
              {initialData ? 'Update Bookmark' : 'Add Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
