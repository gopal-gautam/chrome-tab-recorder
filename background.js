let recordingState = {
  recording: false,
  hasStopped: false,
  status: 'Idle',
  duration: 0,
  fileSize: 0
};

let recordingStartTime = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleRecording') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const tabId = tabs[0].id;
        if (recordingState.recording) {
          chrome.tabs.sendMessage(tabId, { action: 'stopRecording' }, (response) => {
            recordingState.recording = false;
            recordingState.status = 'Stopped';
            recordingState.hasStopped = true;
            sendResponse(recordingState);
          });
        } else {
          recordingState.hasStopped = false;
          chrome.tabs.sendMessage(tabId, { action: 'startRecording' }, (response) => {
            if (response && response.success) {
              recordingState.recording = true;
              recordingState.status = 'Recording...';
              recordingStartTime = Date.now();
              sendResponse(recordingState);
            } else {
              recordingState.status = 'Error: ' + (response?.error || 'Unknown error');
              sendResponse(recordingState);
            }
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getRecordedData' }, (response) => {
          if (response && response.success) {
            const arrayBuffer = response.data;
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
        });
      }
    });
    return false;
  }
});
