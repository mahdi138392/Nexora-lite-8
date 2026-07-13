import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const RITUAL_RPC = 'https://rpc.ritualfoundation.org';
const FEE_RECIPIENT = '0xd06bC18129a8be9af885E7E63B1B95FB19c261b3';
type ItemType = 'xp_booster' | 'premium_pass';

interface ApiRequest {
  method?: string;
  body?: {
    walletAddress?: string;
    itemType?: string;
    txHash?: string;
  };
}

interface ApiResponse {
  status: (code: number) => {
    json: (body: { error?: string; success?: boolean }) => void;
  };
}

const PRICES: Record<ItemType, string> = {
  xp_booster: '0.01',
  premium_pass: '0.05',
};

function isItemType(itemType: string | undefined): itemType is ItemType {
  return itemType === 'xp_booster' || itemType === 'premium_pass';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { walletAddress, itemType, txHash } = req.body || {};

  if (!walletAddress || !isItemType(itemType) || !txHash) {
    res.status(400).json({ error: 'Missing or invalid parameters' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Server missing Supabase service credentials' });
    return;
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 1. Prevent replay: this txHash must not already be recorded
    const { data: existing } = await supabase
      .from('transactions')
      .select('tx_hash')
      .eq('tx_hash', txHash)
      .maybeSingle();

    if (existing) {
      res.status(409).json({ error: 'Transaction already used' });
      return;
    }

    // 2. Verify the transaction on-chain
    const provider = new ethers.JsonRpcProvider(RITUAL_RPC);
    const receipt = await provider.getTransactionReceipt(txHash);
    const tx = await provider.getTransaction(txHash);

    if (!receipt || !tx || receipt.status !== 1) {
      res.status(400).json({ error: 'Transaction not found or not confirmed' });
      return;
    }

    if (tx.to?.toLowerCase() !== FEE_RECIPIENT.toLowerCase()) {
      res.status(400).json({ error: 'Transaction recipient mismatch' });
      return;
    }

    if (tx.from?.toLowerCase() !== walletAddress.toLowerCase()) {
      res.status(400).json({ error: 'Transaction sender mismatch' });
      return;
    }

    const expectedValue = ethers.parseEther(PRICES[itemType]);
    if (tx.value < expectedValue) {
      res.status(400).json({ error: 'Transaction amount too low' });
      return;
    }

    // 3. All checks passed — update the user record server-side
    const now = new Date().toISOString();
    const addr = walletAddress.toLowerCase();

    if (itemType === 'premium_pass') {
      const { error: updateError } = await supabase
        .from('users')
        .update({ premium_status: true, premium_purchased_at: now, updated_at: now })
        .eq('wallet_address', addr);

      if (updateError) {
        console.error('[verify-purchase] premium pass update failed:', updateError);
        res.status(500).json({ error: 'Failed to apply purchase. Please try again.' });
        return;
      }
    } else {
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error: updateError } = await supabase
        .from('users')
        .update({ xp_booster_active: true, xp_booster_expiry: expiry, updated_at: now })
        .eq('wallet_address', addr);

      if (updateError) {
        console.error('[verify-purchase] XP booster update failed:', updateError);
        res.status(500).json({ error: 'Failed to apply purchase. Please try again.' });
        return;
      }
    }

    const { error: transactionError } = await supabase.from('transactions').insert({
      wallet_address: addr,
      transaction_type: itemType,
      tx_hash: txHash,
      amount: PRICES[itemType],
      status: 'confirmed',
      created_at: now,
    });

    if (transactionError) {
      // Non-fatal: the user row update already succeeded, only the purchase
      // log entry failed. Log it but still return success since the purchase
      // effect was saved correctly.
      console.error('[verify-purchase] transaction insert failed:', transactionError);
    }

    res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error('[verify-purchase] error:', err);
    const message = err instanceof Error ? err.message : 'Verification failed';
    res.status(500).json({ error: message });
  }
}
