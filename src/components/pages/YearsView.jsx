import { useRef, useState, useEffect } from 'react';
import { DataRetrieval } from '../../services';
import Slider from '../slider/Slider';
import RangeSlider from '../slider/RangeSlider';
import HorizonChart from './../HorizonChart';

const service = DataRetrieval.getInstance();

function YearsView({ view }) {
    const parent = useRef(null);
    const [layout, setLayout] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        setLayout({
            width: parent?.current?.clientWidth ?? 0,
            height: parent?.current?.clientHeight ?? 0,
        });
    }, [parent]);

    const [filters, setFilters] = useState({
        year: [service.getYears()[1], service.getYears()[1]],
        elevation: null,
    });
    const [data, setData] = useState([]);

    useEffect(() => {
        const filtered = service.getDataByElevation({
            elevation: filters.elevation,
            year: filters.year,
        });
        console.log(filtered);
        setData(filtered);
    }, [filters.elevation, filters.year]);

    return (
        <div className="container">
            <div className="plot" ref={parent}>
                <HorizonChart
                    data={data}
                    width={layout.width}
                    height={layout.height}
                    marginLeft="250"
                    curvature="Basis"
                    scheme={view === 'Temperature' ? 'YlOrBr' : ''}
                    schemeReverse={view === 'Temperature' ? true : true}
                    dateColumn="date"
                    labelColumn="location"
                    neutralValue={view === 'Temperature' ? '0' : null}
                    valueColumn={view === 'Temperature' ? 'temperature' : 'observations'}
                    range={view === 'Temperature' ? service.getTemperatureRange() : service.getObservationRange()}
                />
            </div>
            <div className="control">
                <div className="control-field">
                    <Slider
                        min={service.getYears()[0]}
                        max={service.getYears()[1]}
                        callback={(value) =>
                            setFilters((filters) => ({
                                ...filters,
                                year: [value, value],
                            }))
                        }
                        trackColor={'transparent'}
                        label="Year"
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

export default YearsView;
