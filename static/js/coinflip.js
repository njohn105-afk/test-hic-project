let placeBetButton, betAmountField, coinflipChoiceField;
const phase1 = 150;  
const phase2 = 150;   
const phase3 = 150;   
const phase4 = 250; 
let wagerAmount = 0;

let playerBalanceBeforeStart = 0;


window.onload = function() {
    placeBetButton = document.getElementById("place-bet");
    betAmountField = document.getElementById("chip_cost");
    coinflipChoiceField = document.getElementById("coinflip-choice");

    placeBetButton.addEventListener("click", () => {
        const choice = coinflipChoiceField.value;
        placeBet(choice);
    });
}

function placeBet(choice) {
    wagerAmount = parseInt(betAmountField.value) || 0;
    if (wagerAmount < 0) {
        alert("Invalid bet amount!");
        return;
    }
    if (!player.hasEnough(wagerAmount)) {
        alert("Insufficient balance to place this bet!");
        return;
    }
    playerBalanceBeforeStart = player.getBalance();
    player.removeCurrency(wagerAmount);

    toggleBetContainer(false);
    clearGameResults();
    startGame(choice);
}

function animateCoin(finalSide) {
    const coin = document.getElementById("coin");  

    coin.style.transition = "transform 0.15s ease-in";
    coin.style.transform = "rotateY(0deg) scaleX(0.05)";

    function flip_to_side() {
        coin.src = "/static/coins/coin_side.png";
        coin.style.transition = `transform ${phase1/1000}s linear`;
        coin.style.transform = "rotateY(90deg) scaleX(0)";
    }

    function side_flip() {
        coin.style.transition = `transform ${phase2/1000}s ease-out`;
        coin.style.transform = "rotateY(180deg) scaleX(1)";
    }

    function mid_flip() {
        coin.style.transition = `transform ${phase3/1000}s ease-in`;
        coin.style.transform = "rotateY(270deg) scaleX(0.05)";
    }

    function final_flip() {
        coin.src = finalSide === "heads" 
            ? "/static/coins/coin_front.png" 
            : "/static/coins/coin_back.png";

        coin.style.transition = `transform ${phase4/1000}s ease-out`;
        coin.style.transform = "rotateY(360deg) scaleX(1)";
    }

    setTimeout(() => {flip_to_side();
        setTimeout(() => {side_flip();
            setTimeout(() => {mid_flip();
                setTimeout(() => {final_flip();
                }, phase4);
            }, phase3);
        }, phase2);
    }, phase1);
}

function startGame(choice) {
    const result = Math.random() < 0.5 ? "heads" : "tails";
    animateCoin(result);
    setTimeout(() => {finishGame(choice, result)}, phase1+phase2+phase3+phase4+300)
}

function finishGame(choice, result) {
    const win = (choice === result);
    const winText = document.getElementById("winning-text");
    const profitText = document.getElementById("profit-text");
    let profit = 0

    winText.textContent = "Result: " + result.toUpperCase();

    if (win) {
        player.addCurrency(wagerAmount * 2);
        profitText.classList.add("green-text");
        profitText.textContent = "+"+wagerAmount+" (2x)";
    } else {
        profitText.classList.add("red-text");
        profitText.textContent = "-"+wagerAmount+" (0x)";
    }
    profit = player.getBalance() - playerBalanceBeforeStart;
    if (wagerAmount > 0) {
        player.addToGameHistory("coinflip", wagerAmount, profit)
    }
    toggleBetContainer(true);
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
