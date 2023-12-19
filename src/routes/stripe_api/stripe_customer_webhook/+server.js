import initStripe from 'stripe';
import { PRIVATE_STRIPE_SECRETE_KEY, PRIVATE_STRIPE_API_STRIPE_CUSTOMER_WEBHOOK_SIGNING_SECRET, PRIVATE_RPC_STRIPE_CUSTOMER_TO_USER_PROFILE } from '$env/static/private'

export const POST = async ({request, locals}) => {
    console.dir(request, {depth: null});
    const stripe = initStripe(PRIVATE_STRIPE_SECRETE_KEY);
    const signingSecret = PRIVATE_STRIPE_API_STRIPE_CUSTOMER_WEBHOOK_SIGNING_SECRET;
    const signature = request.headers.get("stripe-signature");

    const arraybuffer = await request.arrayBuffer();
    const requestBuffer = Buffer.from(new Uint8Array(arraybuffer));

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(requestBuffer, signature, signingSecret);
    } catch (error) {
      console.log(error.message);
      return {
        status: 401,
        body : {
          meaasege: `stripe webhook error: ${error.message}`,
        }
      };
    }

    switch (stripeEvent.type) {
      case 'customer.subscription.updated': 
      // -- subscription_to_user_profile database function
      // create or replace function stripe_customer_to_user_profile(
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
      await locals.supabase.rpc('subscription_to_user_profile', {
        token: PRIVATE_RPC_STRIPE_CUSTOMER_TO_USER_PROFILE, 
        subscribed_stripe_plan: stripeEvent.data.object.plan.product, 
        subscribed_stripe_interval: stripeEvent.data.object.plan.interval, 
        start: new Date(stripeEvent.data.object.current_period_start * 1000), 
        termination: new Date(stripeEvent.data.object.current_period_end * 1000), 
        customer_id: stripeEvent.data.object.customer
      });
      break;
      case 'customer.subscription.deleted': 
      // -- stripe_subscription_canceled database function
      //  create or replace function stripe_subscription_canceled(
      // token varchar default null,
      // customer_id text default null
      // ) returns text language plpgsql security definer as $$
      // BEGIN
      // IF token IS NULL OR token <> 'your_PRIVATE_RPC_STRIPE_CUSTOMER_TO_USER_PROFILE' THEN
        // RETURN 'You are not authorized to use this database function';
      // ELSE
      // UPDATE user_profile
      // SET 
      // is_subscribed = false, 
      // subscribed_plan = null, 
      // subscription_interval = null
      // WHERE stripe_customer = customer_id;
      //   RETURN 'Subscribed plan canceled';
      //   END IF;
      // END;
      // $$;
      await locals.supabase.rpc('stripe_subscription_canceled', {
        token: PRIVATE_RPC_STRIPE_CUSTOMER_TO_USER_PROFILE, 
        customer_id: stripeEvent.data.object.customer
      });
      break;
    }

return new Response({
    meaasege: `Stripe subscription webhook received and verified ok`,
})
  };