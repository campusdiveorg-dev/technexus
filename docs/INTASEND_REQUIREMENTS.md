# ⚡ Bite Tech Ltd — IntaSend Integration & Verification Guide

This document outlines everything needed to set up, test, and activate **IntaSend** for Kenyan payment processing (M-Pesa STK Push, Airtel Money, Visa/Mastercard, and Bank Transfers).

---

## 🟢 1. Testing / Sandbox Environment (Development Phase)

In Sandbox mode, you can immediately test end-to-end checkout without submitting KYC documents or processing real money.

### What You Need:
1. **IntaSend Account**: Sign up for a free developer account at [https://intasend.com](https://intasend.com).
2. **Sandbox API Keys**:
   - Navigate to **Settings → API Keys** in your IntaSend dashboard.
   - Copy your **Publishable Key** (e.g. `716d0110-8d16-4004-9d5d-55b0f5f4eb41` or `ISPubKey_test_...`).
   - Copy your **Secret Key** / API Token.
3. **Environment Configuration (`.env`)**:
   ```env
   INTASEND_PUBLISHABLE_KEY=716d0110-8d16-4004-9d5d-55b0f5f4eb41
   INTASEND_SECRET_KEY=525umJNUY1SmNBiqLVval2LolU12ZNwT
   INTASEND_IS_LIVE=false
   ```
4. **Sandbox Test Credentials**:
   - **Test M-Pesa Phone**: `254708374149` (or any valid `2547XXXXXXXX` number)
   - **Test PIN / OTP**: `12345` (if prompted in the sandbox popup)
   - **Test Card**: Available in the IntaSend Sandbox documentation.

---

## 🚀 2. Live / Production Environment (Accepting Real Money)

To receive real payments and disburse seller payouts, IntaSend requires account verification (KYC). You can register as either an **Individual / Freelancer** or a **Registered Business**.

### Option A: Individual / Sole Proprietor (Fastest & Simplest)
If you are operating as an individual developer or sole trader:

| Required Document | Description |
|---|---|
| **National Identity Card** | Clear color scan/photo of Kenyan National ID (Front & Back) or Valid Passport |
| **KRA PIN Certificate** | Personal KRA PIN Certificate (PDF or clear image) |
| **Settlement Account Details** | Registered M-Pesa phone number or personal Kenyan bank account details (Bank name, Branch, Account Number) |
| **Contact Details** | Active email address, phone number, and physical residential address |

---

### Option B: Registered Company / Business Entity
If operating as a registered company (LLC, Limited, Partnership):

| Required Document | Description |
|---|---|
| **Business Registration Certificate** | Certificate of Incorporation or Business Name Registration Certificate (from eCitizen / BRS) |
| **Company KRA PIN Certificate** | KRA PIN registered to the business entity |
| **CR12 Document** | Official CR12 document (or CR13 for partnerships) issued within the last 3–6 months |
| **Directors' National IDs & KRA PINs** | Copies of National IDs and KRA PIN certificates for all major directors |
| **Settlement Account Details** | Corporate Bank Account details or Safaricom M-Pesa Paybill / Buy Goods Till Number |
| **Physical Address Proof** | Utility bill, office lease agreement, or business permit |

---

## ⚙️ 3. Technical Going-Live Checklist

Once your IntaSend account is verified and approved for live transactions:

1. **Retrieve Live Keys**:
   - Log into your IntaSend dashboard and switch toggle from **Sandbox** to **Live**.
   - Copy the Live **Publishable Key** (`ISPubKey_live_...`) and Live **Secret Key** (`ISSecretKey_live_...`).

2. **Update Environment Variables**:
   In your production deployment (e.g. Vercel Dashboard → *Settings → Environment Variables*):
   ```env
   INTASEND_PUBLISHABLE_KEY=ISPubKey_live_xxxxxxxxxxxxxxxxxxxxxxxx
   INTASEND_SECRET_KEY=ISSecretKey_live_xxxxxxxxxxxxxxxxxxxxxxxx
   INTASEND_IS_LIVE=true
   ```

3. **Configure Webhook URL (Optional but Recommended)**:
   - In IntaSend Dashboard → **Settings → Webhooks**:
   - Add Webhook URL: `https://your-domain.vercel.app/api/orders/create`
   - Secret Hash / Challenge: Matches your environment config.

4. **Verify Settlement / Payout Schedule**:
   - Configure automatic settlement (Daily, Weekly, or On-Demand M-Pesa B2C / Bank EFT) to your designated bank account or Till in your IntaSend wallet settings.

---

## 📞 Support & Resources

- **IntaSend Developer Docs**: [https://developers.intasend.com](https://developers.intasend.com)
- **IntaSend Dashboard**: [https://payment.intasend.com](https://payment.intasend.com)
- **Bite Tech Ltd Support**: `support@bitetechltd.co.ke`
