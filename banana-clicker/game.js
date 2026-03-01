// Game state
let gameState = {
    bananas: 0,
    totalClicks: 0,
    clickPower: 1,
    perSecond: 0,
    upgrades: {}
};

// Upgrade definitions
const upgradeTypes = [
    {
        id: 'cursor',
        name: '🖱️ Auto-Clicker',
        desc: 'Clicks automatically',
        baseCost: 15,
        bananasPerSecond: 0.1,
        costMultiplier: 1.15
    },
    {
        id: 'monkey',
        name: '🐒 Banana Monkey',
        desc: 'A friend who picks bananas',
        baseCost: 100,
        bananasPerSecond: 1,
        costMultiplier: 1.15
    },
    {
        id: 'tree',
        name: '🌴 Banana Tree',
        desc: 'Grows bananas automatically',
        baseCost: 500,
        bananasPerSecond: 5,
        costMultiplier: 1.15
    },
    {
        id: 'plantation',
        name: '🏝️ Banana Plantation',
        desc: 'Mass banana production',
        baseCost: 3000,
        bananasPerSecond: 25,
        costMultiplier: 1.15
    },
    {
        id: 'factory',
        name: '🏭 Banana Factory',
        desc: 'Industrial banana output',
        baseCost: 10000,
        bananasPerSecond: 100,
        costMultiplier: 1.15
    },
    {
        id: 'spaceship',
        name: '🚀 Banana Spaceship',
        desc: 'Interplanetary banana trade',
        baseCost: 50000,
        bananasPerSecond: 500,
        costMultiplier: 1.15
    },
    {
        id: 'dimension',
        name: '🌌 Banana Dimension',
        desc: 'Infinite banana multiverse',
        baseCost: 250000,
        bananasPerSecond: 2500,
        costMultiplier: 1.15
    }
];

// Initialize upgrades
upgradeTypes.forEach(upgrade => {
    gameState.upgrades[upgrade.id] = { owned: 0 };
});

// DOM elements
const bananaCountEl = document.getElementById('bananaCount');
const perSecondEl = document.getElementById('perSecond');
const totalClicksEl = document.getElementById('totalClicks');
const clickPowerEl = document.getElementById('clickPower');
const clickBtn = document.getElementById('clickBanana');
const upgradesListEl = document.getElementById('upgradesList');
const resetBtn = document.getElementById('resetBtn');
const floatingBananasEl = document.getElementById('floatingBananas');

// Load saved game
function loadGame() {
    const saved = localStorage.getItem('monkoBananaClicker');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
}

// Save game
function saveGame() {
    localStorage.setItem('monkoBananaClicker', JSON.stringify(gameState));
}

// Calculate per second production
function calculatePerSecond() {
    let total = 0;
    upgradeTypes.forEach(upgrade => {
        const owned = gameState.upgrades[upgrade.id].owned;
        total += owned * upgrade.bananasPerSecond;
    });
    gameState.perSecond = total;
}

// Get upgrade cost
function getUpgradeCost(upgrade) {
    const owned = gameState.upgrades[upgrade.id].owned;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned));
}

// Click handler
clickBtn.addEventListener('click', (e) => {
    gameState.bananas += gameState.clickPower;
    gameState.totalClicks++;
    
    // Create floating banana effect
    createFloatingBanana(e.clientX, e.clientY);
    
    updateDisplay();
    saveGame();
});

// Create floating banana animation
function createFloatingBanana(x, y) {
    const banana = document.createElement('div');
    banana.className = 'float-banana';
    banana.textContent = '🍌';
    banana.style.left = x + 'px';
    banana.style.top = y + 'px';
    floatingBananasEl.appendChild(banana);
    
    setTimeout(() => {
        banana.remove();
    }, 2000);
}

// Buy upgrade
function buyUpgrade(upgrade) {
    const cost = getUpgradeCost(upgrade);
    
    if (gameState.bananas >= cost) {
        gameState.bananas -= cost;
        gameState.upgrades[upgrade.id].owned++;
        calculatePerSecond();
        updateDisplay();
        renderUpgrades();
        saveGame();
    }
}

// Render upgrades list
function renderUpgrades() {
    upgradesListEl.innerHTML = '';
    
    upgradeTypes.forEach(upgrade => {
        const owned = gameState.upgrades[upgrade.id].owned;
        const cost = getUpgradeCost(upgrade);
        const canAfford = gameState.bananas >= cost;
        
        const upgradeEl = document.createElement('div');
        upgradeEl.className = `upgrade-item ${!canAfford ? 'disabled' : ''}`;
        
        upgradeEl.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-cost">🍌 ${formatNumber(cost)}</span>
            </div>
            <div class="upgrade-desc">${upgrade.desc} (+${upgrade.bananasPerSecond} 🍌/s)</div>
            <div class="upgrade-owned">Owned: ${owned}</div>
        `;
        
        if (canAfford) {
            upgradeEl.addEventListener('click', () => buyUpgrade(upgrade));
        }
        
        upgradesListEl.appendChild(upgradeEl);
    });
}

// Format large numbers
function formatNumber(num) {
    if (num < 1000) return Math.floor(num);
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    return (num / 1000000000000).toFixed(1) + 'T';
}

// Update display
function updateDisplay() {
    bananaCountEl.textContent = formatNumber(gameState.bananas);
    perSecondEl.textContent = gameState.perSecond.toFixed(1);
    totalClicksEl.textContent = gameState.totalClicks;
    clickPowerEl.textContent = gameState.clickPower;
}

// Reset game
resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset? All progress will be lost!')) {
        localStorage.removeItem('monkoBananaClicker');
        location.reload();
    }
});

// Game loop - passive income
function gameLoop() {
    if (gameState.perSecond > 0) {
        gameState.bananas += gameState.perSecond / 10; // 10 updates per second
        updateDisplay();
    }
}

// Initialize
loadGame();
calculatePerSecond();
updateDisplay();
renderUpgrades();

// Start game loop
setInterval(gameLoop, 100); // Update 10 times per second

// Auto-save every 5 seconds
setInterval(saveGame, 5000);

// Update upgrades display every second
setInterval(renderUpgrades, 1000);
