"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/provider"
import { Loader2, Play, Save } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { executeCode, submitSolution } from "@/app/actions/code-execution"

interface CodeEditorProps {
  problemId: number
  starterCodeTemplates: {
    [key: string]: string
  }
}

export default function CodeEditor({ problemId, starterCodeTemplates }: CodeEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [user, setUser] = useState<any>(null)
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(starterCodeTemplates.javascript || "")
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("editor")

  // Load user session
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    getUser()
  }, [supabase])

  // Update code when language changes
  useEffect(() => {
    setCode(starterCodeTemplates[language] || "")
  }, [language, starterCodeTemplates])

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value)
  }

  // Handle code execution
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running.",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setExecutionResult(null)

    try {
      const result = await executeCode(code, language, problemId)
      setExecutionResult(result)
      setActiveTab("output") // Switch to output tab after execution
    } catch (error) {
      toast({
        title: "Execution Error",
        description: "Failed to execute code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // Handle code submission
  const handleSubmitCode = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your solution.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitSolution(user.id, problemId, code, language)

      if (!result.success) {
        throw new Error(result.message || "Failed to submit solution")
      }

      toast({
        title: "Submission Successful",
        description: `Your solution has been submitted. ${result.executionResult.testCasesPassed} of ${result.executionResult.totalTestCases} test cases passed.`,
        variant:
          result.executionResult.testCasesPassed === result.executionResult.totalTestCases ? "default" : "destructive",
      })

      setExecutionResult(result.executionResult)
      setActiveTab("output") // Switch to output tab after submission

      // Refresh the page to show updated submission status
      router.refresh()
    } catch (error) {
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to submit your solution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRunCode} disabled={isExecuting || isSubmitting}>
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </Button>

          <Button onClick={handleSubmitCode} disabled={isExecuting || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-full border rounded-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="mx-4 mt-2 justify-start">
            <TabsTrigger value="editor">Code Editor</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 p-0 m-0">
            <textarea
              className="w-full h-[500px] p-4 font-mono text-sm bg-muted resize-none focus:outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              spellCheck="false"
            />
          </TabsContent>

          <TabsContent value="output" className="flex-1 p-0 m-0">
            {executionResult ? (
              <div className="p-4 h-[500px] overflow-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                      {executionResult.output}
                    </pre>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div>
                        <p className="text-sm font-medium">Execution Time</p>
                        <p className="text-sm text-muted-foreground">{executionResult.executionTime.toFixed(2)} s</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Memory Used</p>
                        <p className="text-sm text-muted-foreground">{executionResult.memoryUsed.toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="w-full">
                      <p className="text-sm font-medium">Test Cases</p>
                      <p className="text-sm text-muted-foreground">
                        {executionResult.testCasesPassed} of {executionResult.totalTestCases} test cases passed
                      </p>
                      <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            executionResult.testCasesPassed === executionResult.totalTestCases
                              ? "bg-green-500"
                              : executionResult.testCasesPassed > 0
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: `${(executionResult.testCasesPassed / executionResult.totalTestCases) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {executionResult.testCaseResults && executionResult.testCaseResults.length > 0 && (
                      <div className="w-full mt-4">
                        <p className="text-sm font-medium mb-2">Test Case Details</p>
                        <div className="space-y-2">
                          {executionResult.testCaseResults.map((result: any, index: number) => (
                            <div key={index} className="border rounded-md p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Test Case {index + 1}</span>
                                <Badge className={result.passed ? "bg-green-500" : "bg-red-500"}>
                                  {result.passed ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="font-medium">Input:</p>
                                  <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">{result.input}</pre>
                                </div>
                                <div>
                                  <p className="font-medium">Expected Output:</p>
                                  <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                                    {result.expectedOutput}
                                  </pre>
                                </div>
                                {!result.passed && (
                                  <div className="md:col-span-2">
                                    <p className="font-medium">Your Output:</p>
                                    <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                                      {result.actualOutput}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                Run your code to see the output here
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
