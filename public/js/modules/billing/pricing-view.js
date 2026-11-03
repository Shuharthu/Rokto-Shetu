/**
 * @file pricing-view.js
 * @description SaaS Pricing Plans, Monthly/Annual billing toggle, and Payment Checkout Simulator.
 */

import { toast } from '../../core/toast.js';

export class PricingView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isAnnual = false;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-12) var(--space-4);">
        <!-- Title & Subtitle -->
        <div style="text-align:center; max-width:680px; margin:0 auto var(--space-8);">
          <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-size:11px; font-weight:800; margin-bottom:8px;">B2B WORKSPACE PRICING</span>
          <h1 style="font-size:var(--font-size-3xl); font-weight:900; margin-bottom:8px;">Transparent Plans for Lifesaving Organizations</h1>
          <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); line-height:1.6;">
            Empowering hospitals, blood banks, and NGO clubs with real-time FEFO inventory, donor CRM, and public API integrations.
          </p>

          <!-- Monthly / Annual Toggle -->
          <div style="display:inline-flex; align-items:center; gap:12px; margin-top:var(--space-6); background:var(--color-bg-surface); padding:6px 16px; border-radius:var(--radius-full); border:1px solid var(--color-border);">
            <span style="font-size:var(--font-size-sm); font-weight:700; color:${!this.isAnnual ? 'var(--color-crimson)' : 'var(--color-text-secondary)'};">Monthly</span>
            <label style="position:relative; display:inline-block; width:44px; height:24px; cursor:pointer;">
              <input type="checkbox" id="toggleBillingCycle" ${this.isAnnual ? 'checked' : ''} style="opacity:0; width:0; height:0;">
              <span style="position:absolute; inset:0; background:${this.isAnnual ? 'var(--color-crimson)' : 'var(--color-border)'}; border-radius:24px; transition:0.3s;"></span>
              <span style="position:absolute; top:2px; left:${this.isAnnual ? '22px' : '2px'}; width:20px; height:20px; background:white; border-radius:50%; transition:0.3s; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
            </label>
            <span style="font-size:var(--font-size-sm); font-weight:700; color:${this.isAnnual ? 'var(--color-crimson)' : 'var(--color-text-secondary)'};">Annual <span style="background:var(--color-teal-subtle); color:var(--color-teal); font-size:10px; padding:2px 6px; border-radius:10px;">Save 17%</span></span>
          </div>
        </div>

        <!-- Pricing Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:var(--space-6); align-items:stretch;">
          <!-- Plan 1: Free Community -->
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h3 style="font-size:var(--font-size-lg); font-weight:800;">Free Community</h3>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin:4px 0 16px;">For individual donors, patients, and seekers.</p>
              <div style="font-size:2rem; font-weight:900; margin-bottom:16px;">৳ 0 <span style="font-size:12px; font-weight:500; color:var(--color-text-muted);">/ forever</span></div>
              
              <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:24px;">
                <li>✓ Live donor map search</li>
                <li>✓ 1 Personal account</li>
                <li>✓ Digital donor card & rewards</li>
                <li>✓ In-app moderated chat</li>
                <li style="color:var(--color-text-muted);">✗ Hospital blood inventory</li>
                <li style="color:var(--color-text-muted);">✗ Public API access</li>
              </ul>
            </div>
            <a href="#/register" class="btn btn-outline btn-block">Get Started Free</a>
          </div>

          <!-- Plan 2: Org Starter -->
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h3 style="font-size:var(--font-size-lg); font-weight:800;">Org Starter</h3>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin:4px 0 16px;">For small clinics and local blood donation clubs.</p>
              <div style="font-size:2rem; font-weight:900; color:var(--color-text-primary); margin-bottom:16px;">
                ৳ ${this.isAnnual ? '2,080' : '2,500'} <span style="font-size:12px; font-weight:500; color:var(--color-text-muted);">/ month</span>
              </div>

              <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:24px;">
                <li>✓ Up to 5 Staff Seats</li>
                <li>✓ 1 Hospital Branch</li>
                <li>✓ 500 Blood Inventory Bags</li>
                <li>✓ 250 Monthly SMS Credits</li>
                <li>✓ 6 Camps per Year</li>
                <li style="color:var(--color-text-muted);">✗ White-label domain</li>
              </ul>
            </div>
            <button type="button" class="btn btn-outline btn-block btn-subscribe" data-plan="starter" data-price="2500">Subscribe Starter</button>
          </div>

          <!-- Plan 3: Org Pro (Highlighted) -->
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border:2px solid var(--color-crimson); box-shadow:var(--shadow-glow); transform:translateY(-8px); position:relative;">
            <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--color-crimson); color:white; font-size:10px; font-weight:800; padding:3px 12px; border-radius:12px;">MOST POPULAR</div>
            <div>
              <h3 style="font-size:var(--font-size-lg); font-weight:800; color:var(--color-crimson);">Org Pro</h3>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin:4px 0 16px;">For specialized hospitals, blood banks, and NGOs.</p>
              <div style="font-size:2rem; font-weight:900; color:var(--color-crimson); margin-bottom:16px;">
                ৳ ${this.isAnnual ? '6,250' : '7,500'} <span style="font-size:12px; font-weight:500; color:var(--color-text-muted);">/ month</span>
              </div>

              <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:24px;">
                <li>✓ Up to 25 Staff Seats</li>
                <li>✓ Up to 5 Hospital Branches</li>
                <li>✓ 5,000 Blood Units with FEFO</li>
                <li>✓ 1,500 SMS Credits</li>
                <li>✓ Public REST API & Webhooks</li>
                <li>✓ Custom Logo on Certificates</li>
              </ul>
            </div>
            <button type="button" class="btn btn-primary btn-block btn-subscribe" data-plan="pro" data-price="7500">Subscribe Pro</button>
          </div>

          <!-- Plan 4: Enterprise -->
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h3 style="font-size:var(--font-size-lg); font-weight:800;">Enterprise</h3>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin:4px 0 16px;">For multi-hospital chains and national networks.</p>
              <div style="font-size:2rem; font-weight:900; margin-bottom:16px;">Custom <span style="font-size:12px; font-weight:500; color:var(--color-text-muted);">/ tailored</span></div>

              <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:24px;">
                <li>✓ Unlimited Staff Seats</li>
                <li>✓ Unlimited Branches</li>
                <li>✓ Unlimited RFID Inventory</li>
                <li>✓ 10,000+ SMS Credits</li>
                <li>✓ Custom Subdomain & White-Label</li>
                <li>✓ 24/7 SLA & Dedicated Support</li>
              </ul>
            </div>
            <button type="button" class="btn btn-outline btn-block" onclick="alert('Enterprise representative will contact you.')">Contact Sales</button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const toggle = document.getElementById('toggleBillingCycle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        this.isAnnual = e.target.checked;
        this.render();
      });
    }

    this.container.querySelectorAll('.btn-subscribe').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const plan = e.currentTarget.dataset.plan;
        const price = e.currentTarget.dataset.price;

        const gateway = prompt(`Select Payment Gateway for ${plan.toUpperCase()} (৳ ${price}):\n1. bKash\n2. SSLCommerz\n3. Stripe`, '1');
        if (gateway) {
          toast.info('Redirecting to secure licensed payment gateway...');
          setTimeout(() => {
            toast.success(`Subscription activated for ${plan.toUpperCase()}! HMAC Webhook confirmed.`);
          }, 1000);
        }
      });
    });
  }
}
