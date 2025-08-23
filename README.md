# VirtualTelecaller

VirtualTelecaller is an AI-powered system designed to automate the handling of incoming calls for a company. Instead of relying on human agents, the system listens to callers, understands their queries using speech recognition and natural language processing (NLP), and provides appropriate responses in real time through text-to-speech (TTS).

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Diagrams](#diagrams)
- [Flowchart](#flowchart)
- [Contact](#contact)

---

## About

**Virtual Tele Caller** automates customer interactions by understanding speech, processing queries using AI, and responding instantly.  
The platform aims to:

- Reduce the workload of human telecallers.
- Provide 24/7 availability for customer queries.
- Improve response accuracy and consistency.
- Ensure faster query resolution with minimal wait time.

---

## Features

- Automated speech recognition and understanding
- Real-time NLP-based query handling
- Instant responses via text-to-speech (TTS)
- Scalable and available 24/7
- Consistent and accurate customer support
- **Upload the detailed document of the telecaller role:**  
  - Upload a document describing the role of the telecaller; replies will be generated using its content.
  - Optionally, just name the role, and the platform will auto-generate the document using AI.
- **Voice Selection:**  
  - Choose from multiple AI voices for responses:
    - Aria
    - Brian
    - Freya
    - Lily
    - Thomas
    - Harsh (Indian accent)
    - Monica (Indian accent)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/AayushPatel8/VirtualTelecaller.git

# Change directory
cd VirtualTelecaller

# Install packages
npm i
```

---

## Usage

1. **Install dependencies (see Installation section above).**

2. **Environment Variables:**  
   - Create a `.env` file in the root directory.
   - Copy the contents from `.env.sample` into `.env`.
   - Set your API keys in the `.env` file:
     - `GEMINI_API_KEY`
     - `ELEVENLABS_API_KEY`
     - `GROQ_API_KEY`
   - If you do not have API keys, create or get them from the following:
     - [Google Gemini API Key](https://ai.google.dev/)
     - [ElevenLabs API Key](https://elevenlabs.io/)
     - [Groq API Key](https://console.groq.com/keys)

3. **Run the application:**
   - **Start Backend:**
     ```bash
     cd backend
     python main.py
     ```
   - **Start Frontend:**
     ```bash
     npm run dev
     ```

---

## Screenshots

<img width="1901" height="875" alt="image" src="https://github.com/user-attachments/assets/f6e9b431-9323-47b9-bff8-5e0a1496402c" />
<img width="1900" height="875" alt="image" src="https://github.com/user-attachments/assets/fcb8a9c0-cfc3-47c1-8292-a381ec5b4939" />
<img width="1918" height="872" alt="image" src="https://github.com/user-attachments/assets/0c88f838-17f7-4332-981d-fce4942b917c" />

---

## Diagrams

### Use Case Diagram

<img width="708" height="616" alt="Usecase Telecaller" src="https://github.com/user-attachments/assets/152f9562-680f-4517-9f26-63b89510e72a" />

## Flowchart

<img width="682" height="1152" alt="Untitled Diagram drawio" src="https://github.com/user-attachments/assets/9e5d54fe-48f5-4ff6-b73b-b23b92c2512a" />


## Contact

Author: [Aayush Patel]  
Email: [patelaayush1830@gmail.com]  
GitHub: [AayushPatel8](https://github.com/AayushPatel8)

---
