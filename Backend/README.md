# Telecaller Backend

This is the backend server for the virtual telecaller application. It handles context management, voice processing, and AI-enhanced context generation.

## Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Make sure you have the following environment variables set in your `.env` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. Run the server:
   ```
   python app.py
   ```

## New Feature: AI-Enhanced Context Generation

The backend now supports generating AI-enhanced context for virtual telecallers based on specified roles. This feature uses Google's Gemini AI to generate detailed context information structured for the telecaller application.

When enabled from the frontend, the system will:
1. Take the specified role (e.g., "McDonald's seller", "Policeman", "Customer Care taker")
2. Generate a comprehensive context file with industry details, products/services, common questions, etc.
3. Save the generated content to the context file (MaC.txt)

The AI-generated context follows a standardized format for consistency across different roles. 