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
    marginTop = 25,
    marginRight = 0,
    marginBottom = 40,
    marginLeft = 150,
    bands = 3,
    padding = 1,
    darkTheme = true,
    curvature = 'Linear',
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

            const curve =
                curvature === 'Natural'
                    ? D3.curveNatural
                    : curvature === 'Cardinal'
                    ? D3.curveCardinal
                    : curvature === 'Basis'
                    ? D3.curveBasis
                    : D3.curveLinear;
            svg.html('');
            const options = {
                curve, // method of interpolation between points
                marginTop, // top margin, in pixels
                marginRight, // right margin, in pixels
                marginBottom, // bottom margin, in pixels
                marginLeft, // left margin, in pixels
                width, // outer width, in pixels
                height, // outer height, in pixels
                bands, // number of bands
                padding, // separation between adjacent horizons
                darkTheme,
                reverseColor: schemeReverse ?? false,
                yDomain: range,
                neutralValue,
                scheme: colorScheme, // color scheme; shorthand for colors
                xType: D3.scaleUtc, // type of x-scale
                yType: D3.scaleLinear, // type of y-scale
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
        [data, width, height, dateColumn, labelColumn, valueColumn, scheme, schemeReverse]
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
