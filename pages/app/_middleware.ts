import type { NextFetchEvent, NextRequest } from "next/server"
import { supabase } from "../../lib/supabase"
import { NextResponse } from "next/server"


export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  //This line won't work, see README.md
  //let authResult = await supabase.auth.api.getUserByCookie(req)
  let authResult = await getUser(req) //- uncomment to get the bug fixed
  if (authResult.error) {
    console.log("Authorization error, redirecting to login page", authResult.error)
    return NextResponse.redirect(`/?ret=${encodeURIComponent(req.nextUrl.pathname)}`)
  } else if (!authResult.user) {
    console.log("No auth user, redirecting")
    return NextResponse.redirect(`/?ret=${encodeURIComponent(req.nextUrl.pathname)}`)
  } else {
    console.log("User is found", authResult.user)
    return NextResponse.next()
  }
}

async function getUser(req: NextRequest): Promise<any> {
  let token = req.cookies["sb:token"]
  if (!token) {
    return {
      user: null,
      data: null,
      error: "There is no supabase token in request cookies",
    }
  }
  let authRequestResult = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      APIKey: process.env.NEXT_PUBLIC_SUPABASE_KEY || "",
    },
  })

  let result = await authRequestResult.json()
  console.log("Supabase auth result", result)
  if (authRequestResult.status != 200) {
    return {
      user: null,
      data: null,
      error: `Supabase auth returned ${authRequestResult.status}. See logs for details`,
    }
  } else if (result.aud === "authenticated") {
    return {
      user: result,
      data: result,
      error: null,
    }
  }
}
