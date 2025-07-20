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
    pandas==1.5.3

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
    VITE_API_BASE_URL="https://086231bab7da.ngrok-free.app"
    ```

4.  **Run the Frontend App**
    ```sh
    npm run dev
    ```
    The app will be running at `http://localhost:5173`. Open this URL in your browser.

### Notes on ngrok

To expose your local app for testing:

1. Start backend and frontend locally as shown.
2. In a terminal, run:
    ```sh
    ngrok start --all --config path/to/ngrok.yml
    ```
3. Use the ngrok URLs in your frontend `.env` and to share your app.



## Live Demo (via ngrok - temporary)

- **Frontend**: [https://eef0722a90c7.ngrok-free.app](https://eef0722a90c7.ngrok-free.app)
- **Backend**: [https://086231bab7da.ngrok-free.app](https://086231bab7da.ngrok-free.app)

⚠️ Note: These links are only active while I'm running the tunnels locally. If the links don't work, please clone the repo and run it locally using the setup.


## Test It:
Try journaling a thought and receive a response from the AI!


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

GitHub Profile : ashmeetkb10@gmail.com (registered in the hackathon as akaur5_be22@thapar.edu)