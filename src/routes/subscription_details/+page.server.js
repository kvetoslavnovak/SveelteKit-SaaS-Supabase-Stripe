import { fail, redirect} from "@sveltejs/kit"
import { PRIVATE_STRIPE_SECRETE_KEY } from '$env/static/private'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import initStripe from 'stripe';
import { createServerClient } from '@supabase/ssr'

export const actions = {
	manageSubscription: async (event) => {
     let session = await event.locals.getSession()

     const access_token = session?.access_token

     if (!access_token) {
      return fail(400, {
        error: "Acces denied.", invalid: true, message: "Invalid acces token."
      })
     }


     if (access_token) {
      const formData = await event.request.formData()
      const planId = formData.get('planId')

        let sb = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
           cookies: {
              get: (key) => event.cookies.get(key),
              set: (key, value, options) => {
                 event.cookies.set(key, value, options)
              },
              remove: (key, options) => {
                 event.cookies.delete(key, options)
              },
           },
        })

        const { data: { user }} = await sb.auth.getUser(access_token)

        let { data: user_profile, error } = await sb
        .from('user_profile')
        .select("*")
        .eq('id', user.id)
        .single()

   
       const stripe = await initStripe(PRIVATE_STRIPE_SECRETE_KEY);
      // let lang = event.locals.lang // using user UI lang for Stripe checkout or "en"
      let lang = "en"
       const session = await stripe.billingPortal.sessions.create(
         {
          customer: user_profile.stripe_customer, 
          locale: lang || "en",
          return_url: "https://supabase-ssr-auth.vercel.app/subscription_details"
         }
       )
if (session) {
   throw redirect(303, session.url)
}
       return {
         status: 200,
         body: {
           id: session.id
         }
       };
     }
  },
}

export async function load({locals: { getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/');
	}
  }
