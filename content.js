let recordingState = {
  recording: false,
  mediaRecorder: null,
  recordedChunks: [],
  stream: null
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    startRecording()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === 'stopRecording') {
    stopRecording();
    sendResponse({ success: true });
    return false;
  } else if (request.action === 'getRecordedData') {
    if (recordingState.recordedChunks.length > 0) {
      const blob = new Blob(recordingState.recordedChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        sendResponse({
          success: true,
          data: reader.result,
          fileSize: blob.size
        });
      };
      reader.readAsArrayBuffer(blob);
    } else {
      sendResponse({ success: false, error: 'No recording data' });
    }
    return true;
  }
});

async function startRecording() {
  try {
    const constraints = {
      video: {
        width: { ideal: window.innerWidth },
        height: { ideal: window.innerHeight }
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    recordingState.stream = stream;
    recordingState.recordedChunks = [];

    const mimeType = 'video/webm;codecs=vp8';
    const options = { mimeType };

    recordingState.mediaRecorder = new MediaRecorder(stream, options);

    recordingState.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingState.recordedChunks.push(event.data);
      }
    };

    recordingState.mediaRecorder.onstop = () => {
      if (recordingState.stream) {
        recordingState.stream.getTracks().forEach(track => track.stop());
        recordingState.stream = null;
      }
    };

    recordingState.mediaRecorder.start();
    recordingState.recording = true;

  } catch (error) {
    throw new Error('Failed to start recording: ' + error.message);
  }
}

function stopRecording() {
  if (recordingState.mediaRecorder && recordingState.recording) {
    recordingState.mediaRecorder.stop();
    recordingState.recording = false;
  }
}
