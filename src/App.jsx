import { Component } from 'react';
import './styles/app.scss';
import Navigator from './components/Navigator';
import Overview from './components/pages/Overview';
import LocationsView from './components/pages/LocationsView';
import YearsView from './components/pages/YearsView';
import MonthsView from './components/pages/MonthsView';

export class App extends Component {
    constructor() {
        super();
        this.state = {
            page: 'Overview',
            view: 'Temperature',
            filters: {},
            data: {},
        };
    }

    switchPage(page) {
        this.setState({ page });
    }

    switchView(view) {
        this.setState({ view });
    }

    renderPage() {
        switch (this.state.page) {
            case 'Overview':
                return <Overview />;
            case 'Locations':
                return <LocationsView />;
            case 'Years':
                return <YearsView />;
            case 'Months':
                return <MonthsView />;
            default:
                return;
        }
    }

    render() {
        return (
            <div className="app">
                <div className="navigator">
                    <Navigator
                        pages={['Overview', 'Locations', 'Years', 'Months']}
                        current={this.state.page}
                        onChange={(page) => this.switchPage(page)}
                    />
                </div>
                <div className="sub-navigator">
                    <Navigator
                        pages={['Temperature', 'Observation']}
                        current={this.state.view}
                        onChange={(view) => this.switchView(view)}
                    />
                </div>
                {this.renderPage()}
            </div>
        );
    }
}
