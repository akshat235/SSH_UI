import React, { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Snackbar, Alert } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import ExpandMoreIcon
import { Portfolio, ScheduledOrder } from '../../datatypes';
import { serverBaseURL } from '../../utils';

const PortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [scheduledOrders, setScheduledOrders] = useState<ScheduledOrder[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Portfolio[]>([]);
  const [stats, setStats] = useState<{ total_invested?: number; current_value?: number; profit_loss?: number }>({});
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [token] = useState<string | null>(localStorage.getItem('token'));
  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({});
  const [sellClicked, setSellClicked] = useState<Record<string, boolean>>({});
  const [executionTimes, setExecutionTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      fetchPortfolio();
      fetchScheduledOrders();
      fetchTransactionHistory();
      fetchPortfolioStats();
    }
  }, [token]);

  const handleSellClick = (ticker: string) => {
    const isClicked = !sellClicked[ticker];
    setSellClicked((prev) => ({ ...prev, [ticker]: isClicked }));
    if (isClicked && sellQuantities[ticker] === undefined) {
      setSellQuantities((prevQuantities) => ({ ...prevQuantities, [ticker]: 1 }));
    }
  };

  const incrementQuantity = (ticker: string) => {
    setSellQuantities((prev) => {
      const currentQuantity = prev[ticker] || 1;
      const holding = groupedPortfolio.find((entry) => entry.ticker === ticker)?.quantity || 0;
      return {
        ...prev,
        [ticker]: Math.min(currentQuantity + 1, holding),
      };
    });
  };

  const decrementQuantity = (ticker: string) => {
    setSellQuantities((prev) => {
      const currentQuantity = prev[ticker] || 1;
      return {
        ...prev,
        [ticker]: Math.max(currentQuantity - 1, 1),
      };
    });
  };

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`${serverBaseURL}/portfolio/portfolio`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      const data: Portfolio[] = await response.json();
      setPortfolio(data);
    } catch {
      handleSnackbar('Failed to load portfolio', 'error');
    }
  };

  const fetchScheduledOrders = async () => {
    try {
      const response = await fetch(`${serverBaseURL}/portfolio/scheduled_orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch scheduled orders');
      const data: ScheduledOrder[] = await response.json();
      setScheduledOrders(data);
    } catch {
      handleSnackbar('Failed to load scheduled orders', 'error');
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch(`${serverBaseURL}/portfolio/transaction_history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch transaction history');
      const data: Portfolio[] = await response.json();
      setTransactionHistory(data);
    } catch {
      handleSnackbar('Failed to load transaction history', 'error');
    }
  };

  const fetchPortfolioStats = async () => {
    try {
      const response = await fetch(`${serverBaseURL}/portfolio/portfolio_stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch portfolio stats');
      const data = await response.json();
      setStats(data);
    } catch {
      handleSnackbar('Failed to load portfolio stats', 'error');
    }
  };

  const groupPortfolioByTicker = (portfolio: Portfolio[]): Portfolio[] => {
    const grouped = portfolio.reduce((acc, entry) => {
      const quantity = entry.action === 'sell' ? -entry.quantity : entry.quantity;
      if (acc[entry.ticker]) {
        acc[entry.ticker].quantity += quantity;
      } else {
        acc[entry.ticker] = { ...entry, quantity };
      }
      return acc;
    }, {} as Record<string, Portfolio>);
    return Object.values(grouped).filter((entry) => entry.quantity > 0);
  };

  const handleSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSellNow = async (ticker: string) => {
    const quantityToSell = sellQuantities[ticker];
    const holding = groupedPortfolio.find((entry) => entry.ticker === ticker)?.quantity || 0;

    if (!token) {
      handleSnackbar("Please log in to sell stock.", 'error');
      return;
    }

    if (!quantityToSell || quantityToSell <= 0) {
      handleSnackbar("Please enter a valid quantity.", 'error');
      return;
    }

    if (quantityToSell > holding) {
      handleSnackbar(`You cannot sell more shares than you own (${holding}).`, 'error');
      return;
    }

    try {
      const response = await fetch(`${serverBaseURL}/stock/sell_stock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker, quantity: quantityToSell }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error selling stock');
      }

      const data = await response.json();
      handleSnackbar(`Stock sold successfully: ${data.message || 'Success'}`, 'success');

      fetchPortfolio();
      fetchScheduledOrders();
      fetchTransactionHistory();
    } catch (error: any) {
      handleSnackbar(error.message || 'Failed to sell stock', 'error');
    }
  };

  const handleScheduleSell = async (ticker: string) => {
    const quantityToSell = sellQuantities[ticker];
    const executionTime = executionTimes[ticker];

    if (!token) {
      handleSnackbar("Please log in to schedule an order.", 'error');
      return;
    }
    if (!executionTime) {
      handleSnackbar('Please set an execution time.', 'error');
      return;
    }
    const selectedTime = new Date(executionTime);
    if (selectedTime <= new Date()) {
      handleSnackbar('Execution time cannot be in the past.', 'error');
      return;
    }
    const formattedExecutionTime = executionTime.replace('T', ' ') + ':00';

    try {
      const response = await fetch(`${serverBaseURL}/portfolio/schedule_order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker, quantity: quantityToSell, action: 'sell', execution_time: formattedExecutionTime }),
      });
      if (!response.ok) throw new Error('Error scheduling sell order');
      const data = await response.json();
      handleSnackbar(`Sell order scheduled successfully: ${data.message || 'Success'}`, 'success');
      setExecutionTimes((prev) => ({ ...prev, [ticker]: '' }));
      fetchScheduledOrders();
    } catch (error: any) {
      handleSnackbar(error.message || 'Failed to schedule sell order', 'error');
    }
  };

  const groupedPortfolio = groupPortfolioByTicker(portfolio);

  return (
    <div className='w-[100vw] bg-secondary'>
      <div className="w-full mx-auto p-6 space-y-8 mt-16">
        <h1 className="text-3xl font-bold text-primary my-4">Portfolio Overview</h1>

        {/* <div className="bg-white shadow-md rounded-lg p-4 space-y-2 w-80">
          <h2 className="text-2xl font-semibold">Portfolio Stats</h2>
          <div className="flex justify-between">
            <p><strong>Total Invested:</strong> ${stats.total_invested?.toFixed(2)}</p>
             <p><strong>Current Value:</strong> ${stats.current_value?.toFixed(2)}</p>
            <p><strong>Profit/Loss:</strong> ${stats.profit_loss?.toFixed(2)}</p> 
          </div>
        </div> */}

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h2 className="text-xl font-bold rounded-md">Current Holdings</h2>
          </AccordionSummary>
          <AccordionDetails>
            {groupedPortfolio.length > 0 ? (
              groupedPortfolio.map((entry) => (
                <div key={entry.ticker} className="flex flex-col space-y-4 p-4 py-3 bg-gray-100 shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p><strong>{entry.ticker}</strong></p>
                      <p className="text-sm text-gray-600">{entry.quantity} shares</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                        onClick={() => handleSellClick(entry.ticker)}
                      >
                        {sellClicked[entry.ticker] ? 'Cancel' : 'Sell'}
                      </button>
                    </div>
                  </div>

                  {sellClicked[entry.ticker] && (
                    <div className="mt-4 flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-2 py-1 bg-gray-300 rounded"
                          onClick={() => decrementQuantity(entry.ticker)}
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold">{sellQuantities[entry.ticker]}</span>
                        <button
                          className="px-2 py-1 bg-gray-300 rounded"
                          onClick={() => incrementQuantity(entry.ticker)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="mt-2 px-3 py-2 bg-primary text-white rounded hover:bg-primary-dark w-36" // Reduced width
                        onClick={() => handleSellNow(entry.ticker)}
                      >
                        Confirm Sell
                      </button>
                      <div className="flex items-center space-x-2">
                        <label htmlFor={`execution-time-${entry.ticker}`}>Execution Time:</label>
                        <input
                          type="datetime-local"
                          id={`execution-time-${entry.ticker}`}
                          name={`execution-time-${entry.ticker}`}
                          value={executionTimes[entry.ticker] || ''}
                          onChange={(e) => setExecutionTimes((prev) => ({ ...prev, [entry.ticker]: e.target.value }))}
                          className="border rounded px-2 py-1 bg-secondary"
                        />
                        <button
                          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                          onClick={() => handleScheduleSell(entry.ticker)}
                        >
                          Schedule Sell
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No holdings available.</p>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h2 className="text-xl font-bold">Scheduled Orders</h2>
          </AccordionSummary>
          <AccordionDetails>
            {scheduledOrders.length > 0 ? scheduledOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center py-2">
                <div>
                  <p><strong>{order.ticker}</strong></p>
                  <p className="text-sm text-gray-600">Scheduled to {order.action} {order.quantity} shares</p>
                </div>
                <div className='mr-12 ml-4 pl-4 w-80'>
                  <p className="text-sm text-gray-600"><strong>Execution Time:</strong> {new Date(order.execution_time).toLocaleString()}</p>
                  <p className="text-sm text-gray-600"><strong>Status:</strong> {order.status.toUpperCase()}</p>
                </div>
              </div>
            )) : <p>No scheduled orders available.</p>}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h2 className="text-xl font-bold">Transaction History</h2>
          </AccordionSummary>
          <AccordionDetails>
            {transactionHistory.length > 0 ? transactionHistory.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center py-2">
                <div>
                  <p><strong>{entry.ticker}</strong></p>
                  <p className="text-sm text-gray-600">{entry.action === 'buy' ? 'Bought' : 'Sold'}: {entry.quantity} shares</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600"><strong>Action:</strong> {entry.action.toUpperCase()}</p>
                </div>
              </div>
            )) : <p>No transactions available.</p>}
          </AccordionDetails>
        </Accordion>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default PortfolioPage;
