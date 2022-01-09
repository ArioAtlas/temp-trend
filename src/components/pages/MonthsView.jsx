import { useRef, useState, useEffect } from 'react';
import Slider from '../slider/Slider';
import RangeSlider from '../slider/RangeSlider';
import HorizonChart from './../HorizonChart';
import { DataRetrieval } from '../../services';

const service = DataRetrieval.getInstance();

function MonthsView({ view }) {
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
        month: [service.getMonths()[1], service.getMonths()[1]],
        elevation: null,
    });
    const [data, setData] = useState([]);

    useEffect(() => {
        const filtered = service.getDataByElevation({
            elevation: filters.elevation,
            month: filters.month,
        });
        setData(filtered);
    }, [filters.elevation, filters.month]);

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
                        min={service.getMonths()[0]}
                        max={service.getMonths()[1]}
                        callback={(value) =>
                            setFilters((filters) => ({
                                ...filters,
                                month: [value, value],
                            }))
                        }
                        trackColor={'transparent'}
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

export default MonthsView;
