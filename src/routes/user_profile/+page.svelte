<script>
    export let data
</script>

<h2>User profile</h2>
<p>{data.session.user.email}</p>
<p>{data.session.user.user_profile.stripe_customer}</p>
<p>
    {#if data.session.user.user_profile.is_subscribed}
    User is subscribed and can view this content.
    {:else}
    Subscribe to see this content.
    {/if}
</p>
<p><a href="/update_email">Change your email</a></p>
<p><a href="/update_password">Change password</a></p>
<p><a href="/delete_user">Delete my account</a></p>