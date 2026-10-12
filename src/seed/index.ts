import type { Payload } from 'payload'

import { paragraphs } from '@/lib/richtext'
import type { Media } from '@/payload-types'

import { demoArtworks, demoCategories, demoPrivacy, demoProfile, seriesText } from './data'
import { renderArtwork, renderPortrait } from './placeholders'

/**
 * Seeds demo content. Idempotent: documents are matched by slug or filename and
 * updated instead of duplicated, so it can be run any number of times.
 */
export async function seed(payload: Payload): Promise<void> {
  const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

  const upsertMedia = async (
    filename: string,
    alt: { it: string; en: string },
    render: () => Promise<Buffer>,
  ): Promise<Media> => {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
    let doc = existing.docs[0]
    if (!doc) {
      const data = await render()
      doc = await payload.create({
        collection: 'media',
        locale: 'it',
        data: { alt: alt.it },
        file: { data, mimetype: 'image/jpeg', name: filename, size: data.length },
      })
    }
    await payload.update({ collection: 'media', id: doc.id, locale: 'en', data: { alt: alt.en } })
    return doc
  }

  // Categories
  const categoryIds: Record<string, number> = {}
  for (const category of demoCategories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      depth: 0,
    })
    const doc =
      existing.docs[0] ??
      (await payload.create({
        collection: 'categories',
        locale: 'it',
        data: { name: category.it, slug: category.slug },
      }))
    await payload.update({
      collection: 'categories',
      id: doc.id,
      locale: 'it',
      data: { name: category.it },
    })
    await payload.update({
      collection: 'categories',
      id: doc.id,
      locale: 'en',
      data: { name: category.en },
    })
    categoryIds[category.slug] = doc.id
  }
  log(`${demoCategories.length} categories`)

  // Artworks
  for (const [index, work] of demoArtworks.entries()) {
    const image = await upsertMedia(
      `demo-${work.slug}.jpg`,
      {
        it: `${work.title.it}, ${work.technique.it.toLowerCase()} (immagine dimostrativa)`,
        en: `${work.title.en}, ${work.technique.en.toLowerCase()} (demo image)`,
      },
      () => renderArtwork(index, work.ratio),
    )
    const shared = {
      images: [image.id],
      year: work.year,
      dimensions: work.dimensions,
      category: categoryIds[work.category],
      availability: work.availability,
      price: work.price,
      featured: Boolean(work.featured),
      slug: work.slug,
    }
    const text = (locale: 'it' | 'en') => ({
      title: work.title[locale],
      technique: work.technique[locale],
      shortDescription: seriesText[work.series][locale],
      description: paragraphs(
        seriesText[work.series][locale],
        locale === 'it'
          ? `${work.title.it} è un’opera dimostrativa: sostituiscila con le tue dal pannello di amministrazione.`
          : `${work.title.en} is a demo work: replace it with your own from the admin panel.`,
      ),
    })

    const existing = await payload.find({
      collection: 'artworks',
      where: { slug: { equals: work.slug } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    const doc = existing.docs[0]
      ? await payload.update({
          collection: 'artworks',
          id: existing.docs[0].id,
          locale: 'it',
          data: { ...shared, ...text('it'), _status: 'published' },
        })
      : await payload.create({
          collection: 'artworks',
          locale: 'it',
          data: { ...shared, ...text('it'), _status: 'published' },
        })
    await payload.update({
      collection: 'artworks',
      id: doc.id,
      locale: 'en',
      data: { ...text('en'), _status: 'published' },
    })
  }
  log(`${demoArtworks.length} artworks`)

  // Profile
  const portrait = await upsertMedia(
    'demo-portrait.jpg',
    {
      it: 'Ritratto dell’artista (immagine dimostrativa)',
      en: 'Portrait of the artist (demo image)',
    },
    renderPortrait,
  )
  const profileShared = {
    name: demoProfile.name,
    email: demoProfile.email,
    portrait: portrait.id,
    socials: demoProfile.socials.map((s) => ({ ...s })),
  }
  await payload.updateGlobal({
    slug: 'profile',
    locale: 'it',
    data: {
      ...profileShared,
      tagline: demoProfile.tagline.it,
      location: demoProfile.location.it,
      statement: demoProfile.statement.it,
      contactIntro: demoProfile.contactIntro.it,
      bio: paragraphs(...demoProfile.bio.it),
      cv: demoProfile.cv.map((entry) => ({ year: entry.year, type: entry.type, text: entry.it })),
    },
  })
  const profileIt = await payload.findGlobal({ slug: 'profile', locale: 'it', depth: 0 })
  await payload.updateGlobal({
    slug: 'profile',
    locale: 'en',
    data: {
      tagline: demoProfile.tagline.en,
      location: demoProfile.location.en,
      statement: demoProfile.statement.en,
      contactIntro: demoProfile.contactIntro.en,
      bio: paragraphs(...demoProfile.bio.en),
      // Array rows keep their ids so only the localized text changes.
      cv: (profileIt.cv ?? []).map((row, i) => ({
        ...row,
        text: demoProfile.cv[i]?.en ?? row.text,
      })),
    },
  })
  log('profile')

  // Site settings
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'it',
    data: {
      seo: {
        title: `${demoProfile.name} — Pittura e illustrazione`,
        description:
          'Portfolio di Giulia Marchetti: pittura a olio e illustrazione tra paesaggio e memoria.',
      },
      privacy: paragraphs(...demoPrivacy.it),
    },
  })
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      seo: {
        title: `${demoProfile.name} — Painting and illustration`,
        description:
          'Portfolio of Giulia Marchetti: oil painting and illustration between landscape and memory.',
      },
      privacy: paragraphs(...demoPrivacy.en),
    },
  })
  log('site settings')

  // Optional admin user, only when credentials are provided through the environment.
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (email && password) {
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })
    if (users.docs.length === 0) {
      await payload.create({ collection: 'users', data: { email, password } })
      log(`admin user ${email}`)
    }
  }
}
