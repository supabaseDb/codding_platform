export function formatExecutionOutput(language: string, code: string, output: string): string {
  switch (language) {
    case "javascript":
      return `// JavaScript Code Execution\n${code}\n\n// Output:\n${output}`
    case "python":
      return `# Python Code Execution\n${code}\n\n# Output:\n${output}`
    case "java":
      return `// Java Code Execution\n${code}\n\n// Output:\n${output}`
    case "cpp":
      return `// C++ Code Execution\n${code}\n\n// Output:\n${output}`
    default:
      return `// Code Execution (${language})\n${code}\n\n// Output:\n${output}`
  }
}

export function getLanguageFileExtension(language: string): string {
  switch (language) {
    case "javascript":
      return "js"
    case "python":
      return "py"
    case "java":
      return "java"
    case "cpp":
      return "cpp"
    default:
      return "txt"
  }
}

export function getDefaultCodeTemplate(language: string): string {
  switch (language) {
    case "javascript":
      return `function solution(input) {
  // Your code here
  
  return "output";
}

// Example usage:
// const result = solution("input");
// console.log(result);`
    case "python":
      return `def solution(input):
    # Your code here
    
    return "output"

# Example usage:
# result = solution("input")
# print(result)`
    case "java":
      return `public class Solution {
    public static void main(String[] args) {
        // Example usage
        // System.out.println(solution("input"));
    }
    
    public static String solution(String input) {
        // Your code here
        
        return "output";
    }
}`
    case "cpp":
      return `#include <iostream>
#include <string>

std::string solution(std::string input) {
    // Your code here
    
    return "output";
}

int main() {
    // Example usage
    // std::cout << solution("input") << std::endl;
    return 0;
}`
    default:
      return `// Write your code here`
  }
}
