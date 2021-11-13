# Next.js Middleware and Supabase

This app demonstrates how new Next.js 12 middleware works along supabase auth. `pages/index.tsx` 
is responsible for login logout using supabase js lib (client side). Once user
logged in, it calls `pages/api/set.ts` to set a server-side cookie containing supabase JWT token.
After logout, `pages/api/remove.ts` is called to clear JWT cookie

Every page inside `pages/app/` is filtered by `pages/app/_middleware.ts` 
(see [how Next.js middleware works](https://nextjs.org/docs/middleware)). Middlware validates supabase JWT token (by calling supabase
API). If the token is absent (cookie has not been set) or is invalid (auth expired or someone
doing somthing nasty), user will be redirected to login page. Thus all pages in the `/app` is accesible
only by authorised users

## The bug

This code doesn't work. `supabase.auth.api.getUserByCookie` tries to access `XMLHttpRequest` which
is not present in server-side env:

```
Authorization error, redirecting to login page ReferenceError: XMLHttpRequest is not defined
    at eval (webpack-internal:///./node_modules/cross-fetch/dist/browser-ponyfill.js?d2fb:462:17)
    at new Promise (<anonymous>)
    at fetch (webpack-internal:///./node_modules/cross-fetch/dist/browser-ponyfill.js?d2fb:455:12)
    at eval (webpack-internal:///./node_modules/@supabase/gotrue-js/dist/module/lib/fetch.js?85f4:44:63)
    at new Promise (<anonymous>)
    at eval (webpack-internal:///./node_modules/@supabase/gotrue-js/dist/module/lib/fetch.js?85f4:43:16)
    at Generator.next (<anonymous>)
    at eval (webpack-internal:///./node_modules/@supabase/gotrue-js/dist/module/lib/fetch.js?85f4:16:71)
    at new Promise (<anonymous>)
    at __awaiter (webpack-internal:///./node_modules/@supabase/gotrue-js/dist/module/lib/fetch.js?85f4:12:12)
```

### Workaround

To fix the bug, replace `user = await supabase.auth.api.getUserByCookie(req)`
with `let user = getUserByCookie(req)` in `pages/app/_middleware.ts`. `getUser()` calls supabase API
directly

## Getting user in server-side code

See `pages/app/hidden-ssr-user.tsx`. In this example supabase user is obtained during page
server-side rendering. Since `pages/app/middleware.ts` has already validated the user.
We don't need to verify JWT with supabase server call, we can just decode JWT

Having user on getServerSideProps we pre-build some data on server (e.g. query user settings
from DB). And we will save an extra request to subapase server client-side