import type { NextPage } from "next"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import Link from "next/link"
import { User } from "@supabase/gotrue-js"

const Login: NextPage = () => {
  const [user, setUser] = useState<User | undefined>(supabase.auth.user() || undefined)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      let newUser = supabase.auth.user()
      if (newUser) {
        await fetch("/api/auth/set", {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
          body: JSON.stringify({ event, session }),
        })
      }
      setUser(supabase.auth.user() || undefined)
    })
  })

  return (
    <>
      {loading && <h1>Loading, please wait...</h1>}
      {user && (
        <>
          <h1>Welcome, {user.email}!</h1>
          <div>
            Now you can see hidden pages: <Link href="/app/hidden">/hidden-page</Link>
          </div>
          <button
            onClick={async () => {
              setLoading(true)
              try {
                await supabase.auth.signOut()
                await fetch("/api/auth/remove", {
                  method: "GET",
                  credentials: "same-origin"
                })
              } finally {
                setLoading(false)
              }
            }}
          >
            Logout
          </button>
        </>
      )}
      {!user && !loading && (
        <>
          <h1>Welcome to the app!</h1>
          <button
            onClick={async () => {
              setLoading(true)
              try {
                await supabase.auth.signIn({
                  provider: "google",
                })
              } finally {
                setLoading(false)
              }
            }}
          >
            Login with Google
          </button>
        </>
      )}
    </>
  )
}

export default Login
