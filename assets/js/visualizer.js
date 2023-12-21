// Declare variables in the global scope
var audioContext, analyser, audioBuffer, audioSource = null, isPlaying = false;
var animationId, startTime, currentPlaybackTime = 0;

document.addEventListener('DOMContentLoaded', function() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    var canvas = document.getElementById('visualizer-canvas');
    var ctx = canvas.getContext('2d');
    var playButton = document.getElementById('play-button');
    var pauseButton = document.getElementById('pause-button');
    var stopButton = document.getElementById('stop-button');
    var seekBar = document.getElementById('seek-bar');

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var barWidth = (canvas.width / bufferLength) * 2.5;
        var barHeightScale = canvas.height / 256;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            var barHeight = dataArray[i] * barHeightScale;

        // Set fixed values for Red and Green, and dynamic value for Blue
        var r = 5 + (barHeight / barHeightScale);
        var g = 20 + (i / bufferLength);
        var b = 120 + (155 * (barHeight / (canvas.height * barHeightScale))); // Dynamic value for Blue

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

draw(); // Start the visualizer

    var fileInput = document.getElementById('music-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            var file = event.target.files[0];
            if (!file) {
                console.error('No file selected.');
                return;
            }

            var reader = new FileReader();
            reader.onload = function(fileEvent) {
                audioContext.decodeAudioData(fileEvent.target.result)
                .then(function(buffer) {
                    audioBuffer = buffer;
                })
                .catch(function(e) {
                    console.error("Error with decoding audio data: ", e);
                });
            };
            reader.readAsArrayBuffer(file);
        });
    } else {
        console.error('The file input was not found!');
    }

    setupEventListeners(playButton, pauseButton, stopButton);
});

function setupEventListeners(playButton, pauseButton, stopButton) {
    playButton.addEventListener('click', function() {
        // Check if audio is already playing and if audioContext is suspended
        if (audioContext.state === 'suspended' && isPlaying) {
            // Resume audio if it was paused
            resumeAudio();
        } else if (!isPlaying && audioBuffer) {
            // Play audio from current position if not already playing
            playAudio(audioBuffer, currentPlaybackTime);
        }
    });

    pauseButton.addEventListener('click', function() {
        if (audioContext && audioContext.state === 'running') {
            pauseAudio();
        }
    });

    stopButton.addEventListener('click', function() {
        if (audioContext && audioContext.state !== 'closed') {
            stopAudio();
        }
    });
}

function playAudio(buffer, seekValue) {
    if (audioSource) {
        audioSource.disconnect();
    }

    audioSource = audioContext.createBufferSource();
    audioSource.buffer = buffer;
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    audioSource.start(0, seekValue);
    isPlaying = true;
    startTime = audioContext.currentTime - seekValue;

    updateSeekBar();
}

function pauseAudio() {
    audioContext.suspend();
    isPlaying = false;
    currentPlaybackTime += audioContext.currentTime - startTime;
}

function resumeAudio() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
        startTime = audioContext.currentTime;
        isPlaying = true;
        updateSeekBar();
    }
}

function stopAudio() {
    audioContext.suspend();
    isPlaying = false;
    currentPlaybackTime = 0;
    document.getElementById('seek-bar').value = 0;
}

function updateSeekBar() {
    var seekBar = document.getElementById('seek-bar');
    if (isPlaying && audioBuffer) {
        var elapsedTime = audioContext.currentTime - startTime;
        var totalTime = audioBuffer.duration;
        var progress = ((currentPlaybackTime + elapsedTime) / totalTime) * 100;
        seekBar.value = progress;
        animationId = requestAnimationFrame(updateSeekBar);
    } else {
        cancelAnimationFrame(animationId);
    }
}
