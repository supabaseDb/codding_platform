"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Problem = {
  id: number
  title: string
  difficulty: string
  category: string | null
  tags: string[] | null
}

type Category = {
  id: number
  name: string
}

type DifficultyMap = {
  easy: { count: number; color: string }
  medium: { count: number; color: string }
  hard: { count: number; color: string }
}

interface ProblemsListProps {
  problems: Problem[]
  categories: Category[]
  difficultyMap: DifficultyMap
  currentDifficulty?: string
  currentCategory?: string
  currentSearch?: string
}

export default function ProblemsList({
  problems,
  categories,
  difficultyMap,
  currentDifficulty,
  currentCategory,
  currentSearch,
}: ProblemsListProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(currentSearch || "")

  const handleSearch = (value: string) => {
    setSearchInput(value)
    const params = new URLSearchParams()

    if (currentDifficulty) {
      params.set("difficulty", currentDifficulty)
    }

    if (currentCategory) {
      params.set("category", currentCategory)
    }

    if (value) {
      params.set("search", value)
    }

    const queryString = params.toString()
    router.push(`/problems${queryString ? `?${queryString}` : ""}`)
  }

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams()

    if (currentDifficulty) {
      params.set("difficulty", currentDifficulty)
    }

    if (value && value !== "all") {
      params.set("category", value)
    }

    if (currentSearch) {
      params.set("search", currentSearch)
    }

    const queryString = params.toString()
    router.push(`/problems${queryString ? `?${queryString}` : ""}`)
  }

  return (
    <>
      {/* Difficulty tabs */}
      <Tabs defaultValue={currentDifficulty || "all"} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" asChild>
            <Link href="/problems">All</Link>
          </TabsTrigger>
          <TabsTrigger value="easy" asChild>
            <Link href="/problems?difficulty=easy">
              Easy <Badge className="ml-2 bg-green-500">{difficultyMap.easy.count}</Badge>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="medium" asChild>
            <Link href="/problems?difficulty=medium">
              Medium <Badge className="ml-2 bg-yellow-500">{difficultyMap.medium.count}</Badge>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="hard" asChild>
            <Link href="/problems?difficulty=hard">
              Hard <Badge className="ml-2 bg-red-500">{difficultyMap.hard.count}</Badge>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search problems..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(searchInput)
              }
            }}
          />
        </div>
        <Select defaultValue={currentCategory || "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Problems list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {problems.length > 0 ? (
          problems.map((problem) => (
            <Card key={problem.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{problem.title}</span>
                  <Badge
                    className={
                      problem.difficulty === "easy"
                        ? "bg-green-500"
                        : problem.difficulty === "medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }
                  >
                    {problem.difficulty}
                  </Badge>
                </CardTitle>
                <CardDescription>{problem.category || "General"}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {problem.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/problems/${problem.id}`}>Solve</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-semibold">No problems found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </>
  )
}
