async function showMenu() {
  const remaining = availableOptions.filter(opt => !asked.has(opt));
  if (remaining.length === 0) {
    await speak("You've completed all options. Restarting in 5 seconds...");
    setTimeout(startInteraction, 5000);
    return;
  }
  await speak("Please choose one of the following options:");
  for (const opt of remaining) {
    if (opt === "1") await speak("1. What is your name?");
    if (opt === "2") await speak("2. How are you?");
    if (opt === "3") await speak("3. Try a math trick");
    if (opt === "4") await speak("4. Exit");
    if (opt === "5") await speak("5. Ask anything (ChatGPT mode)");
  }
  listen("menu");
}
