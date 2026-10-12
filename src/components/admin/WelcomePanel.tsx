import type { ServerProps } from 'payload'

import { pick } from './text'
import './admin.scss'

/** Dashboard header: greeting with the artist's name and big shortcuts to common tasks. */
export default async function WelcomePanel({ payload, i18n }: ServerProps) {
  const lang = i18n?.language
  const adminRoute = payload.config.routes.admin

  const [profile, unread, uncategorized, drafts] = await Promise.all([
    payload.findGlobal({ slug: 'profile', depth: 0 }),
    payload.count({ collection: 'messages', where: { read: { not_equals: true } } }),
    payload.count({ collection: 'artworks', where: { category: { exists: false } } }),
    payload.count({ collection: 'artworks', where: { _status: { equals: 'draft' } } }),
  ])

  const firstName = profile?.name?.split(' ')[0]
  const unreadCount = unread.totalDocs

  const actions = [
    {
      href: `${adminRoute}/collections/artworks/create`,
      label: pick(lang, { it: 'Aggiungi opera', en: 'Add artwork' }),
      hint: pick(lang, { it: 'Foto, titolo e descrizione', en: 'Photos, title and description' }),
      primary: true,
    },
    {
      href: `${adminRoute}/collections/media`,
      label: pick(lang, { it: 'Carica più immagini', en: 'Upload many images' }),
      hint: pick(lang, {
        it: 'Trascina tante foto insieme',
        en: 'Drop several photos at once',
      }),
    },
    {
      href: `${adminRoute}/globals/profile`,
      label: pick(lang, { it: 'Modifica profilo', en: 'Edit profile' }),
      hint: pick(lang, { it: 'Biografia, foto, curriculum', en: 'Biography, photo, CV' }),
    },
    {
      href: `${adminRoute}/collections/messages?where[read][not_equals]=true`,
      label: pick(lang, { it: 'Messaggi', en: 'Messages' }),
      hint:
        unreadCount === 0
          ? pick(lang, { it: 'Nessun messaggio da leggere', en: 'No unread messages' })
          : pick(lang, {
              it:
                unreadCount === 1 ? '1 messaggio da leggere' : `${unreadCount} messaggi da leggere`,
              en: unreadCount === 1 ? '1 unread message' : `${unreadCount} unread messages`,
            }),
      badge: unreadCount,
    },
    {
      href: '/',
      label: pick(lang, { it: 'Vedi il sito', en: 'View site' }),
      hint: pick(lang, { it: 'Si apre in una nuova scheda', en: 'Opens in a new tab' }),
      external: true,
    },
  ]

  return (
    <section className="pa-welcome" aria-labelledby="pa-welcome-title">
      <h1 id="pa-welcome-title" className="pa-welcome__title">
        {firstName
          ? pick(lang, { it: `Ciao, ${firstName}!`, en: `Hello, ${firstName}!` })
          : pick(lang, { it: 'Benvenuta, benvenuto!', en: 'Welcome!' })}
      </h1>
      <p className="pa-welcome__subtitle">
        {pick(lang, { it: 'Cosa vuoi fare oggi?', en: 'What would you like to do today?' })}
      </p>
      <div className="pa-welcome__actions">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={`pa-welcome__action${action.primary ? ' pa-welcome__action--primary' : ''}`}
            {...(action.external ? { target: '_blank', rel: 'noopener' } : {})}
          >
            <span>
              {action.label}
              {action.badge ? <span className="pa-welcome__badge">{action.badge}</span> : null}
            </span>
            <small>{action.hint}</small>
          </a>
        ))}
      </div>
      {!profile?.name && (
        <p className="pa-welcome__notice">
          {pick(lang, {
            it: 'Per iniziare, scrivi il tuo nome e la biografia in ',
            en: 'To get started, add your name and biography in ',
          })}
          <a href={`${adminRoute}/globals/profile`}>
            {pick(lang, { it: 'Il mio profilo', en: 'My profile' })}
          </a>
          .
        </p>
      )}
      {uncategorized.totalDocs > 0 && (
        <p className="pa-welcome__notice">
          {pick(lang, {
            it: `${uncategorized.totalDocs === 1 ? 'Un’opera è' : `${uncategorized.totalDocs} opere sono`} senza categoria: sul sito compaiono solo in "Tutti". `,
            en: `${uncategorized.totalDocs} artwork(s) have no category: on the site they only appear under "All". `,
          })}
          <a href={`${adminRoute}/collections/artworks?where[category][exists]=false`}>
            {pick(lang, { it: 'Assegna una categoria', en: 'Assign a category' })}
          </a>
        </p>
      )}
      {drafts.totalDocs > 0 && (
        <p className="pa-welcome__notice">
          {pick(lang, {
            it: `${drafts.totalDocs === 1 ? 'Hai un’opera in bozza' : `Hai ${drafts.totalDocs} opere in bozza`}, non ancora visibile sul sito. `,
            en: `You have ${drafts.totalDocs} draft artwork(s), not yet visible on the site. `,
          })}
          <a href={`${adminRoute}/collections/artworks?where[_status][equals]=draft`}>
            {pick(lang, { it: 'Vedi le bozze', en: 'See drafts' })}
          </a>
        </p>
      )}
    </section>
  )
}
