var timestamps = [];
async function get_questions() {
  timestamps = [];
  try {
    console.log("Fetching questions...");
    const response = await chrome.runtime.sendMessage({
      type: "getQuestions",
      video_url: window.location.href
    });
    if (!response.success) throw new Error(response.error || "Failed to get questions");
    console.log("Questions retrieved:", response);
    return response.timestamp;
  } catch (error) {
    console.error("Error in get_questions:", error);
    throw error;
  }
}

function search_ques_index(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  let resultIndex = -1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] < target) {
      resultIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  if (resultIndex !== -1 && target - arr[resultIndex] <= 1) return resultIndex;
  return null;
}

async function display_question(input_idx) {
  try {
    console.log("Displaying question...");
    const response = await chrome.runtime.sendMessage({
      type: "displayQuestion",
      idx: input_idx
    });
    if (!response.success) throw new Error(response.error || "Failed to display question");
    console.log("Question displayed successfully");
    return true;
  } catch (error) {
    console.error("Error in display_question:", error);
    throw error;
  }
}

async function get_and_display_questions() {
  try {
    timestamps = await get_questions();
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Questions fetched");
  } catch (error) {
    console.error("Error in get_and_display_questions:", error);
  }
}

async function getCurrentVideoTime() {
  const video = document.querySelector('video');
  if (video) {
    const currentTime = video.currentTime;
    var idx = search_ques_index(timestamps, currentTime);
    console.log(`Current video time: ${currentTime}, idx: ${idx}`);
    if (idx !== null) {
      console.log('Pausing video to display question');
      await display_question(idx);
      video.pause();
    }
    return currentTime;
  } else {
    console.log('Video element not found');
    return null;
  }
}

const timeCheckInterval = setInterval(() => {
  getCurrentVideoTime();
}, 1000);

get_and_display_questions();