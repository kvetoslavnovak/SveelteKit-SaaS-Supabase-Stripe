<script>
import { enhance } from '$app/forms';
// export let form;
export let data;
</script>

{#each data.plans as plan}
<h3>{plan.name}</h3>
<p>
    {plan.currency.toUpperCase()} {plan.price/100} / {plan.interval}
</p>
{#if !data.session?.user}
<a href="/register">create account</a> or <a href="/login_logout">login</a>
{:else if !data.session.user.user_profile.is_subscribed} 
<form action="?/subscribe" method="POST" use:enhance>
    <input name="planId" value= {plan.id} type="hidden"/>		
    <button type="submit">Subscribe</button>
</form>
{:else if data.session.user.user_profile.is_subscribed}
<a href="/subscription_details">Subscription Details</a>
{/if}
{/each}

