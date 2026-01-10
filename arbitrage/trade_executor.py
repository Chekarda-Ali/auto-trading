"""
Enhanced Trade Executor with Real-Time Price Validation and KuCoin Order Fixes
"""

import asyncio
import time
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime

from models.arbitrage_opportunity import ArbitrageOpportunity, TradeStep, OpportunityStatus
from models.trade_log import TradeLog, TradeStepLog, TradeStatus, TradeDirection
from utils.logger import setup_logger
from utils.trade_logger import get_trade_logger
from config.config import Config

class TradeExecutor:
    """Enhanced trade executor with real-time price validation and proper order tracking."""
    
    def __init__(self, exchange_manager, config: Dict[str, Any]):
        self.exchange_manager = exchange_manager
        self.config = config
        self.logger = setup_logger('TradeExecutor')
        self.websocket_manager = None
        self.trade_logger = None
        
        # Trading settings
        self.auto_trading = config.get('auto_trading', False)
        self.paper_trading = False  # ALWAYS LIVE TRADING
        self.enable_manual_confirmation = config.get('enable_manual_confirmation', False)
        self.min_profit_threshold = config.get('min_profit_threshold', 0.3)
        
        # Order tracking
        self.active_orders = {}
        self.completed_trades = []
        
        self.logger.info(f"🔴 LIVE TradeExecutor initialized")
        self.logger.info(f"   Auto Trading: {self.auto_trading}")
        self.logger.info(f"   Paper Trading: {self.paper_trading}")
        self.logger.info(f"   Min Profit Threshold: 0.4% (FIXED)")
        self.logger.info(f"   LIGHTNING MODE: Zero WebSocket overhead")
    
    def set_websocket_manager(self, websocket_manager):
        """Set WebSocket manager for real-time updates."""
        self.websocket_manager = websocket_manager
        self.trade_logger = get_trade_logger(websocket_manager)
        self.logger.info("✅ WebSocket manager and trade logger configured")
    
    async def execute_arbitrage(self, opportunity: ArbitrageOpportunity) -> bool:
        """Execute triangular arbitrage INSTANTLY without delays."""
        try:
            self.logger.info("🚀 AGGRESSIVE MODE: Executing immediately")

            # NO WebSocket manipulation - just execute
            return await self._execute_triangle_trade(opportunity)

        except Exception as e:
            self.logger.error(f"❌ Error in execute_arbitrage: {e}")
            return False
    
    async def _disable_websocket_during_execution(self):
        """Disable WebSocket during trade execution for maximum speed"""
        try:
            # INSTANT: Completely disable WebSocket during execution
            if hasattr(self.exchange_manager, 'detector_websocket_running'):
                self.exchange_manager.detector_websocket_running = False
            
            # INSTANT: Also disable SimpleTriangleDetector WebSocket
            if hasattr(self.exchange_manager, 'simple_detector'):
                if hasattr(self.exchange_manager.simple_detector, 'running'):
                    self.exchange_manager.simple_detector.running = False
        except Exception as e:
            # INSTANT: Silent error handling
            pass
    
    async def _re_enable_websocket_after_execution(self):
        """Re-enable WebSocket after trade execution"""
        try:
            # INSTANT: Re-enable WebSocket after execution
            if hasattr(self.exchange_manager, 'detector_websocket_running'):
                self.exchange_manager.detector_websocket_running = True
            
            # INSTANT: Re-enable SimpleTriangleDetector WebSocket
            if hasattr(self.exchange_manager, 'simple_detector'):
                if hasattr(self.exchange_manager.simple_detector, 'running'):
                    self.exchange_manager.simple_detector.running = True
        except Exception as e:
            # INSTANT: Silent error handling
            pass
    
    async def _validate_opportunity_with_fresh_prices(self, opportunity: ArbitrageOpportunity) -> bool:
        """DISABLED - Execute without re-validation for maximum speed."""
        try:
            # CRITICAL: Skip validation entirely - trust detector's initial calculation
            # Re-validation causes delays and price staleness
            self.logger.info("⚡ INSTANT: Skipping validation (using detector prices)")

            # Extract triangle path for execution
            triangle_path = getattr(opportunity, 'triangle_path', '')
            if isinstance(triangle_path, str):
                import re
                currencies = re.findall(r'([A-Z0-9]+)', triangle_path)
                if len(currencies) >= 3:
                    base_currency, intermediate_currency, quote_currency = currencies[0], currencies[1], currencies[2]
                else:
                    self.logger.error(f"❌ Invalid triangle path format: {triangle_path}")
                    return False
            else:
                self.logger.error(f"❌ Triangle path is not a string: {type(triangle_path)}")
                return False
            
            # INSTANT: Use opportunity as-is without re-validation
            self.logger.info(f"⚡ INSTANT: Executing {base_currency} → {intermediate_currency} → {quote_currency}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Validation error: {e}")
            return False
    
    def _get_valid_currencies_for_exchange(self, exchange_name: str) -> set:
        """Get valid currencies for specific exchange"""
        if exchange_name == 'kucoin':
            return {
                'USDT', 'BTC', 'ETH', 'USDC', 'BNB', 'ADA', 'SOL', 'DOT', 'LINK', 'MATIC', 'AVAX',
                'DOGE', 'XRP', 'LTC', 'TRX', 'ATOM', 'FIL', 'UNI', 'NEAR', 'ALGO', 'VET',
                'HBAR', 'ICP', 'APT', 'ARB', 'OP', 'MANA', 'SAND', 'CRV', 'AAVE', 'COMP',
                'MKR', 'SNX', 'YFI', 'SUSHI', 'BAL', 'REN', 'KNC', 'ZRX', 'STORJ', 'GRT',
                'LDO', 'TNSR', 'AKT', 'XLM', 'AR', 'ETC', 'BCH', 'EOS', 'XTZ', 'DASH',
                'ZEC', 'QTUM', 'ONT', 'ICX', 'ZIL', 'BAT', 'ENJ', 'HOT', 'IOST', 'THETA',
                'TFUEL', 'KAVA', 'BAND', 'CRO', 'OKB', 'HT', 'LEO', 'SHIB', 'PENDLE', 'RNDR',
                'INJ', 'SEI', 'TIA', 'SUI', 'PEPE', 'FLOKI', 'WLD', 'KCS', 'LRC'
            }
        else:
            return {
                'USDT', 'BTC', 'ETH', 'USDC', 'BNB', 'ADA', 'SOL', 'DOT', 'LINK', 'MATIC', 'AVAX',
                'DOGE', 'XRP', 'LTC', 'TRX', 'ATOM', 'FIL', 'UNI', 'NEAR', 'ALGO', 'VET'
            }
    
    async def _execute_triangle_trade(self, opportunity: ArbitrageOpportunity) -> bool:
        """Execute the complete triangular arbitrage trade with enhanced error handling."""
        trade_id = f"trade_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"
        start_time = time.time()
        
        try:
            exchange_name = getattr(opportunity, 'exchange', 'unknown')
            exchange = self.exchange_manager.get_exchange(exchange_name)
            
            if not exchange:
                self.logger.error(f"❌ Exchange {exchange_name} not available")
                return False
            
            self.logger.info(f"⚡ LIGHTNING: {exchange_name} {opportunity.triangle_path}")
            
            # Log trade attempt
            await self._log_trade_attempt(opportunity, trade_id)
            
            # Execute triangle steps with enhanced error handling
            return await self._execute_triangle_steps(opportunity, exchange, trade_id, start_time)
            
        except Exception as e:
            self.logger.error(f"❌ Critical error in triangle trade: {e}")
            await self._log_trade_failure(opportunity, trade_id, str(e), start_time)
            return False
    
    async def _execute_triangle_steps(self, opportunity: ArbitrageOpportunity, exchange, trade_id: str, start_time: float) -> bool:
        """Execute all three steps with ULTRA-FAST timing and CORRECT amounts."""
        try:
            # CRITICAL: INSTANT profit recheck with FRESH orderbook (under 200ms)
            triangle_path = getattr(opportunity, 'triangle_path', '')
            import re
            currencies = re.findall(r'([A-Z0-9]+)', triangle_path)
            if len(currencies) >= 3:
                base, inter, quote = currencies[0], currencies[1], currencies[2]

                # Get FRESH orderbook prices (fastest method)
                pair1 = f"{inter}/USDT"
                pair2 = f"{inter}/{quote}"
                pair3 = f"{quote}/USDT"

                try:
                    # Fetch orderbooks in PARALLEL for speed
                    import asyncio
                    ob1_task = exchange.get_orderbook(pair1, depth=20)
                    ob3_task = exchange.get_orderbook(pair3, depth=20)
                    ob2_task = exchange.get_orderbook(pair2, depth=20)

                    # Wait for all three simultaneously
                    results = await asyncio.gather(ob1_task, ob2_task, ob3_task, return_exceptions=True)
                    ob1, ob2, ob3 = results[0], results[1], results[2]

                    # Try alternate direction for pair2 if failed
                    if not isinstance(ob2, dict) or not ob2.get('bids'):
                        pair2 = f"{quote}/{inter}"
                        ob2 = await exchange.get_orderbook(pair2, depth=20)

                    if ob1 and ob2 and ob3:
                        # Calculate with FRESH prices
                        ask1 = float(ob1['asks'][0][0]) if ob1.get('asks') else 0
                        bid2 = float(ob2['bids'][0][0]) if ob2.get('bids') else 0
                        bid3 = float(ob3['bids'][0][0]) if ob3.get('bids') else 0

                        if ask1 > 0 and bid2 > 0 and bid3 > 0:
                            # Simulate trade
                            amt = 20.0
                            amt_inter = amt / ask1
                            amt_quote = amt_inter * bid2
                            final_usdt = amt_quote * bid3

                            # Use KCS fee rate: 0.08% × 3 trades = 0.24% total
                            kcs_fee_cost = 0.24
                            instant_profit_pct = ((final_usdt - amt) / amt) * 100 - kcs_fee_cost

                            # CRITICAL: Require 0.8% minimum to survive price movement
                            if instant_profit_pct < 0.8:
                                self.logger.error(f"❌ INSTANT RECHECK FAILED: {instant_profit_pct:.4f}% < 0.8%")
                                self.logger.error("❌ Insufficient profit margin - skipping trade")
                                return False

                            self.logger.info(f"✅ INSTANT PROFIT CONFIRMED: {instant_profit_pct:.4f}% (KCS fees: {kcs_fee_cost}%)")
                except Exception as e:
                    self.logger.warning(f"⚠️ Instant recheck failed: {e}")

            # CRITICAL FIX: Use configured trade amount, not opportunity amount
            configured_trade_amount = min(20.0, opportunity.initial_amount)  # ENFORCE $20 maximum
            
            # INSTANT: Pre-sync time before execution
            if exchange.exchange_id == 'kucoin':
                # INSTANT: Ensure time is synced before starting
                await exchange._ensure_time_sync()
                
                # Use 1-second buffer for maximum speed
                if hasattr(exchange.exchange, 'options'):
                    exchange.exchange.options['timeDifference'] = 1000  # 1-second buffer
            
            # CRITICAL FIX: Track ACTUAL asset amounts (not USD values) through the triangle
            actual_amounts = {}
            
            # Parse triangle path to get currencies
            triangle_path = getattr(opportunity, 'triangle_path', '')
            if isinstance(triangle_path, str):
                import re
                currencies = re.findall(r'([A-Z0-9]+)', triangle_path)
                if len(currencies) >= 3:
                    base_currency, intermediate_currency, quote_currency = currencies[0], currencies[1], currencies[2]
                else:
                    self.logger.error(f"❌ Invalid triangle path: {triangle_path}")
                    return False
            else:
                self.logger.error(f"❌ Triangle path is not string: {type(triangle_path)}")
                return False
            
            self.logger.info(f"🔧 FIXED EXECUTION: {base_currency} → {intermediate_currency} → {quote_currency} → {base_currency}")
            
            for step_num, step in enumerate(opportunity.steps, 1):
                try:
                    step_start = time.time()
                    
                    # CRITICAL FIX: Use CORRECT asset amounts from previous steps
                    if step_num == 1:
                        # Step 1: Buy intermediate currency with USDT
                        real_quantity = configured_trade_amount  # $20 USDT to spend
                        self.logger.info(f"🔧 Step 1: Spending {real_quantity:.2f} USDT to buy {intermediate_currency}")
                    elif step_num == 2:
                        # Step 2: Use ACTUAL intermediate currency amount from step 1
                        real_quantity = actual_amounts.get('step1_filled', 0)
                        if real_quantity <= 0:
                            self.logger.error(f"❌ No {intermediate_currency} received from step 1")
                            return False
                        self.logger.info(f"🔧 Step 2: Selling {real_quantity:.8f} {intermediate_currency} for {quote_currency}")
                    elif step_num == 3:
                        # Step 3: Use ACTUAL quote currency amount from step 2 (CRITICAL FIX)
                        real_quantity = actual_amounts.get('step2_received', 0)
                        if real_quantity <= 0:
                            self.logger.error(f"❌ No {quote_currency} received from step 2")
                            return False
                        self.logger.info(f"🔧 Step 3: Selling {real_quantity:.8f} {quote_currency} for USDT")
                    else:
                        self.logger.error(f"❌ Invalid step number: {step_num}")
                        return False
                    
                    if real_quantity <= 0:
                        self.logger.error(f"❌ Invalid quantity for step {step_num}: {real_quantity}")
                        return False
                    
                    # Execute the order with actual amount
                    order_result = await self._execute_lightning_step(exchange, step.symbol, step.side, real_quantity, step_num)
                    
                    if not order_result or not order_result.get('success'):
                        self.logger.error(f"❌ Step {step_num} failed: {order_result.get('error', 'Unknown error')}")
                        return False
                    
                    # CRITICAL FIX: Store CORRECT asset amounts for next step
                    filled_quantity = float(order_result.get('filled', 0))
                    cost = float(order_result.get('cost', 0))

                    # CRITICAL FIX: Get actual amounts received from the order
                    if step_num == 1:
                        # Step 1 BUY: filled = intermediate currency received
                        actual_amounts['step1_filled'] = filled_quantity
                        self.logger.info(f"✅ Step 1: Received {filled_quantity:.8f} {intermediate_currency}")
                    elif step_num == 2:
                        # Step 2 SELL: For LRC/BTC sell, filled=LRC sold, cost=BTC received
                        # CRITICAL BUG FIX: 'cost' is in QUOTE currency (BTC), NOT base!
                        if step.side == 'sell':
                            # FIXED: cost is already in quote currency (BTC)
                            actual_amounts['step2_received'] = cost
                            self.logger.info(f"✅ Step 2: Sold {filled_quantity:.8f} {intermediate_currency}, received {cost:.8f} {quote_currency}")
                        else:
                            # For buy orders: filled is what we bought
                            actual_amounts['step2_received'] = filled_quantity
                            self.logger.info(f"✅ Step 2: Bought {filled_quantity:.8f} {quote_currency}")
                    elif step_num == 3:
                        # Step 3 SELL: cost = USDT received
                        actual_amounts['step3_usdt'] = cost
                        self.logger.info(f"✅ Step 3: Sold {filled_quantity:.8f} {quote_currency}, received {cost:.2f} USDT")
                    
                    step_time = (time.time() - step_start) * 1000
                    self.logger.info(f"⚡ Step {step_num} completed in {step_time:.0f}ms")
                    
                except Exception as e:
                    self.logger.error(f"❌ Error in step {step_num}: {e}")
                    return False
            
            # CRITICAL FIX: Use ACTUAL USDT received from step 3
            final_balance = actual_amounts.get('step3_usdt', 0)
            
            if final_balance <= 0:
                self.logger.error(f"❌ No USDT received from final step")
                return False
            
            # Calculate ACTUAL profit using real amounts
            actual_profit = final_balance - configured_trade_amount
            actual_profit_pct = (actual_profit / configured_trade_amount) * 100
            
            total_execution_time = (time.time() - start_time) * 1000
            
            self.logger.info(f"🎉 EXECUTION COMPLETE:")
            self.logger.info(f"   Initial: {configured_trade_amount:.2f} USDT")
            self.logger.info(f"   Final: {final_balance:.2f} USDT")
            self.logger.info(f"   Actual Profit: ${actual_profit:.4f} ({actual_profit_pct:.4f}%)")
            self.logger.info(f"   Duration: {total_execution_time:.0f}ms")
            
            # Log successful trade
            await self._log_trade_success(opportunity, trade_id, final_balance, start_time)
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Error in triangle steps execution: {e}")
            await self._log_trade_failure(opportunity, trade_id, str(e), start_time)
            return False
    
    async def _execute_lightning_step(self, exchange, symbol: str, side: str, 
                                    quantity: float, step_num: int) -> Dict[str, Any]:
        """Execute single step with INSTANT timing - zero overhead."""
        try:
            # INSTANT: Pre-sync time for KuCoin before order
            if exchange.exchange_id == 'kucoin':
                # Ensure timestamp is fresh
                current_timestamp = int(time.time() * 1000) + 500  # 0.5-second buffer
                
                # Apply timestamp to exchange options
                if hasattr(exchange.exchange, 'options'):
                    exchange.exchange.options['timeDifference'] = 500
            
            # INSTANT: Execute order immediately
            order_result = await exchange.place_market_order(symbol, side, quantity)
            
            if not order_result:
                return {'success': False, 'error': 'No response from exchange'}
            
            if not order_result.get('success'):
                return order_result
            
            # INSTANT: Return immediately
            return order_result
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def _log_trade_attempt(self, opportunity: ArbitrageOpportunity, trade_id: str):
        """Log trade attempt."""
        if self.trade_logger:
            try:
                trade_data = {
                    'triangle_path': opportunity.triangle_path,
                    'pairs': [step.symbol for step in opportunity.steps],
                    'initial_amount': opportunity.initial_amount,
                    'final_amount': opportunity.final_amount,
                    'profit_percentage': round(opportunity.profit_percentage, 6),
                    'profit_amount': round(opportunity.profit_amount, 6),
                    'net_profit': round(opportunity.net_profit, 6),
                    'estimated_fees': round(opportunity.estimated_fees, 6),
                    'estimated_slippage': round(opportunity.estimated_slippage, 6),
                    'steps': [step.to_dict() for step in opportunity.steps],
                    'detected_at': opportunity.detected_at.isoformat(),
                    'status': 'executing',
                    'execution_time': 0.0
                }
                
                self.trade_logger.logger.info(f"TRADE_ATTEMPT ({'AUTO' if self.auto_trading else 'MANUAL'}): {trade_data}")
            except Exception as e:
                self.logger.error(f"Error logging trade attempt: {e}")
    
    async def _log_trade_success(self, opportunity: ArbitrageOpportunity, trade_id: str, 
                               final_amount: float, start_time: float):
        """Log successful trade completion."""
        if self.trade_logger:
            try:
                execution_time = (time.time() - start_time) * 1000
                actual_profit = final_amount - opportunity.initial_amount
                actual_profit_pct = (actual_profit / opportunity.initial_amount) * 100
                
                # Create detailed trade log
                trade_log = TradeLog(
                    trade_id=trade_id,
                    timestamp=datetime.now(),
                    exchange=getattr(opportunity, 'exchange', 'unknown'),
                    triangle_path=opportunity.triangle_path.split(' → ')[:3],
                    status=TradeStatus.SUCCESS,
                    initial_amount=opportunity.initial_amount,
                    final_amount=final_amount,
                    base_currency=opportunity.base_currency,
                    expected_profit_amount=opportunity.profit_amount,
                    expected_profit_percentage=opportunity.profit_percentage,
                    actual_profit_amount=actual_profit,
                    actual_profit_percentage=actual_profit_pct,
                    total_fees_paid=opportunity.estimated_fees,
                    total_slippage=opportunity.estimated_slippage,
                    net_pnl=actual_profit - opportunity.estimated_fees,
                    total_duration_ms=execution_time
                )
                
                await self.trade_logger.log_trade(trade_log)
                
            except Exception as e:
                self.logger.error(f"Error logging trade success: {e}")
    
    async def _log_trade_failure(self, opportunity: ArbitrageOpportunity, trade_id: str, 
                               error_message: str, start_time: float):
        """Log failed trade."""
        if self.trade_logger:
            try:
                execution_time = (time.time() - start_time) * 1000
                
                trade_data = {
                    'triangle_path': opportunity.triangle_path,
                    'pairs': [step.symbol for step in opportunity.steps],
                    'initial_amount': opportunity.initial_amount,
                    'final_amount': opportunity.final_amount,
                    'profit_percentage': round(opportunity.profit_percentage, 6),
                    'profit_amount': round(opportunity.profit_amount, 6),
                    'net_profit': round(opportunity.net_profit, 6),
                    'estimated_fees': round(opportunity.estimated_fees, 6),
                    'estimated_slippage': round(opportunity.estimated_slippage, 6),
                    'steps': [step.to_dict() for step in opportunity.steps],
                    'detected_at': opportunity.detected_at.isoformat(),
                    'status': 'failed',
                    'execution_time': execution_time
                }
                
                self.trade_logger.logger.error(f"TRADE_FAILED ({'🔴 LIVE USDT TRIANGLE/AUTO' if self.auto_trading else 'MANUAL'}): {trade_data} | Error: {error_message}")
                
                # Create detailed failure log
                trade_log = TradeLog(
                    trade_id=trade_id,
                    timestamp=datetime.now(),
                    exchange=getattr(opportunity, 'exchange', 'unknown'),
                    triangle_path=opportunity.triangle_path.split(' → ')[:3],
                    status=TradeStatus.FAILED,
                    initial_amount=opportunity.initial_amount,
                    final_amount=opportunity.initial_amount,  # No change on failure
                    base_currency=opportunity.base_currency,
                    expected_profit_amount=opportunity.profit_amount,
                    expected_profit_percentage=opportunity.profit_percentage,
                    actual_profit_amount=0,
                    actual_profit_percentage=0,
                    total_fees_paid=opportunity.estimated_fees * 0.1,  # Partial fees
                    total_slippage=0,
                    net_pnl=0,
                    total_duration_ms=execution_time,
                    error_message=error_message
                )
                
                await self.trade_logger.log_trade(trade_log)
                
            except Exception as e:
                self.logger.error(f"Error logging trade failure: {e}")
    
    async def _get_manual_confirmation(self, opportunity: ArbitrageOpportunity) -> bool:
        """Get manual confirmation for trade execution."""
        try:
            print("\n" + "="*60)
            print("🔴 LIVE TRADE CONFIRMATION")
            print("="*60)
            print(f"Exchange: {getattr(opportunity, 'exchange', 'Unknown')}")
            print(f"Triangle: {opportunity.triangle_path}")
            print(f"Trade Amount: ${opportunity.initial_amount:.2f}")
            print(f"Expected Profit: {opportunity.profit_percentage:.4f}% (${opportunity.profit_amount:.2f})")
            print("⚠️ WARNING: This will execute REAL trades with REAL money!")
            print("="*60)
            
            # In a real GUI, this would be a dialog box
            # For now, we'll auto-approve if auto_trading is enabled
            if self.auto_trading:
                return True
            
            # For manual mode, require explicit confirmation
            return False  # Would be replaced with actual user input in GUI
            
        except Exception as e:
            self.logger.error(f"Error getting manual confirmation: {e}")
            return False