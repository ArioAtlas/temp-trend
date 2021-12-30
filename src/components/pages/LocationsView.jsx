import { useRef, useState, useEffect } from 'react';
import HorizonChart from './../HorizonChart';
import Selector from '../Selector';

const data = require('../../demo3.json');

function LocationsView() {
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
                <HorizonChart
                    data={data}
                    width={layout.width}
                    height={layout.height}
                />
            </div>
        </div>
    );
}

export default LocationsView;
