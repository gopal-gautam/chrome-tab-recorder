# Tab Recorder - Chrome Extension

A simple Chrome extension that allows you to record any browser tab and download the video as WebM format.

## Features

- 🎥 Record any browser tab
- 📝 Display recording duration and file size
- ⬇️ Download recorded videos as WebM format
- 🎨 Beautiful popup UI with status updates
- ⏸️ Start/Stop recording with one click
- 📊 Real-time duration counter

## Installation

1. **Clone or download this repository** to your computer

2. **Open Chrome Extensions Manager**
   - Go to `chrome://extensions/` in your Chrome browser
   - Or use menu: ⋮ > More tools > Extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Navigate to the `chrome-recorder` folder
   - Select the folder and click "Open"

5. **Extension Ready**
   - The "Tab Recorder" extension icon will appear in your toolbar
   - Click the extension icon to see the popup

## Usage

1. **Start Recording**
   - Navigate to any website or open any web application
   - Click the "Tab Recorder" extension icon
   - Click "Start Recording" button
   - The button will change to "Stop Recording" and display a pulsing animation

2. **Stop Recording**
   - Click the "Stop Recording" button to stop the capture
   - The status will change to "Stopped"
   - The "Download Video" button will become enabled

3. **Download Video**
   - Click "Download Video" button
   - Choose where to save the file
   - The video will be saved as `recording-[timestamp].webm`

## Features

- **Status Display**: Shows current recording state (Idle/Recording/Stopped)
- **Duration Counter**: Real-time counter showing how long you've been recording
- **File Size**: Displays the size of the recorded video
- **WebM Format**: Videos are saved in WebM format with VP8 video codec
- **No Audio**: Records video only (audio capture not enabled)

## File Format

- **Format**: WebM
- **Video Codec**: VP8
- **Bitrate**: 5 Mbps (adjustable in background.js)
- **File Extension**: .webm

## Technical Details

### Architecture

- **manifest.json**: Extension configuration (Manifest V3)
- **popup.html/css/js**: User interface and interaction handling
- **background.js**: Service worker managing recording lifecycle
- **chrome.tabCapture**: Used to capture the active tab's media stream
- **MediaRecorder API**: Encodes the stream to WebM format

### Permissions

- `tabCapture`: Required to capture the tab's video stream
- `activeTab`: Required to access the currently active tab
- `downloads`: Required to download the recorded video

## Troubleshooting

### Recording doesn't start
- Make sure you've clicked the extension icon first to open the popup
- Check if the website allows tab capture (some restricted sites may not work)
- Try refreshing the page and try again

### Downloaded file won't play
- Make sure you're using a media player that supports WebM format
  - VLC Media Player (free)
  - Firefox (supports WebM natively)
  - Chrome (supports WebM natively)
  - Edge (supports WebM natively)

### Low video quality
- The bitrate is set to 5 Mbps by default
- To adjust quality, edit `background.js` and change the `videoBitsPerSecond` value:
  - Higher values = better quality but larger files
  - Lower values = smaller files but lower quality

## Limitations

- **Audio**: Does not capture audio from the tab
- **Tab-specific**: Only records the active tab, not multiple tabs
- **Memory**: Stores recording in RAM (may use significant memory for long recordings)
- **Browser**: Chrome/Chromium-based browsers only

## Future Improvements

- Add audio capture option
- Support for MP4 export
- Adjustable video quality settings
- Recording multiple tabs simultaneously
- Keyboard shortcuts (Ctrl+Shift+R)

## License

MIT License - Feel free to use and modify as needed

## Support

If you encounter any issues:
1. Check that Developer Mode is enabled in chrome://extensions
2. Verify the extension is loaded correctly
3. Try reloading the extension
4. Clear your Chrome cache if experiencing persistent issues
