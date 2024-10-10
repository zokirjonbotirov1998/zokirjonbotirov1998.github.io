let hasRecorded = false;  // Yozuv faqat bir marta ishlashi uchun flag

document.querySelector('.start-now').addEventListener('click', function() {
    // Tugmani o'zgartirish va 5 sekund sanash
    const startButton = this;
    startButton.innerHTML = 'Time to Think 00:05';

    let timeLeft = 5;
    const countdown = setInterval(() => {
        timeLeft--;
        startButton.innerHTML = `Time to Think 00:0${timeLeft}`;

        if (timeLeft === 0) {
            clearInterval(countdown);
            // "Start Now" tugmasini yashirish va "Next Question" tugmasini ko'rsatish
            startButton.style.display = 'none';
            document.querySelector('.next_question').classList.remove('d-none'); // Block holatiga keltirish
            document.querySelector('.next_question').style.display = 'block'; // Display: block o'rnatish
            
            // 30 soniyali yozuvni boshlash
            startRecording();
        }
    }, 1000);
});

function startRecording() {
    if (hasRecorded) return;  // Agar yozuv ishlagan bo'lsa, yana boshlamaslik

    hasRecorded = true;  // Yozuv faqat bir marta ishlashi uchun flagni o'rnatamiz

    // 30 soniyali taymer va yozuvni boshlash
    let recordTime = 30;
    const clock = document.querySelector('.test-time-duration');
    clock.innerHTML = `00:${recordTime}`;

    // Mikrofondan yozishni boshlash
    let recorder, audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        recorder = new MediaRecorder(stream);
        recorder.start();

        recorder.ondataavailable = function(e) {
            audioChunks.push(e.data);
        };

        // Taymerni 30 soniya davomida orqaga sanash
        const recordingCountdown = setInterval(() => {
            recordTime--;
            clock.innerHTML = `00:${recordTime < 10 ? '0' + recordTime : recordTime}`;

            if (recordTime === 0) {
                clearInterval(recordingCountdown);
                recorder.stop(); // Yozishni to'xtatish
                stream.getTracks().forEach(track => track.stop()); // Streamni to'xtatish

                // "Download" tugmasini ko'rsatish
                document.querySelector('.btn-download').classList.remove('d-none');
                document.querySelector('.btn-download').style.display = 'block'; // Display: block o'rnatish

                // 2 soniyadan keyin avtomatik boshqa sahifaga o'tish
                setTimeout(function() {
                    window.location.href = '/part2.html';
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
    
    startButton.innerHTML = 'Time to Think 00:05';

    let timeLeft = 5;
    const countdown = setInterval(() => {
        timeLeft--;
        startButton.innerHTML = `Time to Think 00:0${timeLeft}`;

        if (timeLeft === 0) {
            clearInterval(countdown);
            // "Start Now" tugmasini yashirish va taymerni avtomatik boshlash
            startButton.style.display = 'none';
            document.querySelector('.next_question').classList.remove('d-none');
            document.querySelector('.next_question').style.display = 'block'; // Display: block o'rnatish
            startRecording(); // 30 soniyali taymerni avtomatik ishga tushirish
        }
    }, 1000);
});
