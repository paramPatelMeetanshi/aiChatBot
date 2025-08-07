const chatbotContainer = document.getElementById('mitAi-chatbot-container');
const initialChatArea = document.getElementById('mitAi-initial-chat-area');
const newChatScreen = document.getElementById('mitAi-new-chat-screen');
const newChatButton = document.getElementById('mitAi-new-chat-button');
const newChatMessagesContainer = document.getElementById('mitAi-new-chat-messages-container');
const chatInputArea = document.getElementById('mitAi-chat-input-area');
const articleViewScreen = document.getElementById('mitAi-article-view-screen');
const chatHistoryGrid = document.getElementById('mitAi-chat-history-grid');
const searchInput = document.getElementById('mitAi-search-input');
const articleList = document.getElementById('mitAi-article-list');
const chatHistorySection = document.querySelector('.mitAi-chat-history-section');
const searchSection = document.querySelector('.mitAi-search-section');
const screensWrapper = document.getElementById('mitAi-screens-wrapper');
const chatToggleButton = document.getElementById('mitAi-chat-toggle-button');

let isOrderTrackingMode = false;

const actionButtons = [
    {
        prompt: "Order Tracking",
        iconSvg: `<svg class="mitAi-chat-history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a2 2 0 002-2V7.5L14.5 3H6a2 2 0 00-2 2v13a2 2 0 002 2h11z"></path><polyline points="14 3 14 8 19 8"></polyline><path d="M10 12L7 9 4 12"></path><path d="M7 9v11"></path></svg>`
    },
    {
        prompt: "Whatsapp",
        iconSvg: `<svg class="mitAi-chat-history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.5 8.5 0 017.6 4.7 8.38 8.38 0 01.9 3.8z"></path></svg>`
    },
    {
        prompt: "Email",
        iconSvg: `<svg class="mitAi-chat-history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
    },
    {
        prompt: "Support",
        iconSvg: `<svg class="mitAi-chat-history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"></path><line x1="12" y1="12" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8"></line></svg>`
    }
];

const articles = [
    {
        title: "How long will it take to receive my order?",
        author: "Jesse",
        updated: "over a year ago",
        content: `
            <p>Thank you for your order! Delivery times vary based on your location and the shipping method selected during checkout. Generally, orders are processed within <strong>1-2 business days</strong>.</p>
            <h2>Domestic Shipping (within your country)</h2>
            <ul>
                <li><strong>Standard Shipping:</strong> 5-7 business days</li>
                <li><strong>Express Shipping:</strong> 2-3 business days</li>
            </ul>
            <h2>International Shipping</h2>
            <p>International orders typically take <strong>7-21 business days</strong> depending on customs clearance in the destination country. Please note that customs duties and taxes may apply upon arrival.</p>
            <p>You will receive a shipping confirmation email with a tracking number once your order has been dispatched.</p>
            <img src="https://placehold.co/300x200/FFB347/FFFFFF?text=Delivery+Info" alt="Delivery Information">
            <p>If you have any further questions, please don't hesitate to contact our support team.</p>
        `
    },
    {
        title: "How to track my order?",
        author: "Jesse",
        updated: "6 months ago",
        content: `
            <p>Tracking your order is easy! Once your order has shipped, you will receive an email with your tracking number and a link to the carrier's website.</p>
            <h2>Steps to Track Your Order:</h2>
            <ol>
                <li>Check your email for a shipping confirmation from us.</li>
                <li>Locate the tracking number in the email.</li>
                <li>Click on the provided tracking link, or visit the carrier's website and enter your tracking number manually.</li>
            </ol>
            <p>If you haven't received a tracking number within 2 business days of your purchase, please contact our customer support for assistance.</p>
            <img src="https://placehold.co/300x200/FFD180/333333?text=Order+Tracking" alt="Order Tracking Steps">
        `
    },
    {
        title: "Do you ship internationally?",
        author: "Jesse",
        updated: "2 months ago",
        content: `
            <p>Yes, we proudly offer international shipping to most countries worldwide!</p>
            <p>Please note that international shipping times and costs vary depending on the destination. Any customs duties, taxes, or import fees are the responsibility of the recipient and are not included in the item price or shipping cost.</p>
            <p>During checkout, you will be able to see the available shipping options and estimated costs for your country.</p>
        `
    },
    {
        title: "I never got my order, what to do?",
        author: "Jesse",
        updated: "1 month ago",
        content: `
            <p>We're sorry to hear your order hasn't arrived! Please take the following steps:</p>
            <ol>
                <li><strong>Check your tracking information:</strong> Ensure there are no delivery exceptions or delays noted.</li>
                <li><strong>Verify your shipping address:</strong> Double-check that the address provided was correct.</li>
                <li><strong>Look around your delivery location:</strong> Sometimes packages are left in a secure location, with a neighbor, or at a local post office.</li>
                <li><strong>Wait a few more days:</strong> Occasionally, packages can be marked as delivered prematurely.</li>
            </ol>
            <p>If your order still hasn't arrived after these steps, please contact our support team with your order number, and we'll be happy to investigate further.</p>
        `
    },
    {
        title: "What is your return policy?",
        author: "Jesse",
        updated: "3 weeks ago",
        content: `
            <p>We want you to be completely satisfied with your purchase! Our return policy allows for returns within <strong>30 days of delivery</strong> for most items.</p>
            <p>Items must be unused, in their original packaging, and in the same condition that you received them. Some exclusions may apply (e.g., final sale items, personalized products).</p>
            <h2>How to initiate a return:</h2>
            <ol>
                <li>Contact our customer support team to request a Return Merchandise Authorization (RMA) number.</li>
                <li>Package your item securely with the RMA number clearly marked.</li>
                <li>Ship the item back to us using a trackable shipping method.</li>
            </ol>
            <p>Once your return is received and inspected, we will process your refund or exchange. Please allow 5-10 business days for the refund to appear on your statement.</p>
        `
    },
    {
        title: "Can I exchange an item?",
        author: "Jesse",
        updated: "2 weeks ago",
        content: `
            <p>Yes, we offer exchanges for items of equal value within <strong>30 days of delivery</strong>, subject to availability.</p>
            <p>To be eligible for an exchange, your item must be unused, in its original packaging, and in the same condition that you received it.</p>
            <h2>How to exchange an item:</h2>
            <ol>
                <li>Contact our customer support team to check availability of the desired item and receive exchange instructions.</li>
                <li>Ship your original item back to us.</li>
                <li>Once received and inspected, we will ship out your new item.</li>
            </ol>
            <p>If there's a price difference, we will guide you through the process of either paying the difference or receiving a partial refund.</p>
        `
    }
];

function addMessage(text, sender, targetContainer) {
    const messageContainer = document.createElement('div');
    if (targetContainer === newChatMessagesContainer) {
        messageContainer.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`;

        if (sender === 'ai') {
            const profileImageDiv = document.createElement('div');
            profileImageDiv.className = 'mitAi-chat-profile-image w-6 h-6 flex-shrink-0';
            profileImageDiv.style.backgroundImage = "url('https://placehold.co/100x100/FFB347/FFFFFF?text=AI')";
            messageContainer.appendChild(profileImageDiv);
        }

        const messageBubble = document.createElement('div');
        messageBubble.className = `mitAi-message-bubble ${sender === 'user' ? 'mitAi-user-message' : 'mitAi-ai-message'}`;

        if (text === 'thinking_loader') {
            messageBubble.innerHTML = `
                <div class="mitAi-loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
        } else {
            messageBubble.innerHTML = `<p>${text}</p>`;
        }

        messageContainer.appendChild(messageBubble);

        if (sender === 'user') {
            const profileImageDiv = document.createElement('div');
            profileImageDiv.className = 'mitAi-chat-profile-image w-6 h-6 flex-shrink-0';
            profileImageDiv.style.backgroundImage = "url('https://placehold.co/100x100/4A90E2/FFFFFF?text=Me')";
            messageContainer.appendChild(profileImageDiv);
        }

    } else {
        messageContainer.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        const messageBubble = document.createElement('div');
        messageBubble.className = `mitAi-message-bubble ${sender === 'user' ? 'mitAi-user-message' : 'mitAi-ai-message'}`;

        if (text === 'thinking_loader') {
            messageBubble.innerHTML = `
                <div class="mitAi-loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
        } else {
            messageBubble.innerHTML = `<p>${text}</p>`;
        }
        messageContainer.appendChild(messageBubble);
    }

    targetContainer.appendChild(messageContainer);
    targetContainer.scrollTop = targetContainer.scrollHeight;
}

function handleSendMessage(messageText) {
    if (messageText.trim() === '') return;

    addMessage(messageText, 'user', initialChatArea);
    chatHistorySection.style.display = 'none';
    searchSection.style.display = 'none';
    newChatButton.style.display = 'none';

    addMessage('thinking_loader', 'ai', initialChatArea);
    setTimeout(() => {
        const thinkingBubble = initialChatArea.lastChild;
        if (thinkingBubble && thinkingBubble.querySelector('.mitAi-loader-dots')) {
            thinkingBubble.remove();
        }
        addMessage('This is a simulated AI response based on your input.', 'ai', initialChatArea);
    }, 1000);
}

function handleChatHistoryButtonClick(e) {
    const promptText = e.currentTarget.dataset.prompt;
    if (promptText === 'Email') {
        const email = 'support@example.com';
        const subject = encodeURIComponent('Support Request from Meetanshi');
        const body = encodeURIComponent('Hello, I need help with...');
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        return;
    } else if (promptText === 'Whatsapp') {
        const phone = '919999999999';
        const message = encodeURIComponent('Hello, I need help with my order.');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        return;
    } else if (promptText === 'Order Tracking') {
        showNewChatScreen();
        setTimeout(() => {
            addMessage('Order Tracking', 'user', newChatMessagesContainer);
            switchToOrderTrackingInput();
        }, 100);
        return;
    }
    handleSendMessage(promptText);
}

function handleArticleItemClick(e) {
    const articleText = e.currentTarget.querySelector('.mitAi-article-text').textContent;
    showArticleViewScreen(articleText);
}

function showArticleViewScreen(articleTitle) {
    chatbotContainer.classList.add('mitAi-expanded');
    screensWrapper.classList.remove('mitAi-slide-left');
    screensWrapper.classList.add('mitAi-slide-far-left');
    newChatButton.style.display = 'none';

    const articleData = articles.find(article => article.title === articleTitle);
    if (!articleData) {
        articleViewScreen.innerHTML = `<p class="text-red-500">Article not found.</p>`;
        return;
    }

    articleViewScreen.innerHTML = `
        <div class="mitAi-article-header">
            <button class="mitAi-back-button" id="mitAi-back-to-initial-screen">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <button class="mitAi-expand-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            </button>
        </div>
        <div class="mitAi-article-content">
            <h1>${articleData.title}</h1>
            <div class="mitAi-article-meta">
                <img src="https://placehold.co/100x100/6B7280/FFFFFF?text=J" alt="Author">
                <span>Written by ${articleData.author}</span>
                <span>Updated ${articleData.updated}</span>
            </div>
            ${articleData.content}
        </div>
    `;
    document.getElementById('mitAi-back-to-initial-screen').addEventListener('click', resetChatAreaContent);
}

function handleSearchInput(e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('#mitAi-article-list .mitAi-article-item').forEach(item => {
        const text = item.querySelector('.mitAi-article-text').textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function resetChatAreaContent() {
    chatbotContainer.classList.remove('mitAi-expanded');
    screensWrapper.classList.remove('mitAi-slide-left', 'mitAi-slide-far-left');
    newChatButton.style.display = 'flex';
    isOrderTrackingMode = false;
    switchToNormalChatInput();
    attachEventListeners();
}

function showNewChatScreen() {
    chatbotContainer.classList.remove('mitAi-expanded');
    screensWrapper.classList.remove('mitAi-slide-far-left');
    screensWrapper.classList.add('mitAi-slide-left');
    newChatButton.style.display = 'none';
    newChatMessagesContainer.innerHTML = '';
    isOrderTrackingMode = false;

    const existingHeader = newChatMessagesContainer.querySelector('.mitAi-chat-top-bar');
    if (existingHeader) existingHeader.remove();

    newChatMessagesContainer.insertAdjacentHTML('afterbegin', getChatHeaderHTML());

    let predefinedDiv = newChatScreen.querySelector('.mitAi-predefined-options');
    if (!predefinedDiv) {
        const predefinedOptions = [
            { icon: "🛒", text: "Track my order" },
            { icon: "🚚", text: "How long does delivery take?" },
            { icon: "🔁", text: "Return policy" }
        ];

        predefinedDiv = document.createElement('div');
        predefinedDiv.className = 'mitAi-predefined-options flex gap-2 mb-3 px-4';

        predefinedOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'flex items-center gap-2 bg-white text-[#333] font-medium rounded-full shadow px-4 py-2 text-sm hover:bg-[#F8F9FA] transition';
            btn.innerHTML = `<span>${opt.icon}</span> <span>${opt.text}</span>`;
            btn.onclick = () => {
                const currentInput = document.getElementById('mitAi-new-chat-input');
                if (currentInput) {
                    currentInput.value = opt.text;
                    currentInput.focus();
                    autoResizeTextarea.call(currentInput);
                }
            };
            predefinedDiv.appendChild(btn);
        });

        newChatScreen.insertBefore(predefinedDiv, chatInputArea);
    }

    document.getElementById('mitAi-back-to-home').addEventListener('click', resetChatAreaContent);

    addMessage('Hello! How can I help you today?', 'ai', newChatMessagesContainer);
    switchToNormalChatInput();
}

function getChatHeaderHTML() {
    return `
        <div class="mitAi-chat-top-bar">
            <button class="mitAi-back-button" id="mitAi-back-to-home">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <div class="mitAi-chat-profile-info">
                <div class="mitAi-chat-profile-image"></div>
                <div class="mitAi-chat-profile-details">
                    <span class="mitAi-chat-profile-name">ThinkAI Support</span>
                </div>
            </div>
        </div>
    `;
}

function switchToOrderTrackingInput() {
    isOrderTrackingMode = true;
    chatInputArea.innerHTML = `
        <div class="mitAi-order-tracking-input-group">
            <div class="mitAi-input-row">
                <input type="text" id="mitAi-order-number-input" placeholder="Order number" class="flex-1 bg-[#4F4F4F] p-3 rounded-full text-white text-sm outline-none border-none">
            </div>
            <div class="mitAi-input-row">
                <input type="email" id="mitAi-email-input" placeholder="Email address" class="flex-1 bg-[#4F4F4F] p-3 rounded-full text-white text-sm outline-none border-none">
                <button id="mitAi-close-order-tracking" class="mitAi-close-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <button id="mitAi-send-new-message">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    `;
    attachEventListeners();
    addMessage('Please provide your order number and email address to track your order.', 'ai', newChatMessagesContainer);
}

function switchToNormalChatInput() {
    isOrderTrackingMode = false;
    chatInputArea.innerHTML = `
        <textarea placeholder="Type your message..." id="mitAi-new-chat-input" rows="1" class="flex-1 bg-transparent border-none outline-none text-white text-sm py-2 px-2 resize-none min-h-10 leading-6 rounded-full max-h-50 overflow-y-auto scrollbar-width-none"></textarea>
        <button id="mitAi-send-new-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
        </button>
    `;
    attachEventListeners();
}

function handleSendNewMessage() {
    const predefinedDiv = newChatScreen.querySelector('.mitAi-predefined-options');
    if (predefinedDiv) {
        predefinedDiv.remove();
    }

    if (isOrderTrackingMode) {
        const orderNumberInput = document.getElementById('mitAi-order-number-input');
        const emailInput = document.getElementById('mitAi-email-input');

        const orderNumber = orderNumberInput ? orderNumberInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';

        if (orderNumber === '' || email === '') {
            addMessage('Please provide both order number and email address.', 'ai', newChatMessagesContainer);
            return;
        }

        const userMessage = `Order Tracking Request: Order No. ${orderNumber}, Email: ${email}`;
        addMessage(userMessage, 'user', newChatMessagesContainer);

        switchToNormalChatInput();

        addMessage('thinking_loader', 'ai', newChatMessagesContainer);
        setTimeout(() => {
            const thinkingBubble = newChatMessagesContainer.lastChild;
            if (thinkingBubble && thinkingBubble.querySelector('.mitAi-loader-dots')) {
                thinkingBubble.remove();
            }
            addMessage(`Thank you! I'm now looking up order ${orderNumber} associated with ${email}. Please wait a moment.`, 'ai', newChatMessagesContainer);
        }, 1500);

    } else {
        const newChatInput = document.getElementById('mitAi-new-chat-input');
        const messageText = newChatInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user', newChatMessagesContainer);
        newChatInput.value = '';
        newChatInput.style.height = 'auto';
        newChatInput.style.borderRadius = '9999px';

        if (messageText.toLowerCase().includes('order tracking')) {
            switchToOrderTrackingInput();
            return;
        }

        addMessage('thinking_loader', 'ai', newChatMessagesContainer);
        setTimeout(() => {
            const thinkingBubble = newChatMessagesContainer.lastChild;
            if (thinkingBubble && thinkingBubble.querySelector('.mitAi-loader-dots')) {
                thinkingBubble.remove();
            }
            addMessage('I received your message! How else can I assist you?', 'ai', newChatMessagesContainer);
        }, 1500);
    }
}

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 70) + 'px';
}

function attachEventListeners() {
    document.querySelectorAll('#mitAi-chat-history-grid .mitAi-chat-history-button').forEach(button => {
        button.removeEventListener('click', handleChatHistoryButtonClick);
        button.addEventListener('click', handleChatHistoryButtonClick);
    });

    document.querySelectorAll('#mitAi-article-list .mitAi-article-item').forEach(item => {
        item.removeEventListener('click', handleArticleItemClick);
        item.addEventListener('click', handleArticleItemClick);
    });

    const currentSearchInput = document.getElementById('mitAi-search-input');
    if (currentSearchInput) {
        currentSearchInput.removeEventListener('input', handleSearchInput);
        currentSearchInput.addEventListener('input', handleSearchInput);
    }

    newChatButton.removeEventListener('click', showNewChatScreen);
    newChatButton.addEventListener('click', showNewChatScreen);

    const existingBackToHomeButton = document.getElementById('mitAi-back-to-home');
    if (existingBackToHomeButton) {
        existingBackToHomeButton.removeEventListener('click', resetChatAreaContent);
        existingBackToHomeButton.addEventListener('click', resetChatAreaContent);
    }

    const sendNewMessageButton = document.getElementById('mitAi-send-new-message');
    if (sendNewMessageButton) {
        sendNewMessageButton.removeEventListener('click', handleSendNewMessage);
        sendNewMessageButton.addEventListener('click', handleSendNewMessage);
    }

    const newChatInput = document.getElementById('mitAi-new-chat-input');
    if (newChatInput) {
        newChatInput.removeEventListener('input', autoResizeTextarea);
        newChatInput.addEventListener('input', autoResizeTextarea);

        newChatInput.removeEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendNewMessage();
            }
        });
        newChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendNewMessage();
            }
        });
    }

    const closeOrderTrackingButton = document.getElementById('mitAi-close-order-tracking');
    if (closeOrderTrackingButton) {
        closeOrderTrackingButton.removeEventListener('click', switchToNormalChatInput);
        closeOrderTrackingButton.addEventListener('click', switchToNormalChatInput);
    }
}

chatToggleButton.addEventListener('click', () => {
    if (chatbotContainer.classList.contains('mitAi-hidden')) {
        chatbotContainer.classList.remove('mitAi-hidden');
        chatbotContainer.classList.add('mitAi-visible');
        resetChatAreaContent();
    } else {
        chatbotContainer.classList.remove('mitAi-visible');
        chatbotContainer.classList.add('mitAi-hidden');
    }
});

attachEventListeners();
chatbotContainer.classList.add('mitAi-hidden');