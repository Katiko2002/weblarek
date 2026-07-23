import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

type TPage = {
    catalog: HTMLElement[];
    basketCounter: number;
    locked: boolean;
};

export class Page extends Component<TPage> {
    private gallery: HTMLElement;
    private basketButton: HTMLButtonElement;
    private basketCounterElement: HTMLElement;
    private wrapper: HTMLElement;

    constructor(container: HTMLElement, private events: IEvents) {
        super(container);

        this.gallery = ensureElement<HTMLElement>('.gallery', container);
        this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', container);
        this.basketCounterElement = ensureElement<HTMLElement>('.header__basket-counter', container);
        this.wrapper = ensureElement<HTMLElement>('.page__wrapper', container);

        this.basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set catalog(items: HTMLElement[]) {
        this.gallery.replaceChildren(...items);
    }

    set basketCounter(value: number) {
        this.basketCounterElement.textContent = String(value);
    }

    set locked(value: boolean) {
        this.wrapper.classList.toggle('page__wrapper_locked', value);
    }
}