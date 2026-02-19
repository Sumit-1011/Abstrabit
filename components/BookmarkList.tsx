'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

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
            // Get the user's session and set the JWT on the Realtime connection
            // Without this, auth.uid() returns NULL during RLS checks for INSERT events
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

        // Keep the Realtime token fresh when auth state changes
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

    if (loading) return <p className="text-zinc-500">Loading bookmarks...</p>

    if (bookmarks.length === 0)
        return <p className="text-zinc-500">No bookmarks yet. Add one above!</p>

    return (
        <ul className="flex flex-col gap-3">
            {bookmarks.map((bookmark) => (
                <li
                    key={bookmark.id}
                    className="flex items-center justify-between border rounded-lg px-4 py-3"
                >
                    <div>
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                        >
                            {bookmark.title}
                        </a>
                        <p className="text-sm text-zinc-500">{bookmark.url}</p>
                    </div>
                    <button
                        onClick={() => handleDelete(bookmark.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                    >
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    )
}
