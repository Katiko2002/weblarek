import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { CDN_URL, categoryMap } from '../../utils/constants';
import { IProduct } from '../../types';

type TCard = IProduct & {
    index: number;
    buttonText: string;
    buttonDisabled: boolean;
};

export class Card extends Component<TCard> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected categoryElement?: HTMLElement;
    protected imageElement?: HTMLImageElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.titleElement = ensureElement<HTMLElement>('.card__title', container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', container);
        this.categoryElement = container.querySelector('.card__category') || undefined;
        this.imageElement = container.querySelector('.card__image') || undefined;
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    set price(value: number | null) {
        this.priceElement.textContent = value === null ? 'Бесценно' : `${value} синапсов`;
    }

    set category(value: string) {
        if (!this.categoryElement) {
            return;
        }

        this.categoryElement.textContent = value;
        this.categoryElement.className = 'card__category';

        const modifier = categoryMap[value as keyof typeof categoryMap];

        if (modifier) {
            const className = modifier.startsWith('card__category')
                ? modifier
                : `card__category_${modifier}`;

            this.categoryElement.classList.add(className);
        }
    }

    set image(value: string) {
        if (!this.imageElement) {
            return;
        }

        this.setImage(this.imageElement, `${CDN_URL}${value}`, this.titleElement.textContent || '');
    }
}

export class CatalogCard extends Card {
    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.container.addEventListener('click', () => {
            const id = this.container.dataset.id;

            if (id) {
                this.events.emit('card:select', { id });
            }
        });
    }
}

export class PreviewCard extends Card {
    private descriptionElement: HTMLElement;
    private buttonElement: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.descriptionElement = ensureElement<HTMLElement>('.card__text', container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', container);

        this.buttonElement.addEventListener('click', () => {
            const id = this.container.dataset.id;

            if (id) {
                this.events.emit('card:action', { id });
            }
        });
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    set buttonText(value: string) {
        this.buttonElement.textContent = value;
    }

    set buttonDisabled(value: boolean) {
        this.buttonElement.disabled = value;
    }
}

export class BasketCard extends Card {
    private indexElement: HTMLElement;
    private deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

        this.deleteButton.addEventListener('click', () => {
            const id = this.container.dataset.id;

            if (id) {
                this.events.emit('basket:item-remove', { id });
            }
        });
    }

    set index(value: number) {
        this.indexElement.textContent = String(value);
    }
}