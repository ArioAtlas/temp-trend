import { Component } from 'react';
import './styles/app.scss';
import { DataRetrieval } from './repositories/data-retrieval.service';
import Navigator from './components/Navigator';
import Overview from './components/pages/Overview';
import LocationsView from './components/pages/LocationsView';
import YearsView from './components/pages/YearsView';
import MonthsView from './components/pages/MonthsView';

const data = require('./demo3.json');

export class App extends Component {
    constructor() {
        super();
        this.state = {
            page: 'Overview',
            filters: {},
            data: {},
        };
        DataRetrieval.getInstance();
    }

    switchPage(page) {
        this.setState({ page });
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
                {this.renderPage()}
            </div>
        );
    }
}
