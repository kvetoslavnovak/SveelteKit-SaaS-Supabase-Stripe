import addUserprofileToUser from '../utils/addUserprofileToUser.js'
export const load = async (event) => {

let session = await event.locals.getSession()

// solving the case when the session is null, i.e. the user was deleted from the database but the browser still has a cookie/loggedin user
// +lauout.server.js will delete the cookie 
if (session == null) {
  event.cookies.delete(event.locals.supabase.storageKey);
}

await addUserprofileToUser(session, event.locals.supabase)
  return {
    session
  }
}