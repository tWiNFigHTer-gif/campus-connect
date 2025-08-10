#!/usr/bin/env python3
"""
Test script to validate Campus Connect deployment.
"""

import requests
import json
import sys
import time

def test_deployment(base_url="http://localhost:5000"):
    """Test the Campus Connect deployment."""
    print(f"🧪 Testing Campus Connect deployment at {base_url}")
    
    tests = []
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            tests.append(("Health Check", "✅ PASS", f"Status: {data['status']}"))
        else:
            tests.append(("Health Check", "❌ FAIL", f"Status Code: {response.status_code}"))
    except Exception as e:
        tests.append(("Health Check", "❌ FAIL", str(e)))
    
    # Test 2: Main page
    try:
        response = requests.get(base_url, timeout=10)
        if response.status_code == 200 and "Campus Connect" in response.text:
            tests.append(("Main Page", "✅ PASS", "HTML page loaded"))
        else:
            tests.append(("Main Page", "❌ FAIL", f"Status Code: {response.status_code}"))
    except Exception as e:
        tests.append(("Main Page", "❌ FAIL", str(e)))
    
    # Test 3: Graph data
    try:
        response = requests.get(f"{base_url}/api/graph", timeout=10)
        if response.status_code == 200:
            data = response.json()
            node_count = len(data.get('nodes', []))
            tests.append(("Graph Data", "✅ PASS", f"Nodes: {node_count}"))
        else:
            tests.append(("Graph Data", "❌ FAIL", f"Status Code: {response.status_code}"))
    except Exception as e:
        tests.append(("Graph Data", "❌ FAIL", str(e)))
    
    # Test 4: Pathfinding
    try:
        response = requests.get(f"{base_url}/api/path?start=class_1&end=class_2", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                path_length = len(data.get('path', []))
                tests.append(("Pathfinding", "✅ PASS", f"Path found with {path_length} nodes"))
            else:
                tests.append(("Pathfinding", "❌ FAIL", data.get('error', 'Unknown error')))
        else:
            tests.append(("Pathfinding", "❌ FAIL", f"Status Code: {response.status_code}"))
    except Exception as e:
        tests.append(("Pathfinding", "❌ FAIL", str(e)))
    
    # Test 5: Static assets
    try:
        response = requests.get(f"{base_url}/2nd-floor-map.svg", timeout=10)
        if response.status_code == 200:
            tests.append(("SVG Asset", "✅ PASS", "Floor plan SVG accessible"))
        else:
            tests.append(("SVG Asset", "❌ FAIL", f"Status Code: {response.status_code}"))
    except Exception as e:
        tests.append(("SVG Asset", "❌ FAIL", str(e)))
    
    # Print results
    print("\n📋 Test Results:")
    print("-" * 60)
    for test_name, status, details in tests:
        print(f"{test_name:<20} {status} {details}")
    
    # Summary
    passed = sum(1 for _, status, _ in tests if "✅" in status)
    total = len(tests)
    print("-" * 60)
    print(f"📊 Summary: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Deployment is ready.")
        return True
    else:
        print("⚠️  Some tests failed. Please check the deployment.")
        return False

if __name__ == "__main__":
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    success = test_deployment(base_url)
    sys.exit(0 if success else 1)