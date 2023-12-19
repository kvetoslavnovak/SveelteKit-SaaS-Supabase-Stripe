import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { combineChunks, createBrowserClient, isBrowser, parse } from '@supabase/ssr'
import addUserprofileToUser from '../utils/addUserprofileToUser.js'

export const load = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch,
    },
    cookies: {
      get(key) {
        if (!isBrowser()) {
          return JSON.stringify(data.session)
        }

        const cookie = combineChunks(key, (name) => {
          const cookies = parse(document.cookie)
          return cookies[name]
        })
        return cookie
      },
    },
  })
 
  const {
    data: { session },
  } = await supabase.auth.getSession()

  await addUserprofileToUser(session,supabase)

   return { supabase, session }
}