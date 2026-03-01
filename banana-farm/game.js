// MONKO BANANA FARM GAME
// Built by Monko Agent 🦞🍌

class MonkoBananaFarm {
    constructor() {
        this.bananas = 0;
        this.monkoTokens = 0;
        this.water = 100;
        this.fertilizer = 10;
        this.plots = [];
        this.plotCount = 8;
        this.autoWater = false;
        this.autoCollect = false;
        this.defense = 0;
        
        // Tree stages: 0=empty, 1=seed, 2=sprout, 3=growing, 4=mature
        this.growthTime = 30000; // 30 seconds per stage
        this.waterDecayRate = 10000; // Water needed every 10 seconds
        this.monkeyAttackChance = 0.1; // 10% chance per minute
        
        this.upgrades = {
            plotExpansion: { cost: 100, owned: false, name: "New Plot", desc: "Add 4 more plots" },
            autoWatering: { cost: 500, owned: false, name: "Auto-Water", desc: "Trees water themselves" },
            autoCollect: { cost: 750, owned: false, name: "Auto-Collect", desc: "Bananas collect automatically" },
            defenseSystem: { cost: 1000, owned: false, name: "Monkey Defense", desc: "90% attack protection" },
            fastGrow: { cost: 2000, owned: false, name: "Fast Grow", desc: "2x growth speed" },
            bonusYield: { cost: 3000, owned: false, name: "Bonus Yield", desc: "+50% bananas per tree" }
        };
        
        this.init();
    }
    
    init() {
        // Initialize plots
        for (let i = 0; i < this.plotCount; i++) {
            this.plots.push({
                id: i,
                stage: 0, // empty
                health: 100,
                watered: true,
                lastWatered: Date.now(),
                lastGrowth: Date.now(),
                bananaCount: 0
            });
        }
        
        this.renderFarm();
        this.startGameLoop();
        this.startMonkeyAttacks();
        this.loadGame();
        this.updateUI();
    }
    
    renderFarm() {
        const farmArea = document.getElementById('farm-area');
        farmArea.innerHTML = '';
        
        this.plots.forEach((plot, idx) => {
            const plotEl = document.createElement('div');
            plotEl.className = 'plot';
            plotEl.dataset.plotId = idx;
            
            if (plot.stage === 0) {
                plotEl.classList.add('empty');
                plotEl.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 40px;">🌱</div>
                        <div style="font-size: 14px; margin-top: 10px;">Plant Tree</div>
                    </div>
                `;
                plotEl.onclick = () => this.plantTree(idx);
            } else {
                const treeEmojis = ['🌱', '🌿', '🌳', '🌳'];
                const treeIcon = plot.stage < 4 ? treeEmojis[plot.stage - 1] : '🌴';
                const bananaDisplay = plot.stage === 4 ? `🍌 x${plot.bananaCount}` : '';
                
                plotEl.innerHTML = `
                    <div class="health-bar">
                        <div class="health-fill" style="width: ${plot.health}%"></div>
                    </div>
                    <div class="tree tree-stage-${plot.stage}">${treeIcon}</div>
                    <div style="font-size: 20px; margin-top: 5px;">${bananaDisplay}</div>
                    <div class="plot-status">
                        Stage ${plot.stage}/4 | ${plot.watered ? '💧' : '🔥'}
                    </div>
                    <div class="action-buttons" style="right: 5px;">
                        <button class="action-btn" onclick="game.waterPlot(${idx})" title="Water">💧</button>
                        <button class="action-btn" onclick="game.fertilizePlot(${idx})" title="Fertilize">🌱</button>
                        ${plot.stage === 4 && plot.bananaCount > 0 ? 
                            `<button class="action-btn" onclick="game.harvestPlot(${idx})" title="Harvest">🍌</button>` : ''}
                    </div>
                `;
            }
            
            farmArea.appendChild(plotEl);
        });
    }
    
    plantTree(plotId) {
        const plot = this.plots[plotId];
        if (plot.stage === 0 && this.bananas >= 5) {
            this.bananas -= 5;
            plot.stage = 1;
            plot.health = 100;
            plot.watered = true;
            plot.lastWatered = Date.now();
            plot.lastGrowth = Date.now();
            this.showNotification('🌱 Tree planted!');
            this.renderFarm();
            this.updateUI();
            this.saveGame();
        } else if (this.bananas < 5) {
            this.showNotification('❌ Need 5 bananas to plant!');
        }
    }
    
    waterPlot(plotId) {
        const plot = this.plots[plotId];
        if (this.water >= 10 && !plot.watered) {
            this.water -= 10;
            plot.watered = true;
            plot.lastWatered = Date.now();
            plot.health = Math.min(100, plot.health + 20);
            this.renderFarm();
            this.updateUI();
            this.saveGame();
        }
    }
    
    fertilizePlot(plotId) {
        const plot = this.plots[plotId];
        if (this.fertilizer > 0 && plot.stage > 0 && plot.stage < 4) {
            this.fertilizer--;
            plot.stage++;
            plot.lastGrowth = Date.now();
            this.showNotification('🌱 Tree boosted!');
            this.renderFarm();
            this.updateUI();
            this.saveGame();
        }
    }
    
    harvestPlot(plotId) {
        const plot = this.plots[plotId];
        if (plot.stage === 4 && plot.bananaCount > 0) {
            const bonus = this.upgrades.bonusYield.owned ? 1.5 : 1;
            const amount = Math.floor(plot.bananaCount * bonus);
            this.bananas += amount;
            
            // Animation
            this.showCollectAnimation(plotId, amount);
            
            plot.bananaCount = 0;
            plot.stage = 3; // Reset to growing
            plot.lastGrowth = Date.now();
            
            this.renderFarm();
            this.updateUI();
            this.saveGame();
        }
    }
    
    waterAll() {
        let watered = 0;
        this.plots.forEach((plot, idx) => {
            if (plot.stage > 0 && !plot.watered && this.water >= 10) {
                this.waterPlot(idx);
                watered++;
            }
        });
        if (watered > 0) {
            this.showNotification(`💧 Watered ${watered} trees!`);
        }
    }
    
    collectAll() {
        let collected = 0;
        this.plots.forEach((plot, idx) => {
            if (plot.stage === 4 && plot.bananaCount > 0) {
                collected += plot.bananaCount;
                this.harvestPlot(idx);
            }
        });
        if (collected > 0) {
            this.showNotification(`🍌 Collected ${collected} bananas!`);
        }
    }
    
    claimMonko() {
        // Convert bananas to MONKO tokens
        // Rate: 100 bananas = 1 MONKO
        if (this.bananas >= 100) {
            const monkoEarned = Math.floor(this.bananas / 100);
            this.monkoTokens += monkoEarned;
            this.bananas -= monkoEarned * 100;
            this.showNotification(`🦞 Claimed ${monkoEarned} $MONKO!`);
            this.updateUI();
            this.saveGame();
        } else {
            this.showNotification('❌ Need 100 bananas for 1 $MONKO!');
        }
    }
    
    startGameLoop() {
        setInterval(() => {
            this.plots.forEach((plot, idx) => {
                if (plot.stage === 0) return;
                
                // Check watering
                const timeSinceWater = Date.now() - plot.lastWatered;
                if (timeSinceWater > this.waterDecayRate) {
                    plot.watered = false;
                    plot.health = Math.max(0, plot.health - 1);
                }
                
                // Auto-watering
                if (this.autoWater && !plot.watered && this.water >= 10) {
                    this.waterPlot(idx);
                }
                
                // Growth
                if (plot.watered && plot.stage < 4) {
                    const growthSpeed = this.upgrades.fastGrow.owned ? 0.5 : 1;
                    const timeSinceGrowth = Date.now() - plot.lastGrowth;
                    if (timeSinceGrowth > this.growthTime * growthSpeed) {
                        plot.stage++;
                        plot.lastGrowth = Date.now();
                        if (plot.stage === 4) {
                            plot.bananaCount = Math.floor(Math.random() * 3) + 3; // 3-5 bananas
                        }
                    }
                }
                
                // Auto-collect
                if (this.autoCollect && plot.stage === 4 && plot.bananaCount > 0) {
                    this.harvestPlot(idx);
                }
                
                // Tree dies if health reaches 0
                if (plot.health <= 0) {
                    plot.stage = 0;
                    plot.bananaCount = 0;
                    this.showNotification('💀 A tree died!');
                }
            });
            
            // Regenerate water
            this.water = Math.min(100, this.water + 1);
            
            this.renderFarm();
            this.updateUI();
            this.saveGame();
        }, 1000); // Update every second
    }
    
    startMonkeyAttacks() {
        setInterval(() => {
            if (Math.random() < this.monkeyAttackChance) {
                // Random attack!
                const defenseSuccess = this.upgrades.defenseSystem.owned && Math.random() < 0.9;
                
                if (!defenseSuccess) {
                    // Pick random mature tree
                    const matureTrees = this.plots.filter(p => p.stage === 4 && p.bananaCount > 0);
                    if (matureTrees.length > 0) {
                        const target = matureTrees[Math.floor(Math.random() * matureTrees.length)];
                        const stolen = Math.min(target.bananaCount, Math.floor(Math.random() * 2) + 1);
                        target.bananaCount -= stolen;
                        target.health -= 20;
                        
                        this.showMonkeyAttack();
                        this.showNotification(`🐒 MONKEY ATTACK! Lost ${stolen} bananas!`);
                        this.renderFarm();
                    }
                } else {
                    this.showNotification('🛡️ Defense system blocked attack!');
                }
            }
        }, 60000); // Check every minute
    }
    
    showMonkeyAttack() {
        const monkey = document.createElement('div');
        monkey.className = 'monkey-attack';
        monkey.textContent = '🐒';
        monkey.style.top = Math.random() * 60 + 20 + '%';
        document.getElementById('game-container').appendChild(monkey);
        setTimeout(() => monkey.remove(), 3000);
    }
    
    showCollectAnimation(plotId, amount) {
        const plotEl = document.querySelector(`[data-plot-id="${plotId}"]`);
        if (!plotEl) return;
        
        const rect = plotEl.getBoundingClientRect();
        const banana = document.createElement('div');
        banana.className = 'banana-collect';
        banana.textContent = `+${amount}🍌`;
        banana.style.left = rect.left + rect.width / 2 + 'px';
        banana.style.top = rect.top + rect.height / 2 + 'px';
        document.getElementById('game-container').appendChild(banana);
        setTimeout(() => banana.remove(), 1000);
    }
    
    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = message;
        document.getElementById('game-container').appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }
    
    openShop() {
        const modal = document.getElementById('modal');
        const shopItems = document.getElementById('shop-items');
        
        shopItems.innerHTML = '';
        
        Object.entries(this.upgrades).forEach(([key, upgrade]) => {
            if (upgrade.owned) return; // Skip owned upgrades
            
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-desc">${upgrade.desc}</div>
                    <div class="upgrade-cost">Cost: ${upgrade.cost} 🍌</div>
                </div>
                <button class="buy-btn" 
                    onclick="game.buyUpgrade('${key}')"
                    ${this.bananas < upgrade.cost ? 'disabled' : ''}>
                    BUY
                </button>
            `;
            shopItems.appendChild(item);
        });
        
        modal.classList.add('show');
    }
    
    closeShop() {
        document.getElementById('modal').classList.remove('show');
    }
    
    buyUpgrade(key) {
        const upgrade = this.upgrades[key];
        if (this.bananas >= upgrade.cost && !upgrade.owned) {
            this.bananas -= upgrade.cost;
            upgrade.owned = true;
            
            // Apply upgrade effects
            if (key === 'plotExpansion') {
                this.plotCount += 4;
                for (let i = 0; i < 4; i++) {
                    this.plots.push({
                        id: this.plots.length,
                        stage: 0,
                        health: 100,
                        watered: true,
                        lastWatered: Date.now(),
                        lastGrowth: Date.now(),
                        bananaCount: 0
                    });
                }
            } else if (key === 'autoWatering') {
                this.autoWater = true;
            } else if (key === 'autoCollect') {
                this.autoCollect = true;
            }
            
            this.showNotification(`✅ Purchased: ${upgrade.name}`);
            this.renderFarm();
            this.updateUI();
            this.saveGame();
            this.openShop(); // Refresh shop
        }
    }
    
    updateUI() {
        document.getElementById('bananas').textContent = this.bananas;
        document.getElementById('monko-tokens').textContent = this.monkoTokens;
        document.getElementById('water').textContent = this.water;
        document.getElementById('fertilizer').textContent = this.fertilizer;
    }
    
    saveGame() {
        const saveData = {
            bananas: this.bananas,
            monkoTokens: this.monkoTokens,
            water: this.water,
            fertilizer: this.fertilizer,
            plots: this.plots,
            upgrades: this.upgrades,
            autoWater: this.autoWater,
            autoCollect: this.autoCollect
        };
        localStorage.setItem('monko-farm-save', JSON.stringify(saveData));
    }
    
    loadGame() {
        const saveData = localStorage.getItem('monko-farm-save');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.bananas = data.bananas || 10; // Start with 10 for planting
            this.monkoTokens = data.monkoTokens || 0;
            this.water = data.water || 100;
            this.fertilizer = data.fertilizer || 10;
            this.plots = data.plots || this.plots;
            this.upgrades = data.upgrades || this.upgrades;
            this.autoWater = data.autoWater || false;
            this.autoCollect = data.autoCollect || false;
            this.plotCount = this.plots.length;
        } else {
            // First time player - give starting resources
            this.bananas = 10;
            this.fertilizer = 10;
        }
    }
}

// Initialize game
const game = new MonkoBananaFarm();
