import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { code, language, problemId } = body

    if (!code || !language || !problemId) {
      return NextResponse.json({ error: "Missing required fields: code, language, or problemId" }, { status: 400 })
    }

    // Authenticate the request
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Simulate code execution
    // In a real-world scenario, you would send this to a secure execution environment

    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a sample output based on the language
    let output = ""
    switch (language) {
      case "javascript":
        output = "// JavaScript execution\nconsole.log('Hello, World!');\n\n> Hello, World!"
        break
      case "python":
        output = "# Python execution\nprint('Hello, World!')\n\n> Hello, World!"
        break
      case "java":
        output =
          '// Java execution\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}\n\n> Hello, World!'
        break
      case "cpp":
        output =
          '// C++ execution\n#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}\n\n> Hello, World!'
        break
      default:
        output = `Execution for ${language} is not supported yet.`
    }

    // Fetch test cases for the problem
    const { data: testCases } = await supabase.from("test_cases").select("*").eq("problem_id", problemId)

    // Simulate test case validation
    const testCaseResults = testCases
      ? testCases.map((testCase) => {
          // Simulate a 70% pass rate for demo purposes
          const passed = Math.random() > 0.3

          return {
            input: testCase.input,
            expectedOutput: testCase.expected_output,
            actualOutput: passed ? testCase.expected_output : "Incorrect output",
            passed,
          }
        })
      : []

    const testCasesPassed = testCaseResults.filter((r) => r.passed).length
    const totalTestCases = testCaseResults.length

    return NextResponse.json({
      success: true,
      output,
      executionTime: Math.random() * 0.5 + 0.1, // Random value between 0.1-0.6 seconds
      memoryUsed: Math.random() * 10 + 5, // Random value between 5-15 MB
      testCasesPassed,
      totalTestCases,
      testCaseResults,
    })
  } catch (error) {
    console.error("Code execution API error:", error)
    return NextResponse.json({ error: "Failed to execute code" }, { status: 500 })
  }
}
