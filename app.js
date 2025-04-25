// AffiliateHub - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load any saved data
    loadSavedData();
});

// Global variables
let affiliateAccounts = {};
let affiliateLinks = [];
let userProfile = {
    name: '',
    email: '',
    defaultNetwork: 'amazon',
    linkFormat: 'original'
};

// Initialize the application
function initApp() {
    console.log('AffiliateHub initialized');
    
    // Check for local storage support
    if (typeof(Storage) === "undefined") {
        alert("Your browser doesn't support local storage. Some features may not work properly.");
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Tab navigation
    const tabItems = document.querySelectorAll('nav li');
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Quick action buttons
    document.getElementById('find-products').addEventListener('click', function() {
        switchTab('products');
    });
    
    document.getElementById('generate-link').addEventListener('click', function() {
        openModal('create-link-modal');
    });
    
    document.getElementById('share-link').addEventListener('click', function() {
        if (affiliateLinks.length > 0) {
            openModal('create-link-modal');
            document.querySelector('.generated-link-container').classList.add('active');
            document.getElementById('generated-link').value = affiliateLinks[0].affiliateLink;
        } else {
            openModal('create-link-modal');
        }
    });
    
    document.getElementById('view-analytics').addEventListener('click', function() {
        switchTab('analytics');
    });
    
    // Connect account button
    document.getElementById('connect-account-btn').addEventListener('click', function() {
        openModal('connect-account-modal');
    });
    
    // Create link buttons
    document.getElementById('create-link-btn').addEventListener('click', function() {
        openModal('create-link-modal');
    });
    
    document.getElementById('new-link-btn').addEventListener('click', function() {
        openModal('create-link-modal');
    });
    
    document.getElementById('create-first-link').addEventListener('click', function() {
        openModal('create-link-modal');
    });
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Network selection in connect account modal
    const networkOptions = document.querySelectorAll('.network-selector .network-option');
    networkOptions.forEach(option => {
        option.addEventListener('click', function() {
            const network = this.getAttribute('data-network');
            selectNetwork(network);
        });
    });
    
    // Connect account form submission
    document.getElementById('connect-account-form').addEventListener('submit', function(e) {
        e.preventDefault();
        connectAffiliateAccount();
    });
    
    // Create link form submission
    document.getElementById('create-link-form').addEventListener('submit', function(e) {
        e.preventDefault();
        generateAffiliateLink();
    });
    
    // Network select change in create link modal
    document.getElementById('network-select').addEventListener('change', function() {
        updateNetworkFields();
    });
    
    // Copy link button
    document.querySelector('.copy-link-btn').addEventListener('click', function() {
        copyToClipboard('generated-link');
    });
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            shareLink(platform);
        });
    });
    
    // Settings form submissions
    document.getElementById('default-settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveDefaultSettings();
    });
    
    document.getElementById('user-profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveUserProfile();
    });
    
    // Connect network buttons in settings
    const connectButtons = document.querySelectorAll('.connect-btn');
    connectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const network = this.getAttribute('data-network');
            openModal('connect-account-modal');
            selectNetwork(network);
        });
    });
}

// Load any saved data from localStorage
function loadSavedData() {
    // Load affiliate accounts
    const savedAccounts = localStorage.getItem('affiliateAccounts');
    if (savedAccounts) {
        affiliateAccounts = JSON.parse(savedAccounts);
        updateConnectedAccounts();
    }
    
    // Load affiliate links
    const savedLinks = localStorage.getItem('affiliateLinks');
    if (savedLinks) {
        affiliateLinks = JSON.parse(savedLinks);
        updateLinksTable();
    }
    
    // Load user profile
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        updateUserProfileForm();
    }
}

// Switch between tabs
function switchTab(tabId) {
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab items
    const tabItems = document.querySelectorAll('nav li');
    tabItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to the clicked tab item
    document.querySelector(`nav li[data-tab="${tabId}"]`).classList.add('active');
}

// Open a modal
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// Close a modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    
    // Reset forms
    if (modalId === 'connect-account-modal') {
        document.getElementById('connect-account-form').reset();
        document.querySelectorAll('.network-selector .network-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector('.amazon-fields').style.display = 'none';
        document.querySelector('.cj-fields').style.display = 'none';
    } else if (modalId === 'create-link-modal') {
        document.getElementById('create-link-form').reset();
        document.querySelector('.generated-link-container').classList.remove('active');
    }
}

// Select a network in the connect account modal
function selectNetwork(network) {
    // Remove active class from all network options
    document.querySelectorAll('.network-selector .network-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to the selected network option
    document.querySelector(`.network-option[data-network="${network}"]`).classList.add('active');
    
    // Show/hide network-specific fields
    document.querySelector('.amazon-fields').style.display = network === 'amazon' ? 'block' : 'none';
    document.querySelector('.cj-fields').style.display = network === 'cj' ? 'block' : 'none';
}

// Connect an affiliate account
function connectAffiliateAccount() {
    const activeNetwork = document.querySelector('.network-selector .network-option.active');
    if (!activeNetwork) {
        alert('Please select an affiliate network');
        return;
    }
    
    const network = activeNetwork.getAttribute('data-network');
    const affiliateId = document.getElementById('affiliate-id').value.trim();
    
    if (!affiliateId) {
        alert('Please enter your affiliate ID');
        return;
    }
    
    // Network-specific validation
    if (network === 'amazon') {
        const amazonTag = document.getElementById('amazon-tag').value.trim();
        if (!amazonTag) {
            alert('Please enter your Amazon Associate Tag');
            return;
        }
        
        affiliateAccounts.amazon = {
            affiliateId: affiliateId,
            associateTag: amazonTag
        };
    } else if (network === 'cj') {
        const websiteId = document.getElementById('cj-website-id').value.trim();
        if (!websiteId) {
            alert('Please enter your CJ Website ID');
            return;
        }
        
        affiliateAccounts.cj = {
            affiliateId: affiliateId,
            websiteId: websiteId
        };
    } else {
        affiliateAccounts[network] = {
            affiliateId: affiliateId
        };
    }
    
    // Save to localStorage
    localStorage.setItem('affiliateAccounts', JSON.stringify(affiliateAccounts));
    
    // Update UI
    updateConnectedAccounts();
    
    // Close the modal
    closeModal('connect-account-modal');
    
    // Show success message
    alert(`Your ${getNetworkName(network)} account has been connected successfully!`);
}

// Generate an affiliate link
function generateAffiliateLink() {
    const productUrl = document.getElementById('product-url').value.trim();
    const network = document.getElementById('network-select').value;
    const productName = document.getElementById('product-name').value.trim() || 'Unnamed Product';
    const campaignName = document.getElementById('campaign-name').value.trim() || 'Default Campaign';
    
    if (!productUrl) {
        alert('Please enter a product URL');
        return;
    }
    
    // Check if the account for the selected network is connected
    if (!affiliateAccounts[network]) {
        alert(`Please connect your ${getNetworkName(network)} account first`);
        closeModal('create-link-modal');
        openModal('connect-account-modal');
        selectNetwork(network);
        return;
    }
    
    // Generate the affiliate link based on the network
    let affiliateLink = '';
    
    switch (network) {
        case 'amazon':
            affiliateLink = generateAmazonLink(productUrl, affiliateAccounts.amazon.associateTag);
            break;
        case 'awin':
            affiliateLink = generateAwinLink(productUrl, affiliateAccounts.awin.affiliateId);
            break;
        case 'cj':
            affiliateLink = generateCJLink(productUrl, affiliateAccounts.cj.affiliateId, affiliateAccounts.cj.websiteId);
            break;
        case 'clickbank':
            affiliateLink = generateClickBankLink(productUrl, affiliateAccounts.clickbank.affiliateId);
            break;
        default:
            affiliateLink = productUrl;
    }
    
    // Create a new link object
    const newLink = {
        id: Date.now(),
        productName: productName,
        network: network,
        originalUrl: productUrl,
        affiliateLink: affiliateLink,
        campaign: campaignName,
        clicks: 0,
        conversions: 0,
        dateCreated: new Date().toISOString()
    };
    
    // Add to links array
    affiliateLinks.unshift(newLink);
    
    // Save to localStorage
    localStorage.setItem('affiliateLinks', JSON.stringify(affiliateLinks));
    
    // Update the links table
    updateLinksTable();
    
    // Show the generated link
    document.querySelector('.generated-link-container').classList.add('active');
    document.getElementById('generated-link').value = affiliateLink;
    
    // Update stats
    updateStats();
}

// Generate Amazon affiliate link
function generateAmazonLink(url, tag) {
    // Extract the Amazon domain and product ID
    let domain = 'amazon.com';
    let productId = '';
    
    // Try to extract the domain
    const domainMatch = url.match(/amazon\.(com|co\.uk|ca|de|fr|it|es|co\.jp|in)/);
    if (domainMatch) {
        domain = 'amazon.' + domainMatch[1];
    }
    
    // Try to extract the product ID (ASIN)
    const asinMatch = url.match(/\/([A-Z0-9]{10})(?:\/|\?|$)/);
    if (asinMatch) {
        productId = asinMatch[1];
    } else {
        // If we can't find the ASIN, just use the original URL
        return `https://${domain}/dp/${productId}?tag=${tag}`;
    }
    
    // Construct the affiliate link
    return `https://${domain}/dp/${productId}?tag=${tag}`;
}

// Generate Awin affiliate link
function generateAwinLink(url, affiliateId) {
    // Basic implementation - in a real tool, this would be more sophisticated
    const cleanUrl = encodeURIComponent(url);
    return `https://www.awin1.com/cread.php?awinmid=MERCHANT_ID&awinaffid=${affiliateId}&clickref=&p=${cleanUrl}`;
}

// Generate Commission Junction affiliate link
function generateCJLink(url, affiliateId, websiteId) {
    // Basic implementation - in a real tool, this would be more sophisticated
    const cleanUrl = encodeURIComponent(url);
    return `https://www.anrdoezrs.net/click-${affiliateId}-${websiteId}?url=${cleanUrl}`;
}

// Generate ClickBank affiliate link
function generateClickBankLink(url, affiliateId) {
    // Extract the ClickBank product ID (if it's a ClickBank URL)
    if (url.includes('clickbank.net')) {
        const parts = url.split('/');
        const productId = parts[parts.length - 1].split('?')[0];
        return `https://VENDOR.${productId}.hop.clickbank.net/`;
    } else {
        // If it's not a ClickBank URL, we can't generate a proper link
        return url + `?affiliate=${affiliateId}`;
    }
}

// Update the connected accounts in the UI
function updateConnectedAccounts() {
    const networkConnections = document.querySelectorAll('.network-connection');
    
    networkConnections.forEach(connection => {
        const network = connection.querySelector('.connect-btn').getAttribute('data-network');
        const button = connection.querySelector('.connect-btn');
        
        if (affiliateAccounts[network]) {
            button.textContent = 'Connected';
            button.classList.add('connected');
        } else {
            button.textContent = 'Connect';
            button.classList.remove('connected');
        }
    });
}

// Update the links table
function updateLinksTable() {
    const tableBody = document.querySelector('.links-table tbody');
    const emptyState = document.querySelector('#links .empty-state');
    
    if (affiliateLinks.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Clear the table
    tableBody.innerHTML = '';
    
    // Add each link to the table
    affiliateLinks.forEach(link => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${link.productName}</td>
            <td>${getNetworkName(link.network)}</td>
            <td><a href="${link.originalUrl}" target="_blank">${truncateUrl(link.originalUrl)}</a></td>
            <td><a href="${link.affiliateLink}" target="_blank">${truncateUrl(link.affiliateLink)}</a></td>
            <td>${link.clicks}</td>
            <td>${link.conversions}</td>
            <td>
                <button class="btn secondary copy-btn" data-link="${link.affiliateLink}"><i class="fas fa-copy"></i></button>
                <button class="btn secondary share-btn" data-link="${link.affiliateLink}"><i class="fas fa-share-alt"></i></button>
                <button class="btn danger delete-btn" data-id="${link.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to the buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const link = this.getAttribute('data-link');
            copyToClipboard(null, link);
        });
    });
    
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', function() {
            const link = this.getAttribute('data-link');
            // Open share modal or directly share
            navigator.share({
                title: 'Check out this product',
                url: link
            }).catch(err => {
                console.log('Error sharing:', err);
                copyToClipboard(null, link);
                alert('Link copied to clipboard. Share it manually.');
            });
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteLink(id);
        });
    });
}

// Delete an affiliate link
function deleteLink(id) {
    if (confirm('Are you sure you want to delete this link?')) {
        affiliateLinks = affiliateLinks.filter(link => link.id !== id);
        localStorage.setItem('affiliateLinks', JSON.stringify(affiliateLinks));
        updateLinksTable();
        updateStats();
    }
}

// Update the stats on the dashboard
function updateStats() {
    const activeLinks = affiliateLinks.length;
    const totalClicks = affiliateLinks.reduce((sum, link) => sum + link.clicks, 0);
    const totalConversions = affiliateLinks.reduce((sum, link) => sum + link.conversions, 0);
    
    document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = activeLinks;
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = totalClicks;
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = totalConversions;
    
    // In a real app, we would calculate actual earnings
    const estimatedEarnings = totalConversions * 15; // Assuming $15 per conversion
    document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = `$${estimatedEarnings.toFixed(2)}`;
}

// Update network-specific fields in the create link form
function updateNetworkFields() {
    const network = document.getElementById('network-select').value;
    
    // In a more complex app, we would show/hide network-specific fields here
}

// Copy text to clipboard
function copyToClipboard(elementId, text) {
    let textToCopy;
    
    if (elementId) {
        textToCopy = document.getElementById(elementId).value;
    } else {
        textToCopy = text;
    }
    
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    
    // Select and copy the text
    tempInput.select();
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(tempInput);
    
    // Show a success message
    alert('Link copied to clipboard!');
}

// Share a link on social media
function shareLink(platform) {
    const link = document.getElementById('generated-link').value;
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Check out this product!')}`;
            break;
        case 'pinterest':
            shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(link)}&description=${encodeURIComponent('Check out this product!')}`;
            break;
        case 'email':
            shareUrl = `mailto:?subject=${encodeURIComponent('Check out this product!')}&body=${encodeURIComponent('I found this product that you might like: ' + link)}`;
            break;
    }
    
    // Open the share URL in a new window
    window.open(shareUrl, '_blank');
}

// Save default settings
function saveDefaultSettings() {
    const defaultNetwork = document.getElementById('default-network').value;
    const linkFormat = document.getElementById('link-format').value;
    
    userProfile.defaultNetwork = defaultNetwork;
    userProfile.linkFormat = linkFormat;
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    alert('Settings saved successfully!');
}

// Save user profile
function saveUserProfile() {
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    
    userProfile.name = name;
    userProfile.email = email;
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    alert('Profile updated successfully!');
}

// Update the user profile form with saved data
function updateUserProfileForm() {
    document.getElementById('user-name').value = userProfile.name;
    document.getElementById('user-email').value = userProfile.email;
    document.getElementById('default-network').value = userProfile.defaultNetwork;
    document.getElementById('link-format').value = userProfile.linkFormat;
}

// Helper function to get the network name
function getNetworkName(networkId) {
    const networks = {
        'amazon': 'Amazon Associates',
        'awin': 'Awin',
        'cj': 'Commission Junction',
        'clickbank': 'ClickBank'
    };
    
    return networks[networkId] || networkId;
}

// Helper function to truncate URLs for display
function truncateUrl(url) {
    if (url.length > 40) {
        return url.substring(0, 37) + '...';
    }
    return url;
}
