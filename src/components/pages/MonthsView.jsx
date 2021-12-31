import { useRef, useState, useEffect } from 'react';
import Slider from '../slider/Slider';
import RangeSlider from '../slider/RangeSlider';
import HorizonChart from './../HorizonChart';

const data = require('../../demo3.json');

function MonthsView() {
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

    return (
        <div className="container">
            <div className="plot" ref={parent}>
                <HorizonChart
                    data={data}
                    width={layout.width}
                    height={layout.height}
                />
            </div>
            <div className="control">
                <div className="control-field">
                    <Slider
                        min={1}
                        max={12}
                        callback={(range) => console.log(range)}
                        trackColor={'transparent'}
                        label="Month"
                    />
                </div>
                <div className="control-field">
                    <RangeSlider
                        min={1}
                        max={12}
                        callback={(range) => console.log(range)}
                        trackColor={'#254589'}
                        label="Elevation"
                    />
                </div>
            </div>
        </div>
    );
}

export default MonthsView;
