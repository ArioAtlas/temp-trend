import { useRef, useState, useEffect } from 'react';
import { DataRetrieval } from '../../services';
import RangeSlider from '../slider/RangeSlider';
import Selector from './../Selector';
import TimeSpiral from '../TimeSpiral';

const service = DataRetrieval.getInstance();

const DEFAULT_COUNTRY = 'SW';

function Overview() {
    const parent = useRef(null);
    const [layout, setLayout] = useState({
        width: 0,
        height: 0,
    });

    const [filters, setFilters] = useState({
        country: DEFAULT_COUNTRY,
        station: null,
        elevation: null,
        year: null,
        month: null,
    });

    const [country, setCountry] = useState(service.getCountryList());
    const [stations, setStations] = useState(
        service.getStationList({ countryCode: DEFAULT_COUNTRY })
    );
    const [data, setData] = useState();

    useEffect(() => {
        setLayout({
            width: parent?.current?.clientWidth ?? 0,
            height: parent?.current?.clientHeight ?? 0,
        });
    }, [parent]);

    useEffect(() => {
        setCountry(
            service.getCountryList({
                elevation: filters.elevation,
            })
        );
    }, [filters.elevation]);

    useEffect(() => {
        const newStationList = service.getStationList({
            country: filters.country,
            elevation: filters.elevation,
        });
        setStations(newStationList);
    }, [filters.country, filters.elevation]);

    useEffect(() => {
        const temperatures = service.getTemperaturesByStation({
            station: filters.station,
            year: filters.year,
        });
        setData(temperatures);
    }, [filters.station, filters.month, filters.year]);

    const isReady = () => {
        return filters.country && filters.station;
    };

    return (
        <div className="container">
            <Selector
                position="left"
                values={country}
                active={filters.country}
                onClick={(selected) =>
                    setFilters((filters) => ({
                        ...filters,
                        country: selected,
                    }))
                }
                get={(item) => item.name}
            />
            <Selector
                position="right"
                values={stations}
                active={filters.station}
                onClick={(selected) =>
                    setFilters((filters) => ({
                        ...filters,
                        station: selected,
                    }))
                }
                get={(item) => item.name}
            />
            <div className="plot" ref={parent}>
                {isReady() ? (
                    <TimeSpiral
                        data={data}
                        colorBy={'temperature'}
                        field={'temperature'}
                        scheme="YlGnBu"
                        range={service.getTemperatureRange()}
                        diameter={Math.min(layout.width, layout.height)}
                    />
                ) : (
                    <span className="info">Please choose a station</span>
                )}
            </div>
            <div className="control">
                <div className="control-field">
                    <RangeSlider
                        min={service.getYears()[0]}
                        max={service.getYears()[1]}
                        callback={(range) =>
                            setFilters((filters) => ({
                                ...filters,
                                year: range,
                            }))
                        }
                        label="Years"
                    />
                </div>
                <div className="control-field">
                    <RangeSlider
                        min={service.getMonths()[0]}
                        max={service.getMonths()[1]}
                        callback={(range) =>
                            setFilters((filters) => ({
                                ...filters,
                                month: range,
                            }))
                        }
                        label="Month"
                    />
                </div>
                <div className="control-field">
                    <RangeSlider
                        min={service.getElevations()[0]}
                        max={service.getElevations()[1]}
                        callback={(range) =>
                            setFilters((filters) => ({
                                ...filters,
                                elevation: range,
                            }))
                        }
                        trackColor={'#254589'}
                        label="Elevation"
                    />
                </div>
            </div>
        </div>
    );
}

export default Overview;
