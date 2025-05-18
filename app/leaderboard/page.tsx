import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const revalidate = 3600 // Revalidate at most every hour

export default async function LeaderboardPage() {
  const supabase = createServerSupabaseClient()

  // Fetch top users by problems solved
  const { data: topUsers } = await supabase
    .from("user_statistics")
    .select(`
      *,
      profiles:user_id (
        username,
        full_name,
        avatar_url,
        country,
        rating
      )
    `)
    .order("problems_solved", { ascending: false })
    .limit(50)

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Top performers ranked by problems solved</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Global Rankings</CardTitle>
            <CardDescription>Users with the most problems solved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-medium text-muted-foreground py-2 border-b">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">User</div>
                <div className="col-span-2 text-center">Problems</div>
                <div className="col-span-2 text-center">Acceptance</div>
                <div className="col-span-2 text-center">Rating</div>
              </div>

              {topUsers && topUsers.length > 0 ? (
                topUsers.map((user, index) => {
                  const acceptanceRate =
                    user.total_submissions > 0
                      ? Math.round((user.accepted_submissions / user.total_submissions) * 100)
                      : 0

                  return (
                    <div
                      key={user.user_id}
                      className="grid grid-cols-12 gap-4 items-center py-4 border-b last:border-0"
                    >
                      <div className="col-span-1 font-bold">{index + 1}</div>
                      <div className="col-span-5">
                        <Link
                          href={`/profile/${user.profiles?.username}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.profiles?.avatar_url || undefined}
                              alt={user.profiles?.username || "User"}
                            />
                            <AvatarFallback>{user.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.profiles?.full_name || user.profiles?.username || "User"}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              @{user.profiles?.username}
                              {user.profiles?.country && <span>• {user.profiles.country}</span>}
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="col-span-2 text-center font-medium">{user.problems_solved}</div>
                      <div className="col-span-2 text-center">
                        <Badge variant={acceptanceRate >= 70 ? "default" : "outline"}>{acceptanceRate}%</Badge>
                      </div>
                      <div className="col-span-2 text-center font-medium">{user.profiles?.rating || "-"}</div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
