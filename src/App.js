import "./styles.css";
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect } from 'react';

function unixTimestampToYYYY_MM_DD(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function getCurrentDateDD_MM_YYYY() {  // not used
	let dateYYYY_MM_DD = new Date(Date.now()).toISOString().slice(0, 10);
  let year = dateYYYY_MM_DD.slice(0, 4);
  let month = dateYYYY_MM_DD.slice(5, 7);
  let day = dateYYYY_MM_DD.slice(8);
  return day + "-" + month + "-" + year 
}

function getCurrentDateYYYY_MM_DD() { // not used
  return new Date(Date.now()).toISOString().slice(0, 10) + "";
}

function subtractDaysFromDate(dateObjVariable, numberOfDays) {
  const dayInMiliseconds = 86400000;
  //const yearInMilliseconds = 31556952000;
  return new Date(dateObjVariable.setTime(dateObjVariable - dayInMiliseconds * numberOfDays));
}

function ChartAppMainComponent() {
  const APIKEY = process.env.REACT_APP_KEY_POLYGONIO_API;
  const [endDatePicker, setEndDatePicker] = useState(unixTimestampToYYYY_MM_DD(subtractDaysFromDate(new Date(), 1).getTime()));
  const [startDatePicker, setStartDatePicker] = useState(unixTimestampToYYYY_MM_DD(subtractDaysFromDate(new Date(), 7).getTime()));
  const [endDateChart, setEndDateChart] = useState(endDatePicker);
  const [startDateChart, setStartDateChart] = useState(startDatePicker);
  const [generateButtonEnabled, setGenerateButtonEnabled] = useState(false);
  const [selectedCryptoCode, setSelectedCryptoCode] = useState("BTC"); // used to compose url to fetch data
  const [selectedCryptoName, setSelectedCryptoName] = useState("Bitcoin");// used to compose url to fetch data
  const [cryptoNameLabel, setCryptoNameLabel] = useState(selectedCryptoName); // used as graph label
  const URL_API_CALL = "https://api.polygon.io/v2/aggs/ticker/X:" + selectedCryptoCode + "USD/range/1/day/" + startDatePicker + "/" + endDatePicker + "?adjusted=true&sort=asc&apiKey=" + APIKEY;
  //const URL_API_CALL_GAINERS_LOSERS = "https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/gainers?apiKey=" + APIKEY;
  const [apiCallAdress, setApiCallAdress] = useState(URL_API_CALL);
  const [apiData, setApiData] = useState(getApiData);
  
  useEffect(() => {
    buildApiCallAdress();
    setGenerateButtonEnabled(true);
  }, [startDatePicker, endDatePicker, URL_API_CALL]);
  
  /*
    useEffect(() => {
      console.log(selectedCryptoCode + "test");
      console.log(selectedCryptoName);
    }, [selectedCryptoCode, selectedCryptoName]);
  */

  function handleDropdownChange(e) {
    setSelectedCryptoCode(e.target.value);
    setSelectedCryptoName(e.target[e.target.selectedIndex].text);
  }

  function buildApiCallAdress() {
    setApiCallAdress(URL_API_CALL);
  }
  
  function compareGeneratedToCurrentDates() {
    if (endDateChart != endDatePicker && startDateChart != startDatePicker) {
      setGenerateButtonEnabled(true);
    } else {
      setGenerateButtonEnabled(false);
    }
  }
  
  async function getApiData() {
    try{
      const response = await fetch(apiCallAdress);
      if (!response.ok) {
          throw new Error("Network response was not OK");
      }
      const responseData = await response.json();
      convertPolygonIoApiResponseDateToYYYYMMDD(responseData.results);
      setApiData(responseData.results);
      setEndDateChart(endDatePicker);
      setStartDateChart(startDatePicker);
      setGenerateButtonEnabled(false);
      setCryptoNameLabel(selectedCryptoName);
      console.log(URL_API_CALL);
    } catch (error) {
      console.error("There has been a problem with your fetch operation:", error);
    }
  }
  // test here
  function convertPolygonIoApiResponseDateToYYYYMMDD(jsonResponse) {
    for (let i = 0; i < jsonResponse.length; ++i) {
      let dateYYYYMMDD = unixTimestampToYYYY_MM_DD(jsonResponse[i].t);
      jsonResponse[i].t = dateYYYYMMDD;
    }
  }

  return(
    <div className="mainContainer">
      <SelectionArea
        getApiData={getApiData}
        chartStartDate={startDatePicker}
        setChartStartDate={setStartDatePicker}
        chartEndDate={endDatePicker}
        setChartEndDate={setEndDatePicker}
        setApiCallAdress={setApiCallAdress}
        apiCallAdress={apiCallAdress}
        generateButtonEnabled={generateButtonEnabled}
        setGenerateButtonEnabled={setGenerateButtonEnabled}
        compareGeneratedToCurrentDates={compareGeneratedToCurrentDates}
        setChartEndDateGenerated={setEndDateChart}
        setChartStartDateGenerated={setStartDateChart}
        selectedCryptoCode={selectedCryptoCode}
        setSelectedCryptoCode={setSelectedCryptoCode}
        selectedCryptoName={selectedCryptoName}
        setSelectedCryptoName={setSelectedCryptoName}
        handleDropdownChange={handleDropdownChange}
      />
      <ChartArea data={apiData} cryptoNameLabel={cryptoNameLabel}/>
      <OthersArea />
    </div>
  );
}

function SelectionArea({ chartStartDate, chartEndDate, setChartStartDate, setChartEndDate, getApiData, generateButtonEnabled, setChartEndDateGenerated, setChartStartDateGenerated, selectedCryptoCode, setSelectedCryptoCode, selectedCryptoName, setSelectedCryptoName, handleDropdownChange }) {
  let disabledButtonClassName = " button-5-disabled";
  let buttonClassNameSuffix = "";

  if (!generateButtonEnabled) {
    buttonClassNameSuffix += disabledButtonClassName;
  }
  
  function generateChart() {
    getApiData();
    setChartEndDateGenerated(chartEndDate);
    setChartStartDateGenerated(chartStartDate);
  } 
  function handleStartDateChange(chartStartDate) {
    let updatedChartStartDate = unixTimestampToYYYY_MM_DD(chartStartDate.getTime());
    setChartStartDate(updatedChartStartDate);
  }

  function handleEndDateChange(chartEndDate) {
    let updatedChartEndDate = unixTimestampToYYYY_MM_DD(chartEndDate.getTime());
    setChartEndDate(updatedChartEndDate);
  }

  return (
    <div id="selectionArea">
        <div id="inputArea">
          <div id="startDateArea">
            {/* <DatePicker selected={chartStartDate} onChange={handleStartDateChange} /> */}
            <DatePicker
              selected={chartStartDate}
              onChange={handleStartDateChange}
              minDate={subtractDaysFromDate(new Date(), 730).getTime()}
              maxDate={subtractDaysFromDate(new Date(), 3).getTime()}
            />
          </div>
          <div id="endDateArea">
            {/* <DatePicker selected={chartEndDate} onChange={handleEndDateChange} /> */}
            <DatePicker
              selected={chartEndDate}
              onChange={handleEndDateChange}
              minDate={subtractDaysFromDate(new Date(), 730).getTime()}
              maxDate={subtractDaysFromDate(new Date(), 1).getTime()}
            />
          </div>
        </div>
        <div id="selection_area_bottom" style={{border: "1px solid red"}}>
          <div id="button"  style={{border: "1px solid red"}}>
            <button onClick={generateChart}  className={"button-5" + buttonClassNameSuffix} role="button">Generate chart</button>
          </div>
          <div id="dropdown">
              <select  onChange={handleDropdownChange}>
                <option value="BTC">Bitcoin</option>
                <option value="ETH">Ethereum</option>
                <option value="BNB">Build and Build</option>
                <option value="SOL">Solana</option>
                <option value="XRP">XRP</option>
                <option value="DOGE">DOGE</option>
                <option value="ADA">Cardano</option>
                <option value="TRX">TRON</option>
                <option value="AVAX">Avalanche</option>
                <option value="SHIBxM">Shiba (in millions)</option>
                <option value="DOT">Polkadot</option>
                <option value="LINK">Chainlink</option>
                <option value="BCH">Bitcon Cash</option>
                <option value="NEAR">Near Protocol</option>
                <option value="LTC">Litecoin</option>
                <option value="MATIC">Polygon</option>
                <option value="UNI">Uniswap</option>
                <option value="FET">Fetch.ai</option>
                <option value="ETC">Ethereum Classic</option>
                <option value="XMR">Monero</option>
              </select>
          </div>
          <div>
          <p>Currency name: {selectedCryptoName} // Currnecy Code: {selectedCryptoCode}</p>
          </div>
        </div>
    </div>
  )
}

function ChartArea({ data, cryptoNameLabel}) {
  return (
    <div id="chartArea">
      <div id="chart">
        <ResponsiveContainer width="100%" height={650}>
          <LineChart width={600} height={600} data={data}>
            <CartesianGrid />
            <XAxis dataKey="t">
              <Label value="Daily values for the selected time interval" offset={0} position="insideBottom" />
            </XAxis>
            <YAxis dataKey="c">
              <Label value={cryptoNameLabel + " value in USD"} offset={0} angle="-90" position="insideLeft" />
            </YAxis>
            <Tooltip />
            <Line type="linear" dataKey="c" stroke="#8884d8" strokeWidth={5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OthersArea() {
  return (
    <div id="othersArea">

    </div>
  )
}

export default function App() {
  return (
    <ChartAppMainComponent />
  );
}
