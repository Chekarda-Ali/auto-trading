# ArbitrageBot Pro - Multi-Tenant SaaS Platform

A professional multi-tenant SaaS platform for cryptocurrency arbitrage trading, supporting 12+ major exchanges with enterprise-grade security and user management.

## 🚀 Features

### Core Platform
- **Multi-Tenant Architecture**: Isolated bot instances per user
- **12+ Exchange Support**: Binance, KuCoin, Coinbase Pro, Kraken, Gate.io, Bybit, CoinEx, HTX, MEXC, Poloniex, ProBit Global, HitBTC
- **Real-time Arbitrage**: Lightning-fast triangular arbitrage detection and execution
- **Enterprise Security**: Bank-grade encryption for API keys with rotating master keys

### User Management
- **Clerk Authentication**: SSO, social login, secure user management
- **Subscription Management**: Lemon Squeezy integration with $49/month plans
- **Secure Credential Storage**: Encrypted API keys in Neon Postgres
- **Role-based Access**: User and admin dashboards

### Trading Features
- **Automated Trading**: 24/7 bot operation with user-specific settings
- **Risk Management**: Configurable stop-loss, position limits, slippage protection
- **Real-time Analytics**: Live P&L tracking, trade history, performance metrics
- **Multi-Exchange Optimization**: Fee token discounts, zero-fee pair prioritization

### Admin Features
- **User Management**: View all users, subscription status, bot health
- **Emergency Controls**: Kill-switch for all bots, individual user controls
- **Audit Logging**: Comprehensive activity tracking
- **Webhook Management**: Replay failed webhooks, monitor integrations

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with custom design system
- **Framer Motion**: Smooth animations and transitions
- **Radix UI**: Accessible component primitives

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Python Bot Engine**: Existing arbitrage bot logic
- **Neon Postgres**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database operations

### Integrations
- **Clerk**: Authentication and user management
- **Lemon Squeezy**: Subscription billing and payments
- **12+ Exchange APIs**: Direct integration with trading platforms

### Security
- **AES-256 Encryption**: API key encryption at rest
- **Rotating Master Keys**: Enhanced security with key rotation
- **HTTPS Only**: All communications encrypted in transit
- **Rate Limiting**: API protection and abuse prevention

## 📋 Prerequisites

- Node.js 18+ and Python 3.8+
- Neon Postgres database
- Clerk account for authentication
- Lemon Squeezy account for billing
- Exchange API credentials for testing

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone and install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/arbitragebot"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Lemon Squeezy
LEMONSQUEEZY_API_KEY="your_api_key"
LEMONSQUEEZY_STORE_ID="your_store_id"
LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret"

# Encryption
MASTER_ENCRYPTION_KEY="your_256_bit_hex_key"
```

### 3. Database Setup

```bash
# Generate and run migrations
npm run db:generate
npm run db:migrate

# Optional: Open database studio
npm run db:studio
```

### 4. Start Development

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Architecture

### Multi-Tenant Bot Management

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User A        │    │   User B        │    │   User C        │
│   Dashboard     │    │   Dashboard     │    │   Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Next.js API   │
                    │   Bot Manager   │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Python Bot    │    │   Python Bot    │    │   Python Bot    │
│   Instance A    │    │   Instance B    │    │   Instance C    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Security Architecture

```
┌─────────────────┐
│   User Input    │
│   (API Keys)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │
│   (Never stores │
│    plain text)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   API Endpoint  │
│   (Server-side  │
│    encryption)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Neon Postgres │
│   (Encrypted    │
│    at rest)     │
└─────────────────┘
```

## 🔐 Security Features

### API Key Protection
- **Client-side**: Never stores API keys in browser storage
- **Transit**: HTTPS encryption for all communications
- **At Rest**: AES-256-GCM encryption with PBKDF2 key derivation
- **Access**: Keys only decrypted server-side when needed for trading

### Key Rotation
- **Master Keys**: Automatic rotation capability
- **Data Keys**: Per-user encryption with master key protection
- **Audit Trail**: All key operations logged

### Access Control
- **Authentication**: Clerk-managed user sessions
- **Authorization**: Role-based access (user/admin)
- **API Security**: Rate limiting and request validation

## 💰 Billing Integration

### Lemon Squeezy Features
- **Subscription Plans**: $49/month professional plan
- **Webhook Handling**: Real-time subscription status updates
- **Payment Methods**: Credit cards, PayPal, bank transfers
- **Tax Compliance**: Automatic tax calculation and invoicing

### Subscription States
- **Active**: Full bot access and trading
- **Cancelled**: Access until period end
- **Expired**: Bot stopped, dashboard read-only
- **Past Due**: Grace period with limited access

## 🔧 Bot Configuration

### User Settings
```typescript
interface BotSettings {
  minProfitPercentage: number;    // Minimum profit threshold
  maxTradeAmount: number;         // Maximum trade size
  autoTradingMode: boolean;       // Automated execution
  selectedExchanges: string[];    // Active exchanges
  riskManagement: {
    maxDailyLoss: number;         // Daily loss limit
    maxConcurrentTrades: number;  // Concurrent trade limit
    stopLossPercentage: number;   // Stop-loss threshold
  };
}
```

### Exchange Support
- **Binance**: BNB fee discounts, zero-fee pairs
- **KuCoin**: KCS fee discounts, high liquidity pairs
- **Coinbase Pro**: Professional trading features
- **Gate.io**: GT fee discounts, diverse markets
- **And 8 more exchanges**: Full feature parity

## 📊 Analytics & Monitoring

### Real-time Metrics
- **Profit/Loss**: Live P&L tracking with historical data
- **Success Rate**: Trade success percentage and trends
- **Exchange Performance**: Per-exchange profitability analysis
- **Risk Metrics**: Drawdown, volatility, Sharpe ratio

### Alerting
- **Email Notifications**: Trade confirmations, errors, daily summaries
- **Dashboard Alerts**: Real-time status updates
- **Admin Notifications**: System health, user issues

## 🛡️ Risk Management

### Position Limits
- **Trade Size**: Configurable maximum per trade
- **Daily Limits**: Maximum daily loss protection
- **Concurrent Trades**: Limit simultaneous positions

### Market Protection
- **Slippage Control**: Maximum acceptable slippage
- **Liquidity Checks**: Minimum order book depth
- **Circuit Breakers**: Automatic stops on unusual market conditions

## 🔧 Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── admin/            # Admin panel
│   └── (auth)/           # Authentication pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── landing/          # Landing page components
│   ├── dashboard/        # Dashboard components
│   └── admin/            # Admin components
├── lib/                  # Utility libraries
│   ├── db/               # Database schema and operations
│   ├── encryption.ts     # Encryption utilities
│   ├── bot-manager.ts    # Bot instance management
│   └── subscription.ts   # Subscription utilities
├── python-bot/           # Python bot engine
│   ├── main_saas.py      # SaaS bot entry point
│   └── ...               # Existing bot modules
└── drizzle/              # Database migrations
```

### Adding New Exchanges

1. **Update Schema**: Add exchange configuration
2. **Add Credentials**: Update exchange credential form
3. **Bot Integration**: Add exchange to Python bot
4. **Testing**: Verify connection and trading

### Custom Styling

The platform uses a custom design system built on Tailwind CSS:

- **Color Palette**: Professional blue/purple gradient theme
- **Typography**: Inter font with careful hierarchy
- **Components**: Consistent spacing and interaction patterns
- **Animations**: Subtle motion design with Framer Motion

## 🚀 Deployment

### Production Setup

1. **Database**: Set up Neon Postgres production instance
2. **Authentication**: Configure Clerk production keys
3. **Billing**: Set up Lemon Squeezy production webhooks
4. **Encryption**: Generate secure master encryption key
5. **Monitoring**: Set up logging and error tracking

### Environment Variables

```bash
# Production environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://arbitragebot.pro

# Database
DATABASE_URL=postgresql://...

# Security
MASTER_ENCRYPTION_KEY=your_production_key
```

### Scaling Considerations

- **Bot Instances**: Horizontal scaling with process management
- **Database**: Connection pooling and read replicas
- **Caching**: Redis for session and rate limiting
- **Monitoring**: Application performance monitoring

## 📚 API Documentation

### Bot Management
- `POST /api/bot/start` - Start user's bot instance
- `POST /api/bot/stop` - Stop user's bot instance
- `GET /api/bot/status` - Get bot status and statistics

### Exchange Management
- `GET /api/exchanges` - List user's exchange credentials
- `POST /api/exchanges` - Add/update exchange credentials
- `DELETE /api/exchanges` - Remove exchange credentials

### Subscription Management
- `POST /api/subscription/create` - Create checkout session
- `GET /api/subscription/status` - Get subscription status
- `POST /api/webhooks/lemonsqueezy` - Handle billing webhooks

## 🔒 Security Best Practices

### For Users
1. **API Permissions**: Only enable spot trading permissions
2. **IP Restrictions**: Limit API access to our servers
3. **Regular Monitoring**: Check trade activity regularly
4. **Secure Passwords**: Use strong account passwords

### For Developers
1. **Environment Variables**: Never commit secrets to version control
2. **Input Validation**: Validate all user inputs
3. **Error Handling**: Don't expose sensitive information in errors
4. **Audit Logging**: Log all sensitive operations

## 📞 Support

### User Support
- **Documentation**: Comprehensive guides and tutorials
- **Email Support**: Priority support for subscribers
- **Community**: Discord server for user discussions

### Technical Support
- **Monitoring**: 24/7 system monitoring
- **Incident Response**: Rapid response to critical issues
- **Maintenance**: Regular updates and security patches

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the crypto trading community**

For questions or support, contact: support@arbitragebot.pro