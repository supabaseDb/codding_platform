import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SubmissionsList from "@/components/submissions-list"

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { status?: string; language?: string }
}) {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get filter parameters
  const status = searchParams.status
  const language = searchParams.language

  // Build query for submissions
  let query = supabase
    .from("submissions")
    .select(`
      *,
      problems:problem_id (
        id,
        title,
        difficulty
      )
    `)
    .eq("user_id", session.user.id)

  // Apply filters
  if (status) {
    query = query.eq("status", status)
  }

  if (language) {
    query = query.eq("language", language)
  }

  // Execute query
  const { data: submissions } = await query.order("created_at", { ascending: false }).limit(50)

  // Get unique languages and statuses for filters
  const { data: languages } = await supabase
    .from("submissions")
    .select("language")
    .eq("user_id", session.user.id)
    .distinct()

  const { data: statuses } = await supabase
    .from("submissions")
    .select("status")
    .eq("user_id", session.user.id)
    .distinct()

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Submissions</h1>
          <p className="text-muted-foreground">View and filter your code submissions</p>
        </div>

        <SubmissionsList
          submissions={submissions || []}
          languages={languages || []}
          statuses={statuses || []}
          currentStatus={status}
          currentLanguage={language}
        />
      </div>
    </div>
  )
}
