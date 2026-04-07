export function initEasterEgg(targetSelector, onTriggerCallback) {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;

    let clickCount = 0;
    let lastClickTime = 0;
    const TIME_LIMIT_MS = 1500; // 1.5 seconds between clicks before reset
    const TARGET_CLICKS = 7;

    targetElement.addEventListener('click', (e) => {
        const now = Date.now();
        
        if (now - lastClickTime > TIME_LIMIT_MS) {
            clickCount = 0; // reset
        }
        
        clickCount++;
        lastClickTime = now;

        if (clickCount === TARGET_CLICKS) {
            clickCount = 0; // reset to prevent spamming
            fireDopamineHit(e.clientX, e.clientY);
            if (typeof onTriggerCallback === 'function') {
                setTimeout(onTriggerCallback, 600); // Wait for confetti before opening
            }
        }
    });

    targetElement.style.cursor = 'pointer'; // Hint that it is clickable
}

function fireDopamineHit(x, y) {
    // Basic dependency-free CSS confetti explosion
    const colors = ['#d4af37', '#ff0000', '#22c55e', '#ffffff'];
    
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('easter-egg-confetti');
        
        // Random properties
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = x + (Math.random() - 0.5) * 50;
        const top = y + (Math.random() - 0.5) * 50;
        const tx = (Math.random() - 0.5) * 300 + 'px';
        const ty = (Math.random() - 0.5) * 300 - 150 + 'px'; // Bias upwards
        const r = Math.random() * 360 + 'deg';
        
        confetti.style.backgroundColor = color;
        confetti.style.left = left + 'px';
        confetti.style.top = top + 'px';
        confetti.style.setProperty('--tx', tx);
        confetti.style.setProperty('--ty', ty);
        confetti.style.setProperty('--r', r);
        
        document.body.appendChild(confetti);
        
        // Cleanup
        setTimeout(() => {
            confetti.remove();
        }, 1500);
    }
}
