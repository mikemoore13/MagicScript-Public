//contents.js是兼听url变化，如果直接landing到inflight页面时，不会触发listener
console.log("inflight.js")
checkLoaded()

function hasSaveButtonCandidate() {
  if (typeof getSaveElement === "function") {
    return Boolean(getSaveElement({ includeDisabled: true }));
  }

  const headingButtons = document.querySelector('[id="heading-buttons"]');
  if (headingButtons && headingButtons.querySelector("button")) {
    return true;
  }

  const saveLikeButton = Array.from(document.querySelectorAll("button")).find((button) => {
    const text = (button.innerText || button.textContent || "").trim();
    return /\b(save|enregistrer|guardar|speichern|salva|salvar|保存|儲存|저장|บันทึก)\b/i.test(text);
  });

  return Boolean(saveLikeButton);
}

function checkLoaded(retryCount = 0) {
  const maxRetries = 60;
  setTimeout(() => {
    if (hasSaveButtonCandidate()) {
      replaceButton();
      return;
    }

    if (retryCount < maxRetries) {
      checkLoaded(retryCount + 1);
    } else {
      console.log("[MagicScript][inflight] save button not found after retries");
    }
  }, 500);
}
