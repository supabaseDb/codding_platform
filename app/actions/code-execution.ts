"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

// Function to sanitize code to prevent malicious execution
function sanitizeCode(code: string): string {
  // In a real-world scenario, you'd implement more robust sanitization
  // This is a simple example to remove potentially harmful patterns
  return code
    .replace(/process\.exit/g, "/* process.exit */")
    .replace(/require\s*$$\s*['"]child_process['"]\s*$$/g, '/* require("child_process") */')
    .replace(/exec\s*\(/g, "/* exec( */")
    .replace(/eval\s*\(/g, "/* eval( */")
}

// Function to validate test cases against code output
async function validateTestCases(problemId: number, code: string, language: string) {
  const supabase = createServerSupabaseClient()

  // Fetch test cases for the problem
  const { data: testCases } = await supabase.from("test_cases").select("*").eq("problem_id", problemId)

  if (!testCases || testCases.length === 0) {
    return {
      testCasesPassed: 0,
      totalTestCases: 0,
      results: [],
    }
  }

  // For demo purposes, we'll simulate test case validation
  // In a real implementation, you would execute the code against each test case
  const results = testCases.map((testCase) => {
    // Simulate a 70% pass rate for demo purposes
    const passed = Math.random() > 0.3

    return {
      input: testCase.input,
      expectedOutput: testCase.expected_output,
      actualOutput: passed ? testCase.expected_output : "Incorrect output",
      passed,
    }
  })

  const testCasesPassed = results.filter((r) => r.passed).length

  return {
    testCasesPassed,
    totalTestCases: testCases.length,
    results,
  }
}

export async function executeCode(code: string, language: string, problemId: number) {
  try {
    // Sanitize code to prevent malicious execution
    const sanitizedCode = sanitizeCode(code)

    // Record execution start time
    const startTime = Date.now()

    // Simulate code execution delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real implementation, you would send the code to a secure execution environment
    // For this demo, we'll simulate execution

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

    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000

    // Simulate memory usage
    const memoryUsed = Math.random() * 10 + 5 // Random value between 5-15 MB

    // Validate against test cases
    const testCaseResults = await validateTestCases(problemId, sanitizedCode, language)

    return {
      success: true,
      output,
      executionTime,
      memoryUsed,
      testCasesPassed: testCaseResults.testCasesPassed,
      totalTestCases: testCaseResults.totalTestCases,
      testCaseResults: testCaseResults.results,
    }
  } catch (error) {
    console.error("Code execution error:", error)
    return {
      success: false,
      output: `Error executing code: ${error instanceof Error ? error.message : String(error)}`,
      executionTime: 0,
      memoryUsed: 0,
      testCasesPassed: 0,
      totalTestCases: 0,
      testCaseResults: [],
    }
  }
}

export async function submitSolution(userId: string, problemId: number, code: string, language: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Execute the code first
    const executionResult = await executeCode(code, language, problemId)

    // Determine status based on test cases
    const status = executionResult.testCasesPassed === executionResult.totalTestCases ? "Accepted" : "Wrong Answer"

    // Save submission to database
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_id: userId,
        problem_id: problemId,
        code: code,
        language: language,
        status: status,
        execution_time: executionResult.executionTime,
        memory_used: executionResult.memoryUsed,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Update user statistics
    await updateUserStatistics(userId, status)

    return {
      success: true,
      submission: data,
      executionResult,
    }
  } catch (error) {
    console.error("Submission error:", error)
    return {
      success: false,
      message: `Failed to submit solution: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

async function updateUserStatistics(userId: string, status: string) {
  const supabase = createServerSupabaseClient()

  // Get current user statistics
  const { data: stats } = await supabase.from("user_statistics").select("*").eq("user_id", userId).single()

  if (!stats) {
    // Create new statistics record if it doesn't exist
    await supabase.from("user_statistics").insert({
      user_id: userId,
      problems_solved: status === "Accepted" ? 1 : 0,
      total_submissions: 1,
      accepted_submissions: status === "Accepted" ? 1 : 0,
      wrong_submissions: status === "Wrong Answer" ? 1 : 0,
      compilation_errors: status === "Compilation Error" ? 1 : 0,
      runtime_errors: status === "Runtime Error" ? 1 : 0,
      time_limit_exceeded: status === "Time Limit Exceeded" ? 1 : 0,
      last_updated: new Date().toISOString(),
    })
    return
  }

  // Update existing statistics
  const updates: any = {
    total_submissions: (stats.total_submissions || 0) + 1,
    last_updated: new Date().toISOString(),
  }

  // Update specific status counters
  switch (status) {
    case "Accepted":
      updates.accepted_submissions = (stats.accepted_submissions || 0) + 1
      // Only increment problems_solved if this is the first accepted solution
      // In a real app, you'd check if this specific problem was already solved
      updates.problems_solved = (stats.problems_solved || 0) + 1
      break
    case "Wrong Answer":
      updates.wrong_submissions = (stats.wrong_submissions || 0) + 1
      break
    case "Compilation Error":
      updates.compilation_errors = (stats.compilation_errors || 0) + 1
      break
    case "Runtime Error":
      updates.runtime_errors = (stats.runtime_errors || 0) + 1
      break
    case "Time Limit Exceeded":
      updates.time_limit_exceeded = (stats.time_limit_exceeded || 0) + 1
      break
  }

  await supabase.from("user_statistics").update(updates).eq("user_id", userId)
}
