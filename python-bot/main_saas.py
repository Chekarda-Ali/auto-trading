#!/usr/bin/env python3
"""
SaaS Multi-Tenant Arbitrage Bot
Runs arbitrage trading for individual users with their own credentials
"""

import asyncio
import json
import os
import sys
import signal
import time
from typing import Dict, Any, List
from datetime import datetime
import logging

# Add the parent directory to the path to import existing bot modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.config import Config
from exchanges.unified_exchange import UnifiedExchange
from arbitrage.triangle_detector import TriangleDetector
from arbitrage.trade_executor import TradeExecutor
from utils.logger import setup_logger

class SaaSArbitrageBot:
    """Multi-tenant arbitrage bot for SaaS platform."""
    
    def __init__(self):
        self.user_id = os.getenv('USER_ID')
        self.logger = setup_logger(f'SaaSBot_{self.user_id}', 'INFO')
        
        # Load user-specific settings
        self.settings = json.loads(os.getenv('BOT_SETTINGS', '{}'))
        self.credentials = json.loads(os.getenv('BOT_CREDENTIALS', '[]'))
        
        # Bot components
        self.exchanges = {}
        self.detectors = {}
        self.executor = None
        self.running = False
        
        # Statistics
        self.trades_executed = 0
        self.total_profit = 0.0
        self.opportunities_found = 0
        
        self.logger.info(f"SaaS Arbitrage Bot initialized for user {self.user_id}")
        self.logger.info(f"Settings: {self.settings}")
        self.logger.info(f"Exchanges: {[c['exchangeId'] for c in self.credentials]}")
    
    async def initialize(self) -> bool:
        """Initialize bot components for the user."""
        try:
            # Initialize exchanges with user credentials
            for cred in self.credentials:
                exchange_config = {
                    'exchange_id': cred['exchangeId'],
                    'api_key': cred['apiKey'],
                    'api_secret': cred['apiSecret'],
                    'passphrase': cred.get('passphrase'),
                    'sandbox': cred.get('sandbox', False),
                    'fee_token': self._get_fee_token(cred['exchangeId']),
                    'fee_discount': self._get_fee_discount(cred['exchangeId']),
                }
                
                exchange = UnifiedExchange(exchange_config)
                
                if await exchange.connect():
                    self.exchanges[cred['exchangeId']] = exchange
                    self.logger.info(f"Connected to {cred['exchangeId']} for user {self.user_id}")
                else:
                    self.logger.error(f"Failed to connect to {cred['exchangeId']} for user {self.user_id}")
            
            if not self.exchanges:
                self.logger.error("No exchanges connected")
                return False
            
            # Initialize detectors for each exchange
            for exchange_id, exchange in self.exchanges.items():
                detector_config = {
                    'min_profit_percentage': self.settings.get('minProfitPercentage', 0.5),
                    'max_trade_amount': self.settings.get('maxTradeAmount', 100),
                    'max_slippage_percentage': 0.05,
                }
                
                detector = TriangleDetector(exchange, detector_config)
                await detector.initialize()
                self.detectors[exchange_id] = detector
            
            # Initialize trade executor
            executor_config = {
                'enable_manual_confirmation': False,
                'order_timeout_seconds': 30,
                'auto_trading': self.settings.get('autoTradingMode', True),
                'paper_trading': False,  # Always live trading in SaaS
            }
            
            # Use first exchange for executor (could be enhanced to use multiple)
            first_exchange = list(self.exchanges.values())[0]
            self.executor = TradeExecutor(first_exchange, executor_config)
            
            self.logger.info("Bot initialization completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize bot: {e}")
            return False
    
    def _get_fee_token(self, exchange_id: str) -> str:
        """Get fee token for exchange."""
        fee_tokens = {
            'binance': 'BNB',
            'kucoin': 'KCS',
            'gate': 'GT',
            'bybit': 'BIT',
            'coinex': 'CET',
            'htx': 'HT',
            'mexc': 'MX',
        }
        return fee_tokens.get(exchange_id, '')
    
    def _get_fee_discount(self, exchange_id: str) -> float:
        """Get fee discount for exchange."""
        discounts = {
            'binance': 0.25,
            'kucoin': 0.20,
            'gate': 0.15,
            'bybit': 0.10,
            'coinex': 0.20,
            'htx': 0.20,
            'mexc': 0.10,
        }
        return discounts.get(exchange_id, 0.0)
    
    async def start(self) -> None:
        """Start the arbitrage bot."""
        if not await self.initialize():
            return
        
        self.running = True
        self.logger.info(f"Starting SaaS Arbitrage Bot for user {self.user_id}")
        
        try:
            # Start main trading loop
            await self._main_trading_loop()
        except Exception as e:
            self.logger.error(f"Bot error: {e}")
        finally:
            await self.cleanup()
    
    async def _main_trading_loop(self) -> None:
        """Main trading loop."""
        while self.running:
            try:
                # Scan for opportunities on all connected exchanges
                all_opportunities = []
                
                for exchange_id, detector in self.detectors.items():
                    opportunities = await detector.scan_opportunities()
                    for opp in opportunities:
                        opp.exchange = exchange_id
                        all_opportunities.append(opp)
                
                # Sort by profitability
                all_opportunities.sort(key=lambda x: x.profit_percentage, reverse=True)
                
                if all_opportunities:
                    self.opportunities_found += len(all_opportunities)
                    self.logger.info(f"Found {len(all_opportunities)} opportunities")
                    
                    # Execute most profitable opportunity
                    best_opportunity = all_opportunities[0]
                    
                    if (best_opportunity.profit_percentage >= self.settings.get('minProfitPercentage', 0.5) and
                        best_opportunity.is_profitable):
                        
                        success = await self.executor.execute_arbitrage(best_opportunity)
                        
                        if success:
                            self.trades_executed += 1
                            self.total_profit += best_opportunity.profit_amount
                            
                            # Output trade completion for parent process
                            trade_data = {
                                'exchange': best_opportunity.exchange,
                                'trianglePath': best_opportunity.triangle_path,
                                'initialAmount': best_opportunity.initial_amount,
                                'finalAmount': best_opportunity.final_amount,
                                'profitAmount': best_opportunity.profit_amount,
                                'profitPercentage': best_opportunity.profit_percentage,
                                'fees': best_opportunity.estimated_fees,
                                'status': 'success',
                                'executionTimeMs': 1000,  # Placeholder
                                'timestamp': datetime.now().isoformat(),
                            }
                            
                            print(f"TRADE_COMPLETED: {json.dumps(trade_data)}")
                            self.logger.info(f"Trade completed successfully: {best_opportunity}")
                
                # Wait before next scan
                await asyncio.sleep(5)
                
            except Exception as e:
                self.logger.error(f"Error in trading loop: {e}")
                await asyncio.sleep(10)
    
    async def cleanup(self) -> None:
        """Cleanup resources."""
        self.logger.info("Shutting down bot...")
        self.running = False
        
        for exchange in self.exchanges.values():
            try:
                await exchange.disconnect()
            except Exception as e:
                self.logger.error(f"Error disconnecting exchange: {e}")
        
        self.logger.info("Bot shutdown complete")
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        self.logger.info(f"Received signal {signum}, shutting down...")
        self.running = False

async def main():
    """Main entry point for SaaS bot."""
    bot = SaaSArbitrageBot()
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, bot._signal_handler)
    signal.signal(signal.SIGTERM, bot._signal_handler)
    
    try:
        await bot.start()
    except KeyboardInterrupt:
        print("Received interrupt signal, shutting down...")
    except Exception as e:
        print(f"Fatal error: {e}")
    finally:
        await bot.cleanup()

if __name__ == "__main__":
    asyncio.run(main())