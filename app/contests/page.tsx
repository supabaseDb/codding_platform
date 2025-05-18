import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"

export const revalidate = 3600 // Revalidate at most every hour

export default async function ContestsPage() {
  const supabase = createServerSupabaseClient()

  // Get current time
  const now = new Date().toISOString()

  // Fetch active contests
  const { data: activeContests } = await supabase
    .from("contests")
    .select(`
      *,
      contest_participants:contest_participants(count)
    `)
    .eq("is_active", true)
    .lte("start_time", now)
    .gte("end_time", now)
    .order("end_time", { ascending: true })

  // Fetch upcoming contests
  const { data: upcomingContests } = await supabase
    .from("contests")
    .select(`
      *,
      contest_participants:contest_participants(count)
    `)
    .eq("is_active", true)
    .gt("start_time", now)
    .order("start_time", { ascending: true })

  // Fetch past contests
  const { data: pastContests } = await supabase
    .from("contests")
    .select(`
      *,
      contest_participants:contest_participants(count)
    `)
    .eq("is_active", true)
    .lt("end_time", now)
    .order("end_time", { ascending: false })
    .limit(5)

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

  // Calculate duration in hours and minutes
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const durationMs = endDate.getTime() - startDate.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Coding Contests</h1>
          <p className="text-muted-foreground">Participate in coding competitions and test your skills</p>
        </div>

        {/* Active contests */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Active Contests</h2>
          {activeContests && activeContests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeContests.map((contest) => (
                <Card key={contest.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{contest.title}</CardTitle>
                      <Badge className="bg-green-500">Live</Badge>
                    </div>
                    <CardDescription>{contest.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">{contest.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Ends: {formatDate(contest.end_time)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Duration: {calculateDuration(contest.start_time, contest.end_time)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Participants: {contest.contest_participants[0]?.count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/contests/${contest.id}`}>Enter Contest</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No active contests at the moment.</p>
                <p className="text-muted-foreground">Check back later or join an upcoming contest!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming contests */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Upcoming Contests</h2>
          {upcomingContests && upcomingContests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingContests.map((contest) => (
                <Card key={contest.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{contest.title}</CardTitle>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                    <CardDescription>{contest.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">{contest.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Starts: {formatDate(contest.start_time)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Duration: {calculateDuration(contest.start_time, contest.end_time)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Registered: {contest.contest_participants[0]?.count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/contests/${contest.id}`}>Register</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No upcoming contests scheduled.</p>
                <p className="text-muted-foreground">Check back later for new contests!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past contests */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Past Contests</h2>
          {pastContests && pastContests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastContests.map((contest) => (
                <Card key={contest.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{contest.title}</CardTitle>
                      <Badge variant="secondary">Ended</Badge>
                    </div>
                    <CardDescription>{contest.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">{contest.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Ended: {formatDate(contest.end_time)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Participants: {contest.contest_participants[0]?.count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/contests/${contest.id}`}>View Results</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No past contests available.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
