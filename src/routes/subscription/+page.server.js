import { fail, redirect} from "@sveltejs/kit"
import { PRIVATE_STRIPE_SECRETE_KEY } from '$env/static/private'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import initStripe from 'stripe';
import { createServerClient } from '@supabase/ssr'

export const actions = {
  subscribe: async (event) => {
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
       const session = await stripe.checkout.sessions.create(
         {
           customer: user_profile.stripe_customer, 
           mode: "subscription",
           payment_method_types: ['card'],
         //   line_items: [{
         //       price: planId,
         //       quantity: 1
         //    }], 
         subscription_data: {
            items: [
            {
               plan: planId
            }
            ]
         },
         locale: lang || "en",
           success_url: "https://supabase-ssr-auth.vercel.app/payment/success",
           cancel_url: "https://supabase-ssr-auth.vercel.app/payment/canceled",
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

export async function load() {
  const stripe = await initStripe(PRIVATE_STRIPE_SECRETE_KEY);
  const { data: prices } = await stripe.prices.list();

  const plans = await Promise.all(prices.map(async (price) => {
     const product = await stripe.products.retrieve(price.product)
     return {
        id: price.id,
        name: product.name,
        price: price.unit_amount,
        interval: price.recurring.interval,
        currency: price.currency
     }
  }))
  return {
     plans
  }
}
