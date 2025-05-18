import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import CodeEditor from "@/components/code-editor"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import Link from "next/link"

export const revalidate = 3600 // Revalidate at most every hour

export default async function ProblemPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  // Fetch problem details
  const { data: problem, error } = await supabase.from("problems").select("*").eq("id", params.id).single()

  if (error || !problem) {
    notFound()
  }

  // Fetch test cases
  const { data: testCases } = await supabase
    .from("test_cases")
    .select("*")
    .eq("problem_id", problem.id)
    .eq("is_sample", true)

  // Fetch next and previous problems
  const { data: nextProblem } = await supabase
    .from("problems")
    .select("id, title")
    .eq("is_active", true)
    .gt("id", problem.id)
    .order("id", { ascending: true })
    .limit(1)
    .single()

  const { data: prevProblem } = await supabase
    .from("problems")
    .select("id, title")
    .eq("is_active", true)
    .lt("id", problem.id)
    .order("id", { ascending: false })
    .limit(1)
    .single()

  // Default starter code templates
  const starterCodeTemplates = {
    javascript: `function solution(input) {
  // Your code here
  
  return output;
}

// Example usage:
// const result = solution(${problem.sample_input ? JSON.stringify(problem.sample_input) : '"input"'});
// console.log(result);`,
    python: `def solution(input):
    # Your code here
    
    return output

# Example usage:
# result = solution(${problem.sample_input ? problem.sample_input : '"input"'})
# print(result)`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Example usage
        // System.out.println(solution(${problem.sample_input ? problem.sample_input : '"input"'}));
    }
    
    public static String solution(String input) {
        // Your code here
        
        return "output";
    }
}`,
    cpp: `#include <iostream>
#include <string>

std::string solution(std::string input) {
    // Your code here
    
    return "output";
}

int main() {
    // Example usage
    // std::cout << solution(${problem.sample_input ? problem.sample_input : '"input"'}) << std::endl;
    return 0;
}`,
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        {/* Problem header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
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
          </div>
          <div className="flex flex-wrap gap-2">
            {problem.tags?.map((tag: string, index: number) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem description */}
          <div className="flex flex-col space-y-6">
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="hints">Hints</TabsTrigger>
                {problem.editorial && <TabsTrigger value="editorial">Editorial</TabsTrigger>}
              </TabsList>
              <TabsContent value="description" className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                </div>

                {problem.constraints && (
                  <div>
                    <h3 className="text-lg font-semibold">Constraints</h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: problem.constraints }} />
                    </div>
                  </div>
                )}

                {problem.input_format && (
                  <div>
                    <h3 className="text-lg font-semibold">Input Format</h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: problem.input_format }} />
                    </div>
                  </div>
                )}

                {problem.output_format && (
                  <div>
                    <h3 className="text-lg font-semibold">Output Format</h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: problem.output_format }} />
                    </div>
                  </div>
                )}

                {(problem.sample_input || problem.sample_output) && (
                  <div>
                    <h3 className="text-lg font-semibold">Examples</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {problem.sample_input && (
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">Input</h4>
                            <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                              <code>{problem.sample_input}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      )}
                      {problem.sample_output && (
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">Output</h4>
                            <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                              <code>{problem.sample_output}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {testCases && testCases.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold">Test Cases</h3>
                    <div className="space-y-4">
                      {testCases.map((testCase, index) => (
                        <div key={testCase.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">Input {index + 1}</h4>
                              <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                                <code>{testCase.input}</code>
                              </pre>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">Expected Output {index + 1}</h4>
                              <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                                <code>{testCase.expected_output}</code>
                              </pre>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {problem.explanation && (
                  <div>
                    <h3 className="text-lg font-semibold">Explanation</h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: problem.explanation }} />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hints">
                {problem.hints && problem.hints.length > 0 ? (
                  <div className="space-y-4">
                    {problem.hints.map((hint: string, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex items-start gap-2">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium">Hint {index + 1}</h3>
                            <p>{hint}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hints available for this problem.</p>
                  </div>
                )}
              </TabsContent>

              {problem.editorial && (
                <TabsContent value="editorial">
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: problem.editorial }} />
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              {prevProblem ? (
                <Button variant="outline" asChild>
                  <Link href={`/problems/${prevProblem.id}`}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}

              {nextProblem ? (
                <Button variant="outline" asChild>
                  <Link href={`/problems/${nextProblem.id}`}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Code editor */}
          <div className="flex flex-col space-y-4">
            <CodeEditor problemId={problem.id} starterCodeTemplates={starterCodeTemplates} />
          </div>
        </div>
      </div>
    </div>
  )
}
