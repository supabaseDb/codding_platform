"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Submission = {
  id: number
  problem_id: number
  language: string
  status: string
  execution_time: number | null
  memory_used: number | null
  created_at: string
  problems: {
    id: number
    title: string
    difficulty: string
  }
}

type LanguageOption = {
  language: string
}

type StatusOption = {
  status: string
}

interface SubmissionsListProps {
  submissions: Submission[]
  languages: LanguageOption[]
  statuses: StatusOption[]
  currentStatus?: string
  currentLanguage?: string
}

export default function SubmissionsList({
  submissions,
  languages,
  statuses,
  currentStatus,
  currentLanguage,
}: SubmissionsListProps) {
  const router = useRouter()

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams()

    if (value && value !== "all") {
      params.set("status", value)
    }

    if (currentLanguage) {
      params.set("language", currentLanguage)
    }

    const queryString = params.toString()
    router.push(`/submissions${queryString ? `?${queryString}` : ""}`)
  }

  const handleLanguageChange = (value: string) => {
    const params = new URLSearchParams()

    if (currentStatus) {
      params.set("status", currentStatus)
    }

    if (value && value !== "all") {
      params.set("language", value)
    }

    const queryString = params.toString()
    router.push(`/submissions${queryString ? `?${queryString}` : ""}`)
  }

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
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select defaultValue={currentStatus || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((item) => (
              <SelectItem key={item.status} value={item.status}>
                {item.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={currentLanguage || "all"} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((item) => (
              <SelectItem key={item.language} value={item.language}>
                {item.language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(currentStatus || currentLanguage) && (
          <Button variant="ghost" asChild>
            <Link href="/submissions">Clear Filters</Link>
          </Button>
        )}
      </div>

      {/* Submissions table */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>Your recent code submissions and their results</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Link
                        href={`/problems/${submission.problem_id}`}
                        className="font-medium hover:underline flex items-center gap-2"
                      >
                        {submission.problems?.title}
                        <Badge
                          className={
                            submission.problems?.difficulty === "easy"
                              ? "bg-green-500"
                              : submission.problems?.difficulty === "medium"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }
                        >
                          {submission.problems?.difficulty}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{submission.language}</Badge>
                    </TableCell>
                    <TableCell>{submission.execution_time ? `${submission.execution_time} ms` : "-"}</TableCell>
                    <TableCell>{submission.memory_used ? `${submission.memory_used} MB` : "-"}</TableCell>
                    <TableCell>{formatDate(submission.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No submissions found</p>
              <p className="text-muted-foreground">Start solving problems to see your submissions here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
