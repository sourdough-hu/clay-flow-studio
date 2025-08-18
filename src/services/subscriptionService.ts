import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";

// Product IDs for StoreKit
export const PRODUCT_IDS = {
  PRO_MONTHLY: "com.yourapp.pro.monthly",
  PRO_YEARLY: "com.yourapp.pro.yearly",
} as const;

export interface SubscriptionData {
  plan: 'free' | 'pro';
  store?: string;
  originalTransactionId?: string;
  latestExpirationAt?: string;
  subscriptionStatus: 'active' | 'expired' | 'pending';
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private currentSubscription: SubscriptionData | null = null;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  async checkCurrentEntitlements(): Promise<SubscriptionData> {
    if (!this.isIOS()) {
      return this.getFallbackSubscription();
    }

    try {
      // TODO: Implement actual StoreKit 2 entitlement checking
      // For now, return cached or default data
      return this.currentSubscription || this.getFallbackSubscription();
    } catch (error) {
      console.error('Failed to check entitlements:', error);
      return this.getFallbackSubscription();
    }
  }

  async purchaseProduct(productId: string): Promise<boolean> {
    if (!this.isIOS()) {
      throw new Error('Purchases are only available on iOS');
    }

    try {
      // TODO: Implement actual StoreKit 2 purchase
      // For now, simulate success for development
      console.log('Simulating purchase for:', productId);
      
      const subscriptionData: SubscriptionData = {
        plan: 'pro',
        store: 'app_store',
        originalTransactionId: `sim_${Date.now()}`,
        latestExpirationAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        subscriptionStatus: 'active',
      };

      await this.syncToSupabase(subscriptionData);
      this.currentSubscription = subscriptionData;
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    if (!this.isIOS()) {
      throw new Error('Restore is only available on iOS');
    }

    try {
      // TODO: Implement actual StoreKit 2 restore
      // For now, simulate finding existing purchase
      console.log('Simulating restore purchases');
      
      const hasExistingPurchase = Math.random() > 0.5; // Random for demo
      
      if (hasExistingPurchase) {
        const subscriptionData: SubscriptionData = {
          plan: 'pro',
          store: 'app_store',
          originalTransactionId: `restored_${Date.now()}`,
          latestExpirationAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          subscriptionStatus: 'active',
        };

        await this.syncToSupabase(subscriptionData);
        this.currentSubscription = subscriptionData;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }

  async openManageSubscription(): Promise<void> {
    if (!this.isIOS()) {
      throw new Error('Subscription management is only available on iOS');
    }

    try {
      // TODO: Implement opening iOS subscription management
      console.log('Opening iOS subscription management');
      // This would typically open the system subscription management
    } catch (error) {
      console.error('Failed to open subscription management:', error);
    }
  }

  private async syncToSupabase(subscriptionData: SubscriptionData): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: session.user.id,
        plan: subscriptionData.plan,
        store: subscriptionData.store,
        original_transaction_id: subscriptionData.originalTransactionId,
        latest_expiration_at: subscriptionData.latestExpirationAt,
        subscription_status: subscriptionData.subscriptionStatus,
      });

    if (error) {
      console.error('Failed to sync subscription to Supabase:', error);
    }
  }

  private getFallbackSubscription(): SubscriptionData {
    return {
      plan: 'free',
      subscriptionStatus: 'expired',
    };
  }

  async loadUserSubscription(): Promise<SubscriptionData> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return this.getFallbackSubscription();
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, store, original_transaction_id, latest_expiration_at, subscription_status")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        this.currentSubscription = {
          plan: (profile.plan as 'free' | 'pro') || 'free',
          store: profile.store || undefined,
          originalTransactionId: profile.original_transaction_id || undefined,
          latestExpirationAt: profile.latest_expiration_at || undefined,
          subscriptionStatus: (profile.subscription_status as 'active' | 'expired' | 'pending') || 'expired',
        };
        return this.currentSubscription;
      }
    } catch (error) {
      console.error('Failed to load user subscription:', error);
    }

    return this.getFallbackSubscription();
  }
}

export const subscriptionService = SubscriptionService.getInstance();