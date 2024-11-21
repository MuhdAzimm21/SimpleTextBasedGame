const output = document.getElementById("output");
const healthStat = document.getElementById("health");
const attackStat = document.getElementById("attack");
const positionStat = document.getElementById("position");
const criticalChance = document.getElementById("critChance");
const criticalDamage = document.getElementById("critDamage");
const dodgeChance = document.getElementById("dodgeChance");

const startBtn = document.getElementById("startBtn");
const moveBtn = document.getElementById("moveBtn");
const quitBtn = document.getElementById("quitBtn");
const attackBtn = document.getElementById("attackBtn"); // Use the existing attack button


let gameState = {
    isPlaying: false,
    health: 150,
    attack: 10,
    position: 0,
    criticalChance: 1, // Critical hit chance in percentage
    criticalDamage: 1,
    dodgeChance: 1,
};

const boss = {
    health: 300,
    attack: 15,
};

const events = [
    { text: "You find a treasure chest! (+10 attack)", action: () => (gameState.attack += 10) },
    { text: "A goblin attacks you! (-20 health)", action: () => (gameState.health -= 20) },
    { text: "You discover a healing potion! (+20 health)", action: () => (gameState.health += 20) },
    { text: "You encounter a strong enemy! (-30 health)", action: () => (gameState.health -= 30) },
    { text: "You defeat a weak enemy! (+5 attack)", action: () => (gameState.attack += 5) },
    { text: "You step on a trap! (-15 health)", action: () => (gameState.health -= 15) },
    { text: "You discover a big healing potion! (+30 health)", action: () => (gameState.health += 30) },
    { text: "You learn a Crit Hit skill! (+1.5%)", action: () => (gameState.criticalDamage += 1.5) },
    { text: "You got a Crit Chance (+30%)", action: () => (gameState.criticalChance += 30) },
    { text: "You got a Dodge Chance (+20%)", action: () => (gameState.dodgeChance += 20) },
];

function log(text) {
    output.textContent += `\n${text}`;
    output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
}

function updateCharacterStats() {
    // Ensure health doesn't go below 0
    const displayHealth = Math.max(gameState.health, 0);

    document.getElementById('health').textContent = displayHealth;
    document.getElementById('attack').textContent = gameState.attack;
    document.getElementById('position').textContent = gameState.position;
    document.getElementById("critChance").textContent = gameState.criticalChance;
    document.getElementById("critDamage").textContent = gameState.criticalDamage;
    document.getElementById("dodgeChance").textContent = gameState.dodgeChance;

    // Update the player health dynamically in the UI
    document.getElementById('playerHealth').textContent = displayHealth;

    // Update character images based on health
    const playerCharacter = document.getElementById("playerCharacter");
    const bossCharacter = document.getElementById("bossCharacter");

    playerCharacter.classList.toggle("injured", displayHealth <= 20);
    bossCharacter.classList.toggle("injured", boss.health <= 20);
}

// Ensure attack button gets re-enabled after a battle round
async function battleAnimation() {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // Hide the attack button during the animation
    attackBtn.style.display = "none"; 

    // Player attacks
    log("You attack the boss!");
    await delay(1000);
    // Function to check for dodging
    function checkDodge() {
        return Math.random() * 100 < gameState.dodgeChance;  // Returns true if dodge occurs
    }

    // Inside your battle logic:
    const playerCritical = Math.random() * 100 < gameState.criticalChance;
    const playerDamage = playerCritical ? gameState.attack * gameState.criticalDamage : gameState.attack;

    // Check if boss dodges the attack
    const bossDodged = checkDodge();

    if (bossDodged) {
        // If the boss dodges, display a message and skip damage
        log("The boss dodges your attack!");
    } else {
        // If the boss does not dodge, apply damage
        boss.health = Math.max(0, boss.health - playerDamage);
        document.getElementById("bossHealth").textContent = boss.health;
        log(playerCritical ? `Critical hit! You deal ${playerDamage} damage to the boss!` : `You deal ${playerDamage} damage to the boss!`);
    }


    // Update characters
    updateCharacterStats();

    if (boss.health <= 0) {
        log("\nCongratulations! You have defeated the boss!");
        endBattle();
        return;
    }

    // Boss attacks
    log("The boss attacks you!");
    await delay(1000);
    // Check if the player dodges the attack
    const playerDodges = Math.random() * 100 < gameState.dodgeChance;

    // If the player dodges, don't take damage, else subtract damage
    if (playerDodges) {
        log("You dodged the boss's attack!");
    } else {
        gameState.health = Math.max(0, gameState.health - boss.attack);
        document.getElementById("playerHealth").textContent = gameState.health;
        log(`The boss deals ${boss.attack} damage to you!`);
    }

    // Line break for readability
    log("\n");

    // Update characters
    updateCharacterStats();

    if (gameState.health <= 0) {
        log("\nYou have been defeated by the boss. Game over!");
        endBattle();
        return;
    }
    updateCharacterStats()
    // Show the attack button after the boss attack is completed
    attackBtn.style.display = "inline"; // Make the attack button visible again
}

function resetGame() {
    gameState = {
        isPlaying: false,
        health: 150, // Reset to original health
        attack: 10,
        position: 0,
        criticalChance: 1, // Critical hit chance in percentage
        criticalDamage: 1,
        dodgeChance: 1,
    };
    boss.health = 300; // Reset boss health to original
    updateCharacterStats();

    // Update boss health on the UI
    document.getElementById("bossHealth").textContent = boss.health;

    output.textContent = "Welcome to the dungeon! Click \"Start\" to begin your adventure.";
    startBtn.classList.add("visible");
    moveBtn.classList.remove("visible");
    quitBtn.classList.remove("visible");
    document.getElementById("bossCharacter").style.display = "none";

    // Remove the attack button if it exists
    if (attackBtn) {
        attackBtn.style.display = "none"; // Hide attack button after the battle ends
    }

    moveBtn.disabled = false;
}

quitBtn.addEventListener("click", () => {
    log("\nYou have quit the adventure. Resetting the game...");
    resetGame(); // Reset game state

    // Reset player and boss health to original values
    gameState.health = 150; // Reset player health to original
    boss.health = 300; // Reset boss health to original

    updateCharacterStats(); // Update the health values in the UI
});


moveBtn.addEventListener("click", () => {
    if (moveBtn.disabled) return;

    moveBtn.disabled = true; // Disable move button temporarily

    gameState.position++;

    if (gameState.position === 10) {
        bossBattle();
        return;
    }

    const event = events[Math.floor(Math.random() * events.length)];
    log(`\n[Move ${gameState.position}] ${event.text}`);
    event.action();
    updateCharacterStats();  // This will update the health in real-time

    if (gameState.health <= 0) {
        log("\nYou have perished in the dungeon. Game over!");
        moveBtn.disabled = true;
    } else {
        moveBtn.disabled = false; // Re-enable move button after the action
    }
});

// Add the event listener for the attack button
attackBtn.addEventListener("click", battleAnimation);

function bossBattle() {
    log("\nYou encounter the boss! The battle begins!");
    moveBtn.classList.remove("visible");
    quitBtn.classList.remove("visible");
    document.getElementById("bossCharacter").style.display = "block";

    // Show and enable the attack button when the boss battle starts
    if (attackBtn) {
        attackBtn.style.display = "inline"; // Show the attack button
    }
}

function endBattle() {
    attackBtn.style.display = "none"; // Hide attack button after the battle ends
    moveBtn.disabled = true;
    quitBtn.classList.add("visible");
}

startBtn.addEventListener("click", () => {
    gameState.isPlaying = true;
    log("\nYour adventure begins...");
    startBtn.classList.remove("visible");
    moveBtn.classList.add("visible");
    quitBtn.classList.add("visible");
    updateCharacterStats();
});

quitBtn.addEventListener("click", () => {
    log("\nYou have quit the adventure. Resetting the game...");
    resetGame();
});
