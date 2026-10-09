/* =========================================================
   private-gate.js
   Whole-page password gate for manita.html. Like the old letter
   password, this is a front-end romantic touch, not real security —
   the code lives right here in plain JS. Only used on the private
   page; index.html never loads this file.
   ========================================================= */

(function () {
  "use strict";

  const GATE_CODE = "0520"; // change this to whatever code you'd like

  const gate = document.getElementById("pageGate");
  const main = document.getElementById("main");
  const form = document.getElementById("pageGateForm");
  const input = document.getElementById("pageGateInput");
  const feedback = document.getElementById("pageGateFeedback");
  const lockIcon = document.getElementById("pageGateLockIcon");
  if (!gate || !main || !form || !input) return;

  // If she already unlocked the matching password window on the public
  // page's heart-hold just moments ago, don't make her type the same
  // code again here — skip straight to the content. This is carried
  // via a URL parameter (?unlocked=1) rather than sessionStorage,
  // since storage APIs are often restricted when the site is opened
  // directly as a local file:// page rather than served over http.
  let alreadyUnlocked = false;
  try {
    alreadyUnlocked = new URLSearchParams(window.location.search).get("unlocked") === "1";
  } catch (err) { /* ignore if URLSearchParams isn't available for any reason */ }
  if (alreadyUnlocked) {
    gate.hidden = true;
    main.hidden = false;
    return;
  }

  const panel = gate.querySelector(".page-gate__panel");
  const incorrectResponses = ["Nope 😂 Try again.", "Nice try, detective. ❤️", "Almost... but not quite. 😉"];
  let incorrectIndex = 0;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();

    if (value === GATE_CODE) {
      if (lockIcon) lockIcon.classList.add("is-unlocked");
      feedback.textContent = "";
      input.blur(); // dismiss the on-screen numeric keypad on touch devices
      setTimeout(() => {
        gate.classList.add("is-unlocking");
        setTimeout(() => {
          gate.hidden = true;
          main.hidden = false;
          window.scrollTo(0, 0);
        }, 500);
      }, 500);
    } else {
      if (panel) {
        panel.classList.add("page-gate__panel--shake");
        setTimeout(() => panel.classList.remove("page-gate__panel--shake"), 400);
      }
      feedback.textContent = incorrectResponses[incorrectIndex % incorrectResponses.length];
      incorrectIndex++;
      input.value = "";
      input.focus();
    }
  });
})();
