import * as D3 from 'd3';

export class HorizonChartBuilder {
    constructor(container, data, mapper, options) {
        this._container = container;
        this._width = options.width;
        this._height = options.height;
        this._curve = options.curve;
        this._padding = options.padding;
        this._bands = options.bands;
        this._scheme = options.scheme;
        this._reverseColor = options.reverseColor ?? false;
        this._marginTop = options.marginTop;
        this._marginBottom = options.marginBottom;
        this._marginLeft = options.marginLeft;
        this._marginRight = options.marginRight;
        this._darkTheme = options.darkTheme ?? false;
        this._neutralValue = options.neutralValue;

        const {
            x = ([x]) => x, // given d in data, returns the (temporal) x-value
            y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
            z = () => 1, // given d in data, returns the (categorical) z-value
        } = mapper;

        const { xType, yType } = options;

        // Compute values.
        this._X = D3.map(data, x);
        this._Y = D3.map(data, y);
        this._Z = D3.map(data, z);

        // for gaps in data
        const defined =
            options.defined ??
            ((d, i) => !isNaN(this._X[i]) && !isNaN(this._Y[i]));

        this._D = D3.map(data, defined);

        if (this._neutralValue !== null) {
            const delta =
                options?.yDomain &&
                Array.isArray(options.yDomain) &&
                options.yDomain.length === 2
                    ? Math.max(
                          Math.abs(this._neutralValue - options.yDomain[0]),
                          Math.abs(this._neutralValue - options.yDomain[1])
                      )
                    : Math.max(
                          Math.abs(this._neutralValue),
                          Math.abs(this._neutralValue - D3.max(this._Y))
                      );

            this._bands *= 2;
            options.yDomain = [
                this._neutralValue - delta,
                this._neutralValue + delta,
            ];
        }

        // Compute default domains, and unique the z-domain.
        const xDomain = options.xDomain ?? D3.extent(this._X);
        const yDomain = options.yDomain ?? [0, D3.max(this._Y)];
        const zDomain = options.zDomain
            ? new D3.InternSet(options.zDomain)
            : new D3.InternSet(this._Z);

        const size =
            (this._height - this._marginTop - this._marginBottom) /
            (zDomain.size ? zDomain.size : 1);
        const xRange = [this._marginLeft, this._width - this._marginRight]; // [left, right]
        const yRange = [size, size - this._bands * (size - this._padding)]; // [bottom, top]

        // Omit any data not present in the z-domain.
        const I = D3.range(this._X.length).filter((i) =>
            zDomain.has(this._Z[i])
        );

        // Construct scales and axes.
        const xScale = xType(xDomain, xRange);
        const yScale = yType(yDomain, yRange);
        const xAxis = D3.axisTop(xScale)
            .ticks(this._width / 80)
            .tickSizeOuter(0);

        let colors = this._reverseColor
            ? [...this._scheme[Math.max(3, this._bands)]].reverse()
            : this._scheme[Math.max(3, this._bands)]; // an array of colors

        // A unique identifier for clip paths (to avoid conflicts).
        const uid = `O-${Math.random().toString(16).slice(2)}`;

        // Construct an area generator.
        const area = D3.area()
            .defined((i) => this._D[i])
            .curve(this._curve)
            .x((i) => xScale(this._X[i]))
            .y0(yScale(this._neutralValue ?? 0))
            .y1((i) => yScale(this._Y[i]));

        this._container
            .attr('width', this._width)
            .attr('height', this._height)
            .attr('viewBox', [0, 0, this._width, this._height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

        const g = this._container
            .selectAll('g')
            .data(D3.group(I, (i) => this._Z[i]))
            .join('g')
            .attr(
                'transform',
                (_, i) => `translate(0,${i * size + this._marginTop})`
            );

        const defs = g.append('defs');

        defs.append('clipPath')
            .attr('id', (_, i) => `${uid}-clip-${i}`)
            .append('rect')
            .attr('y', this._padding)
            .attr('width', this._width)
            .attr('height', size - this._padding);

        defs.append('path')
            .attr('id', (_, i) => `${uid}-path-${i}`)
            .attr('d', ([, I]) => area(I));

        g.attr(
            'clip-path',
            (_, i) => `url(${new URL(`#${uid}-clip-${i}`, window.location)})`
        )
            .selectAll('use')
            .data((d, i) => new Array(this._bands).fill(i))
            .join('use')
            .attr('fill', (_, i) => colors[i + Math.max(0, 3 - this._bands)])
            .attr('transform', (_, i) => `translate(0,${i * size})`)
            .attr(
                'xlink:href',
                (i) => `${new URL(`#${uid}-path-${i}`, window.location)}`
            );

        g.append('text')
            .attr('y', (size + this._padding) / 2)
            .attr('dy', '0.35em')
            .attr('fill', this._darkTheme ? 'white' : 'black')
            .text(([z]) => z);

        // Since there are normally no left or right margins, don’t show ticks that
        // are close to the edge of the chart, as these ticks are likely to be clipped.
        this._container
            .append('g')
            .attr('transform', `translate(0,${this._marginTop})`)
            .call(xAxis)
            .call((g) =>
                g
                    .selectAll('.tick')
                    .filter(
                        (d) => xScale(d) < 10 || xScale(d) > this._width - 10
                    )
                    .remove()
            )
            .call((g) => g.select('.domain').remove());

        return this._container.node();
    }
}
