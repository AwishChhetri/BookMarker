'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'
import type { Bookmark } from '@/types'
import { ProfileMenu } from './ProfileMenu'
import { BookmarkCard } from './BookmarkCard'
import { AddBookmarkSidebar, getCategoryConfig } from './AddBookmarkSidebar'
import { MobileMenu } from './MobileMenu'
import { BookmarkIcon, Search, Plus, Star, Clock, Folder, Menu } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import Swal from 'sweetalert2'

type ViewMode = 'all' | 'favorites' | 'recent'

interface DashboardProps {
  user: User
}

const FAVORITES_STORAGE_KEY = 'smart-bookmark-favorites'

export default function Dashboard({ user }: DashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (stored) {
      try {
        setFavoriteIds(new Set(JSON.parse(stored)))
      } catch (e) {
        console.error('Failed to parse favorites:', e)
      }
    }
  }, [])

  // Save favorites to localStorage
  const saveFavorites = (ids: Set<string>) => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(ids)))
  }

  const toggleFavorite = (bookmarkId: string) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId)
      } else {
        newSet.add(bookmarkId)
      }
      saveFavorites(newSet)
      return newSet
    })
  }

  const fetchBookmarks = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [user.id])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleSaveBookmark = async (bookmarkData: { title: string; url: string; tags: string[]; category: string }) => {
    const supabase = createClient()

    if (editingBookmark) {
      // Update existing bookmark
      const { error } = await supabase
        .from('bookmarks')
        .update({
          title: bookmarkData.title,
          url: bookmarkData.url,
          ...(bookmarkData.tags?.length > 0 && { tags: bookmarkData.tags }),
          ...(bookmarkData.category && { category: bookmarkData.category }),
        })
        .eq('id', editingBookmark.id)

      if (error) {
        console.error('Error updating bookmark:', error)
        toast.error(`Failed to update bookmark: ${error.message}`)
        return
      }

      Swal.fire({
        title: 'Updated!',
        text: 'Your bookmark has been updated.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
        background: '#1e293b',
        color: '#f1f5f9',
        timer: 2000,
        timerProgressBar: true,
      })
      setEditingBookmark(null)
      setIsSidebarOpen(false)
    } else {
      // Add new bookmark
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          title: bookmarkData.title,
          url: bookmarkData.url,
          ...(bookmarkData.tags?.length > 0 && { tags: bookmarkData.tags }),
          ...(bookmarkData.category && { category: bookmarkData.category }),
        })

      if (error) {
        console.error('Error adding bookmark:', error)
        toast.error(`Failed to add bookmark: ${error.message}`)
        return
      }

      Swal.fire({
        title: 'Added!',
        text: 'Your bookmark has been added.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
        background: '#1e293b',
        color: '#f1f5f9',
        timer: 2000,
        timerProgressBar: true,
      })
      setIsSidebarOpen(false)
    }

    fetchBookmarks()
  }

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setIsSidebarOpen(true)
  }

  const handleDeleteBookmark = async (bookmark: Bookmark) => {
    const result = await Swal.fire({
      title: 'Delete Bookmark?',
      html: `<p class="text-slate-400">Are you sure you want to delete</p><p class="text-white font-semibold">"${bookmark.title}"</p>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#1e293b',
      color: '#f1f5f9',
    })

    if (!result.isConfirmed) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmark.id)

      if (error) throw error
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id))

      // Remove from favorites if exists
      if (favoriteIds.has(bookmark.id)) {
        const newFavorites = new Set(favoriteIds)
        newFavorites.delete(bookmark.id)
        setFavoriteIds(newFavorites)
        saveFavorites(newFavorites)
      }

      Swal.fire({
        title: 'Deleted!',
        text: 'Your bookmark has been deleted.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
        background: '#1e293b',
        color: '#f1f5f9',
        timer: 2000,
        timerProgressBar: true,
      })
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast.error('Failed to delete bookmark')
    }
  }

  const handleOpenAddSidebar = () => {
    setEditingBookmark(null)
    setIsSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
    setEditingBookmark(null)
  }

  // Get unique categories from bookmarks
  const categories: string[] = ['All', ...Array.from(new Set(bookmarks.map(b => b.category).filter((c): c is string => Boolean(c))))]

  // Get category count
  const getCategoryCount = (category: string) => {
    if (category === 'All') return bookmarks.length
    return bookmarks.filter(b => b.category === category).length
  }

  // Get view mode display info
  const getViewModeInfo = () => {
    switch (viewMode) {
      case 'favorites':
        return { title: 'Favorites', icon: Star, count: favoriteIds.size }
      case 'recent':
        return { title: 'Recent', icon: Clock, count: Math.min(10, bookmarks.length) }
      default:
        return { title: 'All Bookmarks', icon: BookmarkIcon, count: bookmarks.length }
    }
  }

  // Filter bookmarks based on view mode, search and category
  const filteredBookmarks = bookmarks.filter(bookmark => {
    // Filter by view mode
    if (viewMode === 'favorites' && !favoriteIds.has(bookmark.id)) {
      return false
    }
    if (viewMode === 'recent') {
      const recentIds = bookmarks.slice(0, 10).map(b => b.id)
      if (!recentIds.includes(bookmark.id)) {
        return false
      }
    }

    // Filter by search
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      bookmark.category?.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by category
    const matchesCategory = selectedCategory === 'All' || bookmark.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const viewModeInfo = getViewModeInfo()

  return (
    <div className="min-h-screen bg-slate-950">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-slate-900/60 border-r border-slate-800/60 p-5 hidden lg:block">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-600/20">
              <BookmarkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg">Smart Bookmark</h2>
            </div>
          </div>

          <nav className="space-y-1.5 mb-8">
            <button
              onClick={() => {
                setViewMode('all')
                setSelectedCategory('All')
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
                {bookmarks.length}
              </span>
            </button>
            <button
              onClick={() => {
                setViewMode('favorites')
                setSelectedCategory('All')
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                viewMode === 'favorites'
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Star className={`w-5 h-5 ${viewMode === 'favorites' ? 'fill-current' : ''}`} />
              <span className="flex-1 text-left">Favorites</span>
              {favoriteIds.size > 0 && (
                <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-lg">
                  {favoriteIds.size}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setViewMode('recent')
                setSelectedCategory('All')
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                viewMode === 'recent'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="flex-1 text-left">Recent</span>
              <span className="text-xs text-slate-500">{Math.min(10, bookmarks.length)}</span>
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
                      setSelectedCategory(category)
                      setViewMode('all')
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
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <header className="bg-slate-900/60 border-b border-slate-800/60 px-6 py-4 sticky top-0 z-30 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex-1 max-w-2xl relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all"
                />
              </div>

              <button
                onClick={handleOpenAddSidebar}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Bookmark</span>
              </button>

              <ProfileMenu user={user} onLogout={handleLogout} />
            </div>
          </header>

          <div className="p-6 lg:p-8">
            {/* Mobile category filter */}
            <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
              {/* View mode buttons for mobile */}
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm flex items-center gap-1.5 ${
                  viewMode === 'all'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                <BookmarkIcon className="w-4 h-4" />
                All
              </button>
              <button
                onClick={() => setViewMode('favorites')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm flex items-center gap-1.5 ${
                  viewMode === 'favorites'
                    ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                <Star className={`w-4 h-4 ${viewMode === 'favorites' ? 'fill-current' : ''}`} />
                Favorites
              </button>
              <button
                onClick={() => setViewMode('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm flex items-center gap-1.5 ${
                  viewMode === 'recent'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Recent
              </button>
              <div className="w-px bg-slate-700 mx-1"></div>
              {categories.filter(c => c !== 'All').map((category) => {
                const catConfig = getCategoryConfig(category)
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setViewMode('all')
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                      selectedCategory === category && viewMode === 'all'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    {catConfig?.label || category}
                  </button>
                )
              })}
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-100 mb-1">
                {viewMode === 'all' && selectedCategory !== 'All'
                  ? (getCategoryConfig(selectedCategory)?.label || selectedCategory)
                  : viewModeInfo.title}
              </h1>
              <p className="text-slate-400 text-sm">
                {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onEdit={handleEditBookmark}
                    onDelete={handleDeleteBookmark}
                    onToggleFavorite={() => toggleFavorite(bookmark.id)}
                    isFavorite={favoriteIds.has(bookmark.id)}
                  />
                ))}
              </div>
            )}

            {!loading && filteredBookmarks.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex p-6 bg-slate-800/40 rounded-2xl mb-4">
                  {viewMode === 'favorites' ? (
                    <Star className="w-16 h-16 text-slate-600" />
                  ) : (
                    <Search className="w-16 h-16 text-slate-600" />
                  )}
                </div>
                <p className="text-slate-400 text-xl font-medium mb-1">
                  {viewMode === 'favorites' ? 'No favorites yet' : 'No bookmarks found'}
                </p>
                <p className="text-slate-500 text-sm">
                  {viewMode === 'favorites'
                    ? 'Click the star icon on bookmarks to add them to favorites'
                    : 'Try adjusting your search or filters'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Bookmark Sidebar */}
      <AddBookmarkSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onSave={handleSaveBookmark}
        initialData={editingBookmark}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat)
          setViewMode('all')
        }}
        bookmarksCount={bookmarks.length}
        getCategoryCount={getCategoryCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        favoritesCount={favoriteIds.size}
      />
    </div>
  )
}
