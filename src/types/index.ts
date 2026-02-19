export interface Bookmark {
  id: string
  user_id: string
  title: string
  url: string
  tags?: string[]
  category?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}
