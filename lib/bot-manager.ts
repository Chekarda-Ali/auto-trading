import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { db } from './db';
import { botInstances, trades } from './db/schema';
import { eq } from 'drizzle-orm';

interface BotInstance {
  id: string;
  userId: string;
  process: ChildProcess;
  status: 'running' | 'stopped' | 'error';
  startedAt: Date;
}

interface ExchangeCredential {
  exchangeId: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string | null;
  sandbox: boolean;
}

interface BotSettings {
  minProfitPercentage: number;
  maxTradeAmount: number;
  autoTradingMode: boolean;
  selectedExchanges: string[];
  riskManagement: {
    maxDailyLoss: number;
    maxConcurrentTrades: number;
    stopLossPercentage: number;
  };
}

// In-memory store for active bot instances
const activeBots = new Map<string, BotInstance>();

export async function startBotForUser(
  userId: string, 
  credentials: ExchangeCredential[], 
  settings: BotSettings
): Promise<BotInstance> {
  try {
    // Stop existing bot if running
    await stopBotForUser(userId);

    // Create environment variables for the bot
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      USER_ID: userId,
      BOT_SETTINGS: JSON.stringify(settings),
      BOT_CREDENTIALS: JSON.stringify(credentials),
      MIN_PROFIT_PERCENTAGE: settings.minProfitPercentage.toString(),
      MAX_TRADE_AMOUNT: settings.maxTradeAmount.toString(),
      AUTO_TRADING_MODE: settings.autoTradingMode.toString(),
      SELECTED_EXCHANGES: settings.selectedExchanges.join(','),
      NODE_ENV: process.env.NODE_ENV || 'development', // Ensure NODE_ENV is present
    };

    // Add exchange-specific credentials to environment
    credentials.forEach((cred) => {
      const prefix = cred.exchangeId.toUpperCase();
      env[`${prefix}_API_KEY`] = cred.apiKey;
      env[`${prefix}_API_SECRET`] = cred.apiSecret;
      if (cred.passphrase) {
        env[`${prefix}_PASSPHRASE`] = cred.passphrase;
      }
      env[`${prefix}_SANDBOX`] = cred.sandbox.toString();
    });

    // Start Python bot process
    const botPath = path.join(process.cwd(), 'python-bot', 'main_saas.py');
    const botProcess: ChildProcess = spawn('python', [botPath], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(process.cwd(), 'python-bot'),
    });

    const botInstance: BotInstance = {
      id: `bot_${userId}_${Date.now()}`,
      userId,
      process: botProcess,
      status: 'running',
      startedAt: new Date(),
    };

    // Store in memory
    activeBots.set(userId, botInstance);

    // Set up process event handlers
    botProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`Bot ${userId} stdout:`, data.toString());
      handleBotOutput(userId, data.toString());
    });

    botProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`Bot ${userId} stderr:`, data.toString());
      handleBotError(userId, data.toString());
    });

    botProcess.on('exit', (code: number | null) => {
      console.log(`Bot ${userId} exited with code:`, code);
      handleBotExit(userId, code);
    });

    botProcess.on('error', (error: Error) => {
      console.error(`Bot ${userId} error:`, error);
      handleBotProcessError(userId, error);
    });

    console.log(`Started bot for user ${userId} with PID ${botProcess.pid}`);
    return botInstance;

  } catch (error) {
    console.error('Error starting bot for user:', userId, error);
    throw new Error('Failed to start bot instance');
  }
}

export async function stopBotForUser(userId: string): Promise<void> {
  try {
    const botInstance = activeBots.get(userId);
    
    if (botInstance && botInstance.process) {
      // Gracefully terminate the process
      botInstance.process.kill('SIGTERM');
      
      // Force kill after 10 seconds if still running
      setTimeout(() => {
        if (botInstance.process && !botInstance.process.killed) {
          botInstance.process.kill('SIGKILL');
        }
      }, 10000);

      // Remove from active bots
      activeBots.delete(userId);
      
      console.log(`Stopped bot for user ${userId}`);
    }
  } catch (error) {
    console.error('Error stopping bot for user:', userId, error);
    throw new Error('Failed to stop bot instance');
  }
}

export async function getBotStatus(userId: string): Promise<BotInstance | null> {
  return activeBots.get(userId) || null;
}

export async function getAllActiveBots(): Promise<BotInstance[]> {
  return Array.from(activeBots.values());
}

export async function emergencyStopAllBots(): Promise<void> {
  console.log('EMERGENCY STOP: Stopping all bot instances');
  
  const promises = Array.from(activeBots.keys()).map(userId => 
    stopBotForUser(userId).catch(error => 
      console.error(`Failed to stop bot for user ${userId}:`, error)
    )
  );
  
  await Promise.all(promises);
  console.log('EMERGENCY STOP: All bots stopped');
}

// Event handlers
async function handleBotOutput(userId: string, output: string) {
  try {
    // Parse bot output for trade information
    if (output.includes('TRADE_COMPLETED')) {
      const tradeData = parseTradeOutput(output);
      if (tradeData) {
        await saveTrade(userId, tradeData);
      }
    }
    
    // Update heartbeat
    await updateBotHeartbeat(userId);
  } catch (error) {
    console.error('Error handling bot output:', error);
  }
}

async function handleBotError(userId: string, error: string) {
  try {
    console.error(`Bot error for user ${userId}:`, error);
    
    // Update bot status to error
    await db.update(botInstances)
      .set({
        status: 'error',
        stoppedAt: new Date(),
      })
      .where(eq(botInstances.userId, userId));
      
  } catch (dbError) {
    console.error('Error updating bot status:', dbError);
  }
}

async function handleBotExit(userId: string, code: number | null) {
  try {
    activeBots.delete(userId);
    
    await db.update(botInstances)
      .set({
        status: 'stopped',
        stoppedAt: new Date(),
      })
      .where(eq(botInstances.userId, userId));
      
    console.log(`Bot for user ${userId} exited with code ${code}`);
  } catch (error) {
    console.error('Error handling bot exit:', error);
  }
}

async function handleBotProcessError(userId: string, error: Error) {
  try {
    activeBots.delete(userId);
    
    await db.update(botInstances)
      .set({
        status: 'error',
        stoppedAt: new Date(),
      })
      .where(eq(botInstances.userId, userId));
      
    console.error(`Bot process error for user ${userId}:`, error);
  } catch (dbError) {
    console.error('Error handling bot process error:', dbError);
  }
}

async function updateBotHeartbeat(userId: string) {
  try {
    await db.update(botInstances)
      .set({
        lastHeartbeat: new Date(),
      })
      .where(eq(botInstances.userId, userId));
  } catch (error) {
    console.error('Error updating bot heartbeat:', error);
  }
}

function parseTradeOutput(output: string): any | null {
  try {
    // Parse the trade output from the Python bot
    // This would need to match the output format from your bot
    const tradeMatch = output.match(/TRADE_COMPLETED: (.+)/);
    if (tradeMatch) {
      return JSON.parse(tradeMatch[1]);
    }
    return null;
  } catch (error) {
    console.error('Error parsing trade output:', error);
    return null;
  }
}

async function saveTrade(userId: string, tradeData: any) {
  try {
    await db.insert(trades).values({
      userId,
      exchangeId: tradeData.exchange,
      trianglePath: tradeData.trianglePath,
      initialAmount: tradeData.initialAmount.toString(),
      finalAmount: tradeData.finalAmount.toString(),
      profitAmount: tradeData.profitAmount.toString(),
      profitPercentage: tradeData.profitPercentage.toString(),
      fees: tradeData.fees.toString(),
      status: tradeData.status,
      executionTimeMs: tradeData.executionTimeMs,
      errorMessage: tradeData.errorMessage,
      tradeData: tradeData,
    });
    
    console.log(`Saved trade for user ${userId}:`, tradeData);
  } catch (error) {
    console.error('Error saving trade:', error);
  }
}