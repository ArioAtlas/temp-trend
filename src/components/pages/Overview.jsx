import { useRef, useState, useEffect } from 'react';
import RangeSlider from '../slider/RangeSlider';
import Selector from './../Selector';
import TimeSpiral from '../TimeSpiral';

function Overview() {
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
            <Selector
                position="left"
                values={['Page 1', 'Page 2', 'Page 3']}
                active="Page 2"
            />
            <Selector
                position="right"
                values={['Page 1', 'Page 2', 'Page 3', 'Page 4']}
                active="Page 3"
                onClick={(page) => console.log(page)}
            />
            <div className="plot" ref={parent}>
                <TimeSpiral diameter={Math.min(layout.width, layout.height)} />
            </div>
            <div className="control">
                <div className="control-field">
                    <RangeSlider
                        min={0}
                        max={100}
                        callback={(range) => console.log(range)}
                        label="Years"
                    />
                </div>
                <div className="control-field">
                    <RangeSlider
                        min={1}
                        max={12}
                        callback={(range) => console.log(range)}
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

export default Overview;
