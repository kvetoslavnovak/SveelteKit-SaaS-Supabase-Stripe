<script>
    import { enhance } from '$app/forms';
    export let form
</script>

<h2>Delete your user account</h2>
<form action="?/delete_user" method="POST" use:enhance>
    <button type="submit">Delete my user account</button>
</form>
{#if form?.invalid}<mark>{form?.message}!</mark>{/if}