
export interface User {
    id: number;
    username: string;
  }
  
  export type ActionType = 'buy' | 'sell';
  
  export interface Portfolio {
    id: number;
    user_id: number;
    ticker: string;
    quantity: number;
    action: ActionType;
    website: string;
  }
  
  export interface WatchlistItem {
    id: number;
    user_id: number;
    ticker: string;
  }
  
  // Price Alert Interface
  export interface PriceAlert {
    id: number;
    user_id: number;
    ticker: string;
    target_price: number;
  }
  
  export interface Favorite {
    id: number;
    user_id: number;
    ticker: string;
  }
  
  export type OrderStatus = 'pending' | 'completed' | 'cancelled';
  
  export interface ScheduledOrder {
    id: number;
    user_id: number;
    ticker: string;
    quantity: number;
    action: ActionType;
    execution_time: string; 
    status: OrderStatus;
  }
  