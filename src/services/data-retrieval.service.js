import { groupBy, mapValues } from 'lodash';
import { CountryCodesRepository } from '../repositories/country-codes.repository';
import { StationRepository } from '../repositories/stations.repository';
import { TemperatureRepository } from '../repositories/temperature.repository';

export class DataRetrieval {
    static #instance = null;
    #dataset = {
        byStation: [],
        byCountry: [],
        byYear: [],
        byMonth: [],
        all: [],
    };
    #reference = {
        stations: {},
        countryCodes: {},
    };
    #stationRepository = null;
    #temperatureRepository = null;
    #countryCodeRepository = null;

    constructor() {
        this.#stationRepository = StationRepository.getInstance();
        this.#temperatureRepository = TemperatureRepository.getInstance();
        this.#countryCodeRepository = CountryCodesRepository.getInstance();

        this.reload();
    }

    static getInstance() {
        if (!this.#instance) this.#instance = new DataRetrieval();
        return this.#instance;
    }

    reload() {
        this.#reference.countryCodes = mapValues(
            groupBy(this.#countryCodeRepository.get(), (s) => s.code),
            (v) => v[0]
        );

        this.#reference.stations = mapValues(
            groupBy(this.#stationRepository.get(), (s) => s.station),
            (v) => ({
                ...v[0],
                countryName:
                    this.#reference.countryCodes[v[0].countrycode].name,
            })
        );

        this.#dataset.all = this.#temperatureRepository.get().map(
            (value) => ({
                ...value,
                station: this.#reference.stations[value.station],
            }),
            {}
        );

        this.#dataset.byCountry = groupBy(
            this.#dataset.all,
            (v) => v.station.countrycode
        );

        this.#dataset.byStation = groupBy(
            this.#dataset.all,
            (v) => v.station.station
        );

        this.#dataset.byYear = groupBy(this.#dataset.all, (v) => v.year);

        this.#dataset.byMonth = groupBy(this.#dataset.all, (v) => v.month);
    }
}
