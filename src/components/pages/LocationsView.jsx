import { useRef, useState, useEffect } from 'react';
import { DataRetrieval } from '../../services';
import RangeSlider from '../slider/RangeSlider';
import Selector from '../Selector';
import HeatMap from '../HeatMap';

const service = DataRetrieval.getInstance();
const DEFAULT_COUNTRY = 'SW';

function LocationsView({ view }) {
    const parent = useRef(null);
    const [layout, setLayout] = useState({
        width: 0,
        height: 0,
    });

    const [filters, setFilters] = useState({
        country: DEFAULT_COUNTRY,
        station: null,
        elevation: null,
    });

    const [country, setCountry] = useState(service.getCountryList());
    const [stations, setStations] = useState(service.getStationList({ countryCode: DEFAULT_COUNTRY }));
    const [data, setData] = useState([]);

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
        const filtered = service.getDataByStation({
            station: filters.station,
        });
        setData(filtered);
    }, [filters.station]);

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
                    <HeatMap
                        data={data}
                        width={layout.width}
                        height={layout.height}
                        scheme={view === 'Temperature' ? 'YlOrBr' : ''}
                        schemeReverse={view === 'Temperature' ? true : true}
                        horizontalColumn="year"
                        verticalColumn="monthName"
                        vDomain={[
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December',
                        ]}
                        neutralValue={view === 'Temperature' ? '0' : undefined}
                        tooltipPostfix={view === 'Temperature' ? ' ˚C' : ' observations'}
                        valueColumn={view === 'Temperature' ? 'temperature' : 'observations'}
                        range={view === 'Temperature' ? service.getTemperatureRange() : service.getObservationRange()}
                    />
                ) : (
                    <span className="info">Please choose a station</span>
                )}
            </div>
            <div className="control">
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

export default LocationsView;
