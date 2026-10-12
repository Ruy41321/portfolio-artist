'use client'

import { useEffect, useState, type ReactNode } from 'react'

type Link = { id: string; label: string }

type Props = {
  links: Link[]
  /** Base path for the links: "" on the home page, "/it" elsewhere. */
  basePath: string
  onHome: boolean
  menuLabel: string
  closeLabel: string
  /** Extra content shown inside the menu on small screens (e.g. language switch). */
  children?: ReactNode
}

/** Main menu: highlights the section in view (home) and collapses into a menu on mobile. */
export function SideNav({ links, basePath, onHome, menuLabel, closeLabel, children }: Props) {
  const [active, setActive] = useState(onHome ? links[0]?.id : '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!onHome) return
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => Boolean(el))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [links, onHome])

  return (
    <>
      <button
        type="button"
        className="burger"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? closeLabel : menuLabel}
      </button>
      <nav id="site-menu" className={`menu${open ? ' is-open' : ''}`} aria-label={menuLabel}>
        {links.map((link) => (
          <a
            key={link.id}
            href={`${basePath}#${link.id}`}
            className={active === link.id ? 'is-active' : undefined}
            aria-current={active === link.id ? 'location' : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        {children && <div className="menu__extra">{children}</div>}
      </nav>
    </>
  )
}
