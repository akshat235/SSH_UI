import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverBaseURL } from '../../utils';
import { Snackbar, Alert } from '@mui/material';
import Stockchart from '../../components/Stockchart';

const HomePage: FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [favoriteStocks, setFavoriteStocks] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavoriteStocks = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${serverBaseURL}/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching favorite stocks');
        }

        const data = await response.json();
        console.log(data);
        setFavoriteStocks(data);
      } catch (error) {
        console.error('Error fetching favorite stocks:', error);
      }
    };

    fetchFavoriteStocks();
  }, []);


  const fetchMarketSummary = async (): Promise<void> => {
    try {
      const response = await fetch(`${serverBaseURL}/stock/market_summary`);
      const data = await response.json();
      setMarketData(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching market summary:', error);
    }
  };

  if (!marketData) fetchMarketSummary();

  const handleSearch = async (): Promise<void> => {
    if (!searchQuery) return;
    setSearchResults([]);
    try {
      const response = await fetch(`${serverBaseURL}/stock/query_stock?ticker=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Invalid ticker or error fetching stock data');
      }
      const data = await response.json();
      if (!data || !data.symbol) {
        throw new Error('Invalid ticker');
      }
      //
      setSearchHistory([searchQuery, ...searchHistory]);

      setSearchResults([data]);
    } catch (error: any) {
      setSnackbarMessage('Invalid ticker. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleResultClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="relative min-h-screen w-[100vw] mt-16 bg-gray-100 p-4">
      <div className="mb-4 max-w-4xl mx-auto flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter stock ticker (e.g., AAPL)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow border border-gray-300 bg-white text-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button onClick={handleSearch} className='text-white bg-primary hover:outline-none h-10 flex items-center' >Search</button>
      </div>

      {searchHistory.length > 0 ?(
        <ul className="bg-white text-blue-600 shadow-md rounded-md mt-2 max-h-40 overflow-y-auto w-2/3 mx-auto text-center">
          {searchHistory.slice(0,3).map((history, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleResultClick(history)}
            >
              {history}
            </li>
          ))}
        </ul>
      ):(<></>)}

      {searchResults.length > 0 && (
        <ul className="bg-white text-blue-600 shadow-md rounded-md mt-2 max-h-40 overflow-y-auto w-2/3 mx-auto text-center">
          {searchResults.map((result) => (
            <li
              key={result.symbol}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleResultClick(result.symbol)}
            >
              {result.symbol} - {result.longName}
            </li>
          ))}
        </ul>
      )} 


      <div className="max-w-4xl mx-auto mt-12">
        {favoriteStocks.length > 0 && (<>
          <h2 className="text-2xl font-bold text-primary mb-4">Your Favorite Stocks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {favoriteStocks.map((stock) => (
              <div
                key={stock.ticker}
                className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-200 text-center" 
                onClick={() => handleResultClick(stock.ticker)}
              >
                <h3 className="text-lg font-bold text-primary">{stock.ticker}</h3>
                <p className="text-gray-600 text-sm">{stock.longName}</p> 
              </div>
            ))}
          </div></>
        )}
      </div>


      <div className="max-w-6xl mx-auto space-y-4 mt-8 ">
        {marketData ? (
          <>
            {Object.keys(marketData).map((key) => (
              <div key={key} className="bg-white shadow-md rounded-lg p-6 w-full flex flex-wrap lg:flex-nowrap justify-between items-start gap-6 mb-4">
                <div className="w-full lg:w-2/3 space-y-2">
                  <h2 className="text-2xl font-bold text-primary mb-2">{key.toUpperCase()}</h2>
                  <p className="text-gray-600 text-lg">{marketData[key].longName}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700"><strong>Price:</strong> ${marketData[key]?.regularMarketOpen}</p>
                      <p className="text-gray-700"><strong>Day High:</strong> ${marketData[key]?.dayHigh}</p>
                      <p className="text-gray-700"><strong>Day Low:</strong> ${marketData[key]?.dayLow}</p>
                      <p className="text-gray-700"><strong>Bid:</strong> ${marketData[key]?.bid}</p>
                      <p className="text-gray-700"><strong>Ask:</strong> ${marketData[key]?.ask}</p>
                    </div>
                    <div>
                      <p className="text-gray-700"><strong>52-Week High:</strong> ${marketData[key]?.fiftyTwoWeekHigh}</p>
                      <p className="text-gray-700"><strong>52-Week Low:</strong> ${marketData[key]?.fiftyTwoWeekLow}</p>
                      <p className="text-gray-700"><strong>Volume:</strong> {marketData[key]?.volume?.toLocaleString()}</p>
                      <p className="text-gray-700"><strong>Avg Volume (10 Days):</strong> {marketData[key]?.averageVolume10days?.toLocaleString()}</p>
                      <p className="text-gray-700"><strong>50-Day Avg:</strong> ${marketData[key]?.fiftyDayAverage}</p>
                      <p className="text-gray-700"><strong>200-Day Avg:</strong> ${marketData[key]?.twoHundredDayAverage}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 h-[280px]">
                  <Stockchart symbol={key === "dowjones" ? "DJI" : key.toUpperCase()} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <p>Loading market summary...</p>
        )}
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default HomePage;
