import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";
import type { Provider } from "@supabase/supabase-js";

const publicRoutes = [
    "/",
    "/api/auth/signin",
    "/api/auth/callback",
];

export const onRequest = defineMiddleware(async (context, next) => {  
  if (publicRoutes.includes(context.url.pathname) || (await supabase.auth.getUser()).data.user != null) {
    return next();
  }

  const { data: oAuthData, error: oAuthError } = await supabase.auth.signInWithOAuth({
    provider: "discord" as Provider,
    options: {redirectTo: "http://localhost:4321/api/auth/callback"},
  });

  if (oAuthError) {
    return new Response(oAuthError.message, { status: 500 });
  }
  
  return context.redirect(oAuthData.url);
});
