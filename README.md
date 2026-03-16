# Code Explainer (PHP + JavaScript + Groq AI)
Overview
Code Explainer is a simple web tool that helps developers understand code quickly.
Users paste a code snippet, select the programming language, and the system returns:
•	A short plain-English explanation
•	Time and space complexity
•	A possible optimized version of the code
The application uses a PHP backend, a JavaScript frontend, and an AI model from Groq to analyze the code

# System Architecture
The application follows a basic client–server architecture.
User Browser
     │
     │  (code snippet + language)
     ▼
Frontend (HTML + JavaScript)
     │
     │  POST request (Fetch API)
     ▼
PHP Backend
     │
     │  Prompt + code
     ▼
Groq AI API
     │
     │  JSON response
     ▼
PHP Backend
     │
     ▼
Frontend displays results

# Components
1. Frontend
Built using:
•	HTML
•	JavaScript
•	Bootstrap
•	Highlight.js
Responsibilities:
•	Accept code input from the user
•	Send the code to the PHP backend
•	Display the explanation and complexity
•	Show syntax-highlighted code
•	Save history using localStorage

2. Backend
Implemented using PHP.
Responsibilities:
•	Receive POST request from frontend
•	Prepare prompt for AI
•	Send request to Groq API using cURL
•	Parse the response
•	Return structured JSON to frontend
________________________________________
3. AI Service
The system uses a large language model from Groq.
Model used:
llama-3.3-70b-versatile
The AI analyzes the code and generates:
•	Explanation
•	Complexity
•	Optimized code suggestion

# Why Groq AI Was Chosen
Groq was selected because:
1. Fast performance
    Groq hardware provides very low response time.
2. Good code understanding
    The Llama models perform well for code explanation and reasoning.
3. OpenAI-compatible API
    The API is similar to OpenAI’s API, making integration with PHP simple.
4. Cost efficiency
    Groq offers a free tier that works well for small projects.


# Prompt Design
A structured system prompt is used to ensure consistent responses.
The model is instructed to return only JSON in this format:
{
 "explanation": "...",
 "complexity": "...",
 "optimized": "..."
}
This allows PHP to easily parse the response and send it to the frontend.

# Data Flow
# Step 1
User pastes code and selects language.
# Step 2
JavaScript sends a POST request to the PHP backend.
# Step 3
PHP creates a prompt containing:
•	language
•	code snippet
# Step 4
The request is sent to the Groq AI API.
# Step 5
The AI analyzes the code and returns JSON.
# Step 6
PHP extracts:
•	explanation
•	complexity
•	optimized code
# Step 7
The frontend displays the results to the user.

# Error Handling
The system handles several errors:
•	Invalid API key
•	Rate limit errors
•	Invalid AI response
•	JSON parsing issues
If parsing fails, the raw explanation is still returned.

# Limitations
•	AI responses depend on model accuracy
•	History is not stored permanently

# Possible Improvements
Future versions could include:
•	Line-by-line code explanation
•	Bug detection
•	Security vulnerability scanning
•	Database storage for history

# Conclusion
This project demonstrates how AI models can be integrated with traditional web technologies like PHP and JavaScript to build useful developer tools.
The system is lightweight, easy to understand, and helps developers quickly analyze and improve their code.
