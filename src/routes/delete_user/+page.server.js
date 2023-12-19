import { PRIVATE_RPC_DELETE_USER } from '$env/static/private'
import { redirect } from "@sveltejs/kit"

export const actions = {
	delete_user: async ({ locals, request,  cookies }) => {
    const storageKey = locals.supabase.storageKey

	// -- delete_user database function
	// 	CREATE OR REPLACE FUNCTION delete_user(token varchar DEFAULT NULL) 
	// RETURNS TEXT
	// LANGUAGE plpgsql
	// SECURITY DEFINER
	// AS $$
	// BEGIN
	//   IF token IS NULL OR token <> 'PRIVATE_RPC_DELETE_USER' THEN
	//       RETURN 'You are not authorized to use this database function';
	//   ELSE
	//   --delete from public.profiles where id = auth.uid();
	// 	delete from auth.users where id = auth.uid();
	// 	RETURN 'User has been deleted';
	//   END IF;
	// END;
	// $$;

	await locals.supabase.rpc('delete_user', {token: PRIVATE_RPC_DELETE_USER});
	cookies.delete(storageKey);
	throw redirect(303, "/")
	}
}

export async function load({locals: { getSession } }) {
	const session = await getSession();
    // if the user is not logged in redirect back to the home page
	if (!session) {
		throw redirect(303, '/');
	}
  }