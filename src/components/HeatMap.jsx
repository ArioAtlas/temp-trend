import * as d3 from 'd3';
import { useD3 } from '../hooks/useD3';

function HeatMap({
    data,
    scheme,
    width,
    height,
    schemeReverse,
    horizontalColumn,
    verticalColumn,
    valueColumn,
    vDomain,
    hDomain,
    neutralValue,
    cellPad = 1,
    legendHeight = 10,
    legendWidth = 421.5,
    tooltipPostfix = '',
}) {
    const makeColorLegend = (svg, colorScale, ticks, heatmapHeight, heatmapMargin, width) => {
        // Define gradient for rectangle
        svg.append('defs')
            .append('linearGradient')
            .attr('id', 'linear-gradient')
            .selectAll('stop')
            .data(
                colorScale.ticks().map((t, i, n) => ({
                    offset: `${i / n.length}`,
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
        svg.append('g')
            .attr('width', legendWidth)
            .attr(
                'transform',
                `translate(${(width - legendWidth) / 2},${heatmapHeight - heatmapMargin.bottom / 2 + legendHeight + 5})`
            )
            .call(d3.axisBottom(axis_scale).ticks(4).tickSize(0))
            .select('.domain')
            .remove();

        // Draw legend title
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', heatmapHeight - heatmapMargin.bottom / 2 - 7)
            .attr('class', 'legend')
            .text('');
    };

    const makeVerticalScale = (range, vDomain) => {
        return d3.scaleBand().domain(vDomain).range(range).padding(0.05);
    };

    const makeHorizontalScale = (range, hDomain) => {
        return d3.scaleBand().domain(hDomain).range(range).padding(0.05);
    };

    const makeColorScale = (data, columnName, scheme, reverse, baseLine) => {
        var props = data.map((d) => d[columnName]);
        let domain = [d3.min(props), d3.max(props)];

        if (baseLine !== undefined) {
            const delta = Math.max(Math.abs(baseLine - domain[0]), Math.abs(baseLine - domain[1]));
            domain = [baseLine - delta, baseLine + delta];
        }

        return d3
            .scaleSequential()
            .interpolator(scheme)
            .domain(reverse ? domain.reverse() : domain);
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
        width,
        schemeReverse = false,
        neutralValue,
        tooltipPostfix = '',
    } = {}) => {
        width = width ?? ref.current?.clientWidth ?? 0;
        let heatmapWidth = gridSize * hDomain.length;
        let heatmapMargin = {
            top: 90,
            right: 0,
            bottom: 80,
            left: (width - heatmapWidth) / 2,
        };
        let heatmapHeight = gridSize * vDomain.length + heatmapMargin.top + heatmapMargin.bottom;

        // svg.attr('height', heatmapHeight);

        let colorScale = makeColorScale(data, valueColumn, scheme, schemeReverse, neutralValue);

        // X axis
        let x = makeHorizontalScale([heatmapMargin.left, heatmapMargin.left + gridSize * hDomain.length], hDomain);
        const xAxis = svg
            .append('g')
            .attr('transform', `translate(0,${heatmapMargin.top})`)
            .attr('class', 'x-axis')
            .call(d3.axisTop(x).tickSize(0));

        xAxis
            .selectAll('text')
            .attr('y', 0)
            .attr('x', -3 * Math.max(10, gridSize / 5))
            .attr('dy', '.35em')
            .attr('transform', 'rotate(90)')
            .style('font-size', Math.max(10, gridSize / 5))
            .style('text-anchor', 'start');

        xAxis.select('.domain').remove();

        // Y axis
        let y = makeVerticalScale([heatmapMargin.top, heatmapMargin.top + gridSize * vDomain.length], vDomain);
        const yAxis = svg
            .append('g')
            .attr('transform', `translate(${heatmapMargin.left},0)`)
            .call(d3.axisLeft(y).tickSize(0));

        yAxis.style('font-size', Math.max(10, gridSize / 5));

        yAxis.select('.domain').remove();

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
            tooltip_datetime.html(d[verticalColumn] + ', ' + d[horizontalColumn]);
            tooltip_busy.html("<span class='bold'>" + d[valueColumn] + tooltipPostfix + '</span>');
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
        if (title)
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('x', width / 2)
                .attr('y', heatmapMargin.top / 3)
                .attr('class', 'title')
                .text(title);

        // Subtitle
        if (subtitle)
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('x', width / 2)
                .attr('y', (heatmapMargin.top * 5) / 8)
                .attr('class', 'subtitle')
                .text(subtitle);

        // Color legend: gradient, rect, and labels
        makeColorLegend(svg, colorScale, [0.1, 0.2], heatmapHeight, heatmapMargin, width);
    };

    const ref = useD3(
        (svg) => {
            const colorScheme =
                scheme === 'YlOrBr'
                    ? d3.interpolateRdYlBu
                    : scheme === 'RdBu'
                    ? d3.interpolateRdBu
                    : scheme === 'RdYlBu'
                    ? d3.interpolateRdYlBu
                    : d3.interpolateBuPu;
            svg.html('');

            if (!hDomain) {
                hDomain = Array.from(new Set(data.map((v) => v[horizontalColumn])));
            }

            if (!vDomain) {
                vDomain = Array.from(new Set(data.map((v) => v[verticalColumn])));
            }

            const gridSize =
                Math.min(ref.current?.clientWidth - 250 ?? 0, ref.current?.clientHeight - 250 ?? 0) /
                Math.max(12, vDomain.length, hDomain.length);

            makeHeatmap({
                svg,
                data,
                gridSize,
                valueColumn,
                horizontalColumn,
                verticalColumn,
                vDomain,
                hDomain,
                scheme: colorScheme,
                schemeReverse,
                neutralValue,
                tooltipPostfix,
            });
        },
        [data, valueColumn, horizontalColumn, verticalColumn, vDomain, hDomain, tooltipPostfix]
    );

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
