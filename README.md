# ASHA-Sphere: Your Digital Confidante

ASHA-Sphere is a compassionate AI companion designed specifically for healthcare workers. It provides a private, non-judgmental space for them to voice their thoughts and feelings, offering empathetic and encouraging responses to help manage stress and prevent burnout.

## Key Features

* **Voice-to-Text Journaling**: Simply speak your thoughts, and the app transcribes them.
* **AI-Powered Empathetic Responses**: Get immediate, supportive feedback from an AI fine-tuned to be a compassionate listener.
* **Mood & Sentiment Analysis**: The app analyzes the sentiment of your entry to help track your emotional state over time.
* **Local-First & Private**: Journal entries are saved locally on your device or in a private database you control, ensuring complete confidentiality.
* **Community Wisdom**: See anonymized, uplifting insights from the community to feel less alone in your journey.

## Tech Stack

* **Frontend**: React, Vite, TypeScript, Lucide Icons
* **Backend**: Python, FastAPI
* **AI**: Google Gemini 1.5 Flash
* **Database**: Simple JSON file-based DB for local storage

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js & npm (for Frontend)
* Python 3.8+ & pip (for Backend)
* A Google AI API Key (for the Gemini model)

### Backend Setup

1.  **Navigate to the Backend Directory**
    (The folder containing `main.py`)

2.  **Create a Virtual Environment**
    ```sh
    python -m venv venv
    ```

3.  **Activate the Virtual Environment**
    * On Windows:
        ```sh
        .\venv\Scripts\activate
        ```
    * On macOS/Linux:
        ```sh
        source venv/bin/activate
        ```

4.  **Install Dependencies**
    Create a file named `requirements.txt` with the following content:
    ```
    fastapi
    uvicorn[standard]
    pydantic
    python-dotenv
    google-generativeai
    ```
    Then, run the command:
    ```sh
    pip install -r requirements.txt
    ```

5.  **Set Up Environment Variables**
    Create a file named `.env` in the backend directory and add your Google API key:
    ```
    GOOGLE_API_KEY="your_google_api_key_here"
    ```

6.  **Run the Backend Server**
    ```sh
    uvicorn main:app --reload
    ```
    The server will be running at `http://localhost:8000`.

### Frontend Setup

1.  **Navigate to the Frontend Directory**

2.  **Install NPM Packages**
    ```sh
    npm install
    ```

3.  **Set Up Environment Variables**
    Create a file named `.env` in the frontend directory and add the following line to connect it to your local backend:
    ```
    VITE_API_BASE_URL="https://asha-backend-twa0.onrender.com"
    ```

4.  **Run the Frontend App**
    ```sh
    npm run dev
    ```
    The app will be running at `http://localhost:5173`. Open this URL in your browser.

## Live Demo

- **Frontend** (Vercel): https://asha-sigma.vercel.app 
- **Backend** (Render): https://asha-sphere-api.onrender.com

## Test It:
Try journaling a thought and receive a response from the AI!

## Note:
Deployment servers (Render) may sleep if inactive for a while. Wait 20–30 seconds if the backend takes time to respond initially.


### Notes on Privacy
- .env files are excluded from version control (via .gitignore)

- Journal entries can be saved locally or routed to an optional secure backend

### Future Improvements
- Local database encryption

- Multi-language support

- Offline support with localStorage fallback

- Optional dashboard for mood analytics

### Contact
If you're reviewing this for a hackathon or collaboration:

**Ashmeet Kaur**

GitHub Profile : ashmeetkb10@gmail.com (registered in the hackathon by akaur5_be22@thapar.edu)