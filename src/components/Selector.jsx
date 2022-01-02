import { ReactComponent as Circle } from './icons/circle.svg';

function Selector({ position, values, active, onClick, get }) {
    return (
        <div className={`selector ${position}`}>
            <ul>
                {(Object.keys(values) ?? []).map((id) => (
                    <li
                        key={id}
                        className={id === active ? 'active' : ''}
                        onClick={() => (onClick ? onClick(id) : null)}
                    >
                        <Circle />
                        <span>{get ? get(values[id]) : values[id]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Selector;
