const ACCESS_KEY = 'ecommerce.access'
const REFRESH_KEY = 'ecommerce.refresh'
const CHANGE_EVENT = 'ecommerce:auth-change'

function isBrowser() {
  return typeof window !== 'undefined'
}

export const tokenStore = {
  getAccess(): string | null {
    return isBrowser() ? window.localStorage.getItem(ACCESS_KEY) : null
  },
  getRefresh(): string | null {
    return isBrowser() ? window.localStorage.getItem(REFRESH_KEY) : null
  },
  set(access: string, refresh?: string | null) {
    if (!isBrowser()) return
    window.localStorage.setItem(ACCESS_KEY, access)
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  },
  clear() {
    if (!isBrowser()) return
    window.localStorage.removeItem(ACCESS_KEY)
    window.localStorage.removeItem(REFRESH_KEY)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  },
  subscribe(callback: () => void) {
    if (!isBrowser()) return () => {}
    const onStorage = (event: StorageEvent) => {
      if (event.key === ACCESS_KEY || event.key === REFRESH_KEY) callback()
    }
    window.addEventListener(CHANGE_EVENT, callback)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CHANGE_EVENT, callback)
      window.removeEventListener('storage', onStorage)
    }
  },
}
