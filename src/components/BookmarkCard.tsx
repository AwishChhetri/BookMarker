'use client'

import { Pencil, Trash2, ExternalLink, Globe, Star } from 'lucide-react'
import type { Bookmark } from '@/types'
import { getCategoryConfig } from './AddBookmarkSidebar'

interface BookmarkCardProps {
  bookmark: Bookmark
  onEdit: (bookmark: Bookmark) => void
  onDelete: (bookmark: Bookmark) => void
  onToggleFavorite: () => void
  isFavorite: boolean
}

export function BookmarkCard({ bookmark, onEdit, onDelete, onToggleFavorite, isFavorite }: BookmarkCardProps) {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return ''
    }
  }

  const categoryConfig = getCategoryConfig(bookmark.category || '')
  const CategoryIcon = categoryConfig.icon

  return (
    <div className="group relative bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 hover:bg-slate-800/80 hover:border-slate-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-600/40">
          <img
            src={getFavicon(bookmark.url)}
            alt=""
            className="w-7 h-7"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2" /></svg>';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 text-base mb-1.5 truncate group-hover:text-white transition-colors leading-snug">
            {bookmark.title}
          </h3>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 group/link"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{getDomain(bookmark.url)}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className={`p-2 rounded-lg transition-all ${
              isFavorite
                ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-700/60'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(bookmark)
            }}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/60 rounded-lg transition-all"
            aria-label="Edit bookmark"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(bookmark)
            }}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-all"
            aria-label="Delete bookmark"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Always visible favorite indicator when favorited */}
        {isFavorite && (
          <div className="absolute top-3 right-3 opacity-100 group-hover:opacity-0 transition-opacity">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        )}
      </div>

      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {bookmark.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {bookmark.category && (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/40 text-slate-400 text-xs rounded-lg border border-slate-600/30">
            <CategoryIcon className={`w-3 h-3 ${categoryConfig.color}`} />
            {categoryConfig.label}
          </span>
        </div>
      )}
    </div>
  )
}
