let hasRecorded = false;  // Yozuv faqat bir marta ishlashi uchun flag
let countdownTimer; // Sanashni boshqarish uchun o'zgaruvchi

document.querySelector('.start-now').addEventListener('click', function() {
    // Tugmani o'zgartirish va 60 sekund sanash
    const startButton = this;
    startButton.innerHTML = 'Time to Think 01:00';

    let timeLeft = 60; // 60 soniya sanash
    countdownTimer = setInterval(() => {
        timeLeft--;
        startButton.innerHTML = `Time to Think 00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;

        if (timeLeft === 0) {
            clearInterval(countdownTimer);
            // "Start Now" tugmasini yashirish va "Next Question" tugmasini ko'rsatish
            startButton.style.display = 'none';
            document.querySelector('.next_question').classList.remove('d-none'); // Block holatiga keltirish
            document.querySelector('.next_question').style.display = 'block'; // Display: block o'rnatish
            
            // 2 daqiqali yozuvni boshlash
            startRecording();
        }
    }, 1000);
});

// "Time to Think" tugmasini bosganda sanashni to'xtatish va yozuvni boshlash
function startRecording() {
    if (hasRecorded) return;  // Agar yozuv ishlagan bo'lsa, yana boshlamaslik

    hasRecorded = true;  // Yozuv faqat bir marta ishlashi uchun flagni o'rnatamiz

    // 2 daqiqalik taymer va yozuvni boshlash
    let recordTime = 120; // 120 soniya = 2 daqiqa
    const clock = document.querySelector('.test-time-duration');
    clock.innerHTML = `02:00`; // 2 daqiqa ko'rsatish

    // Mikrofondan yozishni boshlash
    let recorder, audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        recorder = new MediaRecorder(stream);
        recorder.start();

        recorder.ondataavailable = function(e) {
            audioChunks.push(e.data);
        };

        // Taymerni 2 daqiqa davomida orqaga sanash
        const recordingCountdown = setInterval(() => {
            recordTime--;
            clock.innerHTML = `0${Math.floor(recordTime / 60)}:${recordTime % 60 < 10 ? '0' + (recordTime % 60) : recordTime % 60}`;

            if (recordTime === 0) {
                clearInterval(recordingCountdown);
                recorder.stop(); // Yozishni to'xtatish
                stream.getTracks().forEach(track => track.stop()); // Streamni to'xtatish

                // "Download" tugmasini ko'rsatish
                document.querySelector('.btn-download').classList.remove('d-none');
                document.querySelector('.btn-download').style.display = 'block'; // Display: block o'rnatish

                // 2 soniyadan keyin avtomatik boshqa sahifaga o'tish
                setTimeout(function() {
                    window.location.href = '/part3.html';
                }, 2000);  // 2 soniyadan keyin boshqa sahifaga o'tadi
            }
        }, 1000);

        recorder.onstop = function() {
            // Audio blobni yaratish va link orqali yuklab olish
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const downloadButton = document.querySelector('.btn-download');
            
            downloadButton.href = audioUrl;
            downloadButton.download = 'recording.wav';
        };
    });
}

// Sahifa yuklanganda avtomatik ishga tushadigan kod
window.addEventListener('load', function() {
    const startButton = document.querySelector('.start-now');
    
    startButton.innerHTML = 'Time to Think 01:00';  // 60 soniyali taymer

    let timeLeft = 60;
    countdownTimer = setInterval(() => {
        timeLeft--;
        startButton.innerHTML = `Time to Think 00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;

        if (timeLeft === 0) {
            clearInterval(countdownTimer);
            // "Start Now" tugmasini yashirish va taymerni avtomatik boshlash
            startButton.style.display = 'none';
            document.querySelector('.next_question').classList.remove('d-none');
            document.querySelector('.next_question').style.display = 'block'; // Display: block o'rnatish
            startRecording(); // 2 daqiqali taymerni avtomatik ishga tushirish
        }
    }, 1000);
});

// "Time to Think" tugmasini bosganda sanashni to'xtatish
document.querySelector('.start-now').addEventListener('click', function() {
    clearInterval(countdownTimer); // Sanashni to'xtatish
    // "Next Question" tugmasini ko'rsatish
    document.querySelector('.next_question').classList.remove('d-none');
    document.querySelector('.next_question').style.display = 'block'; // Display: block o'rnatish
    startRecording(); // Yozuvni boshlash
});
