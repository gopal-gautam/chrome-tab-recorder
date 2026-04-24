let recordingState = {
  recording: false,
  hasStopped: false,
  status: 'Idle',
  duration: 0,
  fileSize: 0
};

let recordingStartTime = null;
let activeTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleRecording') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const tabId = tabs[0].id;
        activeTabId = tabId;

        if (recordingState.recording) {
          sendMessageToTab(tabId, { action: 'stopRecording' }, (response) => {
            if (response) {
              recordingState.recording = false;
              recordingState.status = 'Stopped';
              recordingState.hasStopped = true;
            }
            sendResponse(recordingState);
          });
        } else {
          recordingState.hasStopped = false;
          sendMessageToTab(tabId, { action: 'startRecording' }, (response) => {
            if (response && response.success) {
              recordingState.recording = true;
              recordingState.status = 'Recording...';
              recordingStartTime = Date.now();
            } else {
              recordingState.status = 'Error: Cannot record this page (try a regular website)';
            }
            sendResponse(recordingState);
          });
        }
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
    if (activeTabId) {
      sendMessageToTab(activeTabId, { action: 'getRecordedData' }, (response) => {
        if (response && response.success) {
          downloadRecording(response.data, response.fileSize);
        }
      });
    }
    return false;
  }
});

function sendMessageToTab(tabId, message, callback) {
  chrome.tabs.sendMessage(tabId, message, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('Could not connect to tab:', chrome.runtime.lastError.message);
      if (callback) callback(null);
    } else if (callback) {
      callback(response);
    }
  });
}

function downloadRecording(arrayBuffer, fileSize) {
  const blob = new Blob([new Uint8Array(arrayBuffer)], { type: 'video/webm' });
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
