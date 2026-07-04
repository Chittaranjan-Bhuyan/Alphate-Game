// ============================
// AUDIO
// ============================

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playCorrectSound() {
    if (audioCtx.state === "suspended") audioCtx.resume();

}

function playWrongSound() {
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
}

// ============================
// SPEAK LETTER
// ============================

function speakLetter(letter) {

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(letter);

    speech.rate = 0.8;
    speech.pitch = 1.1;

    speechSynthesis.speak(speech);
}

// ============================
// ELEMENTS
// ============================

const letters = document.querySelectorAll(".letter");
const placeholders = document.querySelectorAll(".placeholder");
const container = document.getElementById("letters-container");

let placed = 0;

// ============================
// RANDOM POSITION
// ============================

function randomPosition() {

    const used = [];

    letters.forEach(letter => {

        let x, y;
        let ok = false;

        while (!ok) {

            x = Math.random() * (container.clientWidth - 80);
            y = Math.random() * (container.clientHeight - 80);

            ok = true;

            for (let p of used) {

                const dx = x - p.x;
                const dy = y - p.y;

                if (Math.sqrt(dx * dx + dy * dy) < 75) {
                    ok = false;
                    break;
                }
            }
        }

        used.push({ x, y });

        letter.style.left = x + "px";
        letter.style.top = y + "px";
    });
}

window.onload = randomPosition;

// ============================
// DRAG
// ============================

letters.forEach(letter => {

    letter.addEventListener("dragstart", e => {

        e.dataTransfer.setData("text", letter.id);

        letter.classList.add("dragging");

        speakLetter(letter.textContent.trim());

    });

    letter.addEventListener("dragend", () => {

        letter.classList.remove("dragging");

    });

});

// ============================
// DROP
// ============================

placeholders.forEach(box => {

    box.addEventListener("dragover", e => {

        e.preventDefault();

        box.classList.add("hovered");

    });

    box.addEventListener("dragleave", () => {

        box.classList.remove("hovered");

    });

    box.addEventListener("drop", e => {

        e.preventDefault();

        box.classList.remove("hovered");

        const id = e.dataTransfer.getData("text");

        const dragged = document.getElementById(id);

        if (!dragged) return;

        const answer = box.dataset.letter;

        if (dragged.textContent.trim() === answer) {

            playCorrectSound();

            box.textContent = "";

            box.appendChild(dragged);

            dragged.style.position = "static";

            dragged.draggable = false;

            dragged.style.cursor = "default";

            box.classList.add("correct");

            placed++;

            if (placed === letters.length) {

                setTimeout(() => {

                    alert("🎉 Congratulations! You completed the Alphabet Game!");

                }, 300);

            }

        }

        else {

            playWrongSound();

            alert("❌ Wrong Letter!");

        }

    });

});