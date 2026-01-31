// ==UserScript==
// @name           Zen Media Controls Artwork Background
// @version        1.1
// @description    Shows media artwork as background on hover for Zen media controls (Uses CSS class).
// @author         Your Name
// @compatibility  ZenBrowser
// ==/UserScript==

(() => {
    'use strict';

    const TOOLBAR_ID = 'zen-media-controls-toolbar';
    const ARTWORK_VAR = '--zen-media-artwork-bg'; // CSS variable name
    const ARTWORK_CLASS = 'has-artwork'; // Class to toggle styles

    /* --- Style Injection Removed --- */
    // CSS should be loaded via userChrome.css using @import
    /* function injectStyles() { ... } */

    function findBestArtwork(artwork = []) {
        if (!Array.isArray(artwork) || artwork.length === 0) {
            return null;
        }
        // Sort by size (assuming sizes like "128x128"), parse width, pick largest
        artwork.sort((a, b) => {
            const sizeA = parseInt(a.sizes?.split('x')[0] || '0');
            const sizeB = parseInt(b.sizes?.split('x')[0] || '0');
            return sizeB - sizeA;
        });
        // Ensure we have a src property
        return artwork[0]?.src || null;
    }

    function applyArtwork(toolbar) {
        // Target the inner toolbaritem as background container
        const toolbarItem = toolbar.querySelector(':scope > toolbaritem');
        if (!toolbarItem) return;

        try {
            let artworkUrl = null;
            if (typeof gZenMediaController !== 'undefined' && gZenMediaController._currentMediaController) {
                const metadata = gZenMediaController._currentMediaController.getMetadata();
                artworkUrl = findBestArtwork(metadata?.artwork);
            }

            if (artworkUrl) {
                // Apply the URL to the CSS variable
                toolbarItem.style.setProperty(ARTWORK_VAR, `url("${artworkUrl}")`);
                // Add the class to enable CSS rules
                toolbarItem.classList.add(ARTWORK_CLASS);
                console.log(`Zen Media Artwork BG: Applied artwork and class: ${artworkUrl}`);
            } else {
                 // No artwork found, remove variable and class
                 toolbarItem.style.removeProperty(ARTWORK_VAR);
                 toolbarItem.classList.remove(ARTWORK_CLASS);
                 console.log('Zen Media Artwork BG: No artwork found in metadata, removing class.');
            }
        } catch (e) {
            console.error("Zen Media Artwork BG: Error getting/applying artwork:", e);
            toolbarItem.style.removeProperty(ARTWORK_VAR);
            toolbarItem.classList.remove(ARTWORK_CLASS);
        }
    }

    function removeArtwork(toolbar) {
         const toolbarItem = toolbar.querySelector(':scope > toolbaritem');
         if (toolbarItem) {
            // Remove the CSS variable and class on mouseleave
            toolbarItem.style.removeProperty(ARTWORK_VAR);
            toolbarItem.classList.remove(ARTWORK_CLASS);
             console.log('Zen Media Artwork BG: Removed artwork var and class on mouseleave.');
         }
    }

    function addHoverListeners(toolbar) {
        if (toolbar.dataset.artworkListenersAdded === 'true') return; // Prevent adding multiple times

        toolbar.addEventListener('mouseenter', (e) => {
            console.log('Zen Media Artwork BG: Mouse entered toolbar', e);
            applyArtwork(toolbar);
        });
        toolbar.addEventListener('mouseleave', (e) => {
            console.log('Zen Media Artwork BG: Mouse left toolbar', e);
            removeArtwork(toolbar);
        });
        
        toolbar.dataset.artworkListenersAdded = 'true';
        console.log('Zen Media Artwork BG: Added hover listeners to media toolbar.');
    }

    function init() {
        const toolbar = document.getElementById(TOOLBAR_ID);
        
        if (toolbar && typeof gZenMediaController !== 'undefined') {
             console.log('Zen Media Artwork BG: Initializing (Class-based)...');
             // injectStyles(); // <-- Removed
             addHoverListeners(toolbar);
        } else {
             console.log('Zen Media Artwork BG: Waiting for toolbar and/or controller...');
             setTimeout(init, 1000); 
        }
    }

    // Start initialization check once the window is loaded
    if (document.readyState === 'complete') {
         setTimeout(init, 500); 
    } else {
         window.addEventListener('load', () => setTimeout(init, 500), { once: true });
    }

})(); 