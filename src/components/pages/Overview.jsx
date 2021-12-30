import { useRef, useState, useEffect } from 'react';
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
        </div>
    );
}

export default Overview;
