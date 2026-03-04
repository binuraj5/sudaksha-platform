# SUDASSESS - PRICING MODEL & HOMEPAGE SPECIFICATION
## Freemium to Premium Monetization Strategy

---

## 📊 PRICING STRATEGY OVERVIEW

### Current Status: PILOT PHASE (Free)
- All features free for pilot clients
- Usage data collection
- Feedback gathering
- Feature validation

### Future Status: COMMERCIALIZATION (After Pilot)
- Pay-per-feature
- Pay-as-you-go (per assessment)
- Subscription bundles
- Custom enterprise packages

---

## 💰 PRICING MODEL

### 1. PRICING DIMENSIONS

```
┌─────────────────────────────────────────────────────────┐
│            PRICING CALCULATION FACTORS                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  BASE = Tenant Type (Corporate | Institution)           │
│  + SCALE = User Count (1-10 | 11-50 | 51-200 | 201+)   │
│  + FEATURES = Selected Modules                           │
│  + DURATION = Billing Period (Month | Quarter | Year)   │
│  + USAGE = Assessments Taken                             │
│                                                           │
│  TOTAL PRICE = BASE × SCALE_MULTIPLIER ×                │
│                FEATURE_MULTIPLIER ×                      │
│                DURATION_DISCOUNT ×                       │
│                USAGE_COST                                 │
└─────────────────────────────────────────────────────────┘
```

### 2. BASE PRICING (Per Month)

| Tier | User Range | Corporate | Institution | B2C |
|------|------------|-----------|-------------|-----|
| **Starter** | 1-10 | $49/mo | $39/mo | FREE |
| **Growth** | 11-50 | $199/mo | $149/mo | FREE |
| **Business** | 51-200 | $599/mo | $449/mo | FREE |
| **Enterprise** | 201+ | Custom | Custom | FREE |

### 3. FEATURE-BASED PRICING (Add-Ons)

| Feature Module | Corporate | Institution | B2C | Status |
|----------------|-----------|-------------|-----|--------|
| **Core Features** (Included in Base) |
| - Authentication & User Mgmt | ✅ Included | ✅ Included | ✅ FREE | Active |
| - Departments & Teams | ✅ Included | ✅ Included | ❌ N/A | Active |
| - Basic Assessments | ✅ Included | ✅ Included | ✅ FREE | Active |
| - Dashboard & Analytics | ✅ Included | ✅ Included | ✅ FREE (Limited) | Active |
| - Reports (Basic) | ✅ Included | ✅ Included | ✅ FREE | Active |
| **Premium Add-Ons** |
| - Advanced Role/Competency Mgmt | +$20/mo | +$15/mo | +$5/mo | Planned |
| - Bulk Upload (500+) | +$15/mo | +$10/mo | ❌ N/A | Active |
| - Custom Report Builder | +$30/mo | +$25/mo | ❌ N/A | Planned |
| - Survey Module | +$25/mo | +$20/mo | ❌ N/A | Planned |
| - Career Planning Portal | +$40/mo | +$30/mo | ✅ FREE | Planned |
| **AI-Powered Features** |
| - AI Question Generation | +$50/mo | +$40/mo | +$10/mo | Active |
| - Code Testing Integration | +$100/mo | +$80/mo | +$20/mo | Planned |
| - AI Voice Interview | +$150/mo | +$120/mo | +$30/mo | Future |
| - AI Video Interview | +$200/mo | +$160/mo | +$40/mo | Future |
| **Enterprise Features** |
| - White Label Branding | +$300/mo | +$250/mo | ❌ N/A | Future |
| - Dedicated Support | +$500/mo | +$400/mo | ❌ N/A | Active |
| - Custom Integration | Custom Quote | Custom Quote | ❌ N/A | On Request |
| - On-Premise Deployment | Custom Quote | Custom Quote | ❌ N/A | On Request |

### 4. USAGE-BASED PRICING (Pay-as-you-go)

| Assessment Type | Per Assessment | Bulk Discount (100+) | Corporate | Institution | B2C |
|-----------------|----------------|----------------------|-----------|-------------|-----|
| **Basic Assessment** | $0.50 | $0.35 (-30%) | ✅ | ✅ | FREE (10/mo) then $0.25 |
| **Role-Based Assessment** | $1.00 | $0.70 (-30%) | ✅ | ✅ | $0.50 |
| **Code Test Assessment** | $3.00 | $2.10 (-30%) | ✅ | ✅ | $1.50 |
| **AI Voice Interview** | $10.00 | $7.00 (-30%) | ✅ | ✅ | $5.00 |
| **AI Video Interview** | $15.00 | $10.50 (-30%) | ✅ | ✅ | $7.50 |
| **Survey (per response)** | $0.10 | $0.07 (-30%) | ✅ | ✅ | ❌ |

**B2C Free Tier:**
- 10 basic assessments/month FREE
- After 10: $0.25 per assessment
- Unlimited profile & career planning (always FREE)

### 5. SUBSCRIPTION BUNDLES

#### Bundle A: ESSENTIALS
**Price:** 15% discount on base + selected features  
**Includes:**
- All core features
- Up to 3 premium add-ons
- 100 assessments/month included
- Standard support

| Users | Corporate | Institution |
|-------|-----------|-------------|
| 1-10 | $42/mo | $33/mo |
| 11-50 | $169/mo | $127/mo |
| 51-200 | $509/mo | $382/mo |

#### Bundle B: PROFESSIONAL
**Price:** 25% discount on base + all non-AI features  
**Includes:**
- All core + premium features (except AI)
- 500 assessments/month included
- Priority support
- Custom report templates

| Users | Corporate | Institution |
|-------|-----------|-------------|
| 1-10 | $112/mo | $90/mo |
| 11-50 | $299/mo | $224/mo |
| 51-200 | $899/mo | $674/mo |

#### Bundle C: ENTERPRISE
**Price:** 35% discount on everything  
**Includes:**
- ALL features (including AI)
- Unlimited assessments
- Dedicated support
- Custom integrations
- White label options

| Users | Corporate | Institution |
|-------|-----------|-------------|
| 1-10 | $261/mo | $209/mo |
| 11-50 | $649/mo | $487/mo |
| 51-200 | $1,299/mo | $974/mo |
| 201+ | Custom | Custom |

### 6. BILLING PERIODS & DISCOUNTS

| Period | Discount | Payment |
|--------|----------|---------|
| **Monthly** | 0% | Pay monthly |
| **Quarterly (3 mo)** | 5% off | Pay upfront |
| **Semi-Annual (6 mo)** | 10% off | Pay upfront |
| **Annual (12 mo)** | 20% off | Pay upfront |

**Example:**
- Growth tier ($199/mo) × 12 months = $2,388/year
- With 20% annual discount = $1,910/year
- **Savings: $478/year**

### 7. ENTERPRISE CUSTOM PRICING

For 201+ users or special requirements:
- Volume discounts (30-50% off)
- Custom feature development
- Dedicated account manager
- SLA guarantees
- On-premise deployment options

---

## 🏠 HOMEPAGE SPECIFICATION

### Design Philosophy
- **Minimalistic** (pilot phase)
- **Fast loading** (<1s)
- **Mobile-first** responsive
- **SEO-optimized**
- **Clear CTAs** (Login + Start Free Trial)

### Homepage Structure

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATION BAR                        │
│  [Logo] SudAssess     Features  Pricing  About  [Login] │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     HERO SECTION                         │
│                                                           │
│        Modern Assessment Platform for Teams              │
│                                                           │
│     Empower your organization with AI-powered            │
│     competency assessments and career development        │
│                                                           │
│        [Start Free Trial]  [Watch Demo (2 min)]         │
│                                                           │
│        Trusted by 50+ pilot organizations                │
│        [Logo] [Logo] [Logo] [Logo] [Logo]               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   FEATURES PREVIEW                       │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 🎯 Role-Based│  │ 🤖 AI-Powered│  │ 📊 Analytics │  │
│  │ Assessments  │  │ Questions    │  │ Dashboard    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 👥 Multi-    │  │ 💼 Career    │  │ 📈 Real-Time │  │
│  │ Tenant       │  │ Planning     │  │ Reports      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   PRICING TEASER                         │
│                                                           │
│           Simple, Transparent Pricing                     │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ STARTER  │  │  GROWTH  │  │ BUSINESS │              │
│  │ $49/mo   │  │ $199/mo  │  │ $599/mo  │              │
│  │ 1-10     │  │ 11-50    │  │ 51-200   │              │
│  │ users    │  │ users    │  │ users    │              │
│  │ [Start]  │  │ [Start]  │  │ [Start]  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                           │
│           [View Full Pricing Details →]                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  SOCIAL PROOF                            │
│                                                           │
│      "SudAssess transformed our hiring process"          │
│      - John Doe, CTO at TechCorp                        │
│                                                           │
│      ⭐⭐⭐⭐⭐  4.9/5 from 50+ pilot users               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  CALL TO ACTION                          │
│                                                           │
│         Ready to transform your assessments?             │
│                                                           │
│              [Get Started Free] [Contact Sales]          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                       FOOTER                             │
│  Product  |  Pricing  |  About  |  Contact  |  Login    │
│  Features |  Docs     |  Blog   |  Support  |  Privacy  │
│                                                           │
│  © 2026 SudAssess by Sudaksha. All rights reserved.     │
└─────────────────────────────────────────────────────────┘
```

### Technical Specifications

#### File Structure
```
app/
├─ (marketing)/
│  ├─ page.tsx (Homepage)
│  ├─ features/page.tsx
│  ├─ pricing/page.tsx
│  ├─ about/page.tsx
│  └─ contact/page.tsx
├─ (auth)/
│  ├─ login/page.tsx
│  └─ signup/page.tsx
└─ layout.tsx (Root layout)

components/
├─ marketing/
│  ├─ Hero.tsx
│  ├─ FeatureGrid.tsx
│  ├─ PricingCards.tsx
│  ├─ Testimonials.tsx
│  ├─ CTA.tsx
│  └─ Footer.tsx
```

#### SEO Metadata

```typescript
// app/(marketing)/page.tsx
export const metadata = {
  title: 'SudAssess - Modern Assessment Platform for Teams',
  description: 'Empower your organization with AI-powered competency assessments, career planning, and real-time analytics. Trusted by 50+ organizations.',
  keywords: 'assessment platform, competency assessment, career development, AI assessments, employee evaluation',
  openGraph: {
    title: 'SudAssess - Modern Assessment Platform',
    description: 'AI-powered assessments for modern teams',
    images: ['/og-image.png'],
    url: 'https://sudassess.com'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SudAssess - Modern Assessment Platform',
    description: 'AI-powered assessments for modern teams',
    images: ['/twitter-image.png']
  }
};
```

#### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | <0.8s |
| Largest Contentful Paint | <1.2s |
| Time to Interactive | <1.5s |
| Total Page Weight | <500KB |
| Image Optimization | WebP, lazy loading |
| Font Loading | Preload critical fonts |

---

## 💳 CHECKOUT FLOW

### Pricing Page → Checkout

```
STEP 1: SELECT PLAN
┌─────────────────────────────────────────────────────────┐
│  Choose Your Plan                                        │
│                                                           │
│  ○ Starter ($49/mo)                                      │
│  ● Growth ($199/mo)  ← Selected                          │
│  ○ Business ($599/mo)                                    │
│  ○ Enterprise (Custom)                                   │
│                                                           │
│  User Count: [25] (11-50 range)                         │
│                                                           │
│  [Continue →]                                            │
└─────────────────────────────────────────────────────────┘

STEP 2: SELECT FEATURES (Add-Ons)
┌─────────────────────────────────────────────────────────┐
│  Customize Your Plan                                     │
│                                                           │
│  Core Features (Included): ✅                            │
│  - User Management, Departments, Basic Assessments       │
│                                                           │
│  Add Premium Features:                                   │
│  ☑ Advanced Role/Competency Mgmt +$20/mo               │
│  ☑ Bulk Upload (500+) +$15/mo                           │
│  ☑ Custom Report Builder +$30/mo                        │
│  ☐ Survey Module +$25/mo                                │
│  ☑ Career Planning Portal +$40/mo                       │
│                                                           │
│  Add AI Features:                                        │
│  ☑ AI Question Generation +$50/mo                       │
│  ☐ Code Testing Integration +$100/mo                    │
│  ☐ AI Voice Interview +$150/mo                          │
│                                                           │
│  [← Back]                        [Continue →]           │
└─────────────────────────────────────────────────────────┘

STEP 3: SELECT BILLING PERIOD
┌─────────────────────────────────────────────────────────┐
│  Choose Billing Period                                   │
│                                                           │
│  ○ Monthly                     $354/mo (No discount)     │
│  ○ Quarterly (3 months)        $336/mo (5% off)         │
│  ● Semi-Annual (6 months)      $319/mo (10% off)        │
│  ○ Annual (12 months)          $283/mo (20% off)        │
│                                                           │
│  Total today: $1,914 (for 6 months)                     │
│  You save: $210 compared to monthly                      │
│                                                           │
│  ✅ 14-day money-back guarantee                         │
│  ✅ Cancel anytime                                       │
│                                                           │
│  [← Back]                        [Proceed to Payment →] │
└─────────────────────────────────────────────────────────┘

STEP 4: PAYMENT (Stripe Checkout)
┌─────────────────────────────────────────────────────────┐
│  Complete Your Purchase                                  │
│                                                           │
│  Order Summary:                                          │
│  ├─ Growth Plan (25 users)          $199/mo            │
│  ├─ Advanced Role/Competency Mgmt   +$20/mo            │
│  ├─ Bulk Upload                     +$15/mo            │
│  ├─ Custom Report Builder           +$30/mo            │
│  ├─ Career Planning Portal          +$40/mo            │
│  ├─ AI Question Generation          +$50/mo            │
│  ├─ Subtotal                         $354/mo           │
│  ├─ Semi-Annual Discount (10%)       -$35/mo           │
│  └─ Total                            $319/mo           │
│                                                           │
│  Billing: $1,914 every 6 months                         │
│                                                           │
│  [Stripe Payment Form]                                   │
│  Card Number: [________________]                         │
│  Expiry: [MM/YY] CVV: [___]                            │
│  Name: [____________________]                            │
│                                                           │
│  🔒 Secure payment powered by Stripe                    │
│                                                           │
│  [← Back]                        [Complete Purchase]    │
└─────────────────────────────────────────────────────────┘

STEP 5: CONFIRMATION
┌─────────────────────────────────────────────────────────┐
│  ✅ Payment Successful!                                  │
│                                                           │
│  Your SudAssess subscription is now active.              │
│                                                           │
│  Invoice #INV-2026-001234                               │
│  Amount Paid: $1,914 (for 6 months)                     │
│  Next Billing Date: August 1, 2026                      │
│                                                           │
│  📧 Receipt sent to your email                          │
│                                                           │
│  What's Next?                                            │
│  1. Set up your organization                            │
│  2. Invite team members                                 │
│  3. Create your first assessment                        │
│                                                           │
│  [Go to Dashboard →]                                     │
└─────────────────────────────────────────────────────────┘
```

### Database Schema for Billing

```sql
-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  plan_type VARCHAR(50), -- STARTER, GROWTH, BUSINESS, ENTERPRISE
  user_count INT,
  billing_period VARCHAR(20), -- MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL
  
  -- Feature flags
  features JSONB, -- { "aiQuestions": true, "bulkUpload": true, ... }
  
  -- Pricing
  base_price DECIMAL(10,2),
  addons_price DECIMAL(10,2),
  discount_percent DECIMAL(5,2),
  total_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stripe
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Status
  status VARCHAR(20), -- ACTIVE, CANCELED, PAST_DUE, TRIALING
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Usage tracking
  assessments_used_this_period INT DEFAULT 0,
  assessments_included INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  tenant_id UUID REFERENCES tenants(id),
  
  invoice_number VARCHAR(50) UNIQUE,
  amount_due DECIMAL(10,2),
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  status VARCHAR(20), -- DRAFT, OPEN, PAID, VOID, UNCOLLECTIBLE
  due_date DATE,
  paid_at TIMESTAMP,
  
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  
  line_items JSONB,
  pdf_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking (for pay-as-you-go)
CREATE TABLE usage_records (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  tenant_id UUID REFERENCES tenants(id),
  
  resource_type VARCHAR(50), -- ASSESSMENT, CODE_TEST, VOICE_INTERVIEW, SURVEY_RESPONSE
  resource_id UUID,
  quantity INT DEFAULT 1,
  
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  
  recorded_at TIMESTAMP DEFAULT NOW(),
  billed_at TIMESTAMP,
  invoice_id UUID REFERENCES invoices(id)
);

-- Feature activation log
CREATE TABLE feature_activations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  feature_key VARCHAR(100),
  
  activated_at TIMESTAMP DEFAULT NOW(),
  activated_by UUID REFERENCES users(id),
  
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

### Feature Activation Logic

```typescript
// After successful payment
async function activateSubscription(
  tenantId: string,
  subscriptionData: SubscriptionData
) {
  // 1. Update tenant features
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      features: subscriptionData.features,
      subscriptionTier: subscriptionData.planType
    }
  });
  
  // 2. Create feature activation records
  for (const feature of subscriptionData.selectedFeatures) {
    await prisma.featureActivation.create({
      data: {
        tenantId,
        featureKey: feature.key,
        expiresAt: subscriptionData.currentPeriodEnd,
        isActive: true
      }
    });
  }
  
  // 3. Send welcome email
  await sendEmail({
    to: tenantAdmin.email,
    template: 'subscription-activated',
    data: {
      planName: subscriptionData.planType,
      features: subscriptionData.features,
      expiresAt: subscriptionData.currentPeriodEnd
    }
  });
  
  // 4. Create initial invoice
  await createInvoice({
    subscriptionId: subscription.id,
    tenantId,
    amountDue: subscriptionData.totalPrice,
    status: 'PAID'
  });
}

// Check feature access
async function hasFeatureAccess(
  tenantId: string,
  featureKey: string
): Promise<boolean> {
  const activation = await prisma.featureActivation.findFirst({
    where: {
      tenantId,
      featureKey,
      isActive: true,
      OR: [
        { expiresAt: null }, // Permanent
        { expiresAt: { gt: new Date() } } // Not expired
      ]
    }
  });
  
  return activation !== null;
}
```

---

## 🎯 LOGOUT & NAVIGATION

### Logout Behavior

**All user types redirect to homepage after logout:**

```typescript
// lib/auth.ts
export async function handleLogout() {
  // Clear session
  await signOut({ redirect: false });
  
  // Clear local storage
  localStorage.clear();
  
  // Redirect to homepage
  router.push('/');
}
```

**Logout button locations:**
- User dropdown menu (all dashboards)
- Mobile nav menu
- Settings page

---

## 📊 SUPER ADMIN USAGE DASHBOARD

### Usage Analytics Page

```
Location: app/(admin)/admin/usage-analytics/page.tsx

Access: Super Admin only

Features:
├─ All Tenants Overview
│  ├─ Total tenants (Corporate, Institution, B2C)
│  ├─ Active subscriptions
│  ├─ Total revenue (MRR, ARR)
│  └─ Growth metrics
├─ Per-Tenant Details
│  ├─ Tenant name, plan, users
│  ├─ Features enabled
│  ├─ Assessments taken this period
│  ├─ Usage vs limits
│  └─ Revenue contribution
├─ Usage Trends
│  ├─ Assessments over time (line chart)
│  ├─ Feature adoption (bar chart)
│  ├─ User growth (area chart)
│  └─ Churn analysis
└─ Billing & Revenue
   ├─ MRR trend
   ├─ Churn rate
   ├─ LTV per tenant
   └─ Upcoming renewals

Export Options:
- CSV: All tenant data
- PDF: Executive summary
- Email: Weekly usage report
```

### Database Queries for Usage

```sql
-- Total assessments per tenant
SELECT 
  t.name as tenant_name,
  t.type as tenant_type,
  s.plan_type,
  COUNT(ma.id) as total_assessments,
  s.assessments_included,
  COUNT(ma.id) - s.assessments_included as overage
FROM tenants t
JOIN subscriptions s ON s.tenant_id = t.id
LEFT JOIN member_assessments ma ON ma.tenant_id = t.id
  AND ma.created_at >= s.current_period_start
  AND ma.created_at < s.current_period_end
WHERE s.status = 'ACTIVE'
GROUP BY t.id, t.name, t.type, s.plan_type, s.assessments_included
ORDER BY total_assessments DESC;

-- Monthly Recurring Revenue (MRR)
SELECT 
  DATE_TRUNC('month', current_period_start) as month,
  SUM(CASE 
    WHEN billing_period = 'MONTHLY' THEN total_price
    WHEN billing_period = 'QUARTERLY' THEN total_price / 3
    WHEN billing_period = 'SEMI_ANNUAL' THEN total_price / 6
    WHEN billing_period = 'ANNUAL' THEN total_price / 12
  END) as mrr
FROM subscriptions
WHERE status = 'ACTIVE'
GROUP BY month
ORDER BY month DESC;

-- Feature adoption rates
SELECT 
  feature_key,
  COUNT(DISTINCT tenant_id) as tenant_count,
  ROUND(COUNT(DISTINCT tenant_id) * 100.0 / (SELECT COUNT(*) FROM tenants WHERE type != 'SYSTEM'), 2) as adoption_rate
FROM feature_activations
WHERE is_active = TRUE
GROUP BY feature_key
ORDER BY tenant_count DESC;
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Pilot (Current)
- [ ] Homepage (minimalistic)
- [ ] Login/Signup flows
- [ ] Basic pricing page (informational)
- [ ] All features FREE
- [ ] Usage tracking (background)
- [ ] Feedback collection

### Phase 2: Pricing Logic (Weeks 13-14)
- [ ] Pricing calculator page
- [ ] Feature selection UI
- [ ] Billing period selector
- [ ] Order summary
- [ ] Discount calculations
- [ ] Database schema for subscriptions

### Phase 3: Payment Integration (Week 15)
- [ ] Stripe account setup
- [ ] Stripe Checkout integration
- [ ] Webhook handlers (payment success/failure)
- [ ] Invoice generation
- [ ] Feature activation logic
- [ ] Email notifications

### Phase 4: Usage Enforcement (Week 16)
- [ ] Feature gate middleware
- [ ] Usage limits enforcement
- [ ] Overage warnings
- [ ] Upgrade prompts
- [ ] Super Admin usage dashboard
- [ ] Billing reports

---

END OF PRICING & HOMEPAGE SPECIFICATION
