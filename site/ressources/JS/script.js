document.addEventListener('DOMContentLoaded', () => {
    let points = 0;
    let autoClickerActive = false;

    // DOM Elements
    const pointsDisplay = document.getElementById('points');
    const clickableArea = document.getElementById('clickable-area');
    const messages = document.getElementById('messages');
    const buyAutomationButton = document.getElementById('buy-automation');

    // Vérifiez que les éléments DOM existent
    console.log("Clickable Area :", clickableArea);
    console.log("Points Display :", pointsDisplay);

    // Click Handler
    clickableArea.addEventListener('click', () => {
        points++;
        pointsDisplay.textContent = points;

        if (Math.random() < 0.2) {
            trollUser();
        }
        if (points >= 50 && !autoClickerActive) {
            buyAutomationButton.classList.remove('hidden');
        }
    });

    function trollUser() {
        console.log("Troll triggered!");
        const trollMessages = [
            "Oops, tu cliques trop vite!",
            "Tu destabilises les courants océaniques !",
            "Est-ce que tu viens de créer un ouragan ?",
            "Un poisson vient de mourir à cause de toi.",
            "La pollution de plastique vient d'augmenter de 10% à cause de toi !"
        ];
        const randomMessage =
            trollMessages[Math.floor(Math.random() * trollMessages.length)];
        messages.textContent = randomMessage;

        clickableArea.style.position = 'absolute';
        clickableArea.style.top = `${Math.random() * 80 + 10}%`;
        clickableArea.style.left = `${Math.random() * 80 + 10}%`;
    }

    buyAutomationButton.addEventListener('click', () => {
        if (points >= 50) {
            points -= 50;
            pointsDisplay.textContent = points;
            buyAutomationButton.classList.add('hidden');
            activateAutoClicker();
        }
    });

    function activateAutoClicker() {
        autoClickerActive = true;
        setInterval(() => {
            points++;
            pointsDisplay.textContent = points;
        }, 1000);
    }
});
