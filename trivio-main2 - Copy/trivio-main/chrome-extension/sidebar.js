let question_bank = [];
let timestamps = [];

document.addEventListener('DOMContentLoaded', () => {
  const videoPreview = document.getElementById('video-preview');
  const generateBtn = document.getElementById('generate-btn');
  const quizContainer = document.getElementById('quiz-container');
  const scoreContainer = document.getElementById('score-container');
  const question = document.getElementById('question');
  const continueBtn = document.getElementById('continue');
  const scoreText = document.getElementById('score-text');
  const correctAnswersList = document.getElementById('correct-answers');
  const restartBtn = document.getElementById('restart-btn');
  const generateBtnText = generateBtn.querySelector('.btn-text');
  const generateBtnLoader = generateBtn.querySelector('.loader');

  let youtubeUrl = '';
  let currentQuestionIndex = 0;
  let score = 0;
  let userAnswers = []; // To track answers for score display

  function getYouTubeUrl() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ request: "getUrl" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.url) {
          resolve(response.url);
        } else {
          reject(new Error('No URL received'));
        }
      });
    });
  }

  function getVideoId(url) {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v') || '';
  }

  // Load video preview
  getYouTubeUrl()
    .then((url) => {
      youtubeUrl = url;
      if (youtubeUrl && youtubeUrl.includes("youtube.com/watch")) {
        const videoId = getVideoId(youtubeUrl);
        if (videoId) {
          videoPreview.innerHTML = `
            <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="Thumbnail">
            <p>${youtubeUrl}</p>
          `;
        } else {
          videoPreview.textContent = 'Invalid YouTube URL.';
        }
      } else {
        videoPreview.textContent = 'Open a YouTube video.';
      }
    })
    .catch((error) => {
      videoPreview.textContent = 'Error fetching URL.';
      console.error(error);
    });

  // Handle messages from content scripts
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handleMessage = async () => {
      try {
        if (request.type === "getQuestions") {
          await send_get_question_request(request.video_url);
          timestamps = question_bank.map(q => q.timestamp);
          return { success: true, timestamp: timestamps };
        }
        if (request.type === "displayQuestion") {
          await display_question(request.idx);
          return { success: true };
        }
        return { success: false, error: "Unknown message type" };
      } catch (error) {
        console.error("Error handling message:", error);
        return { success: false, error: error.message };
      }
    };
    Promise.resolve(handleMessage()).then(sendResponse);
    return true;
  });

  // Fetch questions from Flask and start quiz
  async function send_get_question_request(video_url) {
    const url = "http://127.0.0.1:5000/questions";
    generateBtn.disabled = true;
    generateBtnText.textContent = 'Generating Questions...';
    generateBtnLoader.style.display = 'inline-block';

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "link": video_url,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      question_bank = await response.json();
      console.log("Questions received:", question_bank);

      quizContainer.style.display = 'block';
      videoPreview.style.display = 'none';
      currentQuestionIndex = 0;
      score = 0; // Reset score
      userAnswers = []; // Reset answers
      display_question(currentQuestionIndex);
      return question_bank;
    } catch (error) {
      console.error("Error fetching questions:", error);
      videoPreview.textContent = 'Error fetching questions.';
      throw error;
    } finally {
      generateBtn.disabled = false;
      generateBtnText.textContent = 'Generate Questions';
      generateBtnLoader.style.display = 'none';
      generateBtn.style.display = 'none';
    }
  }

  // Display question
  async function display_question(idx) {
    if (!question_bank[idx]) {
      showScore();
      return;
    }
    question.textContent = question_bank[idx].question;
    populate_options_and_check_answer(idx);
  }

  // Populate options and handle clicks
  function populate_options_and_check_answer(idx) {
    const options = ['answer-a', 'answer-b', 'answer-c', 'answer-d'];
    if (continueBtn.style.display === "block") return;

    continueBtn.onclick = null;
    options.forEach((entry, i) => {
      const element = document.getElementById(entry);
      element.style.display = "block";
      element.textContent = question_bank[idx].answers[i];
      element.onclick = () => handleAnswerClick(element, idx, options);
    });
  }

  function handleAnswerClick(element, idx, options) {
    const selectedAnswer = element.textContent;
    const correctAnswer = question_bank[idx].correct_answer;
    userAnswers.push({ selected: selectedAnswer, correct: correctAnswer });

    if (selectedAnswer === correctAnswer) {
      element.style.backgroundColor = "green";
      score++;
    } else {
      element.style.backgroundColor = "red";
      // Highlight correct answer even if wrong is selected
      options.forEach(option => {
        const optElement = document.getElementById(option);
        if (optElement.textContent === correctAnswer) {
          optElement.style.backgroundColor = "green";
        }
      });
    }
    // Enable continue button regardless of answer
    continueBtn.style.display = "block";
    continueBtn.onclick = () => resetForNextQuestion(options);

    // Disable all buttons after selection
    options.forEach(option => {
      document.getElementById(option).disabled = true;
    });
  }

  function resetForNextQuestion(options) {
    options.forEach(option => {
      const btn = document.getElementById(option);
      btn.style.display = "none";
      btn.style.backgroundColor = null;
      btn.disabled = false;
    });
    continueBtn.style.display = "none";
    currentQuestionIndex++;
    display_question(currentQuestionIndex);
  }

  function showScore() {
    quizContainer.style.display = 'none';
    scoreContainer.style.display = 'block';
    scoreText.textContent = `${score} out of ${question_bank.length}`;

    correctAnswersList.innerHTML = '';
    question_bank.forEach((q, index) => {
      const li = document.createElement('li');
      li.textContent = `${q.question} - Correct: ${q.correct_answer}`;
      if (userAnswers[index]?.selected !== q.correct_answer) {
        li.style.color = '#d32f2f'; // Red for incorrect
        li.textContent += ` (Your answer: ${userAnswers[index]?.selected || 'None'})`;
      }
      correctAnswersList.appendChild(li);
    });

    playVideo(); // Resume video
  }

  function playVideo() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: "playVideo" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending playVideo message:", chrome.runtime.lastError.message);
        } else if (response?.success) {
          console.log("Video playback started");
        }
      });
    });
  }

  // Restart quiz
  restartBtn.addEventListener('click', () => {
    scoreContainer.style.display = 'none';
    videoPreview.style.display = 'block';
    generateBtn.style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    question_bank = [];
  });

  // Generate questions manually and start quiz
  generateBtn.addEventListener('click', () => {
    send_get_question_request(youtubeUrl);
  });
});