export default async function addUserprofileToUser (session, supabase) {
    if (session) {
      let { data, error } = await supabase
        .from('user_profile')
        .select("*")
        .eq('id', session.user.id)
        .single()
      session.user.user_profile = data
    }
  }