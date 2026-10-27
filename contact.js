(() => {
  const data = window.portfolioData;
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const nameField = document.querySelector("#contact-name");
  const emailField = document.querySelector("#contact-email");
  const messageField = document.querySelector("#contact-message");
  const honeypot = document.querySelector("#contact-company");
  const tape = document.querySelector("#morse-tape");
  const send = document.querySelector("#morse-send");
  const skip = document.querySelector("#morse-skip");
  const stop = document.querySelector("#morse-stop");
  const status = document.querySelector("#morse-status");
  const easter = document.querySelector("#morse-easter");
  const formStatus = document.querySelector("#form-status");
  const consoleShell = document.querySelector(".console-shell");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const unit = 80;
  let timer = 0;
  let cancelled = false;
  let tapeFrame = 0;
  let transmitting = false;
  let skipRequested = false;
  const replyKeys = new Set();
  const copy = data.contactConsole || {};

  const setStatus = text => { status.textContent = text; };
  const debounceTape = () => {
    cancelAnimationFrame(tapeFrame);
    tapeFrame = requestAnimationFrame(renderTape);
  };
  const renderTape = () => {
    const value = messageField.value.slice(0, 200).toUpperCase();
    const encoded = window.morseTools.encode(value);
    tape.innerHTML = encoded.map((item, index) => `<span class="tape-letter ${index === encoded.length - 1 ? "latest" : ""}" title="${window.morseTools.escape(item.char)} · ${item.code}"><b>${window.morseTools.escape(item.char)}</b><i>${[...item.code].map(symbol => `<em class="${symbol === "." ? "dot" : "dash"}">${symbol}</em>`).join("")}</i></span>`).join("");
    tape.scrollLeft = tape.scrollWidth;
    easter.textContent = value.includes("SOS") ? copy.sosNote : value.includes("CQ") ? copy.cqNote : value.includes("73") ? copy.seventyThreeNote : "";
  };
  const wait = ms => new Promise(resolve => {
    const start = performance.now();
    const tick = now => {
      if (cancelled || skipRequested || now - start >= ms) { timer = 0; resolve(); return; }
      timer = requestAnimationFrame(tick);
    };
    timer = requestAnimationFrame(tick);
  });
  const clearTimer = () => { cancelAnimationFrame(timer); clearTimeout(timer); timer = 0; };
  const confetti = () => {
    if (reduced) return;
    const layer = document.createElement("div");
    layer.className = "morse-confetti";
    const buttonRect = send.getBoundingClientRect();
    layer.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
    layer.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
    [...Array(14)].forEach((_, index) => {
      const piece = document.createElement("i");
      piece.textContent = index % 3 ? "✦" : "♡";
      piece.style.setProperty("--x", `${(Math.random() - .5) * 120}px`);
      piece.style.setProperty("--y", `${-20 - Math.random() * 65}px`);
      piece.style.setProperty("--r", `${Math.random() * 360}deg`);
      layer.append(piece);
    });
    consoleShell.append(layer);
    setTimeout(() => layer.remove(), 1000);
  };
  const emailjsReady = () => {
    const config = data.emailjs;
    return window.emailjs && config && Object.values(config).every(value => value && !value.startsWith("YOUR_"));
  };
  const sentAt = () => new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  const sendMessage = async () => {
    const name = nameField.value;
    const email = emailField.value;
    const message = messageField.value;
    const params = {
      from_name: String(name || "").trim(),
      from_email: String(email || "").trim(),
      message: String(message || "").trim(),
      sent_at: new Date().toLocaleString()
    };
    console.log("EmailJS params:", params);
    if (!emailjsReady()) {
      const subject = encodeURIComponent(`Portfolio message from ${params.from_name}`);
      const body = encodeURIComponent(`Name: ${params.from_name}\nEmail: ${params.from_email}\n\n${params.message}`);
      location.href = `mailto:${data.email}?subject=${subject}&body=${body}`;
      return "fallback";
    }
    window.emailjs.init({ publicKey: data.emailjs.publicKey });
    try {
      await window.emailjs.send(data.emailjs.serviceId, data.emailjs.notifyTemplateId, params);
    } catch (error) {
      console.error("EmailJS notification failed:", error.status, error.text, error);
      throw error;
    }
    try {
      const replyKey = `aarya-auto-reply:${params.from_email}:${params.from_name}:${params.message}`;
      const alreadySent = replyKeys.has(replyKey) || localStorage.getItem(replyKey) === "1";
      if (!alreadySent) {
        replyKeys.add(replyKey);
        localStorage.setItem(replyKey, "1");
        window.emailjs.send(data.emailjs.serviceId, data.emailjs.autoReplyTemplateId, params).catch(error => console.error("EmailJS auto-reply failed:", error.status, error.text, error));
      }
    } catch {
      window.emailjs.send(data.emailjs.serviceId, data.emailjs.autoReplyTemplateId, params).catch(error => console.error("EmailJS auto-reply failed:", error.status, error.text, error));
    }
    return "emailjs";
  };
  const validate = () => {
    nameField.value = nameField.value.replace(/[\r\n]+/g, " ").trim().slice(0, 80);
    emailField.value = emailField.value.replace(/[\r\n]+/g, "").trim().slice(0, 120);
    messageField.value = messageField.value.slice(0, 2000);
    [nameField, emailField, messageField].forEach(field => field.setCustomValidity(""));
    document.querySelector("#name-error").textContent = "";
    document.querySelector("#email-error").textContent = "";
    document.querySelector("#message-error").textContent = "";
    if (!nameField.value) { nameField.setCustomValidity("Name is required"); document.querySelector("#name-error").textContent = "Name is required."; }
    if (!emailField.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) { emailField.setCustomValidity("Enter a valid email"); document.querySelector("#email-error").textContent = "Enter a valid email."; }
    if (!messageField.value.trim()) { messageField.setCustomValidity("Message is required"); document.querySelector("#message-error").textContent = "Message is required."; }
    return form.reportValidity();
  };
  const finish = () => {
    consoleShell.classList.remove("receiving");
    transmitting = false;
    send.disabled = false;
    skip.hidden = true;
    stop.hidden = true;
  };
  const transmit = async skipAnimation => {
    if (transmitting || !validate()) return;
    if (honeypot.value) {
      setStatus("LINK: ACK ✓");
      formStatus.textContent = `73, ${nameField.value.trim().toUpperCase()}! Signal received ♡`;
      return;
    }
    cancelled = false;
    skipRequested = false;
    transmitting = true;
    send.disabled = true;
    skip.hidden = reduced || skipAnimation;
    stop.hidden = reduced || skipAnimation;
    setStatus("LINK: UPLINK…");
    consoleShell.classList.add("receiving");
    if (!reduced && !skipAnimation) {
      const items = window.morseTools.encode(messageField.value.slice(0, 24));
      for (let index = 0; index < items.length; index += 1) {
        if (cancelled) { finish(); return; }
        if (skipRequested) break;
        await wait(unit * 2);
        if (!skipRequested) await wait(unit * 2);
      }
    }
    if (cancelled) { finish(); return; }
    if (skipRequested) renderTape();
    setStatus("LINK: ACK ✓");
    try {
      const delivery = await sendMessage();
      if (delivery === "emailjs") confetti();
      formStatus.textContent = delivery === "fallback"
        ? copy.fallback
        : `73, ${nameField.value.trim().toUpperCase()}! Signal received ♡ A confirmation is on its way to ${emailField.value.trim()}.`;
    } catch {
      formStatus.textContent = copy.failure;
      finish();
      return;
    }
    finish();
  };
  form.addEventListener("submit", event => { event.preventDefault(); transmit(false); });
  skip.addEventListener("click", () => { if (transmitting) skipRequested = true; });
  stop.addEventListener("click", () => { if (!transmitting) return; clearTimer(); cancelled = true; setStatus("LINK: STANDBY"); finish(); });
  addEventListener("keydown", event => { if (event.key === "Escape" && !stop.hidden) stop.click(); });
  messageField.addEventListener("input", debounceTape);
  renderTape();
})();
