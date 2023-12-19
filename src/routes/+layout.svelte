<script>
import { enhance } from '$app/forms'
export let data
</script>

<a href="/">Home</a>   
<a href="/subscription">Subscriptions</a>   
<span id="auth_header">
    {#if !data.session}
        <a href="/login_logout">login</a> / <a href="/register">signup</a>
    {:else}
    <a href="/user_profile">User profile</a>   
    <form action="/login_logout?/logout" method="POST" use:enhance>
        <button type="submit">Logout</button>
    </form>
    {/if}
</span>
<slot />


<style>
#auth_header {
   float: right;
}
form {
    display: inline;
}
</style>