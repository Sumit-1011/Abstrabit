'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Plus, Link, Type } from 'lucide-react'

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
        <div
            className="mb-8 rounded-2xl p-6 shadow-sm"
            style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
            }}
        >
            <h2 className="mb-4 text-lg font-semibold">Add a Bookmark</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                    <Type
                        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: 'var(--muted)' }}
                    />
                    <input
                        type="text"
                        placeholder="Bookmark title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2"
                        style={{
                            background: 'var(--background)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--foreground)',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
                        required
                    />
                </div>
                <div className="relative">
                    <Link
                        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: 'var(--muted)' }}
                    />
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2"
                        style={{
                            background: 'var(--background)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--foreground)',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                    style={{ background: 'var(--accent)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                >
                    <Plus className="h-5 w-5" />
                    {loading ? 'Adding...' : 'Add Bookmark'}
                </button>
            </form>
        </div>
    )
}
