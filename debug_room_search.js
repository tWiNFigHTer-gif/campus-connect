/**
 * Room Search Debug Tool
 * Diagnostic tool for debugging room search functionality
 */

class DebugRoomSearch {
    constructor() {
        this.searchResults = [];
        this.debugMode = true;
    }

    /**
     * Debug room search functionality
     */
    debugSearch(searchTerm) {
        console.log(`🔍 Debugging search for: "${searchTerm}"`);
        
        if (!window.campusNodes) {
            console.error('❌ Campus nodes not available');
            return [];
        }
        
        const results = this.performSearch(searchTerm);
        this.analyzeSearchResults(searchTerm, results);
        
        return results;
    }

    /**
     * Perform search with detailed logging
     */
    performSearch(searchTerm) {
        const normalizedSearch = searchTerm.toLowerCase().trim();
        const results = [];
        
        console.log(`📊 Searching ${window.campusNodes.length} nodes...`);
        
        window.campusNodes.forEach((node, index) => {
            const matchScore = this.calculateMatchScore(node, normalizedSearch);
            
            if (matchScore > 0) {
                results.push({
                    node: node,
                    score: matchScore,
                    matchReason: this.getMatchReason(node, normalizedSearch)
                });
                
                if (this.debugMode) {
                    console.log(`  Match ${results.length}: ${node.label} (${node.id}) - Score: ${matchScore} - Reason: ${this.getMatchReason(node, normalizedSearch)}`);
                }
            }
        });
        
        // Sort by score (highest first)
        results.sort((a, b) => b.score - a.score);
        
        console.log(`✅ Found ${results.length} matches`);
        return results;
    }

    /**
     * Calculate match score for a node
     */
    calculateMatchScore(node, searchTerm) {
        let score = 0;
        
        const label = (node.label || '').toLowerCase();
        const id = (node.id || '').toLowerCase();
        
        // Exact matches get highest score
        if (label === searchTerm || id === searchTerm) {
            score += 100;
        }
        
        // Starts with search term
        if (label.startsWith(searchTerm) || id.startsWith(searchTerm)) {
            score += 50;
        }
        
        // Contains search term
        if (label.includes(searchTerm) || id.includes(searchTerm)) {
            score += 25;
        }
        
        // Room number matching (e.g., "310" matches "room_310")
        if (searchTerm.match(/^\d+$/)) {
            if (label.includes(searchTerm) || id.includes(searchTerm)) {
                score += 75;
            }
        }
        
        // Searchable nodes get bonus
        if (node.searchable) {
            score += 10;
        }
        
        // Type-specific bonuses
        if (node.type === 'class' && searchTerm.includes('room')) {
            score += 15;
        }
        
        return score;
    }

    /**
     * Get reason for match
     */
    getMatchReason(node, searchTerm) {
        const label = (node.label || '').toLowerCase();
        const id = (node.id || '').toLowerCase();
        
        if (label === searchTerm || id === searchTerm) {
            return 'Exact match';
        }
        
        if (label.startsWith(searchTerm)) {
            return 'Label starts with term';
        }
        
        if (id.startsWith(searchTerm)) {
            return 'ID starts with term';
        }
        
        if (label.includes(searchTerm)) {
            return 'Label contains term';
        }
        
        if (id.includes(searchTerm)) {
            return 'ID contains term';
        }
        
        return 'Partial match';
    }

    /**
     * Analyze search results and provide insights
     */
    analyzeSearchResults(searchTerm, results) {
        const analysis = {
            searchTerm: searchTerm,
            totalResults: results.length,
            topScore: results.length > 0 ? results[0].score : 0,
            averageScore: results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0,
            typeDistribution: {},
            recommendations: []
        };
        
        // Analyze type distribution
        results.forEach(result => {
            const type = result.node.type;
            analysis.typeDistribution[type] = (analysis.typeDistribution[type] || 0) + 1;
        });
        
        // Generate recommendations
        if (results.length === 0) {
            analysis.recommendations.push('No matches found - check spelling or try partial terms');
        } else if (results.length > 10) {
            analysis.recommendations.push('Many matches found - consider more specific search terms');
        }
        
        if (searchTerm.match(/^\d+$/)) {
            analysis.recommendations.push('Searching by room number - results include all matching rooms');
        }
        
        console.log('📈 Search Analysis:', analysis);
        return analysis;
    }

    /**
     * Test search functionality with common queries
     */
    runSearchTests() {
        const testQueries = [
            '310',
            '305',
            '314',
            'room 310',
            'Room 305',
            'class',
            'stairway',
            'hub',
            'main',
            'administration',
            'third floor',
            '3f',
            'nonexistent'
        ];
        
        console.log('🧪 Running search functionality tests...');
        
        const testResults = [];
        
        testQueries.forEach(query => {
            console.log(`\n--- Testing: "${query}" ---`);
            const results = this.debugSearch(query);
            
            testResults.push({
                query: query,
                resultCount: results.length,
                topResult: results.length > 0 ? results[0].node.label : null,
                success: results.length > 0
            });
        });
        
        // Summary
        const successfulQueries = testResults.filter(t => t.success).length;
        console.log(`\n🎯 Search Test Summary: ${successfulQueries}/${testResults.length} queries returned results`);
        
        return testResults;
    }

    /**
     * Debug suggestion functionality
     */
    debugSuggestions(inputValue) {
        console.log(`💡 Debugging suggestions for: "${inputValue}"`);
        
        if (!inputValue || inputValue.length < 2) {
            console.log('📝 Input too short for suggestions');
            return [];
        }
        
        const suggestions = this.generateSuggestions(inputValue);
        console.log(`📋 Generated ${suggestions.length} suggestions`);
        
        suggestions.forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion.label} (${suggestion.id}) - Type: ${suggestion.type}`);
        });
        
        return suggestions;
    }

    /**
     * Generate suggestions for search input
     */
    generateSuggestions(inputValue) {
        if (!window.campusNodes) return [];
        
        const searchTerm = inputValue.toLowerCase().trim();
        const suggestions = [];
        
        window.campusNodes.forEach(node => {
            if (!node.searchable) return;
            
            const label = (node.label || '').toLowerCase();
            const id = (node.id || '').toLowerCase();
            
            // Check if node matches search term
            if (label.includes(searchTerm) || id.includes(searchTerm)) {
                suggestions.push({
                    id: node.id,
                    label: node.label,
                    type: node.type,
                    matchScore: this.calculateMatchScore(node, searchTerm)
                });
            }
        });
        
        // Sort by match score and limit results
        return suggestions
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 8); // Limit to 8 suggestions
    }

    /**
     * Create debug interface
     */
    createDebugInterface() {
        const panel = document.createElement('div');
        panel.id = 'room-search-debug';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 320px;
            width: 400px;
            background: rgba(108, 27, 27, 0.95);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 500px;
            overflow-y: auto;
        `;
        
        panel.innerHTML = `
            <h3 style="margin-top: 0;">🔍 Room Search Debug</h3>
            <input type="text" id="debug-search-input" placeholder="Enter search term..." style="width: 100%; padding: 5px; margin: 10px 0;">
            <button id="debug-search-btn" style="background: #fff; color: #6c1b1b; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Search</button>
            <button id="test-search-btn" style="background: #fff; color: #6c1b1b; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-left: 5px;">Run Tests</button>
            <div id="debug-search-results" style="margin-top: 15px; max-height: 300px; overflow-y: auto;"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Bind events
        document.getElementById('debug-search-btn').addEventListener('click', () => {
            const searchTerm = document.getElementById('debug-search-input').value;
            const results = this.debugSearch(searchTerm);
            this.displayDebugResults(results);
        });
        
        document.getElementById('test-search-btn').addEventListener('click', () => {
            const testResults = this.runSearchTests();
            this.displayTestResults(testResults);
        });
        
        // Enter key support
        document.getElementById('debug-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('debug-search-btn').click();
            }
        });
    }

    /**
     * Display debug results in the interface
     */
    displayDebugResults(results) {
        const container = document.getElementById('debug-search-results');
        
        if (results.length === 0) {
            container.innerHTML = '<div style="color: #ffcccc;">No results found</div>';
            return;
        }
        
        let html = `<div><strong>Found ${results.length} results:</strong></div>`;
        
        results.slice(0, 10).forEach((result, index) => {
            html += `
                <div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                    <strong>${index + 1}. ${result.node.label}</strong><br>
                    <small>ID: ${result.node.id} | Type: ${result.node.type} | Score: ${result.score}</small><br>
                    <small>Match: ${result.matchReason}</small>
                </div>
            `;
        });
        
        if (results.length > 10) {
            html += `<div style="color: #cccccc;"><small>...and ${results.length - 10} more results</small></div>`;
        }
        
        container.innerHTML = html;
    }

    /**
     * Display test results in the interface
     */
    displayTestResults(testResults) {
        const container = document.getElementById('debug-search-results');
        
        const successful = testResults.filter(t => t.success).length;
        
        let html = `<div><strong>Search Test Results: ${successful}/${testResults.length} successful</strong></div>`;
        
        testResults.forEach(test => {
            const status = test.success ? '✅' : '❌';
            html += `
                <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">
                    ${status} "${test.query}" → ${test.resultCount} results
                    ${test.topResult ? `<br><small>Top: ${test.topResult}</small>` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.campusNodes) {
                window.debugRoomSearch = new DebugRoomSearch();
                window.debugRoomSearch.createDebugInterface();
                console.log('🔍 Room Search Debug tool loaded');
            }
        }, 3000);
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebugRoomSearch;
}