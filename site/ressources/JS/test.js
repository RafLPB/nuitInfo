// ================ Variables et Configuration ================
let verified = false;
let level = 1;
let timeLeft = 10;
let score = 0;
let gameLoop;
let canStart = false;
let totalTrashRequired = 0;
let successDialogDisplayed = false;
let failureDialogDisplayed = false;


const FISH_TYPES = {
    common: ['🐟', '🐠', '🐡'],
    rare: ['🦈', '🐋', '🐳'],
    special: ['🐢', '🦑', '🐙']
};

const TRASH_TYPES = {
    common: ['🍾', '🥤', '📦', '🛢️'],
    dangerous: ['⚠️', '🧪', '☢️'],
    oil: ['🦠', '🌫️', '💭']
};

const DIFFICULTY_CONFIG = {
    baseTime: 15,
    timeDecrease: 1,
    minTime: 8,
    baseTrashCount: 3,
    baseFishCount: 2,
    trashIncrease: 1,
    fishIncrease: 1,
    maxElements: 12,
    speedMultiplier: 0.15,
    minSpacing: 80
};

const elements = {
    captcha: document.getElementById('captchaContainer'),
    checkbox: document.getElementById('captchaCheckbox'),
    overlay: document.getElementById('gameOverlay'),
    gameArea: document.getElementById('gameArea'),
    vacuum: document.getElementById('vacuum'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    countdown: document.getElementById('countdown'),
    nextLevel: document.getElementById('nextLevel'),
    continueSite: document.getElementById('continueSite')
};

// ================ Initialisation et Event Listeners ================
setTimeout(() => {
    elements.captcha.classList.remove('scale-0', 'opacity-0');
}, 500);

elements.checkbox.addEventListener('change', () => {
    if (elements.checkbox.checked) {
        elements.overlay.classList.remove('hidden');
        startCountdown();
    }
});

elements.nextLevel.addEventListener('click', () => {
    level++;
    elements.nextLevel.classList.add('hidden');
    elements.continueSite.classList.add('hidden');
    startCountdown();
});

elements.continueSite.addEventListener('click', () => {
    window.location.href = '../index.html';
});

document.addEventListener("DOMContentLoaded", () => {
    const captchaCheckbox = document.getElementById("captchaCheckbox");
    captchaCheckbox.checked = false; // Assure que la checkbox est décochée
});

// ================ Gestion du jeu ================
function startCountdown() {
    let count = 3;
    elements.countdown.classList.remove('hidden');
    elements.countdown.textContent = count;
    elements.gameArea.classList.add('pointer-events-none');

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            elements.countdown.textContent = count;
        } else {
            clearInterval(countdownInterval);
            elements.countdown.classList.add('hidden');
            elements.gameArea.classList.remove('pointer-events-none');
            startGame();
        }
    }, 1000);
}

function startGame() {
    canStart = true;
    resetGame();
    initializeStartingPhase();
}

function resetGame() {
    const difficulty = calculateDifficulty();
    timeLeft = difficulty.timeLimit;
    score = 0;

    // Réinitialiser les drapeaux
    successDialogDisplayed = false;
    failureDialogDisplayed = false;

    elements.gameArea.innerHTML = '';
    elements.gameArea.appendChild(elements.vacuum);
    elements.level.textContent = `Niveau ${level}`;
}


function calculateDifficulty() {
    return {
        trashCount: Math.min(
            DIFFICULTY_CONFIG.baseTrashCount + Math.floor(level / 2),
            DIFFICULTY_CONFIG.maxElements / 2
        ),
        fishCount: Math.min(
            DIFFICULTY_CONFIG.baseFishCount + Math.floor(level / 3),
            DIFFICULTY_CONFIG.maxElements / 2
        ),
        timeLimit: Math.max(
            DIFFICULTY_CONFIG.baseTime - (level - 1) * DIFFICULTY_CONFIG.timeDecrease,
            DIFFICULTY_CONFIG.minTime
        ),
        speed: 0.5 + (level * DIFFICULTY_CONFIG.speedMultiplier)
    };
}

// ================ Phase d'initialisation ================
function initializeStartingPhase() {
    score = 0;

    const gameRect = elements.gameArea.getBoundingClientRect();
    const centerX = (gameRect.width / 2) - (elements.vacuum.offsetWidth / 2);
    const centerY = (gameRect.height / 2) - (elements.vacuum.offsetHeight / 2);

    elements.vacuum.style.left = `${centerX}px`;
    elements.vacuum.style.top = `${centerY}px`;

    const safeZone = document.createElement('div');
    safeZone.className = 'absolute bg-blue-200 bg-opacity-20 rounded-full transition-all duration-1000';
    safeZone.style.width = '200px';
    safeZone.style.height = '200px';
    safeZone.style.left = `${centerX - 75}px`;
    safeZone.style.top = `${centerY - 75}px`;
    elements.gameArea.appendChild(safeZone);

    const startMessage = document.createElement('div');
    startMessage.className = 'absolute text-blue-800 font-bold text-xl text-center transition-opacity duration-500';
    startMessage.style.width = '200px';
    startMessage.style.left = `${centerX - 75}px`;
    startMessage.style.top = `${centerY - 100}px`;
    startMessage.textContent = 'Prêt à commencer...';
    elements.gameArea.appendChild(startMessage);

    elements.gameArea.classList.add('pointer-events-none');

    let countdown = 2;
    const unlockInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            startMessage.textContent = `Début dans ${countdown}...`;
        } else {
            clearInterval(unlockInterval);
            unlockGameplay(safeZone, startMessage);
        }
    }, 1000);

    setTimeout(() => {
        createElementsWithSafeZone(centerX, centerY);
    }, 500);
}

function createElementsWithSafeZone(centerX, centerY) {
    const currentDifficulty = calculateDifficulty();
    const existingPositions = [];

    const oldElements = elements.gameArea.querySelectorAll('[data-type]');
    oldElements.forEach(el => {
        if (el !== elements.vacuum) el.remove();
    });

    score = 0;
    totalTrashRequired = currentDifficulty.trashCount;
    console.log('Setting initial trash count:', totalTrashRequired);

    elements.score.textContent = `0/${totalTrashRequired}`;

    let trashCreated = 0;
    for (let i = 0; i < totalTrashRequired; i++) {
        const position = generateSafePosition(existingPositions, centerX, centerY);
        if (position) {
            createGameElementAtPosition(
                selectTrashType(level),
                'trash',
                position.x,
                position.y
            );
            existingPositions.push(position);
            trashCreated++;
        }
    }

    if (trashCreated !== totalTrashRequired) {
        console.warn(`Only created ${trashCreated} trash items out of ${totalTrashRequired}`);
        totalTrashRequired = trashCreated;
        elements.score.textContent = `0/${totalTrashRequired}`;
    }

    const fishCount = currentDifficulty.fishCount;
    for (let i = 0; i < fishCount; i++) {
        const position = generateSafePosition(existingPositions, centerX, centerY);
        if (position) {
            createGameElementAtPosition(
                selectFishType(level),
                'fish',
                position.x,
                position.y
            );
            existingPositions.push(position);
        }
    }
}

function selectTrashType(level) {
    const random = Math.random();
    if (level <= 2) {
        return TRASH_TYPES.common[Math.floor(Math.random() * TRASH_TYPES.common.length)];
    } else if (level <= 4) {
        if (random < 0.7) {
            return TRASH_TYPES.common[Math.floor(Math.random() * TRASH_TYPES.common.length)];
        } else {
            return TRASH_TYPES.oil[Math.floor(Math.random() * TRASH_TYPES.oil.length)];
        }
    } else {
        if (random < 0.5) {
            return TRASH_TYPES.common[Math.floor(Math.random() * TRASH_TYPES.common.length)];
        } else if (random < 0.8) {
            return TRASH_TYPES.oil[Math.floor(Math.random() * TRASH_TYPES.oil.length)];
        } else {
            return TRASH_TYPES.dangerous[Math.floor(Math.random() * TRASH_TYPES.dangerous.length)];
        }
    }
}



function selectFishType(level) {
    const random = Math.random();
    let selectedType;

    if (level <= 2) {
        selectedType = FISH_TYPES.common;
    } else if (level <= 4) {
        selectedType = random < 0.7 ? FISH_TYPES.common : FISH_TYPES.rare;
    } else {
        // Niveaux difficiles: tous les types
        if (random < 0.5) {
            selectedType = FISH_TYPES.common;
        } else if (random < 0.8) {
            selectedType = FISH_TYPES.rare;
        } else {
            selectedType = FISH_TYPES.special;
        }
    }

    return selectedType[Math.floor(Math.random() * selectedType.length)];
}

function generateSafePosition(existingPositions, centerX, centerY) {
    const safeRadius = 150;
    const maxAttempts = 50;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const x = Math.random() * (elements.gameArea.offsetWidth - 50);
        const y = Math.random() * (elements.gameArea.offsetHeight - 50);

        const distanceToCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );

        let isSafe = distanceToCenter > safeRadius;
        if (isSafe) {
            isSafe = existingPositions.every(pos => {
                const distance = Math.sqrt(
                    Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
                );
                return distance > DIFFICULTY_CONFIG.minSpacing;
            });
        }

        if (isSafe) {
            return { x, y };
        }

        attempts++;
    }
    return null;
}

function createGameElementAtPosition(emoji, type, x, y) {
    const element = document.createElement('div');
    element.className = 'absolute text-3xl transition-all duration-300 opacity-0';
    element.textContent = emoji;
    element.dataset.type = type;

    if (type === 'fish') {
        element.style.left = `${(x / elements.gameArea.offsetWidth) * 100}%`;
        element.style.top = `${y}px`;
    } else {
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }

    if (type === 'fish') {
        animateFish(element);
    }

    elements.gameArea.appendChild(element);
    requestAnimationFrame(() => {
        element.style.opacity = '1';
    });
}

// ================ Animation des poissons ================
function animateFish(fish) {
    let direction = 1;
    let position = parseFloat(fish.style.left);
    const difficulty = calculateDifficulty();
    const baseSpeed = difficulty.speed;
    const randomSpeedFactor = 0.8 + Math.random() * 0.4;
    const speed = baseSpeed * randomSpeedFactor;

    function swim() {
        if (!elements.gameArea.contains(fish)) return;
        position += direction * speed;

        if (position > 90) {
            direction = -1;
            position = 90;
        } else if (position < 10) {
            direction = 1;
            position = 10;
        }

        fish.style.left = `${position}%`;
        fish.style.transform = `scaleX(${direction})`;
        requestAnimationFrame(swim);
    }

    swim();
}

// ================ Contrôles et Collisions ================
function unlockGameplay(safeZone, startMessage) {
    safeZone.style.opacity = '0';
    startMessage.style.opacity = '0';

    elements.gameArea.classList.remove('pointer-events-none');

    startTimer();

    setTimeout(() => {
        safeZone.remove();
        startMessage.remove();
    }, 1000);

    enableControls();
}

function enableControls() {
    let targetX = parseFloat(elements.vacuum.style.left);
    let targetY = parseFloat(elements.vacuum.style.top);

    elements.gameArea.addEventListener('mousemove', (e) => {
        const rect = elements.gameArea.getBoundingClientRect();
        targetX = e.clientX - rect.left - elements.vacuum.offsetWidth / 2;
        targetY = e.clientY - rect.top - elements.vacuum.offsetHeight / 2;
    });

    function animateVacuum() {
        if (!canStart) return;

        const rect = elements.gameArea.getBoundingClientRect();
        const currentX = parseFloat(elements.vacuum.style.left);
        const currentY = parseFloat(elements.vacuum.style.top);

        const nextX = currentX + (targetX - currentX) * 0.1;
        const nextY = currentY + (targetY - currentY) * 0.1;

        elements.vacuum.style.left = `${Math.max(0, Math.min(nextX, rect.width - elements.vacuum.offsetWidth))}px`;
        elements.vacuum.style.top = `${Math.max(0, Math.min(nextY, rect.height - elements.vacuum.offsetHeight))}px`;

        checkCollisions();
        requestAnimationFrame(animateVacuum);
    }

    requestAnimationFrame(animateVacuum);
}

function checkCollisions() {
    const vacuumRect = elements.vacuum.getBoundingClientRect();
    const items = document.querySelectorAll('[data-type]');

    items.forEach(item => {
        if (item.dataset.collecting) return;

        const itemRect = item.getBoundingClientRect();
        if (isColliding(vacuumRect, itemRect)) {
            if (item.dataset.type === 'trash') {
                item.dataset.collecting = 'true';

                item.style.transform = 'scale(0)';
                item.style.opacity = '0';

                score++;
                elements.score.textContent = `${score}/${totalTrashRequired}`;

                setTimeout(() => {
                    item.remove();
                    if (score === totalTrashRequired) {
                        levelComplete();
                    }
                }, 300);
            } else if (item.dataset.type === 'fish') {
                fail();
            }
        }
    });
}


function isColliding(rect1, rect2) {
    const margin = 20;
    return !(
        rect1.right - margin < rect2.left ||
        rect1.left + margin > rect2.right ||
        rect1.bottom - margin < rect2.top ||
        rect1.top + margin > rect2.bottom
    );
}

// ================ Timer et Score ================
function startTimer() {
    clearInterval(gameLoop);
    updateTimer();
    gameLoop = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) fail();
    }, 1000);
}

function updateTimer() {
    elements.timer.textContent = `${timeLeft}s`;
    if (timeLeft <= 3) {
        elements.timer.classList.add('text-red-300', 'animate-pulse');
    } else {
        elements.timer.classList.remove('text-red-300', 'animate-pulse');
    }
}

// ================ Gestion des niveaux et dialogues ================
function levelComplete() {
    if (successDialogDisplayed || failureDialogDisplayed) return;
    clearInterval(gameLoop);
    canStart = false;

    if (level === 10) {
        showEasterEgg();
    } else if (level === 20) {
        endGame();
        return;
    }

    if (!verified) {
        verified = true;
        showAuthSuccess();
    } else {
        showSuccess();
    }
}

function fail() {
    if (successDialogDisplayed || failureDialogDisplayed) return;
    clearInterval(gameLoop);
    canStart = false;

    if (!verified) {
        showResult(false);
    } else {
        showFailureDialog();
    }
}

function showEasterEgg() {
    const easterEggDialog = document.createElement('div');
    easterEggDialog.className = 'fixed inset-0 bg-purple-500 bg-opacity-90 flex items-center justify-center z-[9999]';    easterEggDialog.innerHTML = `
        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 transform scale-0 transition-all duration-300">
            <div class="text-center">
                <div class="text-6xl mb-4">🎉</div>
                <div class="text-2xl font-bold text-gray-800 mb-4">Easter Egg Débloqué !</div>
                <p class="text-gray-600 mb-6">Les déchets sont maintenant des pizzas !</p>
                <button id="continueEasterEgg" class="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold">
                    Continuer
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(easterEggDialog);
    requestAnimationFrame(() => easterEggDialog.querySelector('div').classList.remove('scale-0'));

    document.getElementById('continueEasterEgg').onclick = () => {
        easterEggDialog.classList.add('opacity-0');
        setTimeout(() => {
            easterEggDialog.remove();
        }, 300);

        // Déclenche l'easter egg
        elements.vacuum.textContent = '🌊';
        document.querySelectorAll('[data-type="trash"]').forEach(trash => (trash.textContent = '🍕'));
    };
}

function endGame() {
    const endDialog = document.createElement('div');
    endDialog.className = 'fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center z-[9999]';
    endDialog.innerHTML = `
        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 transform scale-0 transition-all duration-300">
            <div class="text-center">
                <div class="text-6xl mb-4">🏆</div>
                <div class="text-2xl font-bold text-gray-800 mb-4">Félicitations !</div>
                <p class="text-gray-600 mb-6">Vous avez terminé le jeu après 20 niveaux.</p>
            </div>
        </div>
    `;

    document.body.appendChild(endDialog);
    requestAnimationFrame(() => endDialog.querySelector('div').classList.remove('scale-0'));

    setTimeout(() => {
        endDialog.classList.add('opacity-0');
        setTimeout(() => {
            endDialog.remove();
            redirectToMainSite();
        }, 300);
    }, 2000);
}

function redirectToMainSite() {
    document.getElementById("gameOverlay").style.display = "none";
    const mainContent = document.querySelector(".main-content");
    mainContent.style.display = "block";
    createBubbles();
}

function showAuthSuccess() {
    const auth = document.createElement('div');
    auth.className = 'fixed inset-0 bg-green-500     bg-opacity-90 flex items-center justify-center z-[9999]';
    auth.innerHTML = `
        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 transform scale-0 transition-all duration-300">
            <div class="text-center">
                <div class="text-6xl mb-4">✨</div>
                <div class="text-2xl font-bold text-gray-800 mb-6">Authentification réussie !</div>
                <div class="flex flex-col gap-3">
                    <button id="authContinueGame" class="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold">
                        Continuer à jouer
                    </button>
                    <button id="authContinueSite" class="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold">
                        Accéder au site
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('gameOverlay').style.zIndex = '150';
    document.body.appendChild(auth);
    requestAnimationFrame(() => auth.querySelector('div').classList.remove('scale-0'));

    document.getElementById('authContinueGame').onclick = () => {
        auth.classList.add('opacity-0');
        setTimeout(() => {
            auth.remove();
            level++;
            startCountdown();
        }, 300);
    };

    document.getElementById('authContinueSite').onclick = () => {
        auth.classList.add('opacity-0');
        setTimeout(() => {
            auth.remove();
            document.getElementById('gameOverlay').style.display = 'none';
            const mainContent = document.querySelector('.main-content');
            mainContent.style.display = 'block';
            createBubbles();
        }, 300);
    };
}

elements.checkbox.addEventListener('change', () => {
    if (elements.checkbox.checked) {
        closeCaptchaPopup();
        elements.overlay.classList.remove('hidden');
        elements.overlay.style.zIndex = '9998';
        startCountdown();
    }
});
function showSuccess() {
    if (successDialogDisplayed) return;
    successDialogDisplayed = true;

    const successDialog = document.createElement('div');
    successDialog.className = 'fixed inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-[9999]';
    successDialog.innerHTML = `
        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 transform scale-0 transition-all duration-300">
            <div class="text-center">
                <div class="text-6xl mb-4">🎉</div>
                <div class="text-2xl font-bold text-gray-800 mb-4">Niveau ${level} terminé !</div>
                <p class="text-gray-600 mb-6">Score: ${score}/${totalTrashRequired}</p>
                <div class="flex flex-col gap-3">
                    <button id="nextLevelBtn" class="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold">
                        Niveau suivant
                    </button>
                    <button id="exitGameBtn" class="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold">
                        Quitter le jeu
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('gameOverlay').style.zIndex = '150';
    document.body.appendChild(successDialog);
    requestAnimationFrame(() => successDialog.querySelector('div').classList.remove('scale-0'));

    document.getElementById('nextLevelBtn').onclick = () => {
        successDialog.classList.add('opacity-0');
        setTimeout(() => {
            successDialog.remove();
            successDialogDisplayed = false;
            level++;
            startCountdown();
        }, 300);
    };

    document.getElementById('exitGameBtn').onclick = () => {
        successDialog.classList.add('opacity-0');
        setTimeout(() => {
            successDialog.remove();
            document.getElementById('gameOverlay').style.display = 'none';
            const mainContent = document.querySelector('.main-content');
            mainContent.style.display = 'block';
            createBubbles();
        }, 300);
    };
}
function showFailureDialog() {
    if (failureDialogDisplayed) return;
    failureDialogDisplayed = true;

    const failureDialog = document.createElement('div');
    failureDialog.className = 'fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center z-[9999]';
    failureDialog.innerHTML = `
        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 transform scale-0 transition-all duration-300">
            <div class="text-center">
                <div class="text-6xl mb-4">😢</div>
                <div class="text-2xl font-bold text-gray-800 mb-4">Oh non !</div>
                <p class="text-gray-600 mb-6">Vous avez touché un poisson !</p>
                <div class="flex flex-col gap-3">
                    <button id="retryBtn" class="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold">
                        Réessayer
                    </button>
                    <button id="quitBtn" class="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold">
                        Quitter
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('gameOverlay').style.zIndex = '150';
    document.body.appendChild(failureDialog);
    requestAnimationFrame(() => failureDialog.querySelector('div').classList.remove('scale-0'));

    document.getElementById('retryBtn').onclick = () => {
        failureDialog.classList.add('opacity-0');
        setTimeout(() => {
            failureDialog.remove();
            failureDialogDisplayed = false;
            startCountdown();
        }, 300);
    };

    document.getElementById('quitBtn').onclick = () => {
        failureDialog.classList.add('opacity-0');
        setTimeout(() => {
            failureDialog.remove();
            document.getElementById('gameOverlay').style.display = 'none';
            const mainContent = document.querySelector('.main-content');
            mainContent.style.display = 'block';
            createBubbles();
        }, 300);
    };
}

function closeCaptchaPopup() {
    const captchaContainer = document.getElementById('captchaContainer');
    captchaContainer.classList.add('scale-0', 'opacity-0');
    setTimeout(() => {
        captchaContainer.style.display = 'none'; // Au lieu de remove()
    }, 300);
}

function showResult(success) {
    const result = document.createElement('div');
    result.className = `fixed inset-0 ${success ? 'bg-green-500' : 'bg-red-500'} bg-opacity-90 flex items-center justify-center z-[9999] transition-all duration-300`;    result.innerHTML = `
        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 transform scale-0 transition-all duration-300">
            <div class="text-center">
                <div class="text-6xl mb-4">${success ? '✓' : '😢'}</div>
                <div class="text-2xl font-bold text-gray-800 mb-4">
                    ${success ? 'Niveau terminé !' : 'Oups !'}
                </div>
                <p class="text-gray-600 mb-6">
                    ${success ? `Score: ${score}/${totalTrashRequired}` : 'Ne touchez pas les poissons !'}
                </p>
                ${!success ? `
                    <button id="retryGame" class="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold">
                        Réessayer
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(result);
    requestAnimationFrame(() => result.querySelector('div').classList.remove('scale-0'));

    if (!success) {
        document.getElementById('retryGame').onclick = () => {
            result.classList.add('opacity-0');
            setTimeout(() => {
                result.remove();
                elements.overlay.classList.add('hidden');
                elements.checkbox.checked = false;
                setTimeout(() => {
                    elements.overlay.classList.remove('hidden');
                    startCountdown();
                }, 500);
            }, 300);
        };
    } else {
        setTimeout(() => {
            result.classList.add('opacity-0');
            setTimeout(() => result.remove(), 300);
        }, 1500);
    }
}

// ================ Easter Egg ================
const konamiCode = ['ArrowUp', 'ArrowUp'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            elements.vacuum.textContent = '🌊';
            document.querySelectorAll('[data-type="trash"]').forEach(trash => trash.textContent = '🍕');
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});