import { NextPage } from "next"
import { supabase } from "../../lib/supabase"
import jwt from 'jsonwebtoken'


const Hidden: NextPage<{user: any}> = (props) => {
  return <h1>Do not tell anybody about this page, {props.user.email}</h1>
}

export async function getServerSideProps(context) {
  let supabaseToken = context.req.cookies['sb:token']
  if (!supabaseToken) {
    throw new Error("It should not happen! Since this page is guarded by _middlware.ts the presense of supabase token cookie (sb:token) should be already checked")
  }
  return {
    props: {
      //we do not need to verify JWT signature since it has been already done in _middlware.ts
      user: jwt.decode(supabaseToken),
    },
  }
}


export default Hidden
