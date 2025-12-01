// INCLUDE this script BEFORE any other scripts in each html file
// This ensures that the player data is loaded and visuals updated
// Do not create new player objects, always use the reference 'player' which is 
// created at the bottom of this file.

// History format:
// Index 0 = most recent
/*{
    gameKey: gameKey, 
    wagerAmt: wagerAmt, 
    win: profitValue > 0,
    profitValue: profitValue,
    endBalance: this.getBalance(),
}*/

class Player {
    constructor() {
        this.balance = Number(localStorage.getItem("balance") ?? 1000);
        this.gameHistory = this.getGameHistory() ?? [];
        this.updateBalanceBox();

        //DEBUG: ADD CURRENCY WITH + BUTTON
        const addButtons = document.querySelectorAll('.balance-add-btn');
        addButtons.forEach(btn => {
            btn.addEventListener("click", function() {player.addCurrency(1000)});
        })

    }

    getBalance() {
        return this.balance ?? 0;
    }

    hasEnough(amount) {
        return this.balance >= amount;
    }

    addCurrency(amount) {
        this.balance += amount;
        localStorage.setItem("balance", this.balance);
        this.updateBalanceBox();
    }

    removeCurrency(amount) {
        if (this.hasEnough(amount)) this.addCurrency(-amount);
        else console.log("Attempted to remove too much balance!");
    }

    getGameHistory() {
        const history = localStorage.getItem("history");
        if (history) {
            return JSON.parse(history);
        }
        return null;
    }

    addToGameHistory(gameKey, wagerAmt, profitValue) {
        // List: 
        // gameKey
        // wager Amount
        // Win/loss determined if profitValue > 0
        // Result determined from profitValue
        // Balance (just get user balance)

        this.gameHistory.unshift(
            {
                gameKey: gameKey, 
                wagerAmt: wagerAmt, 
                win: profitValue > 0,
                profitValue: profitValue,
                endBalance: this.getBalance(),
            }
        )
        if (this.gameHistory.length > 12) {
            this.gameHistory.splice(12); 
        }
        this.saveGameHistory();

    }

    saveGameHistory() {
        localStorage.setItem("history", JSON.stringify(this.gameHistory));
    }

    updateBalanceBox() {
        const balance_boxes = document.querySelectorAll('#balance-amount');
        for (const balance_box of balance_boxes) {
            balance_box.textContent = this.getBalance().toFixed(2);
        }
    }
}

const player = new Player();
