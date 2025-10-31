<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1CAKAy-ufCnWLOHs-NKqIJnRDsTGF58Z8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in [.env](.env) to your Gemini API key
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Open the `.env` file and replace `your_gemini_api_key_here` with your actual API key
3. Run the app:
   `npm run dev`
