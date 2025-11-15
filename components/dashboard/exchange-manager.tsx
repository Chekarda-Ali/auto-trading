'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ExchangeCredential {
  id: string;
  exchangeId: string;
  apiKey: string;
  isActive: boolean;
  sandbox: boolean;
  createdAt: string;
  updatedAt: string;
}

const SUPPORTED_EXCHANGES = [
  { id: 'binance', name: 'Binance', requiresPassphrase: false },
  { id: 'kucoin', name: 'KuCoin', requiresPassphrase: true },
  { id: 'coinbase', name: 'Coinbase Pro', requiresPassphrase: true },
  { id: 'kraken', name: 'Kraken', requiresPassphrase: false },
  { id: 'gate', name: 'Gate.io', requiresPassphrase: false },
  { id: 'bybit', name: 'Bybit', requiresPassphrase: false },
  { id: 'coinex', name: 'CoinEx', requiresPassphrase: false },
  { id: 'htx', name: 'HTX (Huobi)', requiresPassphrase: false },
  { id: 'mexc', name: 'MEXC', requiresPassphrase: false },
  { id: 'poloniex', name: 'Poloniex', requiresPassphrase: false },
  { id: 'probit', name: 'ProBit Global', requiresPassphrase: false },
  { id: 'hitbtc', name: 'HitBTC', requiresPassphrase: false },
];

export function ExchangeManager() {
  const [credentials, setCredentials] = useState<ExchangeCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('');
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    sandbox: false,
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await fetch('/api/exchanges');
      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error",
        description: "Failed to load exchange credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredentials = async () => {
    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchangeId: selectedExchange,
          ...formData,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Exchange credentials saved successfully",
        });
        setShowAddDialog(false);
        setFormData({ apiKey: '', apiSecret: '', passphrase: '', sandbox: false });
        setSelectedExchange('');
        fetchCredentials();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to save credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save exchange credentials",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCredentials = async (exchangeId: string) => {
    try {
      const response = await fetch(`/api/exchanges?exchangeId=${exchangeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Exchange credentials removed",
        });
        fetchCredentials();
      }
    } catch (error) {
      console.error('Error deleting credentials:', error);
      toast({
        title: "Error",
        description: "Failed to remove credentials",
        variant: "destructive",
      });
    }
  };

  const toggleShowSecret = (credentialId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId],
    }));
  };

  const getExchangeName = (exchangeId: string) => {
    return SUPPORTED_EXCHANGES.find(ex => ex.id === exchangeId)?.name || exchangeId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="border-yellow-500/50 bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Shield className="h-5 w-5" />
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-300">
          <p>
            Your API keys are encrypted using bank-grade AES-256 encryption with rotating master keys. 
            We never store your credentials in plain text and only decrypt them server-side when needed for trading.
          </p>
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Required API Permissions:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Spot Trading:</strong> Required for executing arbitrage trades</li>
              <li>• <strong>Read Account:</strong> Required for balance and position monitoring</li>
              <li>• <strong>No Withdrawals:</strong> We never request withdrawal permissions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Credentials */}
      <Card className="glass-effect border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Exchange Connections</CardTitle>
              <CardDescription>
                Manage your exchange API credentials for automated trading
              </CardDescription>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exchange
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Exchange Credentials</DialogTitle>
                  <DialogDescription>
                    Securely connect your exchange account for automated trading.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exchange">Exchange</Label>
                    <select
                      value={selectedExchange}
                      onChange={(e) => setSelectedExchange(e.target.value)}
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select an exchange</option>
                      {SUPPORTED_EXCHANGES.map((exchange) => (
                        <option key={exchange.id} value={exchange.id}>
                          {exchange.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your API key"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="apiSecret">API Secret</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      value={formData.apiSecret}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                      placeholder="Enter your API secret"
                    />
                  </div>
                  
                  {selectedExchange && SUPPORTED_EXCHANGES.find(ex => ex.id === selectedExchange)?.requiresPassphrase && (
                    <div>
                      <Label htmlFor="passphrase">Passphrase</Label>
                      <Input
                        id="passphrase"
                        type="password"
                        value={formData.passphrase}
                        onChange={(e) => setFormData(prev => ({ ...prev, passphrase: e.target.value }))}
                        placeholder="Enter your passphrase"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sandbox"
                      checked={formData.sandbox}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sandbox: checked }))}
                    />
                    <Label htmlFor="sandbox">Sandbox/Testnet Mode</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCredentials}
                    disabled={!selectedExchange || !formData.apiKey || !formData.apiSecret}
                  >
                    Save Credentials
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Exchange Connections</h3>
              <p className="text-gray-400 mb-6">
                Add your first exchange connection to start automated trading.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Exchange
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((credential, index) => (
                <motion.div
                  key={credential.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-slate-600 bg-slate-800/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">
                          {getExchangeName(credential.exchangeId)}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          {credential.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <Badge variant={credential.sandbox ? "secondary" : "default"}>
                            {credential.sandbox ? "Sandbox" : "Live"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm text-gray-400">API Key</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="flex-1 text-xs bg-slate-700 px-2 py-1 rounded">
                            {credential.apiKey.substring(0, 8)}...{credential.apiKey.slice(-4)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleShowSecret(credential.id)}
                          >
                            {showSecrets[credential.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-400">
                          Added {new Date(credential.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Exchange Connection</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove the {getExchangeName(credential.exchangeId)} connection? 
                                  This will stop any active trading on this exchange.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCredentials(credential.exchangeId)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}