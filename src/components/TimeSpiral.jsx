import { TimeSpiralBuilder } from '../utils/time-spiral.builder';
import { useD3 } from '../hooks/useD3';
import * as D3 from 'd3';

function TimeSpiral({ data = [], diameter, range, scheme }) {
    const options = {
        scheme,
        diameter,
        align: 'center', // center,base
        barWidth: 'skinny', // skinny,normal
        rounded: true,
        colorBy: 'value', //time,value
        showTicks: true,
        layers: data.length < 24 ? 1 : data.length < 150 ? 2 : 3, // 2,3,4
    };

    const ref = useD3(
        (svg) => {
            const colorScheme =
                options.scheme === 'OrRd'
                    ? D3.interpolateOrRd
                    : options.scheme === 'YlGnBu'
                    ? D3.interpolateRdYlBu
                    : D3.interpolateRdBu;

            if (diameter && data.length)
                new TimeSpiralBuilder(svg)
                    .size([options.diameter, options.diameter])
                    .layers(options.layers)
                    .style({
                        align: options.align,
                        colorBy: options.colorBy,
                        tickInterval: 'auto',
                        titleFormat: '.2f',
                        showTicks: options.showTicks,
                        barWidth: options.barWidth,
                        rounded: options.rounded,
                        reverseColor: true,
                    })
                    .palette(colorScheme)
                    .field({ value: 'temperature' })
                    .data(data)
                    .range(range)
                    .render();
        },
        [data.length, diameter]
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
