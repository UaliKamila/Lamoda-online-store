const headerCityButton = document.querySelector('.header__city-button');

let hash = location.hash.substring(1); //substring с какого элемента нужно обрезать строку
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



// Запрос БД
//скрипт для получения данных
const getData = async () => {
	const data = await fetch('db.json');
	//fetch позв получать данные(принимает сервер), await заставляет ждать и не присваивает, пока fetch не вернет отв
	if (data.ok) {
		return data.json()
	} else { //если данные с сервера не получили
		throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`)
	}
};

//эти данные получили и обработали
const getGoods = (callback, value) => { //callback отложенная функция, т.е. будет вызвана только когда мы получим данные с сервера
	getData()
		.then(data => { //then обрабатывает promise, он вызовет колбэк функцию когда getData отработает 
			if (value) {
				callback(data.filter(item => item.category === value))
			} else {
				callback(data);
			}
		})
		.catch(err => { //catch отлавливает ошибки
			console.error(err)
		});
};

subheaderCart.addEventListener('click', cartModalOpen);

cartOverlay.addEventListener('click', event => { //event по какому элемнту произошел клик
	const target = event.target; //target тот элемент на которую кликнули

	if (target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {  //matches возвращает true/false если есть указанные класы
		//при нажатии на кнопку Х ИЛИ при клике мимо нашего модального окна cart-overlay
		cartModalClose(); //модальное окно закроется 
	}
});

//Скрипт чтобы стр goods.html работал только в этой стр
try {
	const goodsList = document.querySelector('.goods__list');

	if (!goodsList) {
		throw 'This is not a goods page!' //throw исключение
	}

	const createCard = ({ id, preview, cost, brand, name, sizes }) => { //работаем с элментами карточки
		const li = document.createElement('li');
		li.classList.add('goods__item');
		li.innerHTML = `
			<article class="good">
				<a class="good__link-img" href="card-good.html#${id}">
					<img class="good__img" src="goods-image/${preview}" alt="">
            </a>
            <div class="good__description">
               <p class="good__price">${cost} &#8381;</p>
               <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
					${sizes ?
				`<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
				''}
               <a class="good__link" href="card-good.html#${id}">Подробнее</a>
            </div>
         </article>
		`;
		return li;
	};

	const renderGoodsList = data => { //
		goodsList.textContent = '';

		/*for (let i = 0; i < data.length; i++) { //1вариант
			console.log('for:', data[i]);
		}

		for (const item of data) { //2вариант
			console.log('for/of:', item);
		}
		*/
		data.forEach(item => { //3вариант
			const card = createCard(item);
			goodsList.append(card);
		})
	};

	window.addEventListener('hashchange', () => {
		hash = location.hash.substring(1);
		getGoods(renderGoodsList, hash);
		const goodsTitle = document.querySelector('.goods__title')
		if (hash === 'women')
			goodsTitle.textContent = 'Женщинам'
		else if (hash === 'men')
			goodsTitle.textContent = 'Мужчинам'
		else
			goodsTitle.textContent = 'Детям'
	})
	getGoods(renderGoodsList);

} catch (err) {
	console.warn(err)
}