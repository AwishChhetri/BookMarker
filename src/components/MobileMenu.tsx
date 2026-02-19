'use client'

import { X, BookmarkIcon, Star, Clock, Folder } from 'lucide-react'
import { getCategoryConfig } from './AddBookmarkSidebar'

type ViewMode = 'all' | 'favorites' | 'recent'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  selectedCategory: string
  onCategorySelect: (category: string) => void
  bookmarksCount: number
  getCategoryCount: (category: string) => number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  favoritesCount: number
}

export function MobileMenu({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategorySelect,
  bookmarksCount,
  getCategoryCount,
  viewMode,
  onViewModeChange,
  favoritesCount,
}: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200 lg:hidden"
        onClick={onClose}
      ></div>

      {/* Mobile Menu */}
      <div className="fixed left-0 top-0 bottom-0 w-[280px] bg-slate-900 border-r border-slate-800 shadow-2xl z-50 animate-in slide-in-from-left duration-300 lg:hidden overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-600/20">
                <BookmarkIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-bold text-slate-100 text-lg">Smart Bookmark</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5 mb-8">
            <button
              onClick={() => {
                onViewModeChange('all')
                onCategorySelect('All')
                onClose()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                viewMode === 'all'
                  ? 'bg-slate-800/60 text-slate-200 border border-slate-700/50'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <BookmarkIcon className="w-5 h-5" />
              <span className="flex-1 text-left">All Bookmarks</span>
              <span className="text-xs bg-slate-700/60 px-2 py-1 rounded-lg">
                {bookmarksCount}
              </span>
            </button>
            <button
              onClick={() => {
                onViewModeChange('favorites')
                onClose()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                viewMode === 'favorites'
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Star className={`w-5 h-5 ${viewMode === 'favorites' ? 'fill-current' : ''}`} />
              <span className="flex-1 text-left">Favorites</span>
              {favoritesCount > 0 && (
                <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-lg">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onViewModeChange('recent')
                onClose()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                viewMode === 'recent'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="flex-1 text-left">Recent</span>
              <span className="text-xs text-slate-500">{Math.min(10, bookmarksCount)}</span>
            </button>
          </nav>

          <div className="pt-5 border-t border-slate-800/60">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Categories
              </h3>
            </div>
            <div className="space-y-1">
              {categories.map((category) => {
                const catConfig = category !== 'All' ? getCategoryConfig(category) : null
                const CatIcon = catConfig?.icon || Folder
                return (
                  <button
                    key={category}
                    onClick={() => {
                      onCategorySelect(category)
                      onViewModeChange('all')
                      onClose()
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                      selectedCategory === category && viewMode === 'all'
                        ? 'bg-slate-800/60 text-slate-200 font-medium border border-slate-700/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CatIcon className={`w-4 h-4 ${catConfig?.color || 'text-slate-400'}`} />
                      <span>{catConfig?.label || category}</span>
                    </div>
                    <span className="text-xs text-slate-500">{getCategoryCount(category)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
