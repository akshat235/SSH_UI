import TradingViewWidget from 'react-tradingview-widget';

interface StockchartProps {
  symbol?: string;
  theme?: 'light' | 'dark';  
  locale?: string; 
  autosize?: boolean;  
  className?: string;  
}


const Stockchart: React.FC<StockchartProps> = ({
  symbol = 'AAPL',  //defaults to Apple
  theme = 'light',   
  locale = 'en',     // Default locale is English
  autosize = true,   
  className = '',    
}) => {
  return (
    <div className={`tradingview-chart h-full ${className}`}>
      <TradingViewWidget
        symbol={symbol}
        theme={theme}
        locale={locale}
        autosize={autosize}
      />
    </div>
  );
};

export default Stockchart;
