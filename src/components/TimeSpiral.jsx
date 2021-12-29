import { TimeSpiralBuilder } from '../utils/time-spiral.builder';
import { useD3 } from '../hooks/useD3';
import * as D3 from 'd3';

const sample = require('../demo.json');

function TimeSpiral({ data = [], diameter }) {
    const options = {
        scheme: 'OrRd',
        diameter,
        align: 'center', // center,base
        barWidth: 'skinny', // skinny,normal
        rounded: true,
        colorBy: 'value', //time,value
        showTicks: true,
        layers: 4, // 2,3,4
    };

    const ref = useD3(
        (svg) => {
            const colorScheme =
                options.scheme === 'OrRd'
                    ? D3.interpolateOrRd
                    : options.scheme === 'YlGnBu'
                    ? D3.interpolateYlGnBu
                    : D3.interpolateRdPu;

            if (diameter)
                new TimeSpiralBuilder(svg)
                    .size([options.diameter, options.diameter])
                    .layers(options.layers)
                    .style({
                        align: options.align,
                        colorBy: options.colorBy,
                        tickInterval: 'auto',
                        titleFormat: '$,.2f',
                        showTicks: options.showTicks,
                        barWidth: options.barWidth,
                        rounded: options.rounded,
                    })
                    .palette(colorScheme)
                    .field({ value: 'value' })
                    .data(sample)
                    .render();
        },
        [sample.length, diameter]
    );

    return (
        <svg
            ref={ref}
            viewBox={`0, 0, ${options.diameter}, ${options.diameter}`}
            style={{
                width: options.diameter,
                maxWidth: '100%',
                cursor: 'default',
            }}
        ></svg>
    );
}

export default TimeSpiral;
