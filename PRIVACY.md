# Privacy Policy — GitHub Repo Summarizer

**Last updated: June 26, 2026**

## Overview

GitHub Repo Summarizer is a browser extension that uses AI to analyze GitHub repositories, generate summaries, and answer questions about codebases via a chat interface.

## Data We Collect

We collect only what is necessary to provide the extension's core functionality:

- **Repository content** — When you analyze a repository, the extension reads the repository name, owner, README, and file structure from the current GitHub page and sends it to our backend API (`https://xtension.onrender.com`) to generate an AI summary.
- **Chat messages** — Questions you type or speak in the chat are sent to our backend API to generate answers about the repository.

## Data We Do NOT Collect

- No personally identifiable information (name, email, age, etc.)
- No authentication credentials or passwords
- No browsing history outside of GitHub
- No financial or payment information
- No health information
- No location data
- No keystroke logging or mouse tracking

## Data Storage

- Analysis results, chat history, visited repositories, and favorites are stored **locally** in your browser using the Chrome/Edge storage API. This data never leaves your device unless you explicitly trigger an analysis or chat request.
- Audio from voice input is processed entirely by the browser's built-in Web Speech API on the GitHub page. No audio data is transmitted to our servers — only the final text transcript is used.

## Third Parties

We do not sell, trade, or transfer your data to any third parties. Data sent to `https://xtension.onrender.com` is used solely to generate AI responses and is not shared with or sold to any external party.

## Data Retention

We do not store any user data on our servers beyond what is needed to process a single request. No logs of repository content or chat messages are retained after the response is returned.

## Contact

For questions or concerns about this privacy policy, please open an issue at:  
https://github.com/srivatsavavuppala/xtension/issues
