import Selector from './components/Selector';
import './styles/app.scss';

function App() {
  return (
    <div className="app">
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
      <Selector
        position="bottom"
        values={['Page 1', 'Page 2', 'Page 3']}
        active="Page 1"
      />
      <Selector
        position="top"
        values={['Page 1', 'Page 2', 'Page 3']}
        active="Page 3"
      />
    </div>
  );
}

export default App;
