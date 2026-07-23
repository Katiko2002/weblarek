import { IBuyer, TBuyerErrors } from '../../types';
import { IEvents } from '../base/Events';

export class BuyerModel {
    private data: Partial<IBuyer> = {};

    constructor(private events: IEvents) {}

    setData(data: Partial<IBuyer>): void {
        this.data = {
            ...this.data,
            ...data,
        };

        this.events.emit('buyer:changed');
    }

    getData(): Partial<IBuyer> {
        return this.data;
    }

    clear(): void {
        this.data = {};
        this.events.emit('buyer:changed');
    }

    validate(): TBuyerErrors {
        const errors: TBuyerErrors = {};

        if (!this.data.payment) {
            errors.payment = 'Выберите способ оплаты';
        }

        if (!this.data.address) {
            errors.address = 'Укажите адрес доставки';
        }

        if (!this.data.email) {
            errors.email = 'Укажите email';
        }

        if (!this.data.phone) {
            errors.phone = 'Укажите телефон';
        }

        return errors;
    }
}