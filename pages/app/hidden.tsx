import { NextPage } from "next"
import { supabase } from "../../lib/supabase"

const Hidden: NextPage = (props) => {
  return <h1>You are lucky to see this! Don't tell anybody!</h1>
}

export default Hidden
