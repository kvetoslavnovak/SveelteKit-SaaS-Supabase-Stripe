import { fail, redirect } from "@sveltejs/kit"
import { AuthApiError } from '@supabase/supabase-js'

export const actions = {
	login: async (event) => {
		const { request, url, locals } = event
			const formData = await request.formData()
			const email = formData.get('email')
			const password = formData.get('password')

		const { data, error: err } = await locals.supabase.auth.signInWithPassword({
			email: email,
			password: password,
				})

			if (err) {
				if (err instanceof AuthApiError && err.status === 400) {
					return fail(400, {
						error: "Invalid credentials", email: email, invalid: true, message: err.message
					})
				}
				return fail(500, {
					message: "Server error. Try again later.",
				})
			}

			throw redirect(303, "/")
	}, 

	logout: async ({locals}) => {
		await locals.supabase.auth.signOut()
		throw redirect(303, "/")
	}

}

export async function load({locals: { getSession } }) {
	const session = await getSession();
    // if the user is already logged in return him to the home page
	if (session) {
		throw redirect(303, '/');
	}
  }