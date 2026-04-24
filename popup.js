const recordBtn = document.getElementById('recordBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusEl = document.getElementById('status');
const durationEl = document.getElementById('duration');
const fileSizeEl = document.getElementById('fileSize');

let durationInterval = null;
let recordingStartTime = null;

recordBtn.addEventListener('click', async () => {
  chrome.runtime.sendMessage({ action: 'toggleRecording' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
      return;
    }
    if (response) {
      updateUI(response);
    }
  });
});

downloadBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'download' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    }
  });
});

function updateUI(state) {
  statusEl.textContent = state.status;
  recordBtn.textContent = state.recording ? 'Stop Recording' : 'Start Recording';
  recordBtn.classList.toggle('recording', state.recording);
  downloadBtn.disabled = !state.hasStopped;

  if (state.recording && !durationInterval) {
    recordingStartTime = Date.now() - (state.duration || 0);
    durationInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      durationEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 100);
  } else if (!state.recording && durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }

  if (state.fileSize) {
    fileSizeEl.textContent = `File size: ${(state.fileSize / 1024 / 1024).toFixed(2)} MB`;
  }
}

function updateStatus() {
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
      return;
    }
    if (response) {
      updateUI(response);
    }
  });
}

updateStatus();
setInterval(updateStatus, 500);
