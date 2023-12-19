import { PRIVATE_STRIPE_SECRETE_KEY, PRIVATE_STRIPE_API_SVELTEKIT_ENPOINT_KEY, PRIVATE_RPC_STRIPE_CUSTOMER_TO_USER_PROFILE } from '$env/static/private'
import { error } from '@sveltejs/kit';
import initStripe from 'stripe';

export const POST = async ({request, url,  locals}) => {
  let req = await request.json()

  if (url.searchParams.get('PRIVATE_STRIPE_API_SVELTEKIT_ENPOINT_KEY') !== PRIVATE_STRIPE_API_SVELTEKIT_ENPOINT_KEY) {
    throw error(401, { 
        meaasege: "you are not authorised to call this API"
      }
    );
  }

    const stripe = initStripe(PRIVATE_STRIPE_SECRETE_KEY);
    const customer = await stripe.customers.create({
      email: req.record.email, 
        metadata: {
          supabase_id: req.record.id
        }
    });

    // OLD CODE WHICH NEEDS SERVICE KEY. BUT IT IS BETTER TO USE SUPABASE RPC DATABASE FUNCTION
  // await locals.supabase
  //   .from("user_profile")
  //   .update({
  //       stripe_customer: customer.id
  //     })
  //     .eq("id", 
  //     req.record.id);


      // -- stripe_customer_to_user_profile database function
      //   create or replace function stripe_customer_to_user_profile(
      //   token varchar default null,
      //   customer_id text default null,
      //   record_id uuid default null
      // ) returns text language plpgsql security definer as $$
      // BEGIN
      //   IF token IS NULL OR token <> 'your_PRIVATE_RPC_STRIPE_CUSTOMER_TO_USER_PROFILE' THEN
      //       RETURN 'You are not authorized to use this database function';
      //   ELSE
      // UPDATE user_profile
      // SET stripe_customer = customer_id
      // WHERE id = record_id;
      // 	RETURN 'Stripe customer is added to user profile';
      //   END IF;
      // END;
      // $$;
    await locals.supabase.rpc('stripe_customer_to_user_profile', {
    token: PRIVATE_RPC_STRIPE_CUSTOMER_TO_USER_PROFILE, 
    customer_id: customer.id, 
    record_id: req.record.id
  });

     return new Response(customer.id);
};