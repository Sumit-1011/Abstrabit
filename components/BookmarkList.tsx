'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Globe, Trash2, BookmarkX, Loader2 } from 'lucide-react'

interface Bookmark {
    id: string
    title: string
    url: string
    created_at: string
}

export default function BookmarkList({ refreshKey }: { refreshKey?: number }) {
    const [supabase] = useState(() => createClient())
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBookmarks = async () => {
            const { data } = await supabase
                .from('bookmarks')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setBookmarks(data)
            setLoading(false)
        }

        fetchBookmarks()
    }, [refreshKey])

    // Realtime subscription with proper auth token
    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null

        const setupRealtime = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.access_token) {
                supabase.realtime.setAuth(session.access_token)
            }

            channel = supabase
                .channel('bookmarks-realtime')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'bookmarks' },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            const newBookmark = payload.new as Bookmark
                            setBookmarks((prev) => {
                                if (prev.some((b) => b.id === newBookmark.id)) return prev
                                return [newBookmark, ...prev]
                            })
                        }

                        if (payload.eventType === 'DELETE') {
                            setBookmarks((prev) =>
                                prev.filter((b) => b.id !== (payload.old as Bookmark).id)
                            )
                        }
                    }
                )
                .subscribe()
        }

        setupRealtime()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.access_token) {
                    supabase.realtime.setAuth(session.access_token)
                }
            }
        )

        return () => {
            if (channel) supabase.removeChannel(channel)
            subscription.unsubscribe()
        }
    }, [supabase])

    const handleDelete = async (id: string) => {
        await supabase.from('bookmarks').delete().eq('id', id)
        setBookmarks(bookmarks.filter((b) => b.id !== id))
    }

    // Extract domain from URL for display
    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname
        } catch {
            return url
        }
    }

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2
                    className="h-6 w-6 animate-spin"
                    style={{ color: 'var(--accent)' }}
                />
                <span className="ml-3 text-sm" style={{ color: 'var(--muted)' }}>
                    Loading bookmarks...
                </span>
            </div>
        )
    }

    if (bookmarks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: 'var(--accent-light)' }}
                >
                    <BookmarkX className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                </div>
                <p className="mb-1 font-semibold">No bookmarks yet</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Add your first bookmark above to get started!
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {bookmarks.map((bookmark) => (
                <div
                    key={bookmark.id}
                    className="group flex items-center gap-4 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{
                        background: 'var(--card)',
                        border: '1px solid var(--card-border)',
                    }}
                >
                    {/* Icon */}
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'var(--accent-light)' }}
                    >
                        <Globe className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate font-medium transition-colors hover:underline"
                            style={{ color: 'var(--foreground)' }}
                        >
                            {bookmark.title}
                        </a>
                        <div className="mt-0.5 flex items-center gap-2">
                            <span
                                className="truncate text-xs"
                                style={{ color: 'var(--muted)' }}
                            >
                                {getDomain(bookmark.url)}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--card-border)' }}>
                                •
                            </span>
                            <span
                                className="shrink-0 text-xs"
                                style={{ color: 'var(--muted)' }}
                            >
                                {formatDate(bookmark.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => handleDelete(bookmark.id)}
                        className="shrink-0 rounded-lg p-2 opacity-0 transition-all group-hover:opacity-100 hover:scale-110 active:scale-95"
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        title="Delete bookmark"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}
