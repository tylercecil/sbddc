// Script:
// 1. Intro
//	a. Type Text
//	b. Fade in Box
//	c. Box pullsing
// 2. Password Box
//	a. Overlay
//	b. Red X for false
//	c. Rainbow text + Confetti
// 3. Celebration -> Redirection to monkeydrizzle
// 4. Present Menue
// 5. Taco Bell
// 6. Letter
// 7. Audio Book

const content = document.getElementById("content");
const gift = document.getElementById("gift");
const giftbox = document.getElementById("giftbox");
const giftHeader = document.getElementById("header");

const pswdHTML = `<div id="pswd" class="box">
<div id="prompt">
<p>Wait, you also have the password, right?</p>
</div>
<form action="javascript:;" onsubmit=" checkpasswd( this )" autocomplete="off">
	<input type="text" maxlength="8" id="pswdBox">
	<input type="submit" style="display: none">
</form>
<div id="side">
<p>Look, I can't be giving out gifts to just ANYONE!</p>
<p>How do I know you are THE Award Winning Girlfriend?</p>
</div>
</div>
`

const rewardHTML = `
<div id="reward" class="box">
<h1>AND YOUR GIFT IS...</h1>

<div id="side">
OK OK! That's not your only gift. The last bit of your gift can be
found at:
<br>
SERTEBDAY.COM/&ltTheColorOfOurLove&gt
</div>
</div>
`


giftbox.addEventListener('click', () => {
	gift.style.filter = 'blur(5px)'
	content.insertAdjacentHTML('beforeend', pswdHTML)

});

function toHash(string) {
	let hash = 0;

	if (string.length == 0) return hash;

	for (i = 0; i < string.length; i++) {
		char = string.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}

	return hash;
}

function checkpasswd(form) {
	// tomylove = -1028119207
	// tomdlove = -1047513148
	var pswd = form[0].value.toLowerCase();
	var hash = toHash(pswd);
	console.log(hash);

	if (hash == -1028119207) {
		correctPswd()
	} else if (hash == -1047513148) {
		almostPswd()
	}
	else {
		wrongPswd()
	}

	return true;
}

function correctPswd() {
	const pswdbox = document.getElementById("pswdBox");
	const pswd = document.getElementById("pswd");
	pswdbox.style.animationName = "correctinput";
	pswdbox.style.animationDuration = "0.2s";
	pswdbox.style.animationDelay = "0s";
	pswdbox.style.animationDirection = 'alternate';
	pswdbox.style.animationIterationCount = "infinite";

	pswd.style.animation = 'none';
	pswd.offsetHeight;
	pswd.style.animationName = 'fadein';
	pswd.style.animationDuration = "2s";
	pswd.style.animationDelay = "1s";
	pswd.style.animationDirection = 'reverse';
	pswd.style.animationFillMode = 'both';

	pswd.addEventListener('transitioned', (event) => { pswd.remove(); });
	content.insertAdjacentHTML('beforeend', rewardHTML)
}

var hintCounter = 0;
function wrongPswd() {
	wrongPrompts = Array(
		"That is... Incorrect",
		"NOPE!",
		"Wrong! I did give you a key, right?",
		"Close! In that it has letters...",
		"Try again",
	);
	hints = Array(
		"Come on, you've got this!",
		"I did give you a key, didn't I?",
		"Yup, I double checked, you for sure have the key",
		"You will PROBABLY know you have it when you get it",
		"Ok, that last hint was KINDA a lie... I made a 1-letter mistake... BUT it will MOSTLY look right! (At least I'm pretty)",
		"Not as pretty as you, of course!",
		"Ok, I know you have the key, but do you have the spot?",
		"Look, I know it's not my best work, and it's a bit of a sloppy key, but I'm pretty sure it has a marked center.",
		"If you have the key, and you have the center, you should only need a direction.",
		"You know which way East is, right?"
	);
	const prompt = document.getElementById("prompt");
	const side = document.getElementById("side");
	const pswdbox = document.getElementById("pswdBox");
	pswdbox.style.animationName = "wronginput";
	pswdbox.style.animationDuration = "0.2s";
	pswdbox.style.animationDelay = "0s";
	pswdbox.style.animationDirection = 'alternate';
	pswdbox.style.animationIterationCount = 10;
	prompt.innerHTML = wrongPrompts[Math.floor(Math.random() * wrongPrompts.length)];
	side.style.animation = 'none';
	side.offsetHeight;
	side.style.animation = null;
	side.style.animationDelay = "1s";
	side.innerHTML = hints[hintCounter];
	hintCounter = (hintCounter + 1) % hints.length
}

function almostPswd() {
	const prompt = document.getElementById("prompt");
	const side = document.getElementById("side");
	const pswdbox = document.getElementById("pswdBox");
	// pswdbox.style.animationName = "wronginput";
	// pswdbox.style.animationDuration = "0.2s";
	// pswdbox.style.animationDelay = "0s";
	// pswdbox.style.animationDirection = 'alternate';
	// pswdbox.style.animationIterationCount = 10;
	prompt.innerHTML = "OK, You're Technically Correct!"
	side.style.animation = 'none';
	side.offsetHeight;
	side.style.animation = null;
	side.style.animationDelay = "1s";
	side.innerHTML = `You see... I was so rushed trying to make something 
	to go out in the mail, that... the 4rth letter is off one space...<br>
		But like... you know what it's SUPPOSED to say, right?
		`
}


