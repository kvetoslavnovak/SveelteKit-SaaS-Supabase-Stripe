<script>
import { enhance } from '$app/forms';
// export let form;
export let data;
</script>

<h2>
    Manage Subscription 
</h2>
<p>
    {#if data.session.user.user_profile.is_subscribed}
    Your are subscribed for: {data.session.user.user_profile.subscription_interval} and your subscription ends on
    {new Date(data.session.user.user_profile.current_period_end).toLocaleDateString("en", { year: 'numeric', month: 'long', day: 'numeric' })}

    <form action="?/manageSubscription" method="POST" use:enhance>		
        <button type="submit">Mangae subscription</button>
    </form>
    {:else}
    Your are not subscribed.
    {/if}
</p>
