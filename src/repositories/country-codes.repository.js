export class CountryCodesRepository {
    static instance = null;
    #data = null;

    static getInstance() {
        if (!this.instance) this.instance = new CountryCodesRepository();

        return this.instance;
    }

    set(data) {
        this.#data = data ?? require('./demo/country-codes.json');
    }

    get(){
        return this.#data
    }
}
