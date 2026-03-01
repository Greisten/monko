// MONKO JUNGLE SIMULATOR
// Built by Monko Agent 🦞🌴

class MonkoJungleSimulator {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Setup canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Monko stats
        this.monko = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 40,
            emoji: '🦞',
            targetX: null,
            targetY: null,
            speed: 3,
            hunger: 100,
            energy: 100,
            happiness: 100,
            bananas: 0,
            activity: 'idle', // idle, walking, eating, sleeping, swinging, climbing
            animationFrame: 0
        };
        
        // World objects
        this.objects = [];
        this.generateWorld();
        
        // Activity log
        this.activityLog = [];
        this.maxLogItems = 10;
        
        // Stats decay
        this.hungerDecayRate = 0.1; // per second
        this.energyDecayRate = 0.15;
        this.happinessDecayRate = 0.05;
        
        // Interaction
        this.nearObject = null;
        this.interactionRange = 80;
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        window.addEventListener('resize', () => this.handleResize());
        
        // Start game loop
        this.lastUpdate = Date.now();
        this.gameLoop();
        
        this.addLog('🦞 Monko wakes up in the jungle...');
        this.addLog('🌴 Time to explore and chill!');
    }
    
    generateWorld() {
        // Banana trees
        for (let i = 0; i < 8; i++) {
            this.objects.push({
                type: 'banana-tree',
                emoji: '🌴',
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - 200) + 100,
                size: 50,
                interactable: true,
                tooltip: 'Banana Tree',
                action: 'pick-banana'
            });
        }
        
        // River/water spots
        for (let i = 0; i < 3; i++) {
            this.objects.push({
                type: 'water',
                emoji: '💧',
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - 200) + 100,
                size: 40,
                interactable: true,
                tooltip: 'Fresh Water',
                action: 'drink-water'
            });
        }
        
        // Vines for swinging
        for (let i = 0; i < 5; i++) {
            this.objects.push({
                type: 'vine',
                emoji: '🪴',
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - 300) + 100,
                size: 35,
                interactable: true,
                tooltip: 'Vine',
                action: 'swing'
            });
        }
        
        // Sleeping spots
        for (let i = 0; i < 4; i++) {
            this.objects.push({
                type: 'rest',
                emoji: '🏝️',
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - 200) + 100,
                size: 45,
                interactable: true,
                tooltip: 'Rest Spot',
                action: 'rest'
            });
        }
        
        // Jungle friends
        const friends = [
            { emoji: '🐒', name: 'Monkey Friend' },
            { emoji: '🦜', name: 'Parrot' },
            { emoji: '🐍', name: 'Snake' },
            { emoji: '🦎', name: 'Lizard' },
            { emoji: '🦋', name: 'Butterfly' }
        ];
        
        friends.forEach(friend => {
            this.objects.push({
                type: 'friend',
                emoji: friend.emoji,
                name: friend.name,
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - 200) + 100,
                size: 35,
                interactable: true,
                tooltip: friend.name,
                action: 'greet'
            });
        });
        
        // Decorative elements (not interactable)
        for (let i = 0; i < 15; i++) {
            const decorEmojis = ['🌿', '🌺', '🍃', '🌸', '🌼'];
            this.objects.push({
                type: 'decoration',
                emoji: decorEmojis[Math.floor(Math.random() * decorEmojis.length)],
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - 200) + 100,
                size: 25,
                interactable: false
            });
        }
    }
    
    gameLoop() {
        const now = Date.now();
        const delta = (now - this.lastUpdate) / 1000; // seconds
        this.lastUpdate = now;
        
        this.update(delta);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(delta) {
        // Move monko towards target
        if (this.monko.targetX !== null && this.monko.targetY !== null) {
            const dx = this.monko.targetX - this.monko.x;
            const dy = this.monko.targetY - this.monko.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                this.monko.x += (dx / distance) * this.monko.speed;
                this.monko.y += (dy / distance) * this.monko.speed;
                this.monko.activity = 'walking';
            } else {
                this.monko.targetX = null;
                this.monko.targetY = null;
                this.monko.activity = 'idle';
            }
        }
        
        // Decay stats (only if not resting)
        if (this.monko.activity !== 'sleeping') {
            this.monko.hunger = Math.max(0, this.monko.hunger - this.hungerDecayRate * delta);
            this.monko.energy = Math.max(0, this.monko.energy - this.energyDecayRate * delta);
            
            // Happiness decays faster when hungry or tired
            let happinessDecay = this.happinessDecayRate;
            if (this.monko.hunger < 30) happinessDecay *= 2;
            if (this.monko.energy < 30) happinessDecay *= 1.5;
            this.monko.happiness = Math.max(0, this.monko.happiness - happinessDecay * delta);
        }
        
        // Check for nearby interactable objects
        this.nearObject = null;
        for (const obj of this.objects) {
            if (!obj.interactable) continue;
            
            const dx = obj.x - this.monko.x;
            const dy = obj.y - this.monko.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.interactionRange) {
                this.nearObject = obj;
                break;
            }
        }
        
        // Animation frame for idle animation
        this.monko.animationFrame += delta * 2;
        
        // Update UI
        this.updateHUD();
    }
    
    render() {
        // Clear canvas with gradient sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.5, '#98d8e8');
        gradient.addColorStop(1, '#7ab55c');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render objects (back to front)
        const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);
        
        for (const obj of sortedObjects) {
            this.renderObject(obj);
        }
        
        // Render monko
        this.renderMonko();
        
        // Render interaction indicator
        if (this.nearObject && this.monko.activity === 'idle') {
            this.renderInteractionIndicator(this.nearObject);
        }
    }
    
    renderObject(obj) {
        this.ctx.save();
        this.ctx.font = `${obj.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // Slight sway animation for trees and vines
        let offsetX = 0;
        if (obj.type === 'banana-tree' || obj.type === 'vine') {
            offsetX = Math.sin(Date.now() / 1000 + obj.x) * 2;
        }
        
        this.ctx.fillText(obj.emoji, obj.x + offsetX, obj.y);
        this.ctx.restore();
    }
    
    renderMonko() {
        this.ctx.save();
        this.ctx.font = `${this.monko.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        // Idle animation (slight bounce)
        let offsetY = 0;
        if (this.monko.activity === 'idle') {
            offsetY = Math.sin(this.monko.animationFrame) * 3;
        } else if (this.monko.activity === 'walking') {
            offsetY = Math.abs(Math.sin(this.monko.animationFrame * 3)) * 5;
        }
        
        this.ctx.fillText(this.monko.emoji, this.monko.x, this.monko.y + offsetY);
        
        // Activity indicator
        if (this.monko.activity === 'eating') {
            this.ctx.font = '20px Arial';
            this.ctx.fillText('🍌', this.monko.x + 20, this.monko.y - 30);
        } else if (this.monko.activity === 'sleeping') {
            this.ctx.font = '20px Arial';
            this.ctx.fillText('💤', this.monko.x + 20, this.monko.y - 30);
        }
        
        this.ctx.restore();
    }
    
    renderInteractionIndicator(obj) {
        this.ctx.save();
        
        // Pulsing circle
        const pulseSize = 5 + Math.sin(Date.now() / 200) * 3;
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(obj.x, obj.y, obj.size / 2 + pulseSize, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // "Click" text
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText('CLICK', obj.x, obj.y - obj.size);
        this.ctx.fillText('CLICK', obj.x, obj.y - obj.size);
        
        this.ctx.restore();
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Check if clicking near an interactable object
        for (const obj of this.objects) {
            if (!obj.interactable) continue;
            
            const dx = obj.x - clickX;
            const dy = obj.y - clickY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < obj.size) {
                // Move to object then interact
                this.monko.targetX = obj.x;
                this.monko.targetY = obj.y;
                setTimeout(() => {
                    if (this.monko.activity === 'idle') {
                        this.interact(obj);
                    }
                }, 500);
                return;
            }
        }
        
        // Just move to clicked position
        this.monko.targetX = clickX;
        this.monko.targetY = clickY;
    }
    
    interact(obj) {
        switch (obj.action) {
            case 'pick-banana':
                if (Math.random() > 0.3) { // 70% success rate
                    this.monko.bananas++;
                    this.monko.hunger = Math.min(100, this.monko.hunger + 25);
                    this.monko.happiness = Math.min(100, this.monko.happiness + 10);
                    this.addLog('🍌 Found a banana! Yum!');
                    this.spawnParticle('🍌', obj.x, obj.y);
                    this.monko.activity = 'eating';
                    setTimeout(() => {
                        this.monko.activity = 'idle';
                    }, 1500);
                } else {
                    this.addLog('🌴 No bananas here... try another tree');
                }
                break;
                
            case 'drink-water':
                this.monko.energy = Math.min(100, this.monko.energy + 30);
                this.monko.happiness = Math.min(100, this.monko.happiness + 15);
                this.addLog('💧 Refreshing water! Energy restored');
                this.spawnParticle('💧', obj.x, obj.y);
                break;
                
            case 'swing':
                if (this.monko.energy >= 20) {
                    this.monko.energy -= 20;
                    this.monko.happiness = Math.min(100, this.monko.happiness + 25);
                    this.addLog('🪴 Wheee! Swinging on vines!');
                    this.spawnParticle('⭐', obj.x, obj.y);
                    this.monko.activity = 'swinging';
                    setTimeout(() => {
                        this.monko.activity = 'idle';
                    }, 2000);
                } else {
                    this.addLog('😴 Too tired to swing...');
                }
                break;
                
            case 'rest':
                this.monko.activity = 'sleeping';
                this.addLog('💤 Taking a nap...');
                setTimeout(() => {
                    const energyGain = 40;
                    const hungerCost = 10;
                    this.monko.energy = Math.min(100, this.monko.energy + energyGain);
                    this.monko.hunger = Math.max(0, this.monko.hunger - hungerCost);
                    this.monko.happiness = Math.min(100, this.monko.happiness + 20);
                    this.addLog('😊 Feeling refreshed!');
                    this.monko.activity = 'idle';
                }, 3000);
                break;
                
            case 'greet':
                const greetings = [
                    `👋 Said hi to ${obj.name}!`,
                    `🦞 ${obj.name} waves back!`,
                    `💕 ${obj.name} seems friendly`,
                    `🎉 Made a new friend: ${obj.name}!`
                ];
                this.addLog(greetings[Math.floor(Math.random() * greetings.length)]);
                this.monko.happiness = Math.min(100, this.monko.happiness + 15);
                this.spawnParticle('💖', obj.x, obj.y);
                break;
        }
    }
    
    spawnParticle(emoji, x, y) {
        const particle = document.createElement('div');
        particle.id = 'emoji-particle';
        particle.textContent = emoji;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 2000);
    }
    
    addLog(message) {
        this.activityLog.unshift(message);
        if (this.activityLog.length > this.maxLogItems) {
            this.activityLog.pop();
        }
        
        const logContent = document.getElementById('log-content');
        logContent.innerHTML = this.activityLog
            .map(log => `<div class="activity-item">${log}</div>`)
            .join('');
    }
    
    updateHUD() {
        document.getElementById('hunger-bar').style.width = this.monko.hunger + '%';
        document.getElementById('energy-bar').style.width = this.monko.energy + '%';
        document.getElementById('happiness-bar').style.width = this.monko.happiness + '%';
        document.getElementById('banana-count').textContent = this.monko.bananas;
        
        // Update location based on position
        let location = 'Jungle';
        if (this.monko.y < this.canvas.height * 0.3) location = 'Canopy';
        else if (this.monko.y > this.canvas.height * 0.7) location = 'Ground';
        document.getElementById('location').textContent = location;
    }
    
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Keep monko in bounds
        this.monko.x = Math.min(this.monko.x, this.canvas.width - 50);
        this.monko.y = Math.min(this.monko.y, this.canvas.height - 50);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new MonkoJungleSimulator();
});
