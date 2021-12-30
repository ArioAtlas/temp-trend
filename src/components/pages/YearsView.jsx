import Selector from '../Selector';

function YearsView() {
    return (
        <div className="container">
            <Selector
                position="left"
                values={['Page 1', 'Page 2', 'Page 3']}
                active="Page 2"
            />
            <Selector
                position="right"
                values={['Page 1', 'Page 2', 'Page 3', 'Page 4']}
                active="Page 3"
                onClick={(page) => console.log(page)}
            />
        </div>
    );
}

export default YearsView;
