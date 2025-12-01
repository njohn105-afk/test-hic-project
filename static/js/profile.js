
let activeProfileTab = null;

function loadHistory() {
    const container = document.getElementById("history-content");
    container.innerHTML = ""; 
    const history = player.getGameHistory();

    let html = `
    <table class="history-table">
        <thead>
            <tr>
                <th>Game</th>
                <th>Wager</th>
                <th>Win/Loss</th>
                <th>Result</th>
                <th>Balance</th>
            </tr>
        </thead>
        <tbody>
    `;

    history.forEach(entry => {
        const won = entry.win ? 
            `<span class='history-win'>Win</span>` : 
            `<span class='history-loss'>Loss</span>`;

        const profit = entry.profitValue > 0 ?
            `<span class='history-win'>+${entry.profitValue.toFixed(2)}</span>` :
            `<span class='history-loss'>${entry.profitValue.toFixed(2)}</span>`;

        html += `
        <tr>
            <td>${entry.gameKey}</td>
            <td>${entry.wagerAmt.toFixed(2)}</td>
            <td>${won}</td>
            <td>${profit}</td>
            <td>${entry.endBalance.toFixed(2)}</td>
        </tr>
        `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
}


function loadSection(section) {
    if (section === "History") {
        loadHistory();
    }
}

window.onload = function () {
    document.querySelectorAll('.profile-tab').forEach(btn => {
        if (btn.classList.contains('active')) activeProfileTab = btn;
        btn.addEventListener('click', () => {
            if (activeProfileTab) {
                console.log(activeProfileTab);
                activeProfileTab.classList.remove('active');
                activeProfileTab = btn;
                activeProfileTab.classList.add('active');
                console.log(activeProfileTab);
            }

            const container = document.getElementById("history-content");
            container.innerHTML = ""; 
            loadSection(btn.textContent);
        });
    });
}