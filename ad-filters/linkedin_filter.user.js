// ==UserScript==
// @name         LinkedIn Feed Filter
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Hide promoted posts, network activity posts, suggested posts, and job recommendations from LinkedIn feed
// @author       You
// @match        https://www.linkedin.com/*
// @match        https://linkedin.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    const CONFIG = {
        // Enable/disable filtering for each post type
        hideNetworkActivity: true,  // Posts shown because someone liked/commented/shared/loved/reposted
        hidePromoted: true,         // Sponsored/promoted posts
        hideSuggested: true,        // Suggested posts
        hideJobPostings: true,      // Job recommendation posts
        
        // Performance settings
        checkInterval: 2000,        // Milliseconds between periodic checks (fallback)
        debounceDelay: 100,         // Milliseconds to debounce mutation observer
        
        // Debug mode (set to true to see console logs)
        debug: false
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    function log(message, ...args) {
        if (CONFIG.debug) {
            console.log('[LinkedIn Filter]', message, ...args);
        }
    }

    function hidePost(postElement) {
        if (postElement && postElement.style.display !== 'none') {
            postElement.style.display = 'none';
            return true;
        }
        return false;
    }

    // ============================================================================
    // FILTERING FUNCTIONS
    // ============================================================================

    /**
     * Hide network activity posts (posts shown because someone liked/commented/shared/loved/reposted/reacted)
     */
    function hideNetworkActivityPosts() {
        if (!CONFIG.hideNetworkActivity) return;
        
        try {
            const textViewSpans = document.querySelectorAll('span.update-components-header__text-view');
            let hiddenCount = 0;
            
            textViewSpans.forEach(span => {
                const text = (span.textContent || span.innerText || '').trim();
                
                // Check for network activity indicators
                if (text.includes('commented on this') || 
                    text.includes('likes this') || 
                    text.includes('shared this') ||
                    text.includes('loves this') ||
                    text.includes('reposted this') ||
                    text.includes('finds this funny') ||
                    text.includes('finds this insightful') ||
                    text.includes('celebrates this') ||
                    text.includes('job update')) {
                    
                    const post = span.closest('div.feed-shared-update-v2');
                    if (post && hidePost(post)) {
                        hiddenCount++;
                    }
                }
            });
            
            if (hiddenCount > 0) {
                log(`Hidden ${hiddenCount} network activity post(s)`);
            }
        } catch (error) {
            console.error('[LinkedIn Filter] Error hiding network activity posts:', error);
        }
    }

    /**
     * Hide promoted/sponsored posts
     */
    function hidePromotedPosts() {
        if (!CONFIG.hidePromoted) return;
        
        try {
            // Check both sub-description and description (newer format)
            const subDescriptionSpans = document.querySelectorAll('span.update-components-actor__sub-description, span.update-components-actor__description');
            let hiddenCount = 0;
            
            subDescriptionSpans.forEach(span => {
                const text = (span.textContent || span.innerText || '').toLowerCase();
                
                if (text.includes('promoted')) {
                    const post = span.closest('div.feed-shared-update-v2');
                    if (post && hidePost(post)) {
                        hiddenCount++;
                    }
                }
            });
            
            if (hiddenCount > 0) {
                log(`Hidden ${hiddenCount} promoted post(s)`);
            }
        } catch (error) {
            console.error('[LinkedIn Filter] Error hiding promoted posts:', error);
        }
    }

    /**
     * Hide suggested posts
     */
    function hideSuggestedPosts() {
        if (!CONFIG.hideSuggested) return;
        
        try {
            const textViewSpans = document.querySelectorAll('span.update-components-header__text-view');
            let hiddenCount = 0;
            
            textViewSpans.forEach(span => {
                const text = (span.textContent || span.innerText || '').trim().toLowerCase();
                
                // Check for exact match "suggested" (case-insensitive)
                if (text === 'suggested') {
                    const post = span.closest('div.feed-shared-update-v2');
                    if (post && hidePost(post)) {
                        hiddenCount++;
                    }
                }
            });
            
            if (hiddenCount > 0) {
                log(`Hidden ${hiddenCount} suggested post(s)`);
            }
        } catch (error) {
            console.error('[LinkedIn Filter] Error hiding suggested posts:', error);
        }
    }

    /**
     * Hide job posting recommendations
     */
    function hideJobPostings() {
        if (!CONFIG.hideJobPostings) return;
        
        try {
            let hiddenCount = 0;
            
            // Method 1: Find posts with "Jobs recommended for you" or similar text in header
            const textViewSpans = document.querySelectorAll('span.update-components-header__text-view');
            textViewSpans.forEach(span => {
                const text = (span.textContent || span.innerText || '').trim().toLowerCase();
                
                if (text.includes('jobs recommended') || 
                    text.includes('job recommendations') ||
                    text === 'jobs recommended for you') {
                    
                    const post = span.closest('div.feed-shared-update-v2') || 
                                 span.closest('div[data-id*="urn:li:aggregate"]') ||
                                 span.closest('div[data-id*="jobPosting"]');
                    if (post && hidePost(post)) {
                        hiddenCount++;
                    }
                }
            });
            
            // Method 2: Find elements with job posting data-id attributes
            const jobPostingElements = document.querySelectorAll('div[data-id*="urn:li:aggregate"], div[data-id*="jobPosting"]');
            jobPostingElements.forEach(element => {
                const dataId = element.getAttribute('data-id') || '';
                if (dataId.includes('jobPosting') || dataId.includes('urn:li:aggregate')) {
                    // Check if it's actually a job posting (not just a regular post mentioning jobs)
                    const parent = element.closest('div.feed-shared-update-v2') || element;
                    if (parent && hidePost(parent)) {
                        hiddenCount++;
                    }
                }
            });
            
            if (hiddenCount > 0) {
                log(`Hidden ${hiddenCount} job posting(s)`);
            }
        } catch (error) {
            console.error('[LinkedIn Filter] Error hiding job postings:', error);
        }
    }

    /**
     * Main function to hide all filtered posts
     */
    function hideFilteredPosts() {
        hideNetworkActivityPosts();
        hidePromotedPosts();
        hideSuggestedPosts();
        hideJobPostings();
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /**
     * Initialize the filter with debounced mutation observer
     */
    function init() {
        log('Initializing LinkedIn Feed Filter...');
        
        // Run immediately on page load
        hideFilteredPosts();
        
        // Set up mutation observer with debouncing for performance
        let debounceTimer;
        const observer = new MutationObserver(function(mutations) {
            // Debounce to avoid excessive calls
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                hideFilteredPosts();
            }, CONFIG.debounceDelay);
        });

        // Start observing when DOM is ready
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            log('MutationObserver started');
        } else {
            window.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                log('MutationObserver started (after DOMContentLoaded)');
            });
        }

        // Periodic check as fallback (in case mutation observer misses something)
        setInterval(hideFilteredPosts, CONFIG.checkInterval);
        log('Periodic check interval set to', CONFIG.checkInterval, 'ms');
        
        log('LinkedIn Feed Filter initialized successfully');
    }

    // Start the filter
    init();
})();
