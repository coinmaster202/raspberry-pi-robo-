export const obfuscatedScript = `window.addEventListener("DOMContentLoaded", () => {
  const consoleEl = document.getElementById('console');
  const inputArea = document.getElementById('input-area');
  const userInput = document.getElementById('user-input');
  const overlay = document.getElementById('overlay');
  const unlockInput = document.getElementById('unlock-code');
  const sirenAudio = document.getElementById('siren');
  const logDownload = document.getElementById('log-download');
  let currentState = null;
  let locked = false;
  function speak(text) {
    const line = \`🤖: \${text}\\n\`;
    consoleEl.innerHTML += line;
    consoleEl.scrollTop = consoleEl.scrollHeight;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
  window.startInteraction = function() {
    if (locked) return;
    speak("Hello! I see someone just arrived.");
    speak("Please choose one of the following options:");
    speak("1. What is your name?");
    speak("2. How are you?");
    speak("3. Try a math trick");
    speak("4. Exit");
    speak("5. Ask anything (ChatGPT mode)");
    inputArea.style.display = 'block';
    currentState = "menu";
  };
  window.handleInput = function() {
    const input = userInput.value.trim().toLowerCase();
    if (input === "1") speak("What is your name?");
    else if (input === "2") speak("How are you feeling today?");
    else if (input === "3") speak("The answer is always 5!");
    else if (input === "4") speak("Goodbye!");
    else if (input === "5") speak("Ask me anything! (feature coming soon)");
    else speak("That option is not available.");
    userInput.value = '';
  };
  window.submitUnlock = function() {
    speak("Unlock system not required in demo.");
  };
});`;
