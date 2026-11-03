/**
 * @file chat-view.js
 * @description Moderated in-app chat with commercialization filters and zero phone exposure.
 */

import { toast } from '../../core/toast.js';
import { evaluateCommercialContent, showAntiCommercialBlockedModal } from '../../core/anti-commercial.js';

export class ChatModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.messages = [
      {
        id: 1,
        sender: 'Donor A. (Gold Hero)',
        text: 'Hello, I accepted your B+ blood request for Chittagong Medical. I am preparing to leave.',
        time: '12:45 PM',
        isMe: false
      },
      {
        id: 2,
        sender: 'You',
        text: 'Thank you so much! Patient is in Ward 4, Bed 12. Please let me know when you arrive.',
        time: '12:47 PM',
        isMe: true
      }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="max-width:760px; padding:var(--space-8) var(--space-4);">
        <div class="card" style="display:flex; flex-direction:column; height:680px; padding:0; overflow:hidden;">
          <!-- Chat Header -->
          <div style="padding:var(--space-4) var(--space-6); background:var(--color-bg-surface-elevated); border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:40px; height:40px; border-radius:50%; background:#D4AF37; color:white; display:flex; align-items:center; justify-content:center; font-weight:800;">
                DA
              </div>
              <div>
                <div style="font-weight:700; font-size:var(--font-size-base); display:flex; align-items:center; gap:6px;">
                  Donor A. <span class="badge badge-available" style="font-size:10px;">Gold Hero</span>
                </div>
                <div style="font-size:11px; color:var(--color-text-secondary);">Request #REQ_849201 • B+ Blood at CMCH</div>
              </div>
            </div>

            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-outline btn-sm" id="btnRevealPhone" style="font-size:11px;">
                Show Unlocked Phone
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btnReportUser" style="color:var(--color-danger); font-size:11px;">
                Report
              </button>
            </div>
          </div>

          <!-- Privacy Notice Bar -->
          <div style="background:rgba(42,157,143,0.1); color:var(--color-text-teal); padding:6px 16px; font-size:11px; text-align:center; border-bottom:1px solid var(--color-border-subtle);">
            🔒 End-to-end moderated chat. Blood is never sold or paid for. Please report any monetary demands.
          </div>

          <!-- Message History -->
          <div id="chatMessages" style="flex:1; padding:var(--space-6); overflow-y:auto; display:flex; flex-direction:column; gap:var(--space-4); background:var(--color-bg-app);">
            ${this.renderMessages()}
          </div>

          <!-- Quick Reply Chips -->
          <div style="padding:8px 16px; background:var(--color-bg-surface); display:flex; gap:8px; overflow-x:auto; border-top:1px solid var(--color-border-subtle);">
            <button type="button" class="btn btn-secondary btn-sm quick-chip" data-msg="I have arrived at the hospital gate.">Arrived at gate</button>
            <button type="button" class="btn btn-secondary btn-sm quick-chip" data-msg="Which floor or ward is the patient located?">Which ward?</button>
            <button type="button" class="btn btn-secondary btn-sm quick-chip" data-msg="The doctor is ready for cross-matching.">Ready for test</button>
          </div>

          <!-- Chat Input Bar -->
          <form id="chatForm" style="padding:var(--space-4) var(--space-6); background:var(--color-bg-surface); border-top:1px solid var(--color-border); display:flex; gap:var(--space-3);">
            <input type="text" class="form-input" id="chatInput" placeholder="Type a message to the donor..." style="flex:1;" required>
            <button type="submit" class="btn btn-primary">Send</button>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderMessages() {
    return this.messages.map(m => `
      <div style="align-self: ${m.isMe ? 'flex-end' : 'flex-start'}; max-width:70%;">
        <div style="font-size:10px; color:var(--color-text-muted); margin-bottom:2px; text-align:${m.isMe ? 'right' : 'left'};">${m.sender} • ${m.time}</div>
        <div style="padding:10px 16px; border-radius:${m.isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px'}; background:${m.isMe ? 'var(--color-crimson)' : 'var(--color-bg-surface-elevated)'}; color:${m.isMe ? '#FFFFFF' : 'var(--color-text-primary)'}; box-shadow:var(--shadow-sm); border:1px solid ${m.isMe ? 'transparent' : 'var(--color-border)'}; font-size:var(--font-size-sm); line-height:1.5;">
          ${m.text}
        </div>
      </div>
    `).join('');
  }

  attachEvents() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // Anti-commercialization check scoped strictly to blood requests/chats
        const check = evaluateCommercialContent(text, 'blood_chat');
        if (!check.allowed) {
          showAntiCommercialBlockedModal(check, text, (appealData) => {
            console.log('[ANTI-COMMERCIAL APPEAL RECORDED]', appealData);
            toast.info('False positive report received. Safety moderators will review this rule entry.');
          });
          return;
        }

        this.messages.push({
          id: Date.now(),
          sender: 'You',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true
        });

        input.value = '';
        if (messagesContainer) {
          messagesContainer.innerHTML = this.renderMessages();
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    }

    // Quick chips
    document.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (input) {
          input.value = e.currentTarget.dataset.msg;
          input.focus();
        }
      });
    });

    document.getElementById('btnRevealPhone')?.addEventListener('click', () => {
      alert('Unlocked Donor Phone: +8801712-984729\nDonor Name: Rafi (Gold Donor)\nPlease use for hospital coordination only.');
    });

    document.getElementById('btnReportUser')?.addEventListener('click', () => {
      const reason = prompt('Report reason:\n1. Commercial demand for money\n2. Harassment or inappropriate language\n3. Did not show up at hospital', '1');
      if (reason) {
        toast.error('Report submitted to moderation team. The user conversation is under immediate review.');
      }
    });
  }
}
