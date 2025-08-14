(function () {
  /**
   * ThinkAI Chat - Client-side implementation
   */
  const ThinkAIChat = {
    /**
     * UI-related elements and functionality
     */
    UI: {
      elements: {},
      isMobile: false,

      /**
       * Initialize UI elements and event listeners
       * @param {HTMLElement} container - The main container element
       */
      init: function (container) {
        if (!container) return;

        // Cache DOM elements with mitAi- prefixes
        this.elements = {
          container: container,
          chatToggleButton: document.getElementById('mitAi-chat-toggle-button'),
          chatWindow: container.querySelector('.mitAi-chatbot-container'),
          newChatButton: document.getElementById('mitAi-new-chat-button'),
          newChatMessagesContainer: document.getElementById('mitAi-new-chat-messages-container'),
          chatInputArea: document.getElementById('mitAi-chat-input-area'),
          articleViewScreen: document.getElementById('mitAi-article-view-screen'),
          chatHistoryGrid: document.getElementById('mitAi-chat-history-grid'),
          searchInput: document.getElementById('mitAi-search-input'),
          articleList: document.getElementById('mitAi-article-list'),
          chatHistorySection: container.querySelector('.mitAi-chat-history-section'),
          searchSection: container.querySelector('.mitAi-search-section'),
          screensWrapper: document.getElementById('mitAi-screens-wrapper'),
          initialChatArea: document.getElementById('mitAi-initial-chat-area'),
        };

        // Detect mobile device
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Set up event listeners
        this.setupEventListeners();

        // Fix for iOS Safari viewport height issues
        if (this.isMobile) {
          this.setupMobileViewport();
        }
      },

      /**
       * Set up all event listeners for UI interactions
       */
      setupEventListeners: function () {
        const { chatToggleButton, chatWindow, newChatButton, newChatMessagesContainer, chatInputArea, articleViewScreen, chatHistoryGrid, searchInput, articleList, screensWrapper } = this.elements;

        // Toggle chat window visibility
        chatToggleButton.addEventListener('click', () => this.toggleChatWindow());

        // New chat button
        newChatButton.addEventListener('click', () => ThinkAIChat.showNewChatScreen());

        // Chat history buttons
        chatHistoryGrid.querySelectorAll('.mitAi-chat-history-button').forEach(button => {
          button.addEventListener('click', ThinkAIChat.handleChatHistoryButtonClick);
        });

        // Article list items
        articleList.querySelectorAll('.mitAi-article-item').forEach(item => {
          item.addEventListener('click', ThinkAIChat.handleArticleItemClick);
        });

        // Search input
        if (searchInput) {
          searchInput.addEventListener('input', ThinkAIChat.handleSearchInput);
        }

        // Handle global click for auth links
        document.addEventListener('click', function (event) {
          if (event.target && event.target.classList.contains('mitAi-auth-trigger')) {
            event.preventDefault();
            if (window.thinkAIAuthUrl) {
              ThinkAIChat.Auth.openAuthPopup(window.thinkAIAuthUrl);
            }
          }
        });
      },

      /**
       * Setup mobile-specific viewport adjustments
       */
      setupMobileViewport: function () {
        const setViewportHeight = () => {
          document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
        };
        window.addEventListener('resize', setViewportHeight);
        setViewportHeight();
      },

      /**
       * Toggle chat window visibility
       */
      toggleChatWindow: function () {
        const { chatWindow, chatInputArea } = this.elements;
        chatWindow?.classList?.toggle('mitAi-hidden');
        chatWindow?.classList?.toggle('mitAi-visible');

        if (chatWindow?.classList.contains('mitAi-visible')) {
          if (this.isMobile) {
            document.body.classList.add('mitAi-chat-open');
            setTimeout(() => {
              const chatInput = chatInputArea.querySelector('#mitAi-new-chat-input');
              if (chatInput) chatInput.focus();
            }, 500);
          } else {
            const chatInput = chatInputArea.querySelector('#mitAi-new-chat-input');
            if (chatInput) chatInput.focus();
          }
          this.scrollToBottom();
          ThinkAIChat.resetChatAreaContent();
        } else {
          document.body.classList.remove('mitAi-chat-open');
          const chatInput = chatInputArea.querySelector('#mitAi-new-chat-input');
          if (chatInput && this.isMobile) chatInput.blur();
        }
      },

      /**
       * Scroll messages container to bottom
       */
      scrollToBottom: function () {
        const { newChatMessagesContainer } = this.elements;
        setTimeout(() => {
          newChatMessagesContainer.scrollTop = newChatMessagesContainer.scrollHeight;
        }, 100);
      },

      /**
       * Show typing indicator in the chat
       */
      showTypingIndicator: function () {
        const { newChatMessagesContainer } = this.elements;
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('mitAi-typing-indicator');
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        newChatMessagesContainer.appendChild(typingIndicator);
        this.scrollToBottom();
      },

      /**
       * Remove typing indicator from the chat
       */
      removeTypingIndicator: function () {
        const { newChatMessagesContainer } = this.elements;
        const typingIndicator = newChatMessagesContainer.querySelector('.mitAi-typing-indicator');
        if (typingIndicator) {
          typingIndicator.remove();
        }
      },

      /**
       * Display product results in the chat
       * @param {Array} products - Array of product data objects
       */
      displayProductResults: function (products) {
        const { newChatMessagesContainer } = this.elements;

        const productSection = document.createElement('div');
        productSection.classList.add('mitAi-product-section');
        newChatMessagesContainer.appendChild(productSection);

        const header = document.createElement('div');
        header.classList.add('mitAi-product-header');
        header.style.fontSize = "25px"
        header.style.fontWeight = "600"
        header.style.marginTop = "10px"
        header.innerHTML = `<h1>Top Matched Products</h1>`;
        productSection.appendChild(header);

        const productsContainer = document.createElement('div');
        productsContainer.classList.add('mitAi-product-grid');
        productsContainer.id = 'carousel-container';
        productSection.appendChild(productsContainer);

        if (!products || !Array.isArray(products) || products.length === 0) {
          const noProductsMessage = document.createElement('p');
          noProductsMessage.textContent = "No products found";
          noProductsMessage.style.padding = "10px";
          productsContainer.appendChild(noProductsMessage);
        } else {
          products.forEach(product => {
            const productCard = ThinkAIChat.Product.createCard(product);
            productsContainer.appendChild(productCard);
          });
        }

        this.scrollToBottom();
        ThinkAIChat.Product.initCarousel(document.getElementById('carousel-container'), products);
      },
    },

    /**
     * Message handling and display functionality
     */
    Message: {
      /**
       * Send a message to the API
       * @param {HTMLInputElement|HTMLTextAreaElement} chatInput - The input element
       * @param {HTMLElement} messagesContainer - The messages container
       */
      send: async function (chatInput, messagesContainer) {
        const userMessage = chatInput.value.trim();
        const conversationId = sessionStorage.getItem('thinkAIConversationId');

        if (userMessage === '') return;

        this.add(userMessage, 'user', messagesContainer);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.style.borderRadius = '9999px';

        ThinkAIChat.UI.showTypingIndicator();

        try {
          ThinkAIChat.API.streamResponse(userMessage, conversationId, messagesContainer);
        } catch (error) {
          console.error('Error communicating with API:', error);
          ThinkAIChat.UI.removeTypingIndicator();
          this.add("Sorry, I couldn't process your request at the moment. Please try again later.", 'assistant', messagesContainer);
        }
      },

      /**
       * Add a message to the chat
       * @param {string} text - Message content
       * @param {string} sender - Message sender ('user' or 'assistant')
       * @param {HTMLElement} messagesContainer - The messages container
       * @returns {HTMLElement} The created message element
       */
      add: function (text, sender, messagesContainer) {
        const messageContainer = document.createElement('div');
        messageContainer.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`;

        if (sender === 'assistant') {
          const profileImageDiv = document.createElement('div');
          profileImageDiv.className = 'mitAi-chat-profile-image w-6 h-6 flex-shrink-0';
          profileImageDiv.style.backgroundImage = "url('https://placehold.co/100x100/FFB347/FFFFFF?text=AI')";
          messageContainer.appendChild(profileImageDiv);
        }

        const messageBubble = document.createElement('div');
        messageBubble.className = `mitAi-message-bubble ${sender === 'user' ? 'mitAi-user-message' : 'mitAi-ai-message'}`;
        messageBubble.dataset.rawText = text;

        if (text === 'thinking_loader') {
          messageBubble.innerHTML = `
            <div class="mitAi-loader-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>`;
        } else {
          if (sender === 'assistant') {
            ThinkAIChat.Formatting.formatMessageContent(messageBubble);
          } else {
            messageBubble.innerHTML = `<p>${text}</p>`;
          }
        }

        messageContainer.appendChild(messageBubble);

        if (sender === 'user') {
          const profileImageDiv = document.createElement('div');
          profileImageDiv.className = 'mitAi-chat-profile-image w-6 h-6 flex-shrink-0';
          profileImageDiv.style.backgroundImage = "url('https://placehold.co/100x100/4A90E2/FFFFFF?text=Me')";
          messageContainer.appendChild(profileImageDiv);
        }

        messagesContainer.appendChild(messageContainer);
        ThinkAIChat.UI.scrollToBottom();

        return messageContainer;
      },

      /**
       * Add a tool use message to the chat
       * @param {string} toolMessage - Tool use message content
       * @param {HTMLElement} messagesContainer - The messages container
       */
      // addToolUse: function (toolMessage, messagesContainer) {
      //   const match = toolMessage.match(/Calling tool: (\w+) with arguments: (.+)/);
      //   if (!match) {
      //     const toolUseElement = document.createElement('div');
      //     toolUseElement.classList.add('mitAi-message-bubble', 'mitAi-tool-use');
      //     toolUseElement.textContent = toolMessage;
      //     messagesContainer.appendChild(toolUseElement);
      //     ThinkAIChat.UI.scrollToBottom();
      //     return;
      //   }

      //   const toolName = match[1];
      //   const argsString = match[2];

      //   const toolUseElement = document.createElement('div');
      //   toolUseElement.classList.add('mitAi-message-bubble', 'mitAi-tool-use');

      //   const headerElement = document.createElement('div');
      //   headerElement.classList.add('mitAi-tool-header');

      //   const toolText = document.createElement('span');
      //   toolText.classList.add('mitAi-tool-text');
      //   toolText.textContent = `Calling tool: ${toolName}`;

      //   const toggleElement = document.createElement('span');
      //   toggleElement.classList.add('mitAi-tool-toggle');
      //   toggleElement.textContent = '[+]';

      //   headerElement.appendChild(toolText);
      //   headerElement.appendChild(toggleElement);

      //   const argsElement = document.createElement('div');
      //   argsElement.classList.add('mitAi-tool-args');
      //   try {
      //     const parsedArgs = JSON.parse(argsString);
      //     argsElement.textContent = JSON.stringify(parsedArgs, null, 2);
      //   } catch (e) {
      //     argsElement.textContent = argsString;
      //   }

      //   headerElement.addEventListener('click', function () {
      //     const isExpanded = argsElement.classList.contains('expanded');
      //     argsElement.classList.toggle('expanded');
      //     toggleElement.textContent = isExpanded ? '[+]' : '[-]';
      //   });

      //   toolUseElement.appendChild(headerElement);
      //   toolUseElement.appendChild(argsElement);
      //   messagesContainer.appendChild(toolUseElement);
      //   ThinkAIChat.UI.scrollToBottom();
      // },
    },

    /**
     * Text formatting and markdown handling
     */
    Formatting: {
      /**
       * Format message content with markdown and links
       * @param {HTMLElement} element - The element to format
       */
      formatMessageContent: function (element) {
        if (!element || !element.dataset.rawText) return;

        let processedText = element.dataset.rawText;

        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        processedText = processedText.replace(markdownLinkRegex, (match, text, url) => {
          if (url.includes('shopify.com/authentication') && (url.includes('oauth/authorize') || url.includes('authentication'))) {
            window.thinkAIAuthUrl = url;
            return `<a href="#auth" class="mitAi-auth-trigger">${text}</a>`;
          } else if (url.includes('/cart') || url.includes('checkout')) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">click here to proceed to checkout</a>`;
          } else {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
          }
        });

        processedText = this.convertMarkdownToHtml(processedText);
        element.innerHTML = processedText;
      },

      /**
       * Convert Markdown text to HTML
       * @param {string} text - Markdown text to convert
       * @returns {string} HTML content
       */
      convertMarkdownToHtml: function (text) {
        text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
        const lines = text.split('\n');
        let currentList = null;
        let listItems = [];
        let htmlContent = '';
        let startNumber = 1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const unorderedMatch = line.match(/^\s*([-*])\s+(.*)/);
          const orderedMatch = line.match(/^\s*(\d+)[\.)]\s+(.*)/);

          if (unorderedMatch) {
            if (currentList !== 'ul') {
              if (currentList === 'ol') {
                htmlContent += `<ol start="${startNumber}">${listItems.join('')}</ol>`;
                listItems = [];
              }
              currentList = 'ul';
            }
            listItems.push(`<li>${unorderedMatch[2]}</li>`);
          } else if (orderedMatch) {
            if (currentList !== 'ol') {
              if (currentList === 'ul') {
                htmlContent += `<ul>${listItems.join('')}</ul>`;
                listItems = [];
              }
              currentList = 'ol';
              startNumber = parseInt(orderedMatch[1], 10);
            }
            listItems.push(`<li>${orderedMatch[2]}</li>`);
          } else {
            if (currentList) {
              htmlContent += currentList === 'ul' ? `<ul>${listItems.join('')}</ul>` : `<ol start="${startNumber}">${listItems.join('')}</ol>`;
              listItems = [];
              currentList = null;
            }
            htmlContent += line.trim() === '' ? '<br>' : `<p>${line}</p>`;
          }
        }

        if (currentList) {
          htmlContent += currentList === 'ul' ? `<ul>${listItems.join('')}</ul>` : `<ol start="${startNumber}">${listItems.join('')}</ol>`;
        }

        return htmlContent.replace(/<\/p><p>/g, '</p>\n<p>');
      },
    },

    /**
     * API communication and data handling
     */
    API: {
      /**
       * Stream a response from the API
       * @param {string} userMessage - User's message text
       * @param {string} conversationId - Conversation ID
       * @param {HTMLElement} messagesContainer - The messages container
       */
      streamResponse: async function (userMessage, conversationId, messagesContainer) {
        let currentMessageElement = null;

        try {
          const promptType = window.thinkAIChatConfig?.promptType || "standardAssistant";
          const requestBody = JSON.stringify({
            message: userMessage,
            conversation_id: conversationId,
            prompt_type: promptType,
          });

          const streamUrl = 'https://judicial-roles-upgrades-having.trycloudflare.com/chat';
          const shopId = window.shopId || 'default-shop-id';

          const response = await fetch(streamUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream',
              'X-Shopify-Shop-Id': shopId,
            },
            body: requestBody,
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          let messageElement = document.createElement('div');
          messageElement.classList.add('mitAi-message-bubble', 'mitAi-ai-message');
          messageElement.textContent = '';
          messageElement.dataset.rawText = '';
          messagesContainer.appendChild(messageElement);
          currentMessageElement = messageElement;

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  this.handleStreamEvent(data, currentMessageElement, messagesContainer, userMessage, (newElement) => {
                    currentMessageElement = newElement;
                  });
                } catch (e) {
                  console.error('Error parsing event data:', e, line);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error in streaming:', error);
          ThinkAIChat.UI.removeTypingIndicator();
          ThinkAIChat.Message.add("Sorry, I couldn't process your request. Please try again later.", 'assistant', messagesContainer);
        }
      },

      /**
       * Handle stream events from the API
       * @param {Object} data - Event data
       * @param {HTMLElement} currentMessageElement - Current message element
       * @param {HTMLElement} messagesContainer - The messages container
       * @param {string} userMessage - The original user message
       * @param {Function} updateCurrentElement - Callback to update the current element
       */
      handleStreamEvent: function (data, currentMessageElement, messagesContainer, userMessage, updateCurrentElement) {
        switch (data.type) {
          case 'id':
            if (data.conversation_id) {
              sessionStorage.setItem('thinkAIConversationId', data.conversation_id);
            }
            break;

          case 'chunk':
            ThinkAIChat.UI.removeTypingIndicator();
            currentMessageElement.dataset.rawText += data.chunk;
            currentMessageElement.textContent = currentMessageElement.dataset.rawText;
            ThinkAIChat.UI.scrollToBottom();
            break;

          case 'message_complete':
            ThinkAIChat.UI.removeTypingIndicator();
            ThinkAIChat.Formatting.formatMessageContent(currentMessageElement);
            ThinkAIChat.UI.scrollToBottom();
            break;

          case 'end_turn':
            ThinkAIChat.UI.removeTypingIndicator();
            break;

          case 'error':
            console.error('Stream error:', data.error);
            ThinkAIChat.UI.removeTypingIndicator();
            currentMessageElement.textContent = "Sorry, I couldn't process your request. Please try again later.";
            break;

          case 'rate_limit_exceeded':
            console.error('Rate limit exceeded:', data.error);
            ThinkAIChat.UI.removeTypingIndicator();
            currentMessageElement.textContent = "Sorry, our servers are currently busy. Please try again later.";
            break;

          case 'auth_required':
            sessionStorage.setItem('thinkAILastMessage', userMessage || '');
            break;

          case 'product_results':
            ThinkAIChat.UI.displayProductResults(data.products);
            break;

          case 'tool_use':
            if (data.tool_use_message) {
              ThinkAIChat.Message.addToolUse(data.tool_use_message, messagesContainer);
            }
            break;

          case 'new_message':
            ThinkAIChat.Formatting.formatMessageContent(currentMessageElement);
            ThinkAIChat.UI.showTypingIndicator();

            const newMessageElement = document.createElement('div');
            newMessageElement.classList.add('mitAi-message-bubble', 'mitAi-ai-message');
            newMessageElement.textContent = '';
            newMessageElement.dataset.rawText = '';
            messagesContainer.appendChild(newMessageElement);
            updateCurrentElement(newMessageElement);
            break;

          case 'content_block_complete':
            ThinkAIChat.UI.showTypingIndicator();
            break;
        }
      },


      fetchChatHistory: async function (conversationId, messagesContainer) {
        try {
          console.log("messagesContainer messagesContainer", messagesContainer);
          const loadingMessage = document.createElement('div');
          loadingMessage.classList.add('mitAi-message-bubble', 'mitAi-ai-message');
          loadingMessage.textContent = "Loading conversation history...";
          messagesContainer.appendChild(loadingMessage);

          const historyUrl = `https://judicial-roles-upgrades-having.trycloudflare.com/chat?history=true&conversation_id=${encodeURIComponent(conversationId)}`;
          const response = await fetch(historyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors',
          });

          if (!response.ok) {
            throw new Error('Failed to fetch chat history: ' + response.status);
          }

          const data = await response.json();
          console.log("This is response from the chat history ", data)

          messagesContainer.removeChild(loadingMessage);

          if (!data.messages || data.messages.length === 0) {
            const welcomeMessage = window.thinkAIChatConfig?.welcomeMessage || "👋 Hi there! How can I help you today?";
            ThinkAIChat.Message.add(welcomeMessage, 'assistant', messagesContainer);
            return;
          } else {
            data.messages.forEach(message => {
              try {
                const messageContents = JSON.parse(message.content);
                for (const contentBlock of messageContents) {
                  if (contentBlock.type === 'text') {
                    ThinkAIChat.Message.add(contentBlock.text, message.role, messagesContainer);
                  }
                }
              } catch (e) {
                ThinkAIChat.Message.add(message.content, message.role, messagesContainer);
              }
            });
          }

          ThinkAIChat.UI.scrollToBottom();
        } catch (error) {
          console.error('Error fetching chat history:', error);
          const loadingMessage = messagesContainer.querySelector('.mitAi-message-bubble.mitAi-ai-message');
          if (loadingMessage && loadingMessage.textContent === "Loading conversation history...") {
            messagesContainer.removeChild(loadingMessage);
          }
          const welcomeMessage = window.thinkAIChatConfig?.welcomeMessage || "👋 Hi there! How can I help you today?";
          ThinkAIChat.Message.add(welcomeMessage, 'assistant', messagesContainer);
          sessionStorage.removeItem('thinkAIConversationId');
        }
      },
    },

    /**
     * Authentication-related functionality
     */
    Auth: {
      /**
       * Opens an authentication popup window
       * @param {string} authUrl - The auth URL
       */
      openAuthPopup: function (authUrl) {
        const width = 600;
        const height = 700;
        const left = (window.innerWidth - width) / 2 + window.screenX;
        const top = (window.innerHeight - height) / 2 + window.screenY;

        const popup = window.open(
          authUrl,
          'ThinkAIAuth',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (popup) {
          popup.focus();
        } else {
          alert('Please allow popups for this site to authenticate.');
        }

        const conversationId = sessionStorage.getItem('thinkAIConversationId');
        if (conversationId) {
          ThinkAIChat.Message.add("Authentication in progress. Please complete the process in the popup window.", 'assistant', ThinkAIChat.UI.elements.newChatMessagesContainer);
          this.startTokenPolling(conversationId, ThinkAIChat.UI.elements.newChatMessagesContainer);
        }
      },

      /**
       * Start polling for token availability
       * @param {string} conversationId - Conversation ID
       * @param {HTMLElement} messagesContainer - The messages container
       */
      startTokenPolling: function (conversationId, messagesContainer) {
        if (!conversationId) return;

        const pollingId = 'polling_' + Date.now();
        sessionStorage.setItem('thinkAITokenPollingId', pollingId);

        let attemptCount = 0;
        const maxAttempts = 30;

        const poll = async () => {
          if (sessionStorage.getItem('thinkAITokenPollingId') !== pollingId) {
            console.log('Another polling session has started, stopping this one');
            return;
          }

          if (attemptCount >= maxAttempts) {
            console.log('Max polling attempts reached, stopping');
            return;
          }

          attemptCount++;

          try {
            const tokenUrl = `https://judicial-roles-upgrades-having.trycloudflare.com/auth/token-status?conversation_id=${encodeURIComponent(conversationId)}`;
            const response = await fetch(tokenUrl);

            if (!response.ok) {
              throw new Error('Token status check failed: ' + response.status);
            }

            const data = await response.json();

            if (data.status === 'authorized') {
              console.log('Token available, resuming conversation');
              const message = sessionStorage.getItem('thinkAILastMessage');

              if (message) {
                sessionStorage.removeItem('thinkAILastMessage');
                setTimeout(() => {
                  ThinkAIChat.Message.add("Authorization successful! I'm now continuing with your request.", 'assistant', messagesContainer);
                  ThinkAIChat.API.streamResponse(message, conversationId, messagesContainer);
                  ThinkAIChat.UI.showTypingIndicator();
                }, 500);
              }

              sessionStorage.removeItem('thinkAITokenPollingId');
              return;
            }

            setTimeout(poll, 10000);
          } catch (error) {
            console.error('Error polling for token status:', error);
            setTimeout(poll, 10000);
          }
        };

        setTimeout(poll, 2000);
      },
    },

    /**
     * Product-related functionality
     */
    Product: {
      /**
       * Create a product card with the updated color scheme.
       * @param {Object} product - Product data
       * @returns {HTMLElement} Product card element
       */
      createCard: function (product) {
        const card = document.createElement('div');
        // --- COLOR CHANGE: Removed 'bg-gray-900' class ---
        card.classList.add(
          'mitAi-product-card',
          'flex-none',
          'w-full',
          'max-w-md',
          'mx-auto',
          'rounded-xl',
          'shadow-2xl',
          // --- COLOR CHANGE: Updated shadow color ---
          'hover:shadow-[#f9b347]/50',
          'transition-shadow',
          'duration-300'
        );
        // --- COLOR CHANGE: Set background color using inline style ---
        card.style.backgroundColor = '#333333';


        const imageContainer = document.createElement('div');
        imageContainer.classList.add('mitAi-product-image');
        const imageUrl = product.image_url || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
        imageContainer.style.backgroundImage = `url('${imageUrl}')`;
        imageContainer.style.backgroundSize = 'contain';
        imageContainer.style.backgroundRepeat = 'no-repeat';
        imageContainer.style.backgroundPosition = 'top center';
        imageContainer.style.height = '172px';
        imageContainer.style.marginTop = '17px';
        imageContainer.style.borderRadius = '25px';
        card.appendChild(imageContainer);

        const info = document.createElement('div');
        info.classList.add('mitAi-product-info', 'p-4');

        const title = document.createElement('h3');
        title.classList.add('mitAi-product-title', 'text-lg', 'font-bold', 'text-white', 'tracking-tight');
        if (product.url) {
          const titleLink = document.createElement('a');
          titleLink.href = product.url;
          titleLink.target = '_blank';
          titleLink.textContent = product.title;
          titleLink.classList.add('mitAi-product-title-link');
          title.appendChild(titleLink);
        } else {
          title.textContent = product.title;
        }
        info.appendChild(title);

        const price = document.createElement('p');
        // --- COLOR CHANGE: Updated text color ---
        price.classList.add('mitAi-product-price', 'text-[#f9b347]', 'text-base', 'font-medium', 'mt-2');
        price.textContent = product.price;
        info.appendChild(price);

        const button = document.createElement('button');
        button.classList.add(
          'mitAi-add-to-cart',
          'mt-4',
          'w-full',
          // --- COLOR CHANGE: Updated background and hover colors ---
          'bg-[#f9b347]',
          'text-white',
          'py-2',
          'rounded-lg',
          'hover:bg-[#e0a140]', // Darker shade for hover
          'transition-colors',
          'duration-200',
          'font-semibold',
          'text-sm',
          'uppercase',
          'tracking-wider'
        );
        button.textContent = 'Add to Cart';
        button.dataset.productId = product.id;
        button.addEventListener('click', function () {
          const input = document.getElementById('mitAi-new-chat-input');
          if (input) {
            input.value = `Add ${product.title} to my cart`;
            const sendButton = document.getElementById('mitAi-send-new-message');
            if (sendButton) { sendButton.click(); }
          }
        });
        info.appendChild(button);
        card.appendChild(info);

        return card;
      },

      /**
       * Initialize a carousel that stops at the ends.
       * @param {HTMLElement} container - The container element to append the carousel to
       * @param {Array} products - Array of product data objects
       */
      initCarousel: function (container, products) {
        if (!container || !products || !Array.isArray(products) || products.length === 0) {
          console.error('Invalid container or products data.');
          return;
        }

        container.innerHTML = '';

        const style = document.createElement('style');
        style.textContent = `
      .carousel::-webkit-scrollbar { display: none; }
      .carousel {
        -ms-overflow-style: none;
        scrollbar-width: none;
        scroll-snap-type: x mandatory;
      }
      .mitAi-product-card {
        scroll-snap-align: center;
        transition: opacity 0.5s ease, transform 0.5s ease;
        opacity: 0.5;
        transform: scale(0.95);
      }
      .mitAi-product-card.active { opacity: 1; transform: scale(1); }
      .mitAi-prev-arrow, .mitAi-next-arrow {
        position: absolute;
        top: 40%;
        transform: translateY(-50%);
        transition: opacity 0.3s ease, background-color 0.3s ease;
      }
      .mitAi-prev-arrow { left: 0.5rem; }
      .mitAi-next-arrow { right: 0.5rem; }
      .mitAi-prev-arrow:disabled, .mitAi-next-arrow:disabled { opacity: 0.4; cursor: not-allowed; }
    `;
        document.head.appendChild(style);

        const carouselContainer = document.createElement('div');
        carouselContainer.classList.add('relative');

        const carousel = document.createElement('div');
        carousel.classList.add('carousel', 'flex', 'overflow-x-hidden');

        const cards = products.map(p => this.createCard(p));
        cards.forEach(card => carousel.appendChild(card));

        carouselContainer.appendChild(carousel);
        container.appendChild(carouselContainer);

        if (products.length <= 1) {
          if (cards.length > 0) cards[0].classList.add('active');
          return;
        }

        // --- COLOR CHANGE: Updated background and hover colors ---
        const prevArrow = document.createElement('button');
        prevArrow.classList.add('mitAi-prev-arrow', 'bg-[#f9b347]', 'text-white', 'p-2', 'rounded-full', 'hover:bg-[#e0a140]', 'shadow-lg', 'z-10');
        prevArrow.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>`;
        const nextArrow = document.createElement('button');
        nextArrow.classList.add('mitAi-next-arrow', 'bg-[#f9b347]', 'text-white', 'p-2', 'rounded-full', 'hover:bg-[#e0a140]', 'shadow-lg', 'z-10');
        nextArrow.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
        carouselContainer.appendChild(prevArrow);
        carouselContainer.appendChild(nextArrow);

        let currentIndex = 0;
        let isMoving = false;

        const updateButtons = () => {
          prevArrow.disabled = (currentIndex === 0);
          nextArrow.disabled = (currentIndex === products.length - 1);
        };

        const updateView = (behavior = 'smooth') => {
          isMoving = true;
          const targetCard = cards[currentIndex];

          if (targetCard) {
            targetCard.scrollIntoView({
              behavior: behavior,
              inline: 'center',
              block: 'nearest'
            });
          }

          cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentIndex);
          });

          updateButtons();
          setTimeout(() => { isMoving = false; }, 500);
        };

        nextArrow.addEventListener('click', () => {
          if (isMoving || currentIndex >= products.length - 1) return;
          currentIndex++;
          updateView();
        });

        prevArrow.addEventListener('click', () => {
          if (isMoving || currentIndex <= 0) return;
          currentIndex--;
          updateView();
        });

        updateView('auto');
      }
    },
    /**
     * Existing functionality from mitAi-script.js
     */
    actionButtons: [
      {
        prompt: "Order Tracking",
        iconSvg: `<svg class="mitAi-chat-history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a2 2 0 002-2V7.5L14.5 3H6a2 2 0 00-2 2v13a2 2 0 002 2h11z"></path><polyline points="14 3 14 8 19 8"></polyline><path d="M10 12L7 9 4 12"></path><path d="M7 9v11"></path></svg>`,
      },
      {
        prompt: "Whatsapp",
        iconSvg: `<svg class="mitAi-chat-history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.5 8.5 0 017.6 4.7 8.38 8.38 0 01.9 3.8z"></path></svg>`,
      },
      {
        prompt: "Email",
        iconSvg: `<svg class="mitAi-chat-history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
      },
      {
        prompt: "Support",
        iconSvg: `<svg class="mitAi-chat-history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"></path><line x1="12" y1="12" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8"></line></svg>`,
      },
    ],

    articles: [
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
        `,
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
        `,
      },
      {
        title: "Do you ship internationally?",
        author: "Jesse",
        updated: "2 months ago",
        content: `
          <p>Yes, we proudly offer international shipping to most countries worldwide!</p>
          <p>Please note that international shipping times and costs vary depending on the destination. Any customs duties, taxes, or import fees are the responsibility of the recipient and are not included in the item price or shipping cost.</p>
          <p>During checkout, you will be able to see the available shipping options and estimated costs for your country.</p>
        `,
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
        `,
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
        `,
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
        `,
      },
    ],

    isOrderTrackingMode: false,

    /**
     * Handle chat history button clicks
     * @param {Event} e - Click event
     */
    handleChatHistoryButtonClick: function (e) {
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
        ThinkAIChat.showNewChatScreen();
        setTimeout(() => {
          ThinkAIChat.Message.add('Order Tracking', 'user', ThinkAIChat.UI.elements.newChatMessagesContainer);
          ThinkAIChat.switchToOrderTrackingInput();
        }, 100);
        return;
      }
      ThinkAIChat.Message.send({ value: promptText }, ThinkAIChat.UI.elements.initialChatArea);
      ThinkAIChat.UI.elements.chatHistorySection.style.display = 'none';
      ThinkAIChat.UI.elements.searchSection.style.display = 'none';
      ThinkAIChat.UI.elements.newChatButton.style.display = 'none';
    },

    /**
     * Handle article item clicks
     * @param {Event} e - Click event
     */
    handleArticleItemClick: function (e) {
      const articleText = e.currentTarget.querySelector('.mitAi-article-text').textContent;
      ThinkAIChat.showArticleViewScreen(articleText);
    },

    /**
     * Handle search input
     * @param {Event} e - Input event
     */
    handleSearchInput: function (e) {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll('#mitAi-article-list .mitAi-article-item').forEach(item => {
        const text = item.querySelector('.mitAi-article-text').textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
      });
    },

    /**
     * Reset chat area content to initial screen
     */
    resetChatAreaContent: function () {
      const { chatWindow, screensWrapper, newChatButton } = ThinkAIChat.UI.elements;
      chatWindow?.classList.remove('mitAi-expanded');
      screensWrapper.classList.remove('mitAi-slide-left', 'mitAi-slide-far-left');
      newChatButton.style.display = 'flex';
      ThinkAIChat.isOrderTrackingMode = false;
      ThinkAIChat.switchToNormalChatInput();
      ThinkAIChat.UI.setupEventListeners();
    },

    /**
     * Show new chat screen
     */
    showNewChatScreen: function () {

      const { chatWindow, screensWrapper, newChatButton, newChatMessagesContainer, chatInputArea } = ThinkAIChat.UI.elements;
      chatWindow?.classList.remove('mitAi-expanded');
      screensWrapper.classList.remove('mitAi-slide-far-left');
      screensWrapper.classList.add('mitAi-slide-left');
      newChatButton.style.display = 'none';

      const conversationId = sessionStorage.getItem('thinkAIConversationId');

      console.log("This is converstation id ", conversationId);
      console.log("newChatMessagesContainer newChatMessagesContainer ", newChatMessagesContainer);

      if (conversationId) {
        newChatMessagesContainer.innerHTML = ''
        this.API.fetchChatHistory(conversationId, newChatMessagesContainer);
      } else {
        newChatMessagesContainer.innerHTML = ''
        const welcomeMessage = window.thinkAIChatConfig?.welcomeMessage || "👋 Hi there! How can I help you today?";

        this.Message.add(welcomeMessage, 'assistant', this.UI.elements.newChatMessagesContainer);
      }

      console.log("newChatMessagesContainer newChatMessagesContainer ", newChatMessagesContainer)

      const existingHeader = newChatMessagesContainer.querySelector('.mitAi-chat-top-bar');
      if (existingHeader) existingHeader.remove();

      newChatMessagesContainer.insertAdjacentHTML('afterbegin', `
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
      `);

      let predefinedDiv = newChatMessagesContainer.querySelector('.mitAi-predefined-options');
      if (!predefinedDiv) {
        const predefinedOptions = [
          { icon: "🛒", text: "Track my order" },
          { icon: "🚚", text: "How long does delivery take?" },
          { icon: "🔁", text: "Return policy" },
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
              ThinkAIChat.autoResizeTextarea.call(currentInput);
            }
          };
          predefinedDiv.appendChild(btn);
        });
        // newChatMessagesContainer?.insertBefore(predefinedDiv, chatInputArea);
      }

      document.getElementById('mitAi-back-to-home').addEventListener('click', ThinkAIChat.resetChatAreaContent);
      // ThinkAIChat.Message.add('Hello! How can I help you today?', 'assistant', newChatMessagesContainer);
      ThinkAIChat.switchToNormalChatInput();
    },

    /**
     * Show article view screen
     * @param {string} articleTitle - Title of the article to display
     */
    showArticleViewScreen: function (articleTitle) {
      const { chatWindow, screensWrapper, newChatButton, articleViewScreen } = ThinkAIChat.UI.elements;
      chatWindow?.classList.add('mitAi-expanded');
      screensWrapper.classList.remove('mitAi-slide-left');
      screensWrapper.classList.add('mitAi-slide-far-left');
      newChatButton.style.display = 'none';

      const articleData = ThinkAIChat.articles.find(article => article.title === articleTitle);
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
      document.getElementById('mitAi-back-to-initial-screen').addEventListener('click', ThinkAIChat.resetChatAreaContent);
    },

    /**
     * Switch to order tracking input mode
     */
    switchToOrderTrackingInput: function () {
      ThinkAIChat.isOrderTrackingMode = true;
      const { chatInputArea, newChatMessagesContainer } = ThinkAIChat.UI.elements;
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
      ThinkAIChat.attachEventListeners();
      ThinkAIChat.Message.add('Please provide your order number and email address to track your order.', 'assistant', newChatMessagesContainer);
    },

    /**
     * Switch to normal chat input mode
     */
    switchToNormalChatInput: function () {
      ThinkAIChat.isOrderTrackingMode = false;
      const { chatInputArea } = ThinkAIChat.UI.elements;
      chatInputArea.innerHTML = `
        <textarea placeholder="Type your message..." id="mitAi-new-chat-input" rows="1" class="flex-1 bg-transparent border-none outline-none text-white text-sm py-2 px-2 resize-none min-h-10 leading-6 rounded-full max-h-50 overflow-y-auto scrollbar-width-none"></textarea>
        <button id="mitAi-send-new-message">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      `;
      ThinkAIChat.attachEventListeners();
    },

    /**
     * Handle sending a new message
     */
    handleSendNewMessage: function () {
      const { newChatMessagesContainer, chatInputArea } = ThinkAIChat.UI.elements;
      const predefinedDiv = newChatMessagesContainer.querySelector('.mitAi-predefined-options');
      if (predefinedDiv) predefinedDiv.remove();

      if (ThinkAIChat.isOrderTrackingMode) {
        const orderNumberInput = document.getElementById('mitAi-order-number-input');
        const emailInput = document.getElementById('mitAi-email-input');

        const orderNumber = orderNumberInput ? orderNumberInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';

        if (orderNumber === '' || email === '') {
          ThinkAIChat.Message.add('Please provide both order number and email address.', 'assistant', newChatMessagesContainer);
          return;
        }

        const userMessage = `Order Tracking Request: Order No. ${orderNumber}, Email: ${email}`;
        ThinkAIChat.Message.add(userMessage, 'user', newChatMessagesContainer);
        ThinkAIChat.switchToNormalChatInput();
        ThinkAIChat.Message.send({ value: userMessage }, newChatMessagesContainer);
      } else {
        const newChatInput = document.getElementById('mitAi-new-chat-input');
        if (!newChatInput || newChatInput.value.trim() === '') return;

        if (newChatInput.value.toLowerCase().includes('order tracking')) {
          ThinkAIChat.showNewChatScreen();
          setTimeout(() => {
            ThinkAIChat.Message.add('Order Tracking', 'user', newChatMessagesContainer);
            ThinkAIChat.switchToOrderTrackingInput();
          }, 100);
          return;
        }

        ThinkAIChat.Message.send(newChatInput, newChatMessagesContainer);
      }
    },

    /**
     * Auto-resize textarea
     */
    autoResizeTextarea: function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 70) + 'px';
    },

    /**
     * Attach event listeners
     */
    attachEventListeners: function () {
      const { chatHistoryGrid, articleList, searchInput, newChatButton, chatInputArea } = ThinkAIChat.UI.elements;

      chatHistoryGrid.querySelectorAll('.mitAi-chat-history-button').forEach(button => {
        button.removeEventListener('click', ThinkAIChat.handleChatHistoryButtonClick);
        button.addEventListener('click', ThinkAIChat.handleChatHistoryButtonClick);
      });

      articleList.querySelectorAll('.mitAi-article-item').forEach(item => {
        item.removeEventListener('click', ThinkAIChat.handleArticleItemClick);
        item.addEventListener('click', ThinkAIChat.handleArticleItemClick);
      });

      if (searchInput) {
        searchInput.removeEventListener('input', ThinkAIChat.handleSearchInput);
        searchInput.addEventListener('input', ThinkAIChat.handleSearchInput);
      }

      newChatButton.removeEventListener('click', ThinkAIChat.showNewChatScreen);
      newChatButton.addEventListener('click', ThinkAIChat.showNewChatScreen);

      const existingBackToHomeButton = document.getElementById('mitAi-back-to-home');
      if (existingBackToHomeButton) {
        existingBackToHomeButton.removeEventListener('click', ThinkAIChat.resetChatAreaContent);
        existingBackToHomeButton.addEventListener('click', ThinkAIChat.resetChatAreaContent);
      }

      const sendNewMessageButton = document.getElementById('mitAi-send-new-message');
      if (sendNewMessageButton) {
        sendNewMessageButton.removeEventListener('click', ThinkAIChat.handleSendNewMessage);
        sendNewMessageButton.addEventListener('click', ThinkAIChat.handleSendNewMessage);
      }

      const newChatInput = document.getElementById('mitAi-new-chat-input');
      if (newChatInput) {
        newChatInput.removeEventListener('input', ThinkAIChat.autoResizeTextarea);
        newChatInput.addEventListener('input', ThinkAIChat.autoResizeTextarea);

        newChatInput.removeEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            ThinkAIChat.handleSendNewMessage();
          }
        });
        newChatInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            ThinkAIChat.handleSendNewMessage();
          }
        });
      }

      const closeOrderTrackingButton = document.getElementById('mitAi-close-order-tracking');
      if (closeOrderTrackingButton) {
        closeOrderTrackingButton.removeEventListener('click', ThinkAIChat.switchToNormalChatInput);
        closeOrderTrackingButton.addEventListener('click', ThinkAIChat.switchToNormalChatInput);
      }
    },

    /**
     * Initialize the chat application
     */
    init: function () {
      const container = document.querySelector('.mitAi-chatbot-container');
      if (!container) return;

      this.UI.init(container);



      this.UI.elements.chatWindow?.classList.add('mitAi-hidden');
      this.attachEventListeners();
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    ThinkAIChat.init();
  });

})();