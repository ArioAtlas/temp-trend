import { groupBy, mapValues, pickBy, pick, has } from 'lodash';
import { CountryCodesRepository } from '../repositories/country-codes.repository';
import { StationRepository } from '../repositories/stations.repository';
import { TemperatureRepository } from '../repositories/temperature.repository';

export class DataRetrieval {
    static #instance = null;
    #stationRepository = null;
    #temperatureRepository = null;
    #countryCodeRepository = null;

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

    #aggregated = {
        elevations: [null, null],
        years: [null, null],
        months: [null, null],
        observations: [null, null],
        temperatures: [null, null],
    };

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

    calculateAggregatedData() {
        const elevations = this.#stationRepository
            .get()
            .map((s) => s.elevation);
        this.#aggregated.elevations = [
            Math.min(...elevations),
            Math.max(...elevations),
        ];

        this.#aggregated.months = [1, 12];

        const years = Array.from(
            new Set(this.#temperatureRepository.get().map((v) => v.year))
        );

        const observations = this.#temperatureRepository
            .get()
            .map((v) => v.observations);

        const temperatures = this.#temperatureRepository
            .get()
            .map((v) => v.temperature);

        this.#aggregated.years = [Math.min(...years), Math.max(...years)];
        this.#aggregated.observations = [
            Math.min(...observations),
            Math.max(...observations),
        ];
        this.#aggregated.temperatures = [
            Math.min(...temperatures),
            Math.max(...temperatures),
        ];
    }

    updateReferences() {
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
    }

    reload() {
        // Fill aggregated data
        this.calculateAggregatedData();

        this.updateReferences();

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

    getStationList({ elevation, country } = {}) {
        return pickBy(this.#reference.stations, (v) => {
            if (elevation && Array.isArray(elevation))
                if (elevation[0] > v.elevation || elevation[1] < v.elevation)
                    return false;

            if (country && v.countrycode !== country) return false;

            return true;
        });
    }

    getCountryList({ elevation } = {}) {
        return pick(
            this.#reference.countryCodes,
            Object.values(this.getStationList({ elevation })).map(
                (s) => s.countrycode
            )
        );
    }

    getElevations() {
        return this.#aggregated.elevations;
    }

    getYears() {
        return this.#aggregated.years;
    }

    getMonths() {
        return this.#aggregated.months;
    }

    getTemperatureRange() {
        return this.#aggregated.temperatures;
    }

    getObservationRange() {
        return this.#aggregated.observations;
    }

    getTemperaturesByStation({ station, year, month }) {
        if (!station || !has(this.#dataset.byStation, station)) return [];

        return this.#dataset.byStation[station].map(
            ({ year, month, temperature, observations }) => ({
                date: new Date(`${year}-${month}-1`).toISOString(),
                temperature,
                observations,
            })
        );
    }
}
