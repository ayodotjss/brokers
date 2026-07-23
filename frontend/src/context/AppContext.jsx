import { createContext, useContext, useMemo, useReducer } from 'react'

const AppContext = createContext(null)

const initialState = {
  // preloader
  progress: 0, // 0 → 100
  assetsReady: false, // everything fetched
  appRevealed: false, // preloader finished its exit, site is live
  // scroll sections
  activeSection: 'about', // 'about' | 'whitelist' | 'faq'
  // whitelist flow
  wlSteps: { follow: false, retweet: false, like: false },
  wlStatus: 'idle', // 'idle' | 'sending' | 'success' | 'error'
  wlMessage: '',
}

function reducer(state, action) {
  switch (action.type) {
    case 'PROGRESS':
      return { ...state, progress: Math.max(state.progress, action.value) }
    case 'ASSETS_READY':
      return { ...state, assetsReady: true, progress: 100 }
    case 'REVEAL':
      return { ...state, appRevealed: true }
    case 'SET_SECTION':
      return state.activeSection === action.value
        ? state
        : { ...state, activeSection: action.value }
    case 'WL_STEP':
      return { ...state, wlSteps: { ...state.wlSteps, [action.step]: true } }
    case 'WL_STATUS':
      return { ...state, wlStatus: action.value, wlMessage: action.message ?? '' }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ ...state, dispatch }), [state])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
