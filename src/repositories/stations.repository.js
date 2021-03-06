export class StationRepository {
    static instance = null;
    #data = null;

    static getInstance() {
        if (!this.instance) this.instance = new StationRepository();
        this.instance.set()

        return this.instance;
    }

    set(data) {
        this.#data = data ?? require('./demo/stations.json');
    }

    get(){
        return this.#data
    }
}
