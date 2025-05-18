import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Check if user profile exists
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      // Check if profile exists
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      // If profile doesn't exist, create one
      if (!profile) {
        const username =
          session.user.user_metadata.preferred_username ||
          session.user.user_metadata.user_name ||
          session.user.email?.split("@")[0] ||
          `user_${Math.random().toString(36).substring(2, 10)}`

        // Create profile
        await supabase.from("profiles").insert({
          id: session.user.id,
          username,
          full_name: session.user.user_metadata.full_name || username,
          avatar_url: session.user.user_metadata.avatar_url,
          created_at: new Date().toISOString(),
        })

        // Create user statistics
        await supabase.from("user_statistics").insert({
          user_id: session.user.id,
          problems_solved: 0,
          total_submissions: 0,
          accepted_submissions: 0,
          wrong_submissions: 0,
          compilation_errors: 0,
          runtime_errors: 0,
          time_limit_exceeded: 0,
          easy_solved: 0,
          medium_solved: 0,
          hard_solved: 0,
          last_updated: new Date().toISOString(),
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
