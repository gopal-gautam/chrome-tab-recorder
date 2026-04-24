let recordingState = {
  recording: false,
  hasStopped: false,
  status: 'Idle',
  duration: 0,
  fileSize: 0
};

let mediaRecorder = null;
let recordedChunks = [];
let recordingStartTime = null;
let activeStream = null;
let activeTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleRecording') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        toggleRecording(tabs[0].id).then(() => {
          sendResponse(recordingState);
        });
      }
    });
    return true;
  } else if (request.action === 'getStatus') {
    if (recordingState.recording && recordingStartTime) {
      recordingState.duration = Date.now() - recordingStartTime;
    }
    sendResponse(recordingState);
    return false;
  } else if (request.action === 'download') {
    downloadRecording();
    return false;
  }
});

async function toggleRecording(tabId) {
  if (recordingState.recording) {
    stopRecording();
  } else {
    await startRecording(tabId);
  }
}

async function startRecording(tabId) {
  try {
    activeTabId = tabId;
    recordedChunks = [];
    recordingState.hasStopped = false;

    const stream = await chrome.tabCapture.captureStream(tabId);

    if (!stream) {
      recordingState.status = 'Error: No stream';
      return;
    }

    activeStream = stream;

    const mimeType = 'video/webm;codecs=vp8';
    const options = {
      mimeType: mimeType,
      videoBitsPerSecond: 5000000
    };

    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        recordingState.fileSize = recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
      }
    };

    mediaRecorder.onstop = () => {
      recordingState.recording = false;
      recordingState.status = 'Stopped';
      recordingState.hasStopped = true;

      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStream = null;
      }
    };

    mediaRecorder.start();
    recordingState.recording = true;
    recordingState.status = 'Recording...';
    recordingStartTime = Date.now();
  } catch (error) {
    console.error('Error starting recording:', error);
    recordingState.status = 'Error: ' + error.message;
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

function downloadRecording() {
  if (recordedChunks.length === 0) {
    console.warn('No recording to download');
    return;
  }

  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `recording-${timestamp}.webm`;

  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  });

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
