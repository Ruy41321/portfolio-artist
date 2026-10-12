import type { ComponentType, ReactNode } from 'react'

import type { Dictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'
import type { Artwork, Category, Profile, SiteSetting } from '@/payload-types'

/** Data shared by every page of the public site. */
export type SiteContext = {
  locale: Locale
  dict: Dictionary
  profile: Profile
  settings: SiteSetting
  preview: boolean
}

export type LayoutProps = SiteContext & { children: ReactNode; currentPath: string }

export type HomePageProps = SiteContext & { artworks: Artwork[]; categories: Category[] }

export type ArtworkPageProps = SiteContext & {
  artwork: Artwork
  previous: Artwork | null
  next: Artwork | null
}

export type SimplePageProps = SiteContext

export type NotFoundPageProps = { siteName: string }

/**
 * Contract every theme must implement. Routes are thin: they load the data and
 * delegate rendering to the active theme (chosen in Site settings).
 */
export type Theme = {
  name: string
  Layout: ComponentType<LayoutProps>
  HomePage: ComponentType<HomePageProps>
  AboutSection: ComponentType<SiteContext>
  WorksSection: ComponentType<HomePageProps>
  ContactSection: ComponentType<SiteContext>
  ArtworkPage: ComponentType<ArtworkPageProps>
  PrivacyPage: ComponentType<SimplePageProps>
  NotFoundPage: ComponentType<NotFoundPageProps>
}
