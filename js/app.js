window.onload = function() {
    var recordButton = document.getElementById('js-record');
    var micBoxRadialTimer = document.querySelector('.mic-box_radial-timer');
    var plyrControls = document.querySelector('.plyr__controls');
    var timeDisplay = document.querySelector('.test-time-duration');
    var currentTimeDisplay = document.getElementById('currentTimeDisplay');
    var interval;
    var mediaRecorder;
    var recordedChunks = [];
    var btnAgain = document.querySelector('.btn_again');
    var playButton = document.getElementById('playButton');
    var audioElement;
    var totalTime = 0;
    var countdownInterval;
    var plyrSeek = document.getElementById('plyr-seek'); // Seek input range element
    var maxRecordingTime = 20; // Max recording time set to 20 seconds
    var countdownTime; // To store the countdown time when paused
    var isPlaying = false; // To track if the audio is currently playing
    var isPaused = false; // To track if the audio is paused

    // Request microphone access when the page loads
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            console.log("Microphone activated.");
            startRecording(stream); // Start recording after access is granted
        })
        .catch(function(err) {
            console.error("Unable to access microphone: ", err);
            alert("Microphone access was denied or an issue occurred.");
        });

    function startRecording(stream) {
        // Start recording
        recordButton.innerHTML = 'Stop Recording &nbsp; <i class="fa-regular fa-circle-stop" style="font-size: 18px;"></i>';
        recordButton.classList.add('test-btn');

        micBoxRadialTimer.style.display = 'block';
        plyrControls.classList.remove('active');

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        totalTime = 0;
        interval = setInterval(function() {
            totalTime++;
            timeDisplay.textContent = formatTime(totalTime);

            // Automatically stop recording after maxRecordingTime seconds
            if (totalTime >= maxRecordingTime) {
                mediaRecorder.stop(); // Stop recording after maxRecordingTime
                clearInterval(interval); // Stop the time interval
                clearInterval(countdownInterval); // Stop the countdown interval

                // Update the display
                timeDisplay.textContent = formatTime(totalTime);
                currentTimeDisplay.textContent = formatTime(totalTime);

                // Hide the record button and show the "Test Again" button
                micBoxRadialTimer.style.display = 'none';
                recordButton.style.display = 'none';
                btnAgain.classList.add('active');
                btnAgain.style.display = 'block';
                plyrControls.classList.add('active');
                console.log("Recording stopped after " + maxRecordingTime + " seconds.");
            }
        }, 1000); // 1 second interval for timer

        mediaRecorder.start();
        console.log("Recording started.");
        micBoxRadialTimer.style.display = 'flex';

        recordButton.addEventListener('click', function() {
            if (recordButton.textContent.includes("Stop Recording")) {
                mediaRecorder.stop();
                clearInterval(interval);
                clearInterval(countdownInterval);

                timeDisplay.textContent = formatTime(totalTime);
                currentTimeDisplay.textContent = formatTime(totalTime);

                plyrControls.classList.add('active');
                micBoxRadialTimer.style.display = 'none';
                recordButton.style.display = 'none';

                btnAgain.classList.add('active');
                btnAgain.style.display = 'block';

                console.log("Recording stopped manually.");
            } else {
                // Agar "Start" tugmasi bosilgan bo'lsa, yozishni boshlash
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        startRecording(stream); // Foydalanuvchi tugmani bosganda yozishni boshlang
                    })
                    .catch(function(err) {
                        console.error("Mikrofonga ulanishda xatolik: ", err);
                        alert("Mikrofonni olishda muammo yuz berdi.");
                    });
            }
        });

        btnAgain.addEventListener('click', function() {
            window.location.href = "/index.html";
        });

        playButton.addEventListener('click', function() {
            if (recordedChunks.length > 0) {
                var blob = new Blob(recordedChunks, { type: 'audio/webm' });
                var audioUrl = URL.createObjectURL(blob);

                if (!audioElement) {
                    audioElement = new Audio(audioUrl);
                    countdownTime = totalTime; // Initialize countdown from total time
                    plyrSeek.max = totalTime;
                }

                if (!isPlaying || isPaused) {
                    // Resume or start playback
                    audioElement.play();
                    isPlaying = true;
                    isPaused = false;
                    console.log("Audio is playing.");
                    playButton.innerHTML = '<i class="fa-regular fa-circle-stop"></i>';

                    countdownInterval = setInterval(function() {
                        if (countdownTime > 0) {
                            countdownTime--;
                            currentTimeDisplay.textContent = formatTime(countdownTime);

                            var timePassed = totalTime - countdownTime;
                            plyrSeek.value = timePassed;
                            var progress = (timePassed / totalTime) * 100;
                            plyrSeek.style.setProperty('--value', progress + '%');
                        } else {
                            clearInterval(countdownInterval);
                            currentTimeDisplay.textContent = "00:00";
                        }
                    }, 1000);

                    audioElement.onended = function() {
                        resetPlaybackState(); // Reset everything when audio finishes
                    };

                } else {
                    // Pause playback
                    audioElement.pause();
                    isPaused = true;
                    console.log("Audio is paused.");
                    playButton.innerHTML = '<i class="fa-regular fa-circle-play"></i>';

                    clearInterval(countdownInterval); // Stop the countdown
                }
            } else {
                alert("Please record audio first.");
            }
        });
    }

    // Function to reset playback state after audio finishes
    function resetPlaybackState() {
        isPlaying = false;
        isPaused = false;
        playButton.innerHTML = '<i class="fa-regular fa-circle-play"></i>';
        currentTimeDisplay.textContent = "00:00";
        plyrSeek.value = 0;
        plyrSeek.style.setProperty('--value', '0%');
        console.log("Audio playback has completed. Resetting to initial state.");
    }

    function formatTime(seconds) {
        var minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        return minutes + ':' + seconds;
    }
};

// "Start Now" tugmasini bosish voqeasi
document.querySelector('.start-now').addEventListener('click', function() {
    // Tugma matnini o'zgartiring va 5 soniyali hisobni boshlang
    const startButton = this;
    startButton.innerHTML = 'O\'ylash vaqti 00:05';

    let timeLeft = 5;
    const countdown = setInterval(() => {
        timeLeft--;
        startButton.innerHTML = `O\'ylash vaqti 00:0${timeLeft}`;

        if (timeLeft === 0) {
            clearInterval(countdown);
            // "Start Now" tugmasini yashiring va "Next Question" tugmasini ko'rsating
            startButton.style.display = 'none';
            document.querySelector('.next_question').classList.remove('d-none');

            // 5 soniyadan so'ng avtomatik ravishda yozishni boshlang
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function(stream) {
                    startRecording(stream); // Foydalanuvchi tugmani bosganda yozishni boshlang
                })
                .catch(function(err) {
                    console.error("Mikrofonga ulanishda xatolik: ", err);
                    alert("Mikrofonni olishda muammo yuz berdi.");
                });
        }
    }, 1000);
});
