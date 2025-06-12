const consoleEl = document.getElementById('console');
const inputArea = document.getElementById('input-area');
const userInput = document.getElementById('user-input');
const overlay = document.getElementById('overlay');
const unlockInput = document.getElementById('unlock-code');
const yesNoButtons = document.getElementById('yesno-buttons');
const gotItArea = document.getElementById('got-it-area');
const lockdownAudio = document.getElementById('lockdown-audio');

const optionMap = {
  "1": "1. What is your name?",
  "2": "2. How are you?",
  "3": "3. Try a math trick",
  "4": "4. Ask anything (ChatGPT mode)",
  "5": "5. Tell me a joke",
  "6": "6. Fun fact of the day",
  "7": "7. Guess my age",
  "8": "8. Compliment me",
  "9": "9. Surprise me",
  "10": "10. Exit"
};

const displayOrder = Object.keys(optionMap);
const UNLOCK_CODE = "2026";
let currentState = null;
let asked = new Set();
let locked = false;
let chatCount = 0;
let mathSteps = [];
let currentMathStep = 0;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function speak(text) {
  if (locked) return;
  consoleEl.innerHTML += `🤖: ${text}\n`;
  consoleEl.scrollTop = consoleEl.scrollHeight;

  await fetch('/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
}

function listen(state) {
  currentState = state;
  inputArea.style.display = 'block';
  userInput.value = '';
  userInput.focus();
  if (["guessAge", "getMood"].includes(state)) {
    showYesNo();
  } else {
    hideYesNo();
  }
}

function showYesNo() {
  yesNoButtons.style.display = 'block';
}
function hideYesNo() {
  yesNoButtons.style.display = 'none';
}
function submitYesNo(answer) {
  userInput.value = answer;
  handleInput();
}

function showGotIt() {
  gotItArea.style.display = 'block';
}
function hideGotIt() {
  gotItArea.style.display = 'none';
}

async function speakStepAndWait(text) {
  await speak(text);
  showGotIt();
}

function continueMathTrick() {
  hideGotIt();
  currentMathStep++;
  if (currentMathStep < mathSteps.length) {
    speakStepAndWait(mathSteps[currentMathStep]);
  } else {
    showMenu();
  }
}

async function checkProfanity(text) {
  const badWords = ["fuck", "shit", "bitch", "cunt"]; // basic offline check
  return badWords.some(word => text.includes(word));
}

function submitUnlock() {
  if (unlockInput.value.trim() === UNLOCK_CODE) {
    overlay.style.display = "none";
    locked = false;
    unlockInput.value = "";
    lockdownAudio.pause();
    lockdownAudio.currentTime = 0;
    speak("✅ Terminal access restored.");
    startInteraction();
  } else {
    speak("❌ Invalid code.");
  }
}

async function startInteraction() {
  if (locked) return;
  consoleEl.innerHTML = '';
  asked.clear();
  chatCount = 0;
  hideGotIt();
  await speak("Hello I see someone just arrived.");
  await delay(500);
  await speak("Welcome to my interactive assistant.");
  await delay(500);
  showMenu();
}

async function showMenu() {
  hideYesNo();
  const remaining = displayOrder.filter(opt => !asked.has(opt));
  if (remaining.length === 0) {
    await speak("You've completed all options. Restarting soon.");
    return setTimeout(startInteraction, 3000);
  }
  await speak("Please choose one of the following options:");
  for (let opt of remaining) {
    await speak(optionMap[opt]);
    await delay(200);
  }
  listen("menu");
}

async function handleInput() {
  const input = userInput.value.trim().toLowerCase();
  consoleEl.innerHTML += `You: ${input}\n`;
  inputArea.style.display = "none";
  hideYesNo();

  if (await checkProfanity(input)) {
    overlay.style.display = "block";
    locked = true;
    unlockInput.value = "";
    lockdownAudio.currentTime = 0;
    lockdownAudio.play();
    await speak("🚨 Terminal locked. This message has been flagged as inappropriate and blocked. Access has been restricted.");
    return;
  }

  if (currentState === "menu") {
    if (!optionMap[input] || asked.has(input)) {
      await speak("That option is not available.");
      return showMenu();
    }
    asked.add(input);
    await speak(`You selected option ${input}: ${optionMap[input].replace(/^\d+\.\s*/, '')}`);

    switch (input) {
      case "1": await speak("What is your name?"); listen("getName"); break;
      case "2": await speak("How are you feeling today?"); listen("getMood"); break;
      case "3": return mathTrick();
      case "4": chatCount = 0; await speak("Ask anything. You have 5 questions."); listen("chat"); break;
      case "5": await tellJoke(); return showMenu();
      case "6": await tellFact(); return showMenu();
      case "7": await speak("Do you like TikTok?"); listen("guessAge"); break;
      case "8": await compliment(); return showMenu();
      case "9": await speak("🎉 Surprise! You're amazing. Keep shining!"); return showMenu();
      case "10": await speak("Goodbye! Restarting soon..."); return setTimeout(startInteraction, 3000);
    }
  }

  if (currentState === "getName") {
    await speak(`Nice to meet you, ${input}`);
    return showMenu();
  }

  if (currentState === "getMood") {
    await speak("Thanks for sharing.");
    return showMenu();
  }

  if (currentState === "guessAge") {
    await speak(input.includes("yes") ? "Hmm... I’d guess you’re under 25!" : "You seem mature. Maybe 30+?");
    return showMenu();
  }

  if (currentState === "chat") {
    chatCount++;
    if (chatCount > 5) {
      await speak("You've used all your questions. Returning to menu.");
      return showMenu();
    }

    await speak("Sorry, offline assistant can't respond to that now.");
    listen("chat");
  }
}

async function mathTrick() {
  mathSteps = [
    "Think of any number.",
    "Double it.",
    "Add 10.",
    "Divide by 2.",
    "Subtract your original number.",
    "The answer is... 5!"
  ];
  currentMathStep = 0;
  await speakStepAndWait(mathSteps[0]);
}

async function tellJoke() {
  const jokes = [
    "Why did the computer go to therapy? It had too many bytes.",
    "Parallel lines have so much in common... it's a shame they'll never meet.",
    "Why don't robots panic? They have nerves of steel."
  ];
  await speak(jokes[Math.floor(Math.random() * jokes.length)]);
}

async function tellFact() {
  const facts = [
    "Octopuses have three hearts.",
    "Bananas are berries, but strawberries are not.",
    "A bolt of lightning contains enough energy to toast 100,000 slices of bread."
  ];
  await speak(facts[Math.floor(Math.random() * facts.length)]);
}

async function compliment() {
  const compliments = [
    "You're awesome just the way you are.",
    "If I had eyes, I’d say you look amazing today!",
    "Your mind is sharper than my processor!"
  ];
  await speak(compliments[Math.floor(Math.random() * compliments.length)]);
}

// Lock keyboard input when terminal is locked
document.addEventListener('keydown', function (e) {
  if (!locked) return;
  const isUnlock = document.activeElement === unlockInput;
  const isAllowed = ['Enter', 'Backspace'].includes(e.key) || (e.key >= '0' && e.key <= '9');
  if (isUnlock && isAllowed) return;
  e.preventDefault();
});

// Bind globally
window.startInteraction = startInteraction;
window.handleInput = handleInput;
window.submitUnlock = submitUnlock;
window.continueMathTrick = continueMathTrick;
window.submitYesNo = submitYesNo;