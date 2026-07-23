import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';

import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

import { AppApi } from './components/AppApi';

import { ProductsModel } from './components/Models/ProductsModel';
import { BasketModel } from './components/Models/BasketModel';
import { BuyerModel } from './components/Models/BuyerModel';

import { Page } from './components/View/Page';
import { CatalogCard, PreviewCard, BasketCard } from './components/View/Card';
import { Basket } from './components/View/Basket';
import { OrderForm, ContactsForm } from './components/View/Form';
import { Modal } from './components/View/Modal';
import { Success } from './components/View/Success';

import { IProduct, TOrderRequest } from './types';

const events = new EventEmitter();

const productsModel = new ProductsModel(events);
const basketModel = new BasketModel(events);
const buyerModel = new BuyerModel(events);

const api = new Api(API_URL);
const appApi = new AppApi(api);

const page = new Page(document.body, events);

const modal = new Modal(
    ensureElement<HTMLElement>('#modal-container'),
    events
);

const basket = new Basket(
    cloneTemplate<HTMLElement>('#basket'),
    events
);

const orderForm = new OrderForm(
    cloneTemplate<HTMLFormElement>('#order'),
    events
);

const contactsForm = new ContactsForm(
    cloneTemplate<HTMLFormElement>('#contacts'),
    events
);

const success = new Success(
    cloneTemplate<HTMLElement>('#success'),
    events
);

let openedModal: 'preview' | 'basket' | 'order' | 'contacts' | 'success' | null = null;

function createCatalogCard(product: IProduct): HTMLElement {
    const card = new CatalogCard(
        cloneTemplate<HTMLElement>('#card-catalog'),
        events
    );

    return card.render(product);
}

function createBasketCard(product: IProduct, index: number): HTMLElement {
    const card = new BasketCard(
        cloneTemplate<HTMLElement>('#card-basket'),
        events
    );

    return card.render({
        ...product,
        index: index + 1,
    });
}

function renderCatalog(): void {
    const cards = productsModel.getItems().map((product) => {
        return createCatalogCard(product);
    });

    page.render({
        catalog: cards,
        basketCounter: basketModel.getCount(),
    });
}

function renderSelectedProduct(): void {
    const product = productsModel.getSelectedProduct();

    if (!product) {
        return;
    }

    const isInBasket = basketModel.hasItem(product.id);
    const isDisabled = product.price === null;

    const previewCard = new PreviewCard(
        cloneTemplate<HTMLElement>('#card-preview'),
        events
    );

    const buttonText = isDisabled
        ? 'Недоступно'
        : isInBasket
            ? 'Убрать из корзины'
            : 'В корзину';

    modal.render({
        content: previewCard.render({
            ...product,
            buttonText,
            buttonDisabled: isDisabled,
        }),
    });
}

function renderBasket(): void {
    const items = basketModel.getItems();

    const basketItems = items.map((product, index) => {
        return createBasketCard(product, index);
    });

    modal.render({
        content: basket.render({
            items: basketItems,
            total: basketModel.getTotal(),
            buttonDisabled: items.length === 0,
        }),
    });
}

function getOrderErrors(): string {
    const errors = buyerModel.validate();

    return [errors.payment, errors.address]
        .filter(Boolean)
        .join('; ');
}

function isOrderValid(): boolean {
    const data = buyerModel.getData();

    return Boolean(data.payment && data.address);
}

function renderOrderForm(): void {
    const data = buyerModel.getData();

    modal.render({
        content: orderForm.render({
            payment: data.payment,
            address: data.address ?? '',
            valid: isOrderValid(),
            errors: getOrderErrors(),
        }),
    });
}

function getContactsErrors(): string {
    const errors = buyerModel.validate();

    return [errors.email, errors.phone]
        .filter(Boolean)
        .join('; ');
}

function isContactsValid(): boolean {
    const data = buyerModel.getData();

    return Boolean(data.email && data.phone);
}

function renderContactsForm(): void {
    const data = buyerModel.getData();

    modal.render({
        content: contactsForm.render({
            email: data.email ?? '',
            phone: data.phone ?? '',
            valid: isContactsValid(),
            errors: getContactsErrors(),
        }),
    });
}

function openSuccess(total: number): void {
    openedModal = 'success';

    modal.render({
        content: success.render({
            total,
        }),
    });

    modal.open();
}

events.on('products:changed', () => {
    renderCatalog();
});

events.on('product:selected', () => {
    openedModal = 'preview';

    renderSelectedProduct();
    modal.open();
});

events.on('basket:changed', () => {
    page.render({
        basketCounter: basketModel.getCount(),
    });

    if (openedModal === 'basket') {
        renderBasket();
    }

    if (openedModal === 'preview') {
        renderSelectedProduct();
    }
});

events.on('buyer:changed', () => {
    if (openedModal === 'order') {
        renderOrderForm();
    }

    if (openedModal === 'contacts') {
        renderContactsForm();
    }
});

events.on<{ id: string }>('card:select', ({ id }) => {
    const product = productsModel.getItem(id);

    if (product) {
        productsModel.setSelectedProduct(product);
    }
});

events.on<{ id: string }>('card:action', ({ id }) => {
    const product = productsModel.getItem(id);

    if (!product || product.price === null) {
        return;
    }

    if (basketModel.hasItem(id)) {
        basketModel.removeItem(id);
    } else {
        basketModel.addItem(product);
    }
});

events.on<{ id: string }>('basket:item-remove', ({ id }) => {
    basketModel.removeItem(id);
});

events.on('basket:open', () => {
    openedModal = 'basket';

    renderBasket();
    modal.open();
});

events.on('order:open', () => {
    openedModal = 'order';

    renderOrderForm();
    modal.open();
});

events.on<{ payment: 'card' | 'cash' }>('order:payment-change', ({ payment }) => {
    buyerModel.setData({
        payment,
    });
});

events.on<{ address: string }>('order:address-change', ({ address }) => {
    buyerModel.setData({
        address,
    });
});

events.on('order:submit', () => {
    if (!isOrderValid()) {
        renderOrderForm();
        return;
    }

    openedModal = 'contacts';
    renderContactsForm();
});

events.on<{ email: string }>('contacts:email-change', ({ email }) => {
    buyerModel.setData({
        email,
    });
});

events.on<{ phone: string }>('contacts:phone-change', ({ phone }) => {
    buyerModel.setData({
        phone,
    });
});

events.on('contacts:submit', () => {
    if (!isContactsValid()) {
        renderContactsForm();
        return;
    }

    const buyerData = buyerModel.getData();

    const order: TOrderRequest = {
        payment: buyerData.payment!,
        address: buyerData.address!,
        email: buyerData.email!,
        phone: buyerData.phone!,
        items: basketModel.getItems().map((item) => item.id),
        total: basketModel.getTotal(),
    };

    appApi.postOrder(order)
        .then((result) => {
            basketModel.clear();
            buyerModel.clear();

            openSuccess(result.total);
        })
        .catch((error) => {
            console.error('Ошибка отправки заказа:', error);
        });
});

events.on('success:close', () => {
    modal.close();
});

events.on('modal:open', () => {
    page.render({
        locked: true,
    });
});

events.on('modal:close', () => {
    openedModal = null;

    page.render({
        locked: false,
    });
});

appApi.getProducts()
    .then((data) => {
        productsModel.setItems(data.items);
    })
    .catch((error) => {
        console.error('Ошибка загрузки товаров с сервера:', error);
    });