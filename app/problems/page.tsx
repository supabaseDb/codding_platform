import { createServerSupabaseClient } from "@/lib/supabase/server"
import ProblemsList from "@/components/problems-list"

export const revalidate = 3600 // Revalidate at most every hour

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: { difficulty?: string; category?: string; search?: string }
}) {
  const supabase = createServerSupabaseClient()

  // Get filter parameters
  const difficulty = searchParams.difficulty
  const category = searchParams.category
  const search = searchParams.search

  // Fetch categories for filter
  const { data: categories } = await supabase.from("categories").select("id, name")

  // Build query for problems
  let query = supabase.from("problems").select("id, title, difficulty, category, tags").eq("is_active", true)

  // Apply filters
  if (difficulty) {
    query = query.eq("difficulty", difficulty)
  }

  if (category) {
    query = query.eq("category", category)
  }

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  // Execute query
  const { data: problems, error } = await query

  if (error) {
    console.error("Error fetching problems:", error)
  }

  // Get difficulty counts - fixed query
  const { data: easyCount } = await supabase
    .from("problems")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("difficulty", "easy")

  const { data: mediumCount } = await supabase
    .from("problems")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("difficulty", "medium")

  const { data: hardCount } = await supabase
    .from("problems")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("difficulty", "hard")

  const difficultyMap = {
    easy: { count: easyCount || 0, color: "bg-green-500" },
    medium: { count: mediumCount || 0, color: "bg-yellow-500" },
    hard: { count: hardCount || 0, color: "bg-red-500" },
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Coding Problems</h1>
        <p className="text-muted-foreground">Practice your coding skills with our collection of problems</p>

        <ProblemsList
          problems={problems || []}
          categories={categories || []}
          difficultyMap={difficultyMap}
          currentDifficulty={difficulty}
          currentCategory={category}
          currentSearch={search}
        />
      </div>
    </div>
  )
}
