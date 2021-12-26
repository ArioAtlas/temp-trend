import { useD3 } from '../hooks/useD3';
import * as D3 from 'd3';
import { HorizonChartBuilder } from '../utils/horizon-chart.builder';

function HorizonChart({ data }) {
    const options = {
        curve: D3.curveLinear, // method of interpolation between points
        marginTop: 20, // top margin, in pixels
        marginRight: 0, // right margin, in pixels
        marginBottom: 0, // bottom margin, in pixels
        marginLeft: 150, // left margin, in pixels
        width: 1024, // outer width, in pixels
        size: 30, // outer height of a single horizon, in pixels
        bands: 3, // number of bands
        padding: 1, // separation between adjacent horizons
        xType: D3.scaleUtc, // type of x-scale
        yType: D3.scaleLinear, // type of y-scale
        scheme: D3.schemeYlOrBr, // color scheme; shorthand for colors
        darkTheme: true,
    };

    const ref = useD3(
        (svg) => {
            new HorizonChartBuilder(
                svg,
                data,
                {
                    x: (d) => new Date(d.date),
                    y: (d) => d.value,
                    z: (d) => d.name,
                },
                options
            );
        },
        [data, options]
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
