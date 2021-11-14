# Next.js Middleware and Supabase

_(read the blog post about this example)_

This app demonstrates how new Next.js 12 middleware works along supabase auth. `pages/index.tsx` 
is responsible for login logout using supabase-js lib (client side). Once user
logged in, it calls `pages/api/set.ts` to set a server-side cookie containing supabase JWT token.
After logout, `pages/api/remove.ts` is called to clear JWT cookie

Every page inside `pages/app/` is filtered by `pages/app/_middleware.ts` 
(see [how Next.js middleware works](https://nextjs.org/docs/middleware)). Middleware validates supabase JWT token (by calling supabase
HTTP API). If the token is absent (=cookie has not been set) or is invalid (auth expired etc), 
user will be redirected to login page. Thus, all pages in the `/app` is accessible
only by authorised users

## Deployment and running

The app requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_KEY` environment variables to be set. Read more on Supabase Docs
site.

Run the app with `yarn install && NEXT_PUBLIC_SUPABASE_URL="..." NEXT_PUBLIC_SUPABASE_KEY="..." next start`. 
Open [localhost:3000](https://localhost:3000) to
access it


## Getting user server-side

See `pages/app/hidden-page.tsx`. In there, supabase user is obtained during
server-side rendering. Since `pages/app/_middleware.ts` has already validated the user.
We don't need to verify JWT with supabase server call, we can just decode JWT

Having user on getServerSideProps we pre-build some data on server (e.g. query user settings
from DB). And we will save an extra request to subapase server client-side

<hr />


## The bug

This project also reproduces the bug with `supabase-js` lib. See `_middleware.js`. In theory,
if you uncomment `supabase.auth.api.getUserByCookie` and comment `getUser` the app should remain
functinal. However, here's what happens:

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