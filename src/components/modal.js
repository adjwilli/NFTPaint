const modal = document.getElementById('modal');
const closeButton = document.getElementById('close');
const modalMessage = document.getElementById('modal-message');

export const close = (e) => {
		modal.style.display = 'none';
		modalMessage.innerHTML = '';
	},
	display = (message, button) => {
		modalMessage.innerHTML = message;
		if (button) {
			modalMessage.appendChild(button);
		}
		modal.style.display = 'block';
	};

closeButton.addEventListener('click', e => {
	close(e);
});
