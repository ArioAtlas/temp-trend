import { ReactComponent as Circle } from './icons/circle.svg';

function Selector({ position, values, active, onClick }) {
  return (
    <div className={`selector ${position}`}>
      <ul>
        {(values ?? []).map((item) => (
          <li
            key={item}
            className={item === active ? 'active' : ''}
            onClick={() => (onClick ? onClick(item) : null)}
          >
            <Circle />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Selector;
