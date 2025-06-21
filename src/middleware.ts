import { clerkMiddleware,createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)'
  ]);

export const onRequest = clerkMiddleware((auth, context) => {
    //console.log(auth())
    if (!auth().userId && isProtectedRoute(context.request)) {
        return Response.redirect(new URL('/sign-in', context.url), 302);
    }

    context.locals.orgrole = auth().orgRole ?? 'none';

    
  });

