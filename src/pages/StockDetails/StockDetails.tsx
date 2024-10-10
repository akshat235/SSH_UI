import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Snackbar, Alert, IconButton } from '@mui/material';
import Stockchart from '../../components/Stockchart';
import { serverBaseURL } from '../../utils';
import { Favorite, FavoriteBorder } from '@mui/icons-material';



interface StockData {
    symbol: string;
    longName: string;
    regularMarketOpen: number;
    dayHigh: number;
    dayLow: number;
    bid: number;
    ask: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    volume: number;
    averageVolume10days: number;
    fiftyDayAverage: number;
    twoHundredDayAverage: number;
}

const StockDetailsPage: React.FC = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [executionTime, setExecutionTime] = useState<string>();
    const [token] = useState<string | null>(localStorage.getItem('token'));
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [favorite, setFavorite] = useState<boolean>(false);


    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const response = await fetch(`${serverBaseURL}/stock/query_stock?ticker=${symbol}`);
                if (!response.ok) {
                    throw new Error('Error fetching stock data');
                }
                const data: StockData = await response.json();
                setStockData(data);
            } catch (error: any) {
                setError(error.message || 'Failed to fetch stock data');
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
        console.log(stockData);
    }, [symbol]);

    const toggleFavorite = async () => {
        if (!token) {
            setSnackbarMessage("Please log in to mark as favorite.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        try {
            const response = await fetch(`${serverBaseURL}/favorite_stock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticker: symbol }),
            });

            if (!response.ok) {
                throw new Error('Error marking stock as favorite');
            }

            setFavorite(!favorite); // Toggle favorite state
            setSnackbarMessage(favorite ? 'Removed from favorites' : 'Added to favorites');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to mark as favorite');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleBuyStock = async () => {
        if (!token) {
            setSnackbarMessage("Please log in to buy stock.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        try {
            const response = await fetch(`${serverBaseURL}/stock/buy_stock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticker: symbol, quantity }),
            });
            if (!response.ok) {
                throw new Error('Error buying stock');
            }
            const data = await response.json();
            setSnackbarMessage(`Stock purchased successfully: ${data.message || 'Success'}`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to buy stock');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleScheduleOrder = async () => {
        if (!token) {
            setSnackbarMessage("Please log in to schedule an order.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (!executionTime) {
            setSnackbarMessage('Please set an execution time.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const selectedTime = new Date(executionTime);
        const currentTime = new Date();
        if (selectedTime <= currentTime) {
            setSnackbarMessage('Execution time cannot be in the past.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const formattedExecutionTime = executionTime.replace('T', ' ') + ':00'; // Adding seconds

        try {
            const response = await fetch(`${serverBaseURL}/portfolio/schedule_order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticker: symbol, quantity, action: 'buy', execution_time: formattedExecutionTime }),
            });
            if (!response.ok) {
                throw new Error('Error scheduling order');
            }
            const data = await response.json();
            setSnackbarMessage(`Order scheduled successfully: ${data.message || 'Success'}`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to schedule order');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };


    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    const handleSnackbarClose = () => setSnackbarOpen(false);

    if (loading) { return <div>Loading stock details...</div>; }
    if (error) { return <div>{error}</div>; }
    if (!stockData) { return <div>No stock data available</div>; }
    console.log(stockData);

    return (
        <div className="w-[100vw] p-8 mx-auto space-y-4 mt-8">
            <h1 className="text-3xl font-bold text-primary mb-4">{stockData.longName} ({stockData.symbol})</h1>

            <div className="flex flex-wrap lg:flex-nowrap gap-4">
                <div className="w-full lg:w-[70%] bg-white shadow-md rounded-lg p-6 h-[70vh]">
                    <Stockchart symbol={stockData.symbol} />
                </div>

                <div className="w-full lg:w-[30%] flex flex-col space-y-4">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Stock Details</h2>
                        <p className="text-gray-700"><strong>Price:</strong> ${stockData.regularMarketOpen}</p>
                        <p className="text-gray-700"><strong>Day High:</strong> ${stockData.dayHigh}</p>
                        <p className="text-gray-700"><strong>Day Low:</strong> ${stockData.dayLow}</p>
                        <p className="text-gray-700"><strong>Bid:</strong> ${stockData.bid}</p>
                        <p className="text-gray-700"><strong>Ask:</strong> ${stockData.ask}</p>
                        <p className="text-gray-700"><strong>52-Week High:</strong> ${stockData.fiftyTwoWeekHigh}</p>
                        <p className="text-gray-700"><strong>52-Week Low:</strong> ${stockData.fiftyTwoWeekLow}</p>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Buy or Schedule Stock</h2>

                        <div className="flex items-center space-x-2 mb-4 ml-2">
                            <button className="px-2 py-1 bg-gray-300 rounded" onClick={decrementQuantity}> - </button>
                            <span className="text-lg font-semibold">{quantity}</span>
                            <button className="px-2 py-1 bg-gray-300 rounded" onClick={incrementQuantity}> + </button>

                            <IconButton onClick={toggleFavorite} aria-label="favorite" color={favorite ? 'error' : 'default'}>
                                {favorite ? <Favorite /> : <FavoriteBorder />}
                            </IconButton> </div>
                        <div className="mb-4">
                            <label className="text-gray-700 font-bold mr-2">Execution Time:</label>
                            <input type="datetime-local" value={executionTime} onChange={(e) => setExecutionTime(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 w-full bg-secondary text-black" />
                        </div>


                        <button className="mt-2 w-full bg-primary text-white py-2 rounded hover:bg-primary-dark" onClick={handleBuyStock}>Buy Now</button>
                        <button className="mt-2 w-full bg-primary text-white py-2 rounded hover:bg-secondary hover:border-none" onClick={handleScheduleOrder}>Schedule Order</button>
                    </div>
                </div>
            </div>

            <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar>
        </div>
    );
};

export default StockDetailsPage;
