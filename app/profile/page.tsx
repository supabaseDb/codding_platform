import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get user statistics
  const { data: stats } = await supabase.from("user_statistics").select("*").eq("user_id", session.user.id).single()

  // Get recent submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      problems:problem_id (
        title,
        difficulty
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate submission statistics
  const totalSubmissions = stats?.total_submissions || 0
  const acceptedRate =
    totalSubmissions > 0 ? Math.round(((stats?.accepted_submissions || 0) / totalSubmissions) * 100) : 0

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-8">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
            <AvatarFallback className="text-2xl">
              {profile?.username?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{profile?.full_name || profile?.username || "User"}</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline">@{profile?.username || "user"}</Badge>
              {profile?.rating && <Badge className="bg-primary">{profile.rating} Rating</Badge>}
              {profile?.country && <Badge variant="outline">{profile.country}</Badge>}
            </div>
            {profile?.bio && <p className="text-muted-foreground">{profile.bio}</p>}
            {profile?.institution && <p className="text-sm text-muted-foreground">{profile.institution}</p>}
          </div>
        </div>

        {/* Stats and submissions */}
        <Tabs defaultValue="stats">
          <TabsList>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            {/* Problem solving stats */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Solving</CardTitle>
                <CardDescription>Your coding progress and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Problems Solved</h3>
                    <div className="text-3xl font-bold">{stats?.problems_solved || 0}</div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Easy</div>
                        <div className="font-medium">{stats?.easy_solved || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Medium</div>
                        <div className="font-medium">{stats?.medium_solved || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Hard</div>
                        <div className="font-medium">{stats?.hard_solved || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Submissions</h3>
                    <div className="text-3xl font-bold">{totalSubmissions}</div>
                    <div className="space-y-1 pt-2">
                      <div className="text-xs text-muted-foreground">Acceptance Rate</div>
                      <Progress value={acceptedRate} className="h-2" />
                      <div className="text-xs text-right">{acceptedRate}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Errors</h3>
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <div className="flex justify-between">
                        <div className="text-sm">Wrong Answer</div>
                        <div className="font-medium">{stats?.wrong_submissions || 0}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-sm">Compilation Error</div>
                        <div className="font-medium">{stats?.compilation_errors || 0}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-sm">Runtime Error</div>
                        <div className="font-medium">{stats?.runtime_errors || 0}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-sm">Time Limit Exceeded</div>
                        <div className="font-medium">{stats?.time_limit_exceeded || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Your most recent code submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions && submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{submission.problems?.title}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(submission.created_at)}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <Badge variant="outline">{submission.language}</Badge>
                          <Badge
                            className={
                              submission.status === "Accepted"
                                ? "bg-green-500"
                                : submission.status === "Wrong Answer"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                            }
                          >
                            {submission.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No submissions yet. Start solving problems!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
