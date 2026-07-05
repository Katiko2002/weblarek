import './scss/styles.scss';

import { apiProducts } from './utils/data';
import { ProductsModel } from './components/Models/ProductsModel';
import { BasketModel } from './components/Models/BasketModel';
import { BuyerModel } from './components/Models/BuyerModel';
import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';
import { AppApi } from './components/AppApi';

const productsModel = new ProductsModel();
const basketModel = new BasketModel();
const buyerModel = new BuyerModel();
const api = new Api(API_URL);
const appApi = new AppApi(api);

productsModel.setItems(apiProducts.items);

console.log('Все товары:', productsModel.getItems());

const firstProduct = productsModel.getItems()[0];
const secondProduct = productsModel.getItems()[1];

if (firstProduct) {
    console.log('Первый товар:', firstProduct);
    console.log('Товар по id:', productsModel.getItem(firstProduct.id));

    productsModel.setSelectedProduct(firstProduct);
    console.log('Выбранный товар:', productsModel.getSelectedProduct());

    basketModel.addItem(firstProduct);
}

if (secondProduct) {
    basketModel.addItem(secondProduct);
}

console.log('Товары в корзине:', basketModel.getItems());
console.log('Количество товаров в корзине:', basketModel.getCount());
console.log('Сумма корзины:', basketModel.getTotal());

if (firstProduct) {
    console.log('Первый товар есть в корзине:', basketModel.hasItem(firstProduct.id));

    basketModel.removeItem(firstProduct.id);
    console.log('Корзина после удаления первого товара:', basketModel.getItems());
}

basketModel.clear();
console.log('Корзина после очистки:', basketModel.getItems());

buyerModel.setData({
    payment: 'card',
    address: 'Москва',
});

console.log('Данные покупателя после первого заполнения:', buyerModel.getData());
console.log('Ошибки после первого заполнения:', buyerModel.validate());

buyerModel.setData({
    email: 'test@test.ru',
    phone: '+79999999999',
});

console.log('Данные покупателя после второго заполнения:', buyerModel.getData());
console.log('Ошибки после полного заполнения:', buyerModel.validate());

buyerModel.clear();
console.log('Данные покупателя после очистки:', buyerModel.getData());
console.log('Ошибки после очистки:', buyerModel.validate());

appApi.getProducts()
    .then((data) => {
        productsModel.setItems(data.items);
        console.log('Товары с сервера:', productsModel.getItems());
    })
    .catch((error) => {
        console.error('Ошибка загрузки товаров с сервера:', error);
    });


