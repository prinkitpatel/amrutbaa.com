import { fireDopamineHit } from './easter-egg.js';

document.addEventListener('DOMContentLoaded', () => {
    // State Tracking
    const masteryState = {
        side: false,
        top: false,
        base: false,
        calendarDays: new Set()
    };

    const progressBar = document.getElementById('masteryProgress');
    const progressLabel = document.getElementById('masteryLabel');

    function updateMastery() {
        let completed = 0;
        if (masteryState.side) completed++;
        if (masteryState.top) completed++;
        if (masteryState.base) completed++;

        const percentage = Math.round((completed / 3) * 100);
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        if (progressLabel) {
            if (completed === 0) progressLabel.textContent = "0% (Novice)";
            if (completed === 1) progressLabel.textContent = "33% (Commis Chef)";
            if (completed === 2) progressLabel.textContent = "66% (Sous Chef)";
            if (completed === 3) progressLabel.textContent = "100% (Master Chef)";
        }

        if (completed === 3) {
            progressBar.style.background = "#22c55e"; // Success green
            document.getElementById('calendarSection').classList.remove('locked');
            document.getElementById('calendarSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Level 1: Side (Buttons)
    const sideBtns = document.querySelectorAll('.side-choice-btn');
    sideBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sideBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (!masteryState.side) {
                masteryState.side = true;
                updateMastery();
            }
        });
    });

    // Level 2: Top (Sizzle Slider)
    const sizzleSlider = document.getElementById('sizzleSlider');
    const sizzleOverlay = document.getElementById('sizzleOverlay'); // Before image overlay
    if (sizzleSlider && sizzleOverlay) {
        sizzleSlider.addEventListener('input', (e) => {
            const val = e.target.value; // 0 to 100
            // Opacity of the "dull" image goes down to 0
            sizzleOverlay.style.opacity = 1 - (val / 100);
            
            // Slider fill background
            const percentage = val + '%';
            sizzleSlider.style.setProperty('--slider-fill', percentage);

            if (val == 100 && !masteryState.top) {
                masteryState.top = true;
                updateMastery();
                sizzleSlider.classList.add('completed');
            }
        });
    }

    // Level 3: Base (Pantry Purge)
    const pantryItems = document.querySelectorAll('.pantry-item');
    if (pantryItems.length > 0) {
        pantryItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.add('purged');
                checkPantryComplete();
            });
        });
    }

    function checkPantryComplete() {
        const purgedCount = document.querySelectorAll('.pantry-item.purged').length;
        if (purgedCount === 3 && !masteryState.base) {
            masteryState.base = true;
            document.getElementById('amrutbaaReveal').classList.add('visible');
            updateMastery();
        }
    }

    // Final Stage: Calendar Selection
    const calendarDays = document.querySelectorAll('.calendar-day');
    const secureJarBtn = document.getElementById('secureJarBtn');
    
    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            if (day.closest('#calendarSection').classList.contains('locked')) return;

            const dayVal = day.dataset.day;
            if (masteryState.calendarDays.has(dayVal)) {
                masteryState.calendarDays.delete(dayVal);
                day.classList.remove('selected');
            } else {
                masteryState.calendarDays.add(dayVal);
                day.classList.add('selected');
            }

            if (masteryState.calendarDays.size >= 3) {
                // Unlocked CTA
                if (secureJarBtn.classList.contains('hidden')) {
                    secureJarBtn.classList.remove('hidden');
                    
                    try {
                        fireDopamineHit(window.innerWidth / 2, window.innerHeight / 2);
                    } catch (err) {}
                }
            } else {
                secureJarBtn.classList.add('hidden');
            }
        });
    });

    // Start Course Hero Button
    const startCourseBtn = document.getElementById('startCourseBtn');
    if (startCourseBtn) {
        startCourseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.progress-tracker').classList.add('visible');
            document.getElementById('frameworkSection').scrollIntoView({ behavior: 'smooth' });
        });
    }
});
