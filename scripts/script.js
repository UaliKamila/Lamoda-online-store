const headerCityButton = document.querySelector('.header__city-button');

/*if(localStorage.getItem('lomoda-location')) {//если получили данные (1вариант)
	headerCityButton.textContent = localStorage.getItem('lomoda-location'); //выводим их в headerCityButton
}*/

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?' //(2вариант)

headerCityButton.addEventListener('click', () => {
	const city = prompt('Укажите ваш город');
	headerCityButton.textContent = city; //меняем на текстовый контент, сохраняет в переменной значение что написал польз
	localStorage.setItem('lomoda-location', city)//хранилище в браузере, внутрь попадает city
});

//Блокировка скрола при открытии модальног окна
const disableScroll = () => {
	const widthScroll = window.innerWidth - document.body.offsetWidth; 
	//window.innerWidth-вся ширина нашего экрана, document.body.offsetWidth-ширина с левого края до скрола(скрол не входит)
	
	document.body.dbScrollY = window.scrollY; //scrollY сколько px от верха отматали
	
	document.body.style.cssText = ` 
		position: fixed;
		top: ${-window.scrollY}px; 
		left: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		padding-right: ${widthScroll}px; 
	`; //добавили стиль чтобы страница не прыгало влево
};
const enableScroll = () => { //для разблокировки
	document.body.style.cssText = '';
	window.scroll({
		top: document.body.dbScrollY
	})
};

//Модальное окно
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

const cartModalOpen = () => {
	cartOverlay.classList.add('cart-overlay-open');
	disableScroll(); //при открытии мод окна скол скрывается
};

const cartModalClose = () => {
	cartOverlay.classList.remove('cart-overlay-open');
	enableScroll(); //при закрытии мод окна скрол появляется обратно
};

subheaderCart.addEventListener('click', cartModalOpen); 

cartOverlay.addEventListener('click', event => { //event по какому элемнту произошел клик
	const target = event.target; //target тот элемент на которую кликнули

	if(target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {  //matches возвращает true/false если есть указанные класы
		 //при нажатии на кнопку Х ИЛИ при клике мимо нашего модального окна cart-overlay
		cartModalClose(); //модальное окно закроется 
	}
});