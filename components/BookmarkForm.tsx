'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function BookmarkForm({ onBookmarkAdded }: { onBookmarkAdded?: () => void }) {
    const supabase = createClient()
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            await supabase.from('bookmarks').insert({
                url,
                title,
                user_id: user.id,
            })
            setUrl('')
            setTitle('')
            onBookmarkAdded?.()
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8">
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded-lg px-4 py-2"
                required
            />
            <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border rounded-lg px-4 py-2"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
            >
                {loading ? 'Adding...' : 'Add Bookmark'}
            </button>
        </form>
    )
}
