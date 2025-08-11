import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import AssetCard from './AssetCard.jsx';
import { getEthBalance, getSolBalance, getBtcBalance } from '../services/blockchain';

function WalletDashboard() {
    const { wallet, logout } = useWallet();
    const [balances, setBalances] = useState({ eth: null, sol: null, btc: null });
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [totalValue, setTotalValue] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [showSendModal, setShowSendModal] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [sendForm, setSendForm] = useState({
        recipient: '',
        amount: '',
        note: ''
    });
    const [transactions, setTransactions] = useState([
        {
            id: 1,
            type: 'send',
            coin: 'ETH',
            amount: 0.5,
            address: '0x742d35Cc6634C0532925a3b8D67F5E2e7936924f',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'completed',
            hash: '0x1234...5678'
        },
        {
            id: 2,
            type: 'receive',
            coin: 'SOL',
            amount: 2.5,
            address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            status: 'completed',
            hash: '5KJp...7gHt'
        },
        {
            id: 3,
            type: 'send',
            coin: 'BTC',
            amount: 0.01,
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'pending',
            hash: '6MnQ...8kLm'
        }
    ]);
    const [userProfile, setUserProfile] = useState({
        username: 'CryptoMaster',
        email: 'user@cryptowallet.com',
        avatar: null,
        joinDate: new Date('2024-01-15'),
        preferences: {
            currency: 'USD',
            notifications: true,
            twoFactorAuth: false,
            darkMode: true
        },
        stats: {
            totalTransactions: 47,
            totalVolume: 12580.45,
            favoriteCoins: ['ETH', 'BTC', 'SOL']
        }
    });
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState(userProfile);
    const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '', confirmEmail: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [deleteForm, setDeleteForm] = useState({ password: '', confirmText: '' });

    // Mock prices for demonstration - you can replace with real API
    const mockPrices = {
        eth: 2340.50,
        sol: 98.75,
        btc: 43250.00
    };

    const fetchBalances = useCallback(async () => {
        if (!wallet || !wallet.ethereum || !wallet.bitcoin || !wallet.solana) return;

        try {
            console.log("Refreshing balances...");
            const [eth, sol, btc] = await Promise.all([
                getEthBalance(wallet.ethereum.address),
                getSolBalance(wallet.solana.address),
                getBtcBalance(wallet.bitcoin.address)
            ]);
            setBalances({ eth, sol, btc });
            
            // Calculate total portfolio value
            const total = (eth * mockPrices.eth) + (sol * mockPrices.sol) + (btc * mockPrices.btc);
            setTotalValue(total);
        } catch (error) {
            console.error("Failed to fetch all balances:", error);
        }
    }, [wallet]);

    useEffect(() => {
        fetchBalances();
        const interval = setInterval(fetchBalances, 30000);
        return () => clearInterval(interval);
    }, [fetchBalances]);

    if (!wallet || !wallet.ethereum || !wallet.bitcoin || !wallet.solana) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Wallet Data Error</h2>
                    <p className="text-gray-300 mb-6">There was a problem loading your wallet data. Please try logging out and importing your wallet again.</p>
                    <button 
                        onClick={logout} 
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Logout & Retry
                    </button>
                </div>
            </div>
        );
    }

    const coins = [
        { 
            name: 'Ethereum', 
            symbol: 'ETH', 
            ...wallet.ethereum,
            color: 'from-blue-400 to-blue-600',
            icon: '⟠'
        },
        { 
            name: 'Solana', 
            symbol: 'SOL', 
            ...wallet.solana,
            color: 'from-purple-400 to-purple-600',
            icon: '◎'
        },
        { 
            name: 'Bitcoin', 
            symbol: 'BTC', 
            ...wallet.bitcoin,
            color: 'from-orange-400 to-orange-600',
            icon: '₿'
        },
    ];

    const TabButton = ({ id, label, active, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                active 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
        >
            {label}
        </button>
    );

    const handleSend = (coin) => {
        setSelectedCoin(coin);
        setShowSendModal(true);
        setSendForm({ recipient: '', amount: '', note: '' });
    };

    const handleReceive = (coin) => {
        setSelectedCoin(coin);
        setShowReceiveModal(true);
    };

    const submitSend = async (e) => {
        e.preventDefault();
        if (!sendForm.recipient || !sendForm.amount || parseFloat(sendForm.amount) <= 0) {
            alert('Please fill in all required fields with valid values');
            return;
        }

        // Add new transaction to the list
        const newTransaction = {
            id: transactions.length + 1,
            type: 'send',
            coin: selectedCoin.symbol,
            amount: parseFloat(sendForm.amount),
            address: sendForm.recipient,
            timestamp: new Date(),
            status: 'pending',
            hash: `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`
        };

        setTransactions([newTransaction, ...transactions]);
        
        // Simulate transaction processing
        setTimeout(() => {
            setTransactions(prev => prev.map(tx => 
                tx.id === newTransaction.id ? { ...tx, status: 'completed' } : tx
            ));
        }, 3000);

        setShowSendModal(false);
        alert(`Sending ${sendForm.amount} ${selectedCoin.symbol} to ${sendForm.recipient}`);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Address copied to clipboard!');
    };

    const handleProfileSave = () => {
        setUserProfile(profileForm);
        setEditingProfile(false);
        alert('Profile updated successfully!');
    };

    const generateAvatar = (username) => {
        const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
        const colorIndex = username.length % colors.length;
        return colors[colorIndex];
    };

    const handleEmailChange = (e) => {
        e.preventDefault();
        if (!emailForm.currentPassword || !emailForm.newEmail || !emailForm.confirmEmail) {
            alert('Please fill in all fields');
            return;
        }
        if (emailForm.newEmail !== emailForm.confirmEmail) {
            alert('Email addresses do not match');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate authentication check
        if (emailForm.currentPassword !== 'password123') {
            alert('Current password is incorrect');
            return;
        }

        setUserProfile({ ...userProfile, email: emailForm.newEmail });
        setProfileForm({ ...profileForm, email: emailForm.newEmail });
        setShowChangeEmailModal(false);
        setEmailForm({ currentPassword: '', newEmail: '', confirmEmail: '' });
        alert('Email changed successfully!');
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            alert('New password must be at least 8 characters long');
            return;
        }
        
        // Simulate authentication check
        if (passwordForm.currentPassword !== 'password123') {
            alert('Current password is incorrect');
            return;
        }

        setShowChangePasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully!');
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        if (!deleteForm.password || deleteForm.confirmText !== 'DELETE') {
            alert('Please enter your password and type "DELETE" to confirm');
            return;
        }
        
        // Simulate authentication check
        if (deleteForm.password !== 'password123') {
            alert('Password is incorrect');
            return;
        }

        // In a real app, this would call an API to delete the account
        alert('Account deletion initiated. You will be logged out.');
        setShowDeleteAccountModal(false);
        // Simulate logout after deletion
        setTimeout(() => {
            logout();
        }, 2000);
    };

    const Modal = ({ isOpen, onClose, children }) => {
        if (!isOpen) return null;
        
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen text-white">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all duration-200 transform hover:scale-105"
                        >
                            <div className={`w-12 h-12 rounded-full ${generateAvatar(userProfile.username)} flex items-center justify-center text-white font-bold text-lg`}>
                                {userProfile.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left">
                                <p className="text-white font-semibold">{userProfile.username}</p>
                                <p className="text-white/70 text-sm">{userProfile.email}</p>
                            </div>
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                                Portfolio Dashboard
                            </h1>
                            <p className="text-white/70 mt-1">Manage your digital assets</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout} 
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg border border-white/20 transition-all duration-200 transform hover:scale-105"
                    >
                        <span className="mr-2">🔒</span>
                        Logout
                    </button>
                </div>

                {/* Portfolio Value */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
                    <div className="text-center">
                        <p className="text-white/70 text-lg mb-2">Total Portfolio Value</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-green-400 text-sm mt-2">+2.34% (24h)</p>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex space-x-2 mb-8">
                <TabButton id="overview" label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
                <TabButton id="transactions" label="Transactions" active={activeTab === 'transactions'} onClick={setActiveTab} />
                <TabButton id="security" label="Security" active={activeTab === 'security'} onClick={setActiveTab} />
                <TabButton id="profile" label="Profile" active={activeTab === 'profile'} onClick={setActiveTab} />
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coins.map(coin => (
                        <div key={coin.symbol} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${coin.color} flex items-center justify-center text-white text-xl font-bold`}>
                                        {coin.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{coin.name}</h3>
                                        <p className="text-white/70">{coin.symbol}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">
                                        {balances[coin.symbol.toLowerCase()] || '0.00'}
                                    </p>
                                    <p className="text-white/70">
                                        ${((balances[coin.symbol.toLowerCase()] || 0) * mockPrices[coin.symbol.toLowerCase()]).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <p className="text-white/70 text-sm mb-1">Address</p>
                                    <p className="text-white font-mono text-sm break-all">{coin.address}</p>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleSend(coin)}
                                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Send
                                    </button>
                                    <button 
                                        onClick={() => handleReceive(coin)}
                                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Receive
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="space-y-6">
                    {/* Profile Overview */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">Profile Overview</h3>
                            <button
                                onClick={() => setEditingProfile(true)}
                                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2 px-4 rounded-lg transition-colors"
                            >
                                ✏️ Edit Profile
                            </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-20 h-20 rounded-full ${generateAvatar(userProfile.username)} flex items-center justify-center text-white font-bold text-2xl`}>
                                        {userProfile.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{userProfile.username}</h4>
                                        <p className="text-white/70">{userProfile.email}</p>
                                        <p className="text-white/50 text-sm">
                                            Member since {userProfile.joinDate.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h5 className="text-white font-semibold mb-2">Account Stats</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-white/70">Total Transactions:</span>
                                            <span className="text-white">{userProfile.stats.totalTransactions}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/70">Total Volume:</span>
                                            <span className="text-white">${userProfile.stats.totalVolume.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/70">Favorite Coins:</span>
                                            <span className="text-white">{userProfile.stats.favoriteCoins.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-2xl font-bold text-white mb-6">Preferences</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="text-white font-semibold">Default Currency</h5>
                                            <p className="text-white/70 text-sm">Display prices in</p>
                                        </div>
                                        <select 
                                            value={userProfile.preferences.currency}
                                            onChange={(e) => setUserProfile({
                                                ...userProfile,
                                                preferences: {...userProfile.preferences, currency: e.target.value}
                                            })}
                                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="JPY">JPY</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="text-white font-semibold">Notifications</h5>
                                            <p className="text-white/70 text-sm">Transaction alerts</p>
                                        </div>
                                        <button
                                            onClick={() => setUserProfile({
                                                ...userProfile,
                                                preferences: {
                                                    ...userProfile.preferences, 
                                                    notifications: !userProfile.preferences.notifications
                                                }
                                            })}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                userProfile.preferences.notifications 
                                                    ? 'bg-green-500' 
                                                    : 'bg-white/20'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                                userProfile.preferences.notifications 
                                                    ? 'translate-x-6' 
                                                    : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="text-white font-semibold">Two-Factor Auth</h5>
                                            <p className="text-white/70 text-sm">Extra security layer</p>
                                        </div>
                                        <button
                                            onClick={() => setUserProfile({
                                                ...userProfile,
                                                preferences: {
                                                    ...userProfile.preferences, 
                                                    twoFactorAuth: !userProfile.preferences.twoFactorAuth
                                                }
                                            })}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                userProfile.preferences.twoFactorAuth 
                                                    ? 'bg-green-500' 
                                                    : 'bg-white/20'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                                userProfile.preferences.twoFactorAuth 
                                                    ? 'translate-x-6' 
                                                    : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="text-white font-semibold">Dark Mode</h5>
                                            <p className="text-white/70 text-sm">Interface theme</p>
                                        </div>
                                        <button
                                            onClick={() => setUserProfile({
                                                ...userProfile,
                                                preferences: {
                                                    ...userProfile.preferences, 
                                                    darkMode: !userProfile.preferences.darkMode
                                                }
                                            })}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                userProfile.preferences.darkMode 
                                                    ? 'bg-purple-500' 
                                                    : 'bg-white/20'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                                userProfile.preferences.darkMode 
                                                    ? 'translate-x-6' 
                                                    : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-2xl font-bold text-white mb-6">Account Actions</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setShowChangeEmailModal(true)}
                                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-3 px-4 rounded-lg transition-colors"
                            >
                                📧 Change Email
                            </button>
                            <button 
                                onClick={() => setShowChangePasswordModal(true)}
                                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 py-3 px-4 rounded-lg transition-colors"
                            >
                                🔑 Change Password
                            </button>
                            <button 
                                onClick={() => setShowDeleteAccountModal(true)}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 py-3 px-4 rounded-lg transition-colors"
                            >
                                🗑️ Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        transaction.type === 'send' 
                                            ? 'bg-red-500/20' 
                                            : 'bg-green-500/20'
                                    }`}>
                                        <span className={`${
                                            transaction.type === 'send' 
                                                ? 'text-red-400' 
                                                : 'text-green-400'
                                        }`}>
                                            {transaction.type === 'send' ? '↗' : '↙'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-white font-semibold">
                                                {transaction.type === 'send' ? 'Sent' : 'Received'} {transaction.coin}
                                            </p>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                transaction.status === 'completed'
                                                    ? 'bg-green-500/20 text-green-300'
                                                    : 'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                        <p className="text-white/70 text-sm">
                                            {transaction.timestamp.toLocaleString()}
                                        </p>
                                        <p className="text-white/50 text-xs font-mono">
                                            {transaction.address.slice(0, 20)}...
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${
                                        transaction.type === 'send' ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                        {transaction.type === 'send' ? '-' : '+'}{transaction.amount} {transaction.coin}
                                    </p>
                                    <p className="text-white/70 text-sm">
                                        Hash: {transaction.hash}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-6">
                    {/* Mnemonic Card */}
                    <div className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-300/30">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-400 text-xl">⚠️</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Recovery Phrase</h3>
                                    <p className="text-white/70">Keep this absolutely secret!</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMnemonic(!showMnemonic)}
                                className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-all duration-200"
                            >
                                {showMnemonic ? '🙈 Hide' : '👁️ Show'}
                            </button>
                        </div>
                        
                        {showMnemonic ? (
                            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white break-words">
                                {wallet.mnemonic}
                            </div>
                        ) : (
                            <div className="bg-black/30 rounded-lg p-4 text-center text-white/70">
                                Click "Show" to reveal your recovery phrase
                            </div>
                        )}
                    </div>

                    {/* Security Tips */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-2xl font-bold text-white mb-4">Security Tips</h3>
                        <div className="space-y-3">
                            {[
                                'Never share your recovery phrase with anyone',
                                'Always verify transaction details before confirming',
                                'Use hardware wallets for large amounts',
                                'Keep your software up to date'
                            ].map((tip, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <span className="text-green-400 text-xs">✓</span>
                                    </div>
                                    <p className="text-white/70">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Refresh Button */}
            <div className="fixed bottom-8 right-8">
                <button
                    onClick={fetchBalances}
                    className="w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-full text-white text-xl shadow-2xl transition-all duration-200 transform hover:scale-110"
                >
                    🔄
                </button>
            </div>

            {/* Send Modal */}
            <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Send {selectedCoin?.symbol}</h3>
                        <button
                            onClick={() => setShowSendModal(false)}
                            className="text-white/70 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    <form onSubmit={submitSend} className="space-y-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Recipient Address</label>
                            <input
                                type="text"
                                value={sendForm.recipient}
                                onChange={(e) => setSendForm({...sendForm, recipient: e.target.value})}
                                placeholder={`Enter ${selectedCoin?.symbol} address`}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={sendForm.amount}
                                    onChange={(e) => setSendForm({...sendForm, amount: e.target.value})}
                                    placeholder="0.00"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 pr-16"
                                    required
                                />
                                <span className="absolute right-4 top-3 text-white/70 font-semibold">
                                    {selectedCoin?.symbol}
                                </span>
                            </div>
                            <p className="text-white/50 text-sm mt-1">
                                Available: {balances[selectedCoin?.symbol?.toLowerCase()] || '0.00'} {selectedCoin?.symbol}
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Note (Optional)</label>
                            <input
                                type="text"
                                value={sendForm.note}
                                onChange={(e) => setSendForm({...sendForm, note: e.target.value})}
                                placeholder="Transaction note"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                            />
                        </div>
                        
                        <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
                            <p className="text-yellow-300 text-sm">
                                ⚠️ Double-check the recipient address. Transactions cannot be reversed.
                            </p>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowSendModal(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                            >
                                Send {selectedCoin?.symbol}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Receive Modal */}
            <Modal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Receive {selectedCoin?.symbol}</h3>
                        <button
                            onClick={() => setShowReceiveModal(false)}
                            className="text-white/70 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="text-center space-y-4">
                        <div className="bg-white/10 rounded-lg p-6">
                            <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <div className="text-black text-xs font-mono break-all p-2">
                                    QR Code
                                    <br />
                                    {selectedCoin?.address?.slice(0, 8)}...
                                </div>
                            </div>
                            <p className="text-white/70 text-sm mb-4">Scan QR code to get address</p>
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Your {selectedCoin?.symbol} Address</label>
                            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                                <p className="text-white font-mono text-sm break-all mb-3">
                                    {selectedCoin?.address}
                                </p>
                                <button
                                    onClick={() => copyToClipboard(selectedCoin?.address)}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-semibold"
                                >
                                    📋 Copy Address
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4">
                            <p className="text-blue-300 text-sm">
                                💡 Only send {selectedCoin?.symbol} to this address. Sending other tokens may result in permanent loss.
                            </p>
                        </div>
                        
                        <button
                            onClick={() => setShowReceiveModal(false)}
                            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Profile Edit Modal */}
            <Modal isOpen={editingProfile} onClose={() => setEditingProfile(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
                        <button
                            onClick={() => setEditingProfile(false)}
                            className="text-white/70 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <div className={`w-20 h-20 rounded-full ${generateAvatar(profileForm.username)} flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4`}>
                                {profileForm.username.charAt(0).toUpperCase()}
                            </div>
                            <button className="text-purple-400 text-sm hover:text-purple-300">
                                Change Avatar
                            </button>
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-2">Username</label>
                            <input
                                type="text"
                                value={profileForm.username}
                                onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Favorite Coins</label>
                            <div className="flex space-x-2">
                                {['BTC', 'ETH', 'SOL', 'ADA', 'DOT'].map(coin => (
                                    <button
                                        key={coin}
                                        onClick={() => {
                                            const favorites = profileForm.stats.favoriteCoins.includes(coin)
                                                ? profileForm.stats.favoriteCoins.filter(c => c !== coin)
                                                : [...profileForm.stats.favoriteCoins, coin];
                                            setProfileForm({
                                                ...profileForm,
                                                stats: {...profileForm.stats, favoriteCoins: favorites}
                                            });
                                        }}
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                            profileForm.stats.favoriteCoins.includes(coin)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                                    >
                                        {coin}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                            <button
                                onClick={() => setEditingProfile(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProfileSave}
                                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Profile Quick Access Modal */}
            <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Profile</h3>
                        <button
                            onClick={() => setShowProfileModal(false)}
                            className="text-white/70 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="text-center space-y-4">
                        <div className={`w-24 h-24 rounded-full ${generateAvatar(userProfile.username)} flex items-center justify-center text-white font-bold text-3xl mx-auto`}>
                            {userProfile.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white">{userProfile.username}</h4>
                            <p className="text-white/70">{userProfile.email}</p>
                            <p className="text-white/50 text-sm mt-2">
                                Member since {userProfile.joinDate.toLocaleDateString()}
                            </p>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-4 text-left">
                            <h5 className="text-white font-semibold mb-3">Quick Stats</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/70">Transactions:</span>
                                    <span className="text-white">{userProfile.stats.totalTransactions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/70">Portfolio Value:</span>
                                    <span className="text-white">${totalValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/70">Total Volume:</span>
                                    <span className="text-white">${userProfile.stats.totalVolume.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setShowProfileModal(false);
                                    setActiveTab('profile');
                                }}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                            >
                                View Full Profile
                            </button>
                            <button
                                onClick={() => {
                                    setShowProfileModal(false);
                                    setEditingProfile(true);
                                }}
                                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Change Email Modal */}
            <Modal isOpen={showChangeEmailModal} onClose={() => setShowChangeEmailModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Change Email Address</h3>
                        <button
                            onClick={() => setShowChangeEmailModal(false)}
                            className="text-white/70 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    <form onSubmit={handleEmailChange} className="space-y-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Current Password</label>
                            <input
                                type="password"
                                value={emailForm.currentPassword}
                                onChange={(e) => setEmailForm({...emailForm, currentPassword: e.target.value})}
                                placeholder="Enter current password"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                                required
                            />
                            <p className="text-white/50 text-xs mt-1">For demo: use "password123"</p>
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Current Email</label>
                            <input
                                type="email"
                                value={userProfile.email}
                                disabled
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/50"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">New Email Address</label>
                            <input
                                type="email"
                                value={emailForm.newEmail}
                                onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                                placeholder="Enter new email address"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Confirm New Email</label>
                            <input
                                type="email"
                                value={emailForm.confirmEmail}
                                onChange={(e) => setEmailForm({...emailForm, confirmEmail: e.target.value})}
                                placeholder="Confirm new email address"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                                required
                            />
                        </div>
                        
                        <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4">
                            <p className="text-blue-300 text-sm">
                                📧 A verification email will be sent to your new email address.
                            </p>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowChangeEmailModal(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                            >
                                Change Email
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Change Password</h3>
                        <button
                            onClick={() => setShowChangePasswordModal(false)}
                            className="text-white/70 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                placeholder="Enter current password"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-orange-400"
                                required
                            />
                            <p className="text-white/50 text-xs mt-1">For demo: use "password123"</p>
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                placeholder="Enter new password"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-orange-400"
                                required
                                minLength="8"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                placeholder="Confirm new password"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-orange-400"
                                required
                                minLength="8"
                            />
                        </div>
                        
                        <div className="bg-orange-500/20 border border-orange-300/30 rounded-lg p-4">
                            <p className="text-orange-300 text-sm mb-2">
                                🔐 Password Requirements:
                            </p>
                            <ul className="text-orange-300 text-xs space-y-1">
                                <li>• At least 8 characters long</li>
                                <li>• Mix of uppercase and lowercase letters</li>
                                <li>• At least one number</li>
                                <li>• At least one special character</li>
                            </ul>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowChangePasswordModal(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                            >
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Account Modal */}
            <Modal isOpen={showDeleteAccountModal} onClose={() => setShowDeleteAccountModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-red-400">Delete Account</h3>
                        <button
                            onClick={() => setShowDeleteAccountModal(false)}
                            className="text-white/70 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="text-red-400 text-2xl">⚠️</span>
                            <h4 className="text-red-400 font-bold">Warning: This action is irreversible!</h4>
                        </div>
                        <p className="text-red-300 text-sm">
                            Deleting your account will permanently remove:
                        </p>
                        <ul className="text-red-300 text-sm mt-2 ml-4 space-y-1">
                            <li>• All wallet data and transaction history</li>
                            <li>• Your private keys and recovery phrase</li>
                            <li>• Profile information and preferences</li>
                            <li>• Access to your cryptocurrency funds</li>
                        </ul>
                    </div>
                    
                    <form onSubmit={handleDeleteAccount} className="space-y-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={deleteForm.password}
                                onChange={(e) => setDeleteForm({...deleteForm, password: e.target.value})}
                                placeholder="Enter your password"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-red-400"
                                required
                            />
                            <p className="text-white/50 text-xs mt-1">For demo: use "password123"</p>
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm mb-2">
                                Type "DELETE" to confirm (case-sensitive)
                            </label>
                            <input
                                type="text"
                                value={deleteForm.confirmText}
                                onChange={(e) => setDeleteForm({...deleteForm, confirmText: e.target.value})}
                                placeholder="Type DELETE here"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-red-400"
                                required
                            />
                        </div>
                        
                        <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
                            <p className="text-yellow-300 text-sm">
                                💡 <strong>Alternative:</strong> Consider backing up your recovery phrase and simply logging out instead of permanently deleting your account.
                            </p>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteAccountModal(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                            >
                                Delete Account
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

export default WalletDashboard;