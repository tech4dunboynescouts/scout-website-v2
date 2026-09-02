export interface RouteToggle {
  label?: string
  routePath?: string
  enabled?: boolean
}

interface NavChild {
  label: string
  href: string
}

interface NavLinkItem {
  _type: 'navLink'
  label: string
  href: string
}

interface NavGroupItem {
  _type: 'navGroup'
  label: string
  children?: NavChild[]
}

export type NavItemLike = NavLinkItem | NavGroupItem

export function normalizeRoutePath(path: string): string {
  if (!path) return '/'
  const withSlash = path.startsWith('/') ? path : `/${path}`
  if (withSlash === '/') return '/'
  return withSlash.replace(/\/+$/, '')
}

function disabledPathSet(routeToggles: RouteToggle[]): Set<string> {
  return new Set(
    routeToggles
      .filter((toggle) => toggle.enabled === false && typeof toggle.routePath === 'string')
      .map((toggle) => normalizeRoutePath(toggle.routePath as string))
  )
}

export function isRouteDisabled(pathname: string, routeToggles: RouteToggle[]): boolean {
  const disabled = disabledPathSet(routeToggles)
  const normalizedPath = normalizeRoutePath(pathname)
  return Array.from(disabled).some(
    (disabledPath) =>
      normalizedPath === disabledPath ||
      (disabledPath !== '/' && normalizedPath.startsWith(`${disabledPath}/`))
  )
}

export function filterNavItemsByRouteToggles<T extends NavItemLike>(
  navItems: T[],
  routeToggles: RouteToggle[]
): T[] {
  return navItems
    .map((item) => {
      if (item._type === 'navLink') {
        const href = normalizeRoutePath(item.href)
        return isRouteDisabled(href, routeToggles) ? null : item
      }

      const children = (item.children ?? []).filter((child) => {
        const href = normalizeRoutePath(child.href)
        return !isRouteDisabled(href, routeToggles)
      })

      if (children.length === 0) return null
      return { ...item, children } as T
    })
    .filter((item): item is T => item !== null)
}
