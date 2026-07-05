import { IBuyer, TBuyerErrors } from '../../types';

export class BuyerModel {
    data: Partial<IBuyer> = {};

    setData(data: Partial<IBuyer>): void {
        this.data = {
            ...this.data,
            ...data,
        };
    }

    getData(): Partial<IBuyer> {
        return this.data;
    }

    clear(): void {
        this.data = {};
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