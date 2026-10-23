const bot = document.getElementById('bot');
const botPop = document.getElementById('bot-pop');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const emailIndicator = document.getElementById('email-indicator');
const form = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');

// Image paths are resolved relative to this script, not to the page,
// so pages in subfolders (e.g. a translated version) share the same images.
const IMAGE_BASE = new URL('cute_bot/', document.currentScript.src);
const botImage = name => new URL(`${name}.png`, IMAGE_BASE).href;

const BOT_STATES = {
    neutral: botImage('neutral'),
    happy: botImage('happy'),
    star_eyes: botImage('star_eyes'),
    heart_eyes: botImage('heart_eyes'),
    green_light: botImage('green_light'),
    covering_eyes: botImage('covering_eyes'),
    peeking: botImage('peeking'),
};

// Preload
Object.values(BOT_STATES).forEach(src => {
    const img = new Image();
    img.src = src;
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let currentState = null;

function setBot(state) {
    if (state === currentState) return;
    const src = BOT_STATES[state];
    if (!src) return;

    bot.src = src;
    bot.classList.toggle('heart-eyes', state === 'heart_eyes');
    bot.classList.toggle('green-light', state === 'green_light');
    bot.classList.toggle('peeking', state === 'peeking');

    // Trigger pop animation on wrapper (keeps idle-bounce running on image)
    botPop.classList.remove('pop');
    void botPop.offsetWidth;
    botPop.classList.add('pop');

    currentState = state;
}

function emailState() {
    const value = emailInput.value;
    if (value.length === 0) return 'neutral';
    if (!value.includes('@')) return 'happy';
    if (EMAIL_REGEX.test(value)) return 'green_light';
    const afterAt = value.split('@')[1] || '';
    if (afterAt.includes('.')) return 'heart_eyes';
    return 'star_eyes';
}

function updateBot() {
    // Success state locks the bot on the green light
    if (submitBtn.classList.contains('success')) {
        setBot('green_light');
        return;
    }

    const active = document.activeElement;

    if (active === passwordInput) {
        setBot(passwordInput.type === 'text' ? 'peeking' : 'covering_eyes');
        return;
    }

    if (active === emailInput) {
        const state = emailState();
        setBot(state);
        emailIndicator.classList.toggle('visible', state === 'green_light');
        return;
    }

    // No relevant focus
    setBot('neutral');
    emailIndicator.classList.toggle('visible', EMAIL_REGEX.test(emailInput.value));
}

// Email events
emailInput.addEventListener('input', updateBot);
emailInput.addEventListener('focus', updateBot);
emailInput.addEventListener('blur', updateBot);

// Password events
passwordInput.addEventListener('focus', updateBot);
passwordInput.addEventListener('blur', updateBot);
passwordInput.addEventListener('input', updateBot);

// Prevent focus loss from password input when pressing the toggle button
togglePasswordBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
});

// Password visibility toggle
togglePasswordBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.classList.toggle('visible', isHidden);
    // Labels come from the page (data-label-show / data-label-hide), so the script holds no UI text
    const { labelShow, labelHide } = togglePasswordBtn.dataset;
    togglePasswordBtn.setAttribute('aria-label', isHidden ? labelHide : labelShow);

    // Keep focus on password so bot stays in correct state
    passwordInput.focus();
    updateBot();
});

// Submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailValid = EMAIL_REGEX.test(emailInput.value.trim());
    const passwordValid = passwordInput.value.length >= 1;

    if (!emailValid) {
        emailInput.focus();
        return;
    }
    if (!passwordValid) {
        passwordInput.focus();
        return;
    }

    // Success: button morphs to green checkmark, bot switches on its green light
    emailInput.blur();
    passwordInput.blur();
    submitBtn.classList.add('success');
    setBot('green_light');
});

// Initial state
updateBot();
