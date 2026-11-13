// "Incoming message" animation, shown for the almost-password.
// playIncomingMessage() resolves once the whole page has faded out.
//
// Steps:
// 1. Screen flashes.
// 2. Message box opens in the center.
// 3. Message types out.
// 4. Loading bar fills.
// 5. Whole page fades out.

const INCOMING = {
	lines: ["INCOMING MESSAGE ...", "...", "FROM:", "CITIZEN"],
	flashes: 3,
	flashMs: 1000,  // one on/off flash
	openMs: 400,   // box growing open
	typeMs: 70,    // per character
	dotMs: 400,    // per "." (dramatic pause)
	lineMs: 500,   // pause after each line
	loadMs: 1500,  // loading bar fill
	fadeMs: 2000,  // whole page fading out
};

const incomingHTML = `
<div id="incoming">
	<div id="incoming-box">
		<div id="incoming-text"></div>
		<div id="incoming-bar"><div id="incoming-bar-fill"></div></div>
	</div>
</div>
`

const incomingWait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function playIncomingMessage() {
	// Durations are shared with style.css through CSS variables.
	for (const [name, ms] of Object.entries(INCOMING)) {
		if (typeof ms === "number") document.documentElement.style.setProperty(`--incoming-${name}`, `${ms}ms`);
	}

	document.body.insertAdjacentHTML('beforeend', incomingHTML);
	const overlay = document.getElementById("incoming");
	const box = document.getElementById("incoming-box");
	const text = document.getElementById("incoming-text");
	const barFill = document.getElementById("incoming-bar-fill");

	// 1. Flash, ending dark.
	for (let i = 0; i < INCOMING.flashes; i++) {
		overlay.style.opacity = 1;
		await incomingWait(INCOMING.flashMs / 2);
		overlay.style.opacity = 0;
		await incomingWait(INCOMING.flashMs / 2);
	}
	overlay.style.opacity = 1;

	// 2. Open the box.
	box.classList.add("open");
	await incomingWait(INCOMING.openMs);

	// 3. Type the message.
	for (const [i, line] of INCOMING.lines.entries()) {
		if (i > 0) text.textContent += "\n";
		for (const char of line) {
			text.textContent += char;
			await incomingWait(char === "." ? INCOMING.dotMs : INCOMING.typeMs);
		}
		await incomingWait(INCOMING.lineMs);
	}
	text.classList.add("done"); // hides the cursor

	// 4. Fill the loading bar.
	barFill.classList.add("full");
	await incomingWait(INCOMING.loadMs);

	// 5. Fade out everything.
	document.body.classList.add("fade-out");
	await incomingWait(INCOMING.fadeMs);
}
