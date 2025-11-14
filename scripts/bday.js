const content = document.getElementById("content")
const gift = document.getElementById("gift")
const giftbox = document.getElementById("giftbox")

const pswdHTML = `<div id="pswd">
<form action="javascript:;" onsubmit=" checkpasswd( this ) ">
	<input type="text" maxlength="8" id="pswdBox">
	<input type="submit" style="display: none">
</form>
`

giftbox.addEventListener('click', () => {
	gift.style.filter = 'blur(5px)'
	content.insertAdjacentHTML('beforeend', pswdHTML)

});

function checkpasswd(form) {
	return true;
}

// myinput.addEventListener('transitionend', () => myinput.remove());
