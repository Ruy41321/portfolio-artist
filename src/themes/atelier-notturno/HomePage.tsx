import type { HomePageProps } from '@/themes/types'

import { AboutSection } from './AboutSection'
import { ContactSection } from './ContactSection'
import { WorksSection } from './WorksSection'

/** One-page home: Biography → Works → Contact. */
export function HomePage(props: HomePageProps) {
  return (
    <>
      <AboutSection {...props} />
      <WorksSection {...props} />
      <ContactSection {...props} />
    </>
  )
}
