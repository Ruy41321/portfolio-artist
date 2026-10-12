// Temporary placeholder: replaced by the themed one-page site in M4.
import Link from 'next/link'
export default function HomePage() {
  return (
    <main className="home">
      <h1>Portfolio</h1>
      <p>
        <Link href="/admin">Admin</Link>
      </p>
    </main>
  )
}
