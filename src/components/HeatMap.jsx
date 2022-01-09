import * as d3 from 'd3';
import { useD3 } from '../hooks/useD3';

const DAY_TO_STR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_TO_STR = [
    '12a',
    '1a',
    '2a',
    '3a',
    '4a',
    '5a',
    '6a',
    '7a',
    '8a',
    '9a',
    '10a',
    '11a',
    '12p',
    '1p',
    '2p',
    '3p',
    '4p',
    '5p',
    '6p',
    '7p',
    '8p',
    '9p',
    '10p',
    '11p',
];

function HeatMap({ data, scheme, cellPad = 1, legendHeight = 10, legendWidth = 421.5 }) {
    const makeColorLegend = (svg, colorScale, ticks, heatmapHeight, heatmapMargin, width) => {
        // Define gradient for rectangle
        svg.append('defs')
            .append('linearGradient')
            .attr('id', 'linear-gradient')
            .selectAll('stop')
            .data(
                colorScale.ticks().map((t, i, n) => ({
                    offset: `${(100 * i) / n.length}%`,
                    color: colorScale(t),
                }))
            )
            .enter()
            .append('stop')
            .attr('offset', (d) => d.offset)
            .attr('stop-color', (d) => d.color);

        // Draw rectangle
        svg.append('g')
            .attr('transform', `translate(${(width - legendWidth) / 2},${heatmapHeight - heatmapMargin.bottom / 2})`)
            .append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .attr('fill', 'url(#linear-gradient)')
            .attr('rx', 2);

        // Create number scale for labels
        var axis_scale = d3.scaleLinear().domain(colorScale.domain()).range([0, legendWidth]);

        // Draw labels
        var formatPercent = d3.format('.0%');

        svg.append('g')
            .attr(
                'transform',
                `translate(${(width - legendWidth) / 2},${heatmapHeight - heatmapMargin.bottom / 2 + legendHeight + 4})`
            )
            .call(
                d3
                    .axisBottom(axis_scale)
                    // .ticks(4)
                    .tickValues(ticks)
                    .tickFormat(formatPercent)
                    .tickSize(0)
            )
            .select('.domain')
            .remove();

        // Draw legend title
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', heatmapHeight - heatmapMargin.bottom / 2 - 7)
            .attr('class', 'legend')
            .text('Percentage of machines in use');
    };

    const makeVerticalScale = (range, vDomain) => {
        return d3.scaleBand().domain(vDomain).range(range).padding(0.05);
    };

    const makeHorizontalScale = (range, hDomain) => {
        return d3.scaleBand().domain(hDomain).range(range).padding(0.05);
    };

    const makeColorScale = (data, columnName, scheme) => {
        var props = data.map((d) => d[columnName]);
        return d3
            .scaleDiverging() // scaleSequential
            .interpolator(scheme)
            .domain([d3.min(props), d3.max(props)]);
    };

    const makeHeatmap = ({
        svg,
        data,
        gridSize,
        valueColumn,
        verticalColumn,
        horizontalColumn,
        vDomain,
        hDomain,
        scheme,
        title,
        subtitle,
    } = {}) => {
        const width = ref.current?.clientWidth ?? 0;
        let heatmapWidth = gridSize * hDomain.length;
        let heatmapMargin = {
            top: 90,
            right: 0,
            bottom: 80,
            left: (width - heatmapWidth) / 2,
        };
        let heatmapHeight = gridSize * vDomain.length + heatmapMargin.top + heatmapMargin.bottom;

        let colorScale = makeColorScale(data, valueColumn, scheme);

        // X axis (hours)
        let x = makeHorizontalScale([heatmapMargin.left, heatmapMargin.left + gridSize * hDomain.length], hDomain);
        svg.append('g')
            .attr('transform', `translate(0,${heatmapMargin.top})`)
            .call(d3.axisTop(x).tickSize(0))
            .select('.domain')
            .remove();

        // Y axis (days)
        let y = makeVerticalScale([heatmapMargin.top, heatmapMargin.top + gridSize * vDomain.length], vDomain);
        svg.append('g')
            .attr('transform', `translate(${heatmapMargin.left},0)`)
            .call(d3.axisLeft(y).tickSize(0))
            .select('.domain')
            .remove();

        // Mouseover
        let tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
        let tooltip_datetime = tooltip.append('p').attr('class', 'bold');
        let tooltip_busy = tooltip.append('p');

        let mouseover = function (event, d) {
            tooltip.style('opacity', 1);
            d3.select(this).style('stroke', '#4D4F53').style('stroke-width', '1.5');
        };
        let mousemove = function (event, d) {
            tooltip.style('top', event.pageY - 28 + 'px');
            if (event.pageX < width / 2) {
                tooltip.style('left', event.pageX + 20 + 'px');
            } else {
                tooltip.style('left', event.pageX - 160 + 'px');
            }
            tooltip_datetime.html(d[verticalColumn] + ', ' + d[horizontalColumn] + 'm');
            tooltip_busy.html("<span class='bold'>" + (d.prop_busy * 100).toFixed(0) + '%</span> of machines in use');
        };
        let mouseleave = function (event, d) {
            tooltip.style('opacity', 0);
            d3.select(this).style('stroke', 'none');
        };

        // Heatmap rectangles
        svg.append('g')
            .selectAll('rect')
            .data(data)
            .join('rect')
            .attr('width', gridSize - cellPad * 2)
            .attr('height', gridSize - cellPad * 2)
            .attr('x', (d) => x(d[horizontalColumn]))
            .attr('y', (d) => y(d[verticalColumn]))
            .attr('fill', (d) => colorScale(d[valueColumn]))
            .attr('class', 'heatmap')
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        // Title
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', heatmapMargin.top / 3)
            .attr('class', 'title')
            .text(title);

        // Subtitle
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', (heatmapMargin.top * 5) / 8)
            .attr('class', 'subtitle')
            .text(subtitle);

        // Color legend: gradient, rect, and labels
        makeColorLegend(svg, colorScale, [0.1, 0.2], heatmapHeight, heatmapMargin, width);
    };

    const ref = useD3((svg) => {
        const colorScheme =
            scheme === 'YlOrBr'
                ? d3.schemeRdYlBu
                : scheme === 'RdBu'
                ? d3.schemeRdBu
                : scheme === 'RdYlBu'
                ? d3.schemeRdYlBu
                : d3.schemeBuPu;
        svg.html('');

        makeHeatmap({
            svg,
            data: require('./untitled.json'),
            gridSize: 33,
            valueColumn: 'prop_busy',
            horizontalColumn: 'hour',
            verticalColumn: 'day',
            vDomain: DAY_TO_STR,
            hDomain: HOUR_TO_STR,
            scheme: d3.interpolateRdBu,
            title: 'Laundry machine usage by day and hour',
            subtitle: 'Averaged over all available residences, 10/19/19-11/22/19',
        });
    }, []);

    return (
        <svg
            ref={ref}
            className="heatmap"
            style={{
                width: '100%',
                cursor: 'default',
                fontSize: 8,
            }}
        ></svg>
    );
}

export default HeatMap;
