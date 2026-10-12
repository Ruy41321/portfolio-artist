import type { Theme } from '@/themes/types'

import { AboutSection } from './AboutSection'
import { ArtworkPage } from './ArtworkPage'
import { ContactSection } from './ContactSection'
import { HomePage } from './HomePage'
import { Layout } from './Layout'
import { NotFoundPage } from './NotFoundPage'
import { PrivacyPage } from './PrivacyPage'
import { WorksSection } from './WorksSection'
import './theme.css'

export const atelierNotturno: Theme = {
  name: 'atelier-notturno',
  Layout,
  HomePage,
  AboutSection,
  WorksSection,
  ContactSection,
  ArtworkPage,
  PrivacyPage,
  NotFoundPage,
}
