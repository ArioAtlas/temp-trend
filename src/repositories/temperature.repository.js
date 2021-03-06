export class TemperatureRepository {
    static instance = null;
    #data = null;

    static getInstance() {
        if (!this.instance) this.instance = new TemperatureRepository();
        this.instance.set()

        return this.instance;
    }

    set(data) {
        this.#data = data ?? require('./demo/temperature.json');
    }

    get(){
        return this.#data
    }
}
