# Trivio Backend API

Trivio is a backend Flask API that generates interactive quiz questions from YouTube video transcripts. Simply provide a YouTube video URL, and Trivio will extract the transcript, chunk it, and use the Google Gemini API to generate multiple-choice questions with a correct answer, perfect for creating engaging learning experiences or quick knowledge checks.

---

## Features

* **YouTube Transcript Extraction:** Automatically fetches transcripts for any given YouTube video URL using `youtube-transcript-api`.
* **Intelligent Text Chunking:** Divides the video transcript into meaningful segments to ensure questions are generated from coherent contexts.
* **AI-Powered Question Generation:** Leverages the **Google Gemini API** (`gemini-1.5-flash`) to create high-quality multiple-choice questions with a single correct answer and several distractors, based on the extracted text chunks.
* **Timestamp Integration:** Each generated question is associated with a timestamp from the video, allowing users to easily jump to the relevant part of the video for context.
* **CORS Enabled:** The API is configured with CORS (Cross-Origin Resource Sharing) to allow seamless integration with frontend applications.
* **Robust Error Handling:** Includes checks for invalid URLs, missing transcripts, and API generation failures.

---

## Technologies Used

* **Flask:** A lightweight Python web framework for building the API.
* **youtube-transcript-api:** Python library to fetch YouTube video transcripts.
* **google-generativeai:** Python client library for interacting with the Google Gemini API.
* **python-dotenv:** For loading environment variables securely.
* **Flask-CORS:** Flask extension for handling Cross-Origin Resource Sharing.

---

## Getting Started

Follow these steps to set up and run the Trivio backend API on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Python 3.8+**
* **pip** (Python package installer)
* **Google Gemini API Key:** You'll need an API key from Google AI Studio. You can get one [here](https://aistudio.google.com/app/apikey).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/Trivio.git](https://github.com/your-username/Trivio.git) # Replace with your actual repo URL
    cd Trivio # Navigate into your project directory
    ```
2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On macOS/Linux
    .\venv\Scripts\activate   # On Windows
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    **`requirements.txt` content:**
    ```
    Flask
    youtube-transcript-api
    python-dotenv
    google-generativeai
    Flask-Cors
    ```
4.  **Set up your environment variables:**
    Create a file named `.env` in the root directory of your project (the same directory as `app.py`) and add your Google Gemini API key:
    ```
    GEMINI_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
    ```
    Replace `"YOUR_GOOGLE_GEMINI_API_KEY"` with the actual API key you obtained.

---

## Usage

### Running the API

To start the Flask development server:

```bash
python app.py
```
The API will run on `http://127.0.0.1:5000` by default. You will see output in your terminal indicating that the Flask server is running.

---

### API Endpoints

#### `GET /questions`

This endpoint generates questions from a YouTube video.

* **Method:** `GET`
* **Headers:**
    * `link`: **Required**. The full YouTube video URL (e.g., `http://youtube.com/watch?v=dQw4w9WgXcQ`).

* **Example Request (using curl):**

    ```bash
    curl -H "link: [http://youtube.com/watch?v=dQw4w9WgXcQ](http://youtube.com/watch?v=dQw4w9WgXcQ)" [http://127.0.0.1:5000/questions](http://127.0.0.1:5000/questions)
    ```
    Replace `dQw4w9WgXcQ` with an actual YouTube video ID.

* **Example Success Response (`200 OK`):**

    ```json
    [
      {
        "question": "What is the main topic discussed in the first part of the video?",
        "answers": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Option A",
        "timestamp": 0.0
      },
      {
        "question": "According to the speaker, what is the significance of X?",
        "answers": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correct_answer": "Option 3",
        "timestamp": 120.5
      }
      // ... more questions
    ]
    ```

* **Example Error Response (`400 Bad Request`):**

    ```json
    {"error": "No link provided in the request header"}
    ```
    or

    ```json
    {"error": "Invalid YouTube URL or no video ID found."}
    ```

---

### Project Structure
```plaintext
├── .env                  # Environment variables (e.g., GEMINI_KEY)
├── app.py                # Main Flask application file
├── requirements.txt      # Python dependencies
└── README.md             # This README file
```
---

### Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

### License

Distributed under the MIT License.
