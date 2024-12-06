
document.addEventListener('DOMContentLoaded', () => {

    let points = 0;
    let autoClickerActive = false;
    let autoClickerCount = 0;
    const maxAutoClickers = 1;
    let doubleUpgradeCount = 0;
    const maxDoubleUpgrades = 5;
    let doubleUpgradeCooldown = false;

    const pointsDisplay = document.getElementById('points-display');
    const oceanPulseBtn = document.getElementById('ocean-pulse-btn');
    const messageZone = document.getElementById('message-zone');
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    const trollOverlay = document.getElementById('troll-overlay');
    const trollPopup = document.querySelector('.troll-popup');
    const homeBtn = document.getElementById('home-btn');
    const bodyParts = [
        "Le cœur des courants marins palpite...",
        "Les poumons océaniques respirent...",
        "L'estomac des vagues se remue...",
        "Les reins coralliens filtrent...",
        "Un tsunami de santé déferle !",
        "La circulation thermohaline s'active !"
    ];

    const trollMessages = [
        "Oups ! Un courant contraire...",
        "Le récif a avalé vos points !",
        "La mer reprend ce qu'elle a donné !",
        "Votre impulsion s'est perdue dans les abysses !",
        "Tempête de points annulée !",
        "Les courants vous jouent des tours !"
    ];

    function updatePoints(amount) {
        points = Math.max(0, points + amount);
        pointsDisplay.textContent = `Points Santé Océanique : ${points}`;
        if (points >= 1000) {
            alert("Félicitations ! Vous êtes arrivé à 1000 points, mais la planète a encore besoin de vous... Le jeu recommence !");
            resetGame();
        }
    }

    function resetGame() {
        points = 0;
        autoClickerCount = 0;
        doubleUpgradeCount = 0;
        updatePoints(0);
    }

    function showRandomMessage() {
        const randomMessage = bodyParts[Math.floor(Math.random() * bodyParts.length)];
        messageZone.textContent = randomMessage;
    }

    function triggerTrollPopup(message) {
        trollPopup.textContent = message;
        trollOverlay.style.display = 'block';
        setTimeout(() => {
            trollOverlay.style.display = 'none';
        }, 2000);
    }

    oceanPulseBtn.addEventListener('click', () => {
        updatePoints(1);
        showRandomMessage();

        // Random troll chance
        if (Math.random() < 0.1) {
            const randomTrollMessage = trollMessages[Math.floor(Math.random() * trollMessages.length)];
            triggerTrollPopup(randomTrollMessage);
            updatePoints(-Math.floor(points * 0.05));
        }
    });

    homeBtn.addEventListener('click', () => {
        window.location.href = "../src/index.html";
    });

    upgradeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cost = parseInt(button.getAttribute('cost'));

            if (points >= cost) {
                switch (button.id) {
                    case 'upgrade1':
                        if (doubleUpgradeCount < maxDoubleUpgrades) {
                            if (!doubleUpgradeCooldown) {
                                updatePoints(-cost);
                                points *= 2;
                                doubleUpgradeCount++;
                                triggerTrollPopup("Doublement océanique !");
                                doubleUpgradeCooldown = true;


                                setTimeout(() => {
                                    doubleUpgradeCooldown = false;
                                }, 30000);
                            } else {
                                triggerTrollPopup("Un peu de patience !");
                            }
                        } else {
                            updatePoints(-cost);
                            triggerTrollPopup("Vous vous êtes fait doubler !");
                        }
                        break;
                    case 'upgrade2':
                        if (autoClickerCount < maxAutoClickers) {
                            updatePoints(-cost);
                            autoClickerCount++;
                            let clickInterval = setInterval(() => {
                                updatePoints(1);
                                showRandomMessage();
                            }, 1000);

                            // Randomly stop the auto-clicker
                            setTimeout(() => {
                                clearInterval(clickInterval);
                                autoClickerCount--;
                                triggerTrollPopup("Auto-clicker dérivant...");
                            }, 30000);
                        } else {
                            triggerTrollPopup("Trop de courants simultanés !");
                        }
                        break;

                    case 'upgrade3':
                        updatePoints(-cost);
                        triggerTrollPopup("Stabilisation océanique !");
                        break;

                    case 'upgrade4':
                        updatePoints(-cost);
                        triggerTrollPopup("Bouclier de récif activé !");
                        // Temporary protection from troll events
                        setTimeout(() => {
                            triggerTrollPopup("Protection expirée !");
                        }, 15000);
                        break;

                    case 'upgrade5':
                        updatePoints(-cost);
                        // Boost clicking power temporarily
                        let originalClickPower = 1;
                        let boostDuration = 60000; // 60 seconds
                        triggerTrollPopup("Courant vital activé ! La minute de Folie !");

                        // Temporarly increase click power
                        oceanPulseBtn.addEventListener('click', boostClick);

                    function boostClick() {
                        updatePoints(2);
                    }

                        setTimeout(() => {
                            oceanPulseBtn.removeEventListener('click', boostClick);
                            triggerTrollPopup("Courant vital terminé !");
                        }, boostDuration);
                        break;

                    case 'upgrade6':
                        updatePoints(-cost);
                        // Regenerate a percentage of total points
                        const regenerationAmount = Math.floor(points * 3);
                        updatePoints(regenerationAmount);
                        triggerTrollPopup(`Régénération : +${regenerationAmount} points !`);
                        break;
                }
            } else {
                triggerTrollPopup("Ressources océaniques insuffisantes !");
            }
        });
    });
});