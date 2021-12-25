import CSVReader from 'react-csv-reader';

const handleForce = (data, fileInfo) => console.log(data, fileInfo);

const parserOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().replace(/\W/g, '_'),
};

function DataLoader({ label = 'Select a CSV file' }) {
    return (
        <div className="container">
            <CSVReader
                cssClass="react-csv-input"
                label={label}
                onFileLoaded={handleForce}
                parserOptions={parserOptions}
            />
        </div>
    );
}

export default DataLoader;
