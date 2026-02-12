import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from "react-qr-code";
import { generateKey, exportKey, encryptData, decryptData, importKey } from './crypto';
import { Lock, Shield, ShieldAlert, ShieldX, CheckCircle, AlertTriangle, ShieldCheck, FileText, ArrowRight, Flame, RefreshCw } from 'lucide-react';

// Automatically detect IP for mobile sharing
const API_URL = `http://${window.location.hostname}:8080/api`;

function App() {
  const [view, setView] = useState('create');
  
  // Data States
  const [secretContent, setSecretContent] = useState('');
  const [ttl, setTtl] = useState(86400); 
  const [password, setPassword] = useState('');
  
  // Result States
  const [generatedLink, setGeneratedLink] = useState('');
  const [secretId, setSecretId] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [secretStatus, setSecretStatus] = useState('active');
  
  // Security States
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  
  // Reveal States
  const [decryptedContent, setDecryptedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // On Load: Check URL & Get "Lives" Left
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const hash = window.location.hash.substring(1); 

    if (id) {
      if (!hash) {
        setView('error');
        setErrorMsg("Missing Decryption Key. Link is invalid.");
      } else {
        // Check attempts left immediately
        axios.get(`${API_URL}/check/${id}`)
             .then(res => {
                 if(res.data.remainingAttempts !== undefined) {
                     setAttemptsLeft(res.data.remainingAttempts);
                 }
                 setView('reveal');
             })
             .catch(() => setView('error'));
      }
    }
  }, []);

  // CREATE
  const handleCreate = async () => {
    if (!secretContent) return;
    setLoading(true);

    try {
      const rawKey = await generateKey();
      const encryptedText = await encryptData(secretContent, rawKey);
      
      const payload = { 
        content: encryptedText, 
        password: password, 
        ttl: ttl 
      };

      const response = await axios.post(`${API_URL}/create`, payload);
      const { id, adminToken } = response.data;
      
      const keyString = await exportKey(rawKey);
      const fullLink = `${window.location.origin}/?id=${id}#${btoa(keyString)}`;
      
      setSecretId(id);
      setAdminToken(adminToken);
      setGeneratedLink(fullLink);
      setView('dashboard'); 
    } catch (err) {
      alert("Failed to create secret. Is the Backend running?");
    } finally {
      setLoading(false);
    }
  };

  // DASHBOARD STATUS
  const checkStatus = async () => {
    try {
        const response = await axios.get(`${API_URL}/status/${secretId}`);
        if (response.data.active) {
            setSecretStatus('active');
            
            if(response.data.attemptsLeft) setAttemptsLeft(response.data.attemptsLeft);
        } else {
            setSecretStatus('destroyed');
        }
    } catch (e) { setSecretStatus('destroyed'); }
  };

  // BURN
  const handleBurn = async () => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    setLoading(true);
    try {
        await axios.post(`${API_URL}/burn/${secretId}`, { adminToken });
        setSecretStatus('destroyed');
    } catch (e) { alert("Failed to burn secret."); } 
    finally { setLoading(false); }
  };

  // REVEAL (The 3-Strike Logic)
  const handleReveal = async () => {
    setLoading(true);
    setErrorMsg("");
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const keyB64 = window.location.hash.substring(1); 

    try {
        const response = await axios.post(`${API_URL}/view/${id}`, { password });
        const encryptedContent = response.data;

        const keyJson = atob(keyB64);
        const rawKey = await importKey(keyJson);
        const originalText = await decryptData(encryptedContent, rawKey);

        setDecryptedContent(originalText);
        setView('content');
    } catch (err) {
      // HANDLE FAILED ATTEMPTS
      if (err.response && err.response.status === 401) {
        setAttemptsLeft(prev => prev - 1); // Decrease life counter
        setErrorMsg("🔒 WRONG PASSWORD! Attempts remaining: " + (attemptsLeft - 1));
      } 
      else if (err.response && err.response.status === 410) {
        setView('error');
        setErrorMsg("💥 SECURITY PROTOCOL ACTIVATED: Data Destroyed.");
      }
      else {
        setView('error');
        setErrorMsg("Link expired or secret destroyed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">SecureLink</h1>
        <p className="text-muted text-sm">Confidential Data Vault</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* CREATE */}
        {view === 'create' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <textarea 
              className="w-full bg-[#09090b] border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
              placeholder="Paste sensitive data, API keys, or passwords..."
              value={secretContent}
              onChange={(e) => setSecretContent(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <select className="bg-[#09090b] border border-border rounded-lg p-2.5 text-sm outline-none"
                  value={ttl} onChange={(e) => setTtl(Number(e.target.value))}>
                  <option value={3600}>Expires: 1 Hour</option>
                  <option value={86400}>Expires: 1 Day</option>
              </select>
              <input type="password" className="bg-[#09090b] border border-border rounded-lg p-2.5 text-sm outline-none"
                  placeholder="Optional PIN" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button onClick={handleCreate} disabled={loading || !secretContent}
              className="w-full bg-white text-black font-semibold h-10 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? "Encrypting..." : <>Create Secure Link <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {view === 'dashboard' && (
          <div className="text-center space-y-4 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${secretStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className="text-sm font-medium">{secretStatus === 'active' ? 'Active' : 'Destroyed'}</span>
                </div>
                <button onClick={checkStatus} className="text-xs text-muted hover:text-white flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Check
                </button>
            </div>

            <div className="bg-white p-2 rounded-lg inline-block">
                <QRCode value={generatedLink} size={120} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigator.clipboard.writeText(generatedLink)}
                  className="bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 py-2 rounded-lg text-sm font-medium">
                  Copy Link
                </button>
                <button onClick={handleBurn} disabled={secretStatus !== 'active'}
                  className="bg-red-600/10 text-red-500 hover:bg-red-600/20 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <Flame className="w-4 h-4" /> Burn Now
                </button>
            </div>
            <button onClick={() => window.location.reload()} className="text-xs text-muted hover:text-white mt-4">
                Create New Secret
            </button>
          </div>
        )}

        {/* REVEAL */}
        {view === 'reveal' && (
            <div className="text-center space-y-4 animate-in fade-in duration-500">
                
                {/* SECURITY STATUS INDICATOR */}
                <div className="flex justify-center gap-2 mb-2">
                   {[1, 2, 3].map(i => (
                       <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i <= attemptsLeft ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                           {i <= attemptsLeft ? <Shield className="w-4 h-4"/> : <ShieldX className="w-4 h-4"/>}
                       </div>
                   ))}
                </div>

                <h3 className="text-lg font-semibold">Protected Message</h3>
                <p className="text-sm text-muted">
                    Attempts remaining: <span className={attemptsLeft < 2 ? "text-red-500 font-bold" : "text-white"}>{attemptsLeft}</span>
                </p>

                <input type="password" placeholder="Enter PIN"
                  className={`w-full bg-[#09090b] border rounded-lg p-2.5 text-sm text-center outline-none focus:ring-2 ${errorMsg ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-blue-500'}`}
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                
                {errorMsg && <p className="text-red-500 text-xs font-semibold animate-pulse">{errorMsg}</p>}

                <button onClick={handleReveal} disabled={loading}
                  className="w-full bg-orange-600 text-white font-semibold h-10 rounded-lg hover:bg-orange-700 transition-colors">
                   {loading ? "Verifying..." : "Unlock Secret"}
                </button>
            </div>
        )}

        {/* CONTENT */}
        {view === 'content' && (
            <div className="space-y-4 animate-in zoom-in duration-300">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Decrypted Successfully</span>
                </div>
                <div className="bg-[#09090b] p-4 rounded-lg border border-border font-mono text-sm break-words whitespace-pre-wrap min-h-[100px]">
                    {decryptedContent}
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-3 items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">
                        This message has been destroyed from the server.
                    </p>
                </div>
                <button onClick={() => window.location.href = '/'}
                    className="w-full bg-white/10 text-white h-9 rounded-lg hover:bg-white/20 text-sm">
                    Create New Secret
                </button>
            </div>
        )}

        {/* ERROR */}
        {view === 'error' && (
            <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-red-500">Access Denied</h3>
                <p className="text-sm text-muted">{errorMsg || "Link expired or destroyed."}</p>
                <button onClick={() => window.location.href = '/'}
                    className="w-full bg-white/10 text-white h-9 rounded-lg hover:bg-white/20 text-sm">
                    Go Home
                </button>
            </div>
        )}

      </div>
      <p className="text-center text-xs text-muted mt-8">AES-256 Encryption • Client-Side Privacy • Audit-Grade Security</p>
    </div>
  );
}

export default App;