function Navigator({ pages = [], current = '', onChange = (page) => null }) {
    return (
        <nav>
            <ul>
                {pages.map((p, i) => (
                    <li
                        key={i}
                        className={
                            p.toLowerCase() === current.toLowerCase()
                                ? 'active'
                                : ''
                        }
                        onClick={() => onChange(p)}
                    >
                        {p}
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Navigator;
