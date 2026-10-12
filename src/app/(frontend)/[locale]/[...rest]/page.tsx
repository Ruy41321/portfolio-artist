import { notFound } from 'next/navigation'

/** Any unknown path under /it or /en renders the themed 404 page. */
export default function CatchAll() {
  notFound()
}
