import RCSlider from 'rc-slider';
import { useState } from 'react';
const Range = RCSlider.createSliderWithTooltip(RCSlider);

function Slider({
    callback,
    min = 0,
    max = 0,
    label = '',
    step = 1,
    trackColor,
}) {
    const [value, setValue] = useState(max);
    return (
        <div className="slider">
            <div className="label">
                <h3>{label}</h3>
                <span>{value}</span>
            </div>
            <Range
                allowCross="false"
                min={min}
                max={max}
                step={step}
                defaultValue={value}
                tipFormatter={(value) => `${value}`}
                onAfterChange={(value) => {
                    setValue(value);
                    if (callback) callback(value);
                }}
                trackStyle={[trackColor ? { backgroundColor: trackColor } : {}]}
            />
        </div>
    );
}

export default Slider;
