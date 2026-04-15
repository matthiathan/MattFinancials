import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  Upload, 
  FileText, 
  Search, 
  Trash2, 
  ExternalLink, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';

interface Receipt {
  id: string;
  user_id: string;
  merchant_name: string;
  amount: number;
  date: string;
  image_url: string;
  transaction_id?: string;
}

export function Receipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  async function fetchReceipts() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (data) setReceipts(data);
    setLoading(false);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, or PDF.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await supabase.from('receipts').insert({
        user_id: user.id,
        merchant_name: 'New Receipt', // In a real app, use AI OCR here
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        image_url: publicUrl
      });

      if (dbError) throw dbError;

      fetchReceipts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Digital Archive</h2>
          <p className="text-slate-400">Upload and manage your purchase receipts for audit verification.</p>
        </div>
        <label className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 cursor-pointer group">
          {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} className="group-hover:translate-y-[-2px] transition-transform" />}
          {uploading ? 'Archiving...' : 'Archive Receipt'}
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
        </label>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-bold uppercase tracking-widest text-xs">Synchronizing Archive...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card/20 border-2 border-dashed border-border rounded-3xl text-slate-500">
            <Camera size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No digital records found.</p>
          </div>
        ) : receipts.map((receipt) => (
          <Card key={receipt.id} className="p-0 overflow-hidden group border-border/50 hover:border-primary/50 transition-all">
            <div className="aspect-[4/3] relative overflow-hidden bg-card">
              <img 
                src={receipt.image_url} 
                alt={receipt.merchant_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                <a 
                  href={receipt.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 border border-white/20 rounded-full text-white hover:bg-primary hover:border-primary transition-all duration-300 active:scale-90 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                >
                  <ExternalLink size={18} />
                </a>
                <button 
                  type="button"
                  className="p-3 bg-white/10 border border-white/20 rounded-full text-white hover:bg-error hover:border-error transition-all duration-300 active:scale-90 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="absolute top-2 right-2">
                <div className="px-2 py-1 bg-background/80 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                  {new Date(receipt.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-white truncate pr-2">{receipt.merchant_name}</h4>
                <span className="font-black text-primary font-mono">{formatCurrency(receipt.amount)}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {receipt.id.slice(0, 8)}</p>
                {receipt.transaction_id ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-success uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Linked
                  </span>
                ) : (
                  <button 
                    type="button"
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-all duration-300 active:scale-95 hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                  >
                    Link Entry
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
