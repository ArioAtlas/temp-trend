import { TimeSpiralBuilder } from '../utils/time-spiral.builder';
import { useD3 } from '../hooks/useD3';
import * as D3 from 'd3';

function TimeSpiral({
    data = [],
    diameter,
    field,
    range,
    scheme,
    schemeReverse,
}) {
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
                    ? D3.interpolateReds
                    : options.scheme === 'RdBu'
                    ? D3.interpolateRdBu
                    : options.scheme === 'RdYlBu'
                    ? D3.interpolateRdYlBu
                    : D3.interpolateBuPu;

            svg.html('');
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
                        reverseColor: schemeReverse ?? false,
                    })
                    .palette(colorScheme)
                    .field({ value: field })
                    .data(data)
                    .range(range)
                    .render();
        },
        [data.length, diameter, field]
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
