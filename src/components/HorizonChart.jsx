import { useD3 } from '../hooks/useD3';
import * as D3 from 'd3';
// import { HorizonChartBuilder } from '../utils/horizon-chart.builder';

function HorizonChart({
    data,
    width,
    height,
    scheme,
    schemeReverse,
    dateColumn,
    labelColumn,
    valueColumn,
    range,
    neutralValue = null,
}) {
    const ref = useD3(
        (svg) => {
            const colorScheme =
                scheme === 'YlOrBr'
                    ? D3.schemeRdYlBu
                    : scheme === 'RdBu'
                    ? D3.schemeRdBu
                    : scheme === 'RdYlBu'
                    ? D3.schemeRdYlBu
                    : D3.schemeBuPu;
            svg.html('');
            const options = {
                curve: D3.curveLinear, // method of interpolation between points
                marginTop: 25, // top margin, in pixels
                marginRight: 0, // right margin, in pixels
                marginBottom: 40, // bottom margin, in pixels
                marginLeft: 150, // left margin, in pixels
                width, // outer width, in pixels
                height, // outer height, in pixels
                bands: 3, // number of bands
                padding: 1, // separation between adjacent horizons
                xType: D3.scaleUtc, // type of x-scale
                yType: D3.scaleLinear, // type of y-scale
                scheme: colorScheme, // color scheme; shorthand for colors
                darkTheme: true,
                reverseColor: schemeReverse ?? false,
                yDomain: range,
                neutralValue,
            };

            const Builder = require('../utils/horizon-chart.builder');

            if (width && height && data.length) {
                new Builder.HorizonChartBuilder(
                    svg,
                    data,
                    {
                        x: (d) => new Date(d[dateColumn ?? 'date']),
                        y: (d) => d[valueColumn ?? 'value'],
                        z: (d) => d[labelColumn ?? 'name'],
                    },
                    options
                );
            }
        },
        [
            data,
            width,
            height,
            dateColumn,
            labelColumn,
            valueColumn,
            scheme,
            schemeReverse,
        ]
    );

    return (
        <svg
            ref={ref}
            style={{
                maxWidth: '100%',
                cursor: 'default',
                fontSize: 8,
            }}
        ></svg>
    );
}

export default HorizonChart;
