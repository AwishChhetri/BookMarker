'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Plus, X, Link as LinkIcon, Type } from 'lucide-react'

interface BookmarkFormProps {
  userId: string
  onBookmarkAdded: () => void
}

export default function BookmarkForm({ userId, onBookmarkAdded }: BookmarkFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      setError('Please fill in all fields')
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          title: title.trim(),
          url: url.trim(),
        })

      if (insertError) throw insertError

      setTitle('')
      setUrl('')
      setIsOpen(false)
      onBookmarkAdded()
    } catch (err) {
      setError('Failed to add bookmark. Please try again.')
      console.error('Error adding bookmark:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Bookmark
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Add New Bookmark</h2>
        <button
          onClick={() => {
            setIsOpen(false)
            setError('')
            setTitle('')
            setUrl('')
          }}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Type className="w-4 h-4 inline mr-1" />
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My awesome bookmark"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <LinkIcon className="w-4 h-4 inline mr-1" />
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Bookmark'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setError('')
              setTitle('')
              setUrl('')
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
