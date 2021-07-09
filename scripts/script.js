const headerCityButton = document.querySelector('.header__city-button');
const cartListGoods = document.querySelector('.cart__list-goods');
const cartTotalCost = document.querySelector('.cart__total-cost');
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

let hash = location.hash.substring(1); //substring с какого элемента нужно обрезать строку, те решетку
/*if(localStorage.getItem('lamoda-location')) {//если получили данные (1вариант)
	headerCityButton.textContent = localStorage.getItem('lamoda-location'); //выводим их в headerCityButton
}*/

headerCityButton.textContent = localStorage.getItem('lamoda-location') || "Ваш город?" //(2вариант)

headerCityButton.addEventListener('click', () => {
	const city = prompt('Укажите ваш город');
	headerCityButton.textContent = city; //меняем на текстовый контент, сохраняет в переменной значение что написал польз
	localStorage.setItem('lamoda-location', city)//хранилище в браузере, внутрь попадает city
});

const getLocalStorage = () => JSON?.parse(localStorage.getItem('cart-lamoda')) || [] // .?если возникнет ошибка вернет null. Те. получаем данные из JSON и парсим данные в наш массив
const setLocalStorage = data => localStorage.setItem('cart-lamoda', JSON.stringify(data)) //запись данных. Те. переводим в JSON и отправляем в LocalStorage

const renderCart = () => {
	cartListGoods.textContent = ''; //очищаем cartListGoods
	const cartItems = getLocalStorage(); //при открытии корзины получаем данные для этой корз
	let totalPrice = 0;
	cartItems.forEach((item, i) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${i+1}</td>
			<td>${item.brand} ${item.name}</td>
			${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
			${item.size ? `<td>${item.size}</td>` : '<td>-</td>'}
			<td>${item.cost} &#8381;</td>
			<td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
		`;
		totalPrice += item.cost;
		cartListGoods.append(tr)
	}); //и перебираем их чтобы создать эти строчки
	cartTotalCost.textContent = totalPrice + ' ₽';
}

const deleteItemCart = id => { //принимает id, находит этот id в LocalStorage и удалять его
	const cartItems = getLocalStorage();
	const newCartItems = cartItems.filter(item => item.id !== id); 
	//все эл у которых id не равен нашему id которого мы передали,он их вернет. Те. единственный котрый не вернется, тот котрый хотим удалить
	setLocalStorage(newCartItems);
}

cartListGoods.addEventListener('click', e => { //при нажатии на крестик
	if (e.target.matches('.btn-delete')){
		deleteItemCart(e.target.dataset.id);
		renderCart();
	}
})

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
		top: document.body.dbScrollY,
	})
};

//Модальное окно
const cartModalOpen = () => {
	cartOverlay.classList.add('cart-overlay-open');
	disableScroll(); //при открытии мод окна, скол скрывается
	renderCart();
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
	if(data.ok) {
		return data.json()
	} else { //если данные с сервера не получили
		throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`)
	}
};

//эти данные получили и обработали
const getGoods = (callback, prop, value) => { //callback отложенная функция, т.е. будет вызвана только когда мы получим данные с сервера
	getData()
		.then(data => { //then обрабатывает promise, он вызовет колбэк функцию когда getData отработает 
			if (value) {
				callback(data.filter(item => item[prop] === value)) //передаем отфильтрованные данные(у котрых категoрия совпадает)
			} else {
				callback(data);//если не будет категории, то вызвутся все
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

// Страница категорий
try {
	const goodsList = document.querySelector('.goods__list');

	if (!goodsList) {
		throw 'This is not a goods page!' //throw исключение, чтобы стр goods.html работал только в этой стр
	}

	const goodsTitle = document.querySelector('.goods__title'); //выводит данные по хэштегу

	const changeTitle = () => {
		goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent; //ищем по атрибуту hash и забираем у него tetxContent
	}

	//работаем с элементами карточки
	const createCard = ({ id, preview, cost, brand, name, sizes }) => { //достаем данные с cthdthf сохраняя их в эти ячейки
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

	const renderGoodsList = data => { //выведем данные на страницу в ul goodsList
		goodsList.textContent = ''; //очищаем ul карточки

		/*for (let i = 0; i < data.length; i++) { //1вариант
			console.log('for:', data[i]); //data[i] каждый элемент вывыодится отдельно
		}

		for (const item of data) { //2вариант
			console.log('for/of:', item);
		}
		*/
		data.forEach(item => { //3вариант заполняет новыми данными, forEach запускает функцию столько раз, сколько эл-ов в массиве
			const card = createCard(item); //каждой карточке из б/д передаем li элем
			goodsList.append(card); //вставляем card внутри goodsList
		})
	};

	//хэш отменился, его получили и записали в перемнную и вызвали заново getGoods(getgoods запрашивает данные и вызывает renderGoodsList)
	window.addEventListener('hashchange', () => { 
		hash = location.hash.substring(1);
		getGoods(renderGoodsList, 'category', hash);
		changeTitle();
	})

	changeTitle();
	getGoods(renderGoodsList, 'category', hash);

} catch (err) {
	console.warn(err)
}

// Страница товаров
try {

	if (!document.querySelector('.card-good')) { //если не получили эту стр
		throw 'This is not a card-good page!'; 
	}

	const cardGoodIamge = document.querySelector('.card-good__image');
	const cardGoodBrand = document.querySelector('.card-good__brand');
	const cardGoodTitle = document.querySelector('.card-good__title');
	const cardGoodPrice = document.querySelector('.card-good__price');
	const cardGoodColor = document.querySelector('.card-good__color');
	const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
	const cardGoodColorList = document.querySelector('.card-good__color-list');
	const cardGoodSizes = document.querySelector('.card-good__sizes');
	const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
	const cardGoodBuy = document.querySelector('.card-good__buy');

	const generateList = data => data.reduce((html, item, i) => html + //reduce принимает колбэк функцию и кажд сл итерацию, первый аргум передает резул предыдущей итерацию этой колбэк функции 
	`<li class="card-good__select-item" data-id="${i}">${item}</li>`, ''); //2я будет с первой итерацией, и прибавляем каждому выбранному эл-у id
	
	const renderCardGood = ([{id, brand, name, cost, color, sizes, photo}]) => { //подгружаем данные в эти ячейки, при клике выводится та карта
		const data = {brand, name, cost, id}; //отправляем в корзину
		cardGoodIamge.src = `goods-image/${photo}`;
		cardGoodIamge.alt = `${brand} ${name}`;
		cardGoodBrand.textContent = brand;
		cardGoodTitle.textContent = name;
		cardGoodPrice.textContent = `${cost} ₽`;
		if (color) {
			cardGoodColor.textContent = color[0]; //0 по дефольту
			cardGoodColor.dataset.id = 0;
			cardGoodColorList.innerHTML = generateList(color); //innerHTML возвращ верстку
		} else {
			cardGoodColor.style.display = 'none'; //если нет, то скрывает стили
		}
		if (sizes) {
			cardGoodSizes.textContent = sizes[0]; //0 по дефольту
			cardGoodSizes.dataset.id = 0;
			cardGoodSizesList.innerHTML = generateList(sizes);
		} else {
			cardGoodSizes.style.display = 'none';
		}

		if (getLocalStorage().some(item => item.id === id)) { //если мы найдем хотя бы один id в корзине 
			cardGoodBuy.classList.add('delete'); //и добавь этот клас
			cardGoodBuy.textContent = 'Удалить из корзины'; //напиши удалить из корзины
		} 

		cardGoodBuy.addEventListener('click', () => { //при клике если есть цвет и размер

			//если кликнула по кнопке, то проверяю есть ли delete, если есть то удаляю из корзины и меняю надпись на добавить
			if (cardGoodBuy.classList.contains('delete')) { 
				deleteItemCart(id);
				cardGoodBuy.classList.remove('delete'); 
				cardGoodBuy.textContent = 'Добавить в корзину';
				return; 
			}

			if(color) data.color = cardGoodColor.textContent;
			if(sizes) data.size = cardGoodSizes.textContent;

			cardGoodBuy.classList.add('delete');
			cardGoodBuy.textContent = 'Удалить из корзины'; 

			//обновляем товары в корзине
			const cardData = getLocalStorage(); //получаем данные из LocalStorage
			cardData.push(data); //к этим данным добавляем новый товар
			setLocalStorage(cardData); //и отправили обратно в LocalStorage
		});
	};

	cardGoodSelectWrapper.forEach(item => {
		item.addEventListener('click', e => {
			const target = e.target;
			if(target.closest('.card-good__select')) { //если мы добавлем card-good__select открывается список снизу
				target.classList.toggle('card-good__select__open'); //toggle добавляет клас если его нет и убирает клас если он есть
			}
			if(target.closest('.card-good__select-item')) { //если кликнули на item
				const cardGoodSelect = item.querySelector('.card-good__select'); //внутри item ищем card-good__select
				cardGoodSelect.textContent = target.textContent; //при клике на эл забираем у него textcontent
				cardGoodSelect.dataset.id = target.dataset.id; //также хабираем data атрибут
				cardGoodSelect.classList.remove('card-good__select__open'); //при нажатии на люой эл обратно выходит на изнач вид
			} 
		});
	});
	
	getGoods(renderCardGood, 'id', hash); //получаем данные по id которые содержатся в хэш

} catch (err) {
	console.warn(err); 
}