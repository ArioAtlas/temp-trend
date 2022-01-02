import { groupBy, mapValues, pickBy, pick, has, valuesIn, flatten } from 'lodash';
import { CountryCodesRepository } from '../repositories/country-codes.repository';
import { StationRepository } from '../repositories/stations.repository';
import { TemperatureRepository } from '../repositories/temperature.repository';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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

    getDataByStation({ station, year, month }) {
        if (!station || !has(this.#dataset.byStation, station)) return [];

        return this.#dataset.byStation[station]
            .filter((d) => {
                if (year && Array.isArray(year))
                    if (year[0] > d.year || year[1] < d.year) return false;

                if (month && Array.isArray(month))
                    if (month[0] > d.month || month[1] < d.month) return false;

                return true;
            })
            .map(({ year, month, temperature, observations,station }) => ({
                date: new Date(`${year}-${month}-1`).toISOString(),
                temperature,
                observations,
                location:station.name,
                year:year.toString(),
                monthName:MONTH_NAMES[month],
                month:new Date(`${year}-${month}-1`)
            }));
    }

    getDataByCountry({ country, year, month }) {
        if (!country || !has(this.#dataset.byCountry, country)) return [];

        return this.#dataset.byCountry[country]
            .filter((d) => {
                if (year && Array.isArray(year))
                    if (year[0] > d.year || year[1] < d.year) return false;

                if (month && Array.isArray(month))
                    if (month[0] > d.month || month[1] < d.month) return false;

                return true;
            })
            .map(({ year, month, temperature, observations,station }) => ({
                date: new Date(`${year}-${month}-1`).toISOString(),
                temperature,
                observations,
                location:station.name
            }));
    }

    getDataByElevation({ elevation, year, month }) {
        const stations = Object.keys(this.getStationList({elevation}))

        return flatten(valuesIn(pick(this.#dataset.byStation,stations)))
            .filter((d) => {
                if (year && Array.isArray(year))
                    if (year[0] > d.year || year[1] < d.year) return false;

                if (month && Array.isArray(month))
                    if (month[0] > d.month || month[1] < d.month) return false;

                return true;
            })
            .map(({ year, month, temperature, observations,station }) => ({
                date: new Date(`${0}-${month}-1`).toISOString(),
                temperature,
                observations,
                year:year.toString(),
                month:MONTH_NAMES[month]
            }));
    }
}
