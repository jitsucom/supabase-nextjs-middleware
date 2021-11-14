import { supabase } from "../../../lib/supabase"

export default async function handler(req, res) {
    await supabase.auth.api.setAuthCookie(req, res)

}