import Slider from 'rc-slider';
import { useState } from 'react';
const Range = Slider.createSliderWithTooltip(Slider.Range);

function RangeSlider({
    callback,
    min = 0,
    max = 0,
    label = '',
    step = 1,
    trackColor,
}) {
    const [range, setRange] = useState([min, max]);
    return (
        <div className="slider">
            <div className="label">
                <h3>{label}</h3>
                <span>
                    {range[0]} - {range[1]}
                </span>
            </div>
            <Range
                allowCross="false"
                min={min}
                max={max}
                step={step}
                defaultValue={range}
                tipFormatter={(value) => `${value}`}
                onAfterChange={(value) => {
                    setRange(value);
                    if (callback) callback(value);
                }}
                trackStyle={[trackColor ? { backgroundColor: trackColor } : {}]}
            />
        </div>
    );
}

export default RangeSlider;
