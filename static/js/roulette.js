//TODO:
// SNACKBAR UI BUILDER FOR USER INFORMATION DISPLAY
// Fix awkward positioning of elements in history table

const choiceTable = new Map();
const wheelOrder = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34,
    6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7,
    28, 12, 35, 3, 26
];
const blackNumbers = [
    26, 15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31,
    22, 29, 28, 35, 26
]

const redNumbers = [
    32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14,
    9, 18, 7, 12, 3,
]

let lastSavedBetConfig = null;

// To determine the correct rotation of any given number pocket on the roulette wheel
// So we can move the ball toward that rotational value corresponding.
const ANGLE_PER_SLOT = 360 / 37;

const ballTravelTime = 1800;  // ms
const outerRadius = 260; // The ball's orbit radius
const innerRadius = 210; // how far the ball should fall into the pocket

const IMAGE_OFFSET = -80;  // IDK WHY THIS RANDOM OFFSET WORKED BUT IT DOES, DON'T CHANGE IT
const EXTRA_SPINS = 3;     // number of extra full rotations before honing in on target
const SPIN_PHASE = 0.2;
const HONE_PHASE = 0.5;

let chipValue = 0;
let totalBet = 0;

let winningIndex = 0;
let startTime = 0;

let ballAngle = 0;
let initialBallAngle = 0;
let ballRadius = outerRadius;

let playerBalanceBeforeStart = 0;

// Get initial angles of each pocket (number) on the roulette wheel
const basePocketAngles = wheelOrder.map((_, i) => i * ANGLE_PER_SLOT);

//
//
// ----ANIMATION----------------------
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeIn(t) {
    return t * t * t;
}
function animateBall() {
    const now = performance.now();
    const t = Math.min((now - startTime) / ballTravelTime, 1.5); 
    const ball = document.getElementById("ball");

    const wheelAngle = getWheelAngle(); // current wheel rotation 

    const pocketBase = basePocketAngles[winningIndex];
    const rawTarget = (pocketBase + IMAGE_OFFSET + wheelAngle + 360) % 360;
    const finalTargetAngle = rawTarget + EXTRA_SPINS * 360;
    ballFinalAngle = finalTargetAngle;
    
    if (t < SPIN_PHASE) {
        // Extra spins
        const phaseT = t / SPIN_PHASE;
        ballAngle = lerp(initialBallAngle, ballFinalAngle * SPIN_PHASE, easeIn(phaseT));
        ballRadius = lerp(outerRadius, innerRadius, easeIn(t));
    } else if (t < SPIN_PHASE + HONE_PHASE) {
        // Start honing in on target angle
        const phaseT = (t - SPIN_PHASE) / (HONE_PHASE);
        ballAngle = lerp(ballFinalAngle * HONE_PHASE, ballFinalAngle, easeOut(phaseT));
        ballRadius = lerp(outerRadius, innerRadius, easeIn(phaseT));
    } else {
        ballAngle = ballFinalAngle;
    }

    ball.style.transform = `
        translate(-50%, -50%)
        rotate(${ballAngle}deg)
        translateX(${ballRadius}px)
    `;
    // Animate ball until t reaches 1.5 (time finished)
    if (t < 1.5) {
        requestAnimationFrame(animateBall);
    } else {
        finishGame();
    }
}
//
//
// ----HELPERS----------------------
function getWheelAngle() {
    const wheel = document.getElementById("wheel");
    const style = window.getComputedStyle(wheel);
    const transform = style.transform;

    if (transform === "none") return 0;
    const values = transform.match(/matrix.*\((.+)\)/)[1].split(", ");
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);

    let angle = Math.atan2(b, a) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle % 360;
}

//
//
// ----GAMEPLAY----------------------
function saveBetConfig() {
    lastSavedBetConfig = new Map(choiceTable);
}
function loadLastBetConfig() {
    if (lastSavedBetConfig !== null) {
        resetBet();
        for (const [id,amount] of lastSavedBetConfig.entries()) {
            if (amount > 0) addToChoice(id, amount);
        }
    }
}
function attemptStartGame() {
    if (!player.hasEnough(totalBet)) return;
    playerBalanceBeforeStart = player.getBalance();
    toggleBetContainer(false);
    clearGameResults();
    player.removeCurrency(totalBet);
    saveBetConfig();

    // Get ball element, reset angle settings
    const ball = document.getElementById("ball");
    initialBallAngle = 0;
    ballAngle = 0;
    ballRadius = outerRadius;

    ball.style.transform = `
        translate(-50%, -50%)
        rotate(0deg)
        translateX(${outerRadius}px)
    `;

    // Pick winning pocket 
    winningIndex = getRandomIntInclusive(0,36);
    const winningNumber = wheelOrder[winningIndex];
    console.log("Selected winning number:", winningNumber);

    // Start animation
    startTime = performance.now();
    requestAnimationFrame(animateBall);
}
function finishGame() {
    const winningNumber = wheelOrder[winningIndex];
    payout(winningNumber);
    resetBet();
    toggleBetContainer(true);
}
function buildChoices() {
    for (let i = 0; i <= 36; i++) {
        choiceTable.set(i, 0);
    }
    choiceTable.set("black", 0);
    choiceTable.set("red", 0);
    choiceTable.set("even", 0);
    choiceTable.set("odd", 0);
}
function addToChoice(choice, amount) {
    if (amount < 0) return;
    if (totalBet + amount > player.getBalance()) {
        alert("Insufficient balance to place this bet!");
        return; 
    }
    choiceTable.set(choice, choiceTable.get(choice) + amount);
    totalBet += amount;
    updateTotalBetAmount();
    updateSelectorWithBetAmount(choice);
}
function resetBet() {
    totalBet = 0;
    choiceTable.clear();
    buildChoices();
    updateTotalBetAmount();
    clearAllBetLabels();
    const ball = document.getElementById("ball");
    ball.style.transform = `
    translate(-50%, -50%)
    rotate(0deg)
    translateX(0px)
    `;
}
function payout(winningNumber) {
    // totalBet is already removed from player, so we just add now.
    const amountBetSpecificNumber = choiceTable.get(winningNumber);
    const amountBetBlack = choiceTable.get('black');
    const amountBetRed   = choiceTable.get('red');
    const amountBetEven  = choiceTable.get('even');
    const amountBetOdd   = choiceTable.get('odd');
    let profit = 0;
    // Specific number payout: 36x
    player.addCurrency(amountBetSpecificNumber * 36);
    // Black/red payout: 2x
    if (blackNumbers.includes(winningNumber)) player.addCurrency(amountBetBlack * 2);
    else if (redNumbers.includes(winningNumber)) player.addCurrency(amountBetRed * 2);
    // Even/odd payout: 2x
    if (winningNumber % 2 == 0) player.addCurrency(amountBetEven * 2);
    else player.addCurrency(amountBetOdd * 2);

    profit = player.getBalance() - playerBalanceBeforeStart

    showGameResults("Winning Number: " + winningNumber, "Profit: " + profit, profit);
    if (totalBet > 0) {
        player.addToGameHistory("roulette", totalBet, profit)
    }

}

//
//
// ----VISUALS----------------------
function showGameResults(topText, botText, profitAmt) {
    clearGameResults();
    const winText = document.getElementById("winning-text");
    const profitText = document.getElementById("profit-text");
    let multiplier = (totalBet + profitAmt) / totalBet;
    if (profitAmt > 0) {
        profitText.classList.add("green-text");
        botText += " (" + multiplier + "x)"
    }
    else {
        profitText.classList.add("red-text");
        botText += " (" + 0 + "x)"
    } 
    winText.textContent = topText;
    profitText.textContent = botText;
}

function clearGameResults() {
    const winText = document.getElementById("winning-text");
    const profitText = document.getElementById("profit-text");
    winText.textContent = "";
    profitText.textContent = "";
    profitText.classList.remove("green-text");
    profitText.classList.remove("red-text");
}

function toggleBetContainer(to) {
    const container = document.querySelector('.bet-container');
    if (to === false) container.classList.add("disabled");
    else container.classList.remove("disabled");
}

function buildSelectorButton(div, text, className, id) {
    const selectorButton = document.createElement('div');
    selectorButton.textContent = text;
    selectorButton.className = className;
    selectorButton.id = id;
    selectorButton.addEventListener("click", function () {
        addToChoice(id, chipValue);
    });
    div.appendChild(selectorButton);
}
function buildSelector() {
    const choiceDiv = document.querySelector('.roulette-choices');
    if (choiceDiv) {
        for (let i = 0; i <= 36; i++) {
            let color;
            if (blackNumbers.includes(i)) color = 'black';
            else if (redNumbers.includes(i)) color = 'red';
            else color = 'green';
            buildSelectorButton(choiceDiv, i, 'roulette-button ' + color, i);
        }
        buildSelectorButton(choiceDiv, "Black", 'roulette-button black smaller-text', "black");
        buildSelectorButton(choiceDiv, "Red", 'roulette-button red smaller-text', "red");
        buildSelectorButton(choiceDiv, "Even", 'roulette-button grey smaller-text', "even");
        buildSelectorButton(choiceDiv, "Odd", 'roulette-button grey smaller-text', "odd");
    }
}
function updateTotalBetAmount() {
    const betAmountText = document.querySelector('#bet-amnt');
    betAmountText.textContent = totalBet;
}

function updateSelectorWithBetAmount(id) {
    const theButton = document.getElementById(id);
    let label = theButton.querySelector(".bet-label");
    if (!label) {
        label = document.createElement("div");
        label.classList.add("bet-label");
        theButton.appendChild(label);
    }
    label.textContent = choiceTable.get(id);
    if (choiceTable.get(id) <= 0) {
        label.remove();
    }
}
function clearAllBetLabels() {
    const labels = document.querySelectorAll('.bet-label');
    labels.forEach(label => label.remove());
}
//
//
// ----STARTUP----------------------
window.onload = function () {
    buildSelector();
    buildChoices();

    const inputField = document.getElementById('chip_cost');
    inputField.addEventListener("input", function () {
        chipValue = Number(inputField.value);
    });

    document.getElementById("place-bet")
        .addEventListener("click", attemptStartGame);

    document.getElementById("reset-bet")
        .addEventListener("click", resetBet);
    
    document.getElementById("redo-bet")
        .addEventListener("click", loadLastBetConfig);

    document.getElementById("wheel").classList.add("idle-spin");
};