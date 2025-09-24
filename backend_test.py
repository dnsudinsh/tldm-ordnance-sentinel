#!/usr/bin/env python3
"""
Backend API Testing for Predictive Readiness Forecasting System
Tests all forecasting endpoints for the Royal Malaysian Navy ordnance management system
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, List
import uuid

# Get backend URL from environment
BACKEND_URL = "https://ordnance-predict.preview.emergentagent.com/api"

class ForecastingAPITester:
    """Test suite for forecasting API endpoints"""
    
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.test_results = []
        self.forecast_id = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()
    
    async def test_health_check(self):
        """Test basic API health"""
        try:
            async with self.session.get(f"{self.base_url}/") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("API Health Check", True, f"API is responding: {data}")
                    return True
                else:
                    self.log_test("API Health Check", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    async def test_generate_forecast(self):
        """Test POST /api/forecasts/generate endpoint"""
        try:
            # Test with minimal request (no body)
            async with self.session.post(f"{self.base_url}/forecasts/generate") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = [
                        'forecast_id', 'generated_at', 'timeframe', 'critical_alerts',
                        'procurement_recommendations', 'operation_impact_assessment',
                        'mitigation_strategies', 'confidence_metrics'
                    ]
                    
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Generate Forecast - Structure", False, 
                                    f"Missing fields: {missing_fields}", data)
                        return False
                    
                    # Store forecast ID for later tests
                    self.forecast_id = data.get('forecast_id')
                    
                    # Validate timeframe structure
                    timeframe = data.get('timeframe', {})
                    if 'current_readiness' not in timeframe or 'projections' not in timeframe:
                        self.log_test("Generate Forecast - Timeframe", False, 
                                    "Invalid timeframe structure", timeframe)
                        return False
                    
                    # Validate projections
                    projections = timeframe.get('projections', [])
                    if len(projections) != 3:  # Should have 30, 60, 90 day projections
                        self.log_test("Generate Forecast - Projections", False, 
                                    f"Expected 3 projections, got {len(projections)}", projections)
                        return False
                    
                    # Check projection structure
                    for proj in projections:
                        required_proj_fields = ['days', 'readiness', 'confidence_interval', 'risk_level']
                        missing_proj_fields = [field for field in required_proj_fields if field not in proj]
                        if missing_proj_fields:
                            self.log_test("Generate Forecast - Projection Fields", False, 
                                        f"Missing projection fields: {missing_proj_fields}", proj)
                            return False
                    
                    # Validate confidence metrics
                    confidence = data.get('confidence_metrics', {})
                    required_conf_fields = ['model_accuracy', 'data_quality_score', 'forecast_reliability']
                    missing_conf_fields = [field for field in required_conf_fields if field not in confidence]
                    if missing_conf_fields:
                        self.log_test("Generate Forecast - Confidence Metrics", False, 
                                    f"Missing confidence fields: {missing_conf_fields}", confidence)
                        return False
                    
                    self.log_test("Generate Forecast", True, 
                                f"Generated forecast {self.forecast_id} with {len(projections)} projections")
                    return True
                    
                else:
                    error_text = await response.text()
                    self.log_test("Generate Forecast", False, 
                                f"Status: {response.status}, Error: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test("Generate Forecast", False, f"Exception: {str(e)}")
            return False
    
    async def test_generate_forecast_with_scenarios(self):
        """Test forecast generation with scenarios enabled"""
        try:
            request_body = {
                "include_scenarios": True,
                "custom_config": {
                    "time_horizon_days": 90,
                    "confidence_level": 0.95,
                    "risk_tolerance": "conservative"
                }
            }
            
            async with self.session.post(
                f"{self.base_url}/forecasts/generate",
                json=request_body
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check if scenarios are included in metadata
                    metadata = data.get('metadata', {})
                    scenarios = metadata.get('scenarios', [])
                    
                    if scenarios:
                        self.log_test("Generate Forecast with Scenarios", True, 
                                    f"Generated forecast with {len(scenarios)} scenarios")
                        return True
                    else:
                        self.log_test("Generate Forecast with Scenarios", True, 
                                    "Forecast generated successfully (scenarios may be empty)")
                        return True
                else:
                    error_text = await response.text()
                    self.log_test("Generate Forecast with Scenarios", False, 
                                f"Status: {response.status}, Error: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test("Generate Forecast with Scenarios", False, f"Exception: {str(e)}")
            return False
    
    async def test_list_forecasts(self):
        """Test GET /api/forecasts endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/forecasts") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if isinstance(data, list):
                        # Check structure of forecast summaries
                        if data:  # If there are forecasts
                            first_forecast = data[0]
                            required_summary_fields = [
                                'forecast_id', 'generated_at', 'current_readiness',
                                'critical_alerts_count', 'confidence_score'
                            ]
                            
                            missing_fields = [field for field in required_summary_fields 
                                            if field not in first_forecast]
                            
                            if missing_fields:
                                self.log_test("List Forecasts - Structure", False, 
                                            f"Missing summary fields: {missing_fields}", first_forecast)
                                return False
                        
                        self.log_test("List Forecasts", True, 
                                    f"Retrieved {len(data)} forecast summaries")
                        return True
                    else:
                        self.log_test("List Forecasts", False, 
                                    f"Expected list, got {type(data)}", data)
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("List Forecasts", False, 
                                f"Status: {response.status}, Error: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test("List Forecasts", False, f"Exception: {str(e)}")
            return False
    
    async def test_get_specific_forecast(self):
        """Test GET /api/forecasts/{forecast_id} endpoint"""
        if not self.forecast_id:
            self.log_test("Get Specific Forecast", False, "No forecast ID available from previous test")
            return False
        
        try:
            async with self.session.get(f"{self.base_url}/forecasts/{self.forecast_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate it's a complete forecast result
                    required_fields = [
                        'forecast_id', 'generated_at', 'timeframe', 'critical_alerts',
                        'procurement_recommendations', 'confidence_metrics'
                    ]
                    
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Get Specific Forecast", False, 
                                    f"Missing fields: {missing_fields}", data)
                        return False
                    
                    self.log_test("Get Specific Forecast", True, 
                                f"Retrieved forecast {self.forecast_id}")
                    return True
                    
                elif response.status == 404:
                    self.log_test("Get Specific Forecast", False, 
                                f"Forecast {self.forecast_id} not found")
                    return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Specific Forecast", False, 
                                f"Status: {response.status}, Error: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test("Get Specific Forecast", False, f"Exception: {str(e)}")
            return False
    
    async def test_get_nonexistent_forecast(self):
        """Test GET /api/forecasts/{forecast_id} with invalid ID"""
        fake_id = "nonexistent_forecast_id"
        
        try:
            async with self.session.get(f"{self.base_url}/forecasts/{fake_id}") as response:
                if response.status == 404:
                    self.log_test("Get Nonexistent Forecast", True, 
                                "Correctly returned 404 for invalid forecast ID")
                    return True
                else:
                    self.log_test("Get Nonexistent Forecast", False, 
                                f"Expected 404, got {response.status}")
                    return False
                    
        except Exception as e:
            self.log_test("Get Nonexistent Forecast", False, f"Exception: {str(e)}")
            return False
    
    async def test_scenario_analysis(self):
        """Test POST /api/forecasts/{forecast_id}/scenarios endpoint"""
        if not self.forecast_id:
            self.log_test("Scenario Analysis", False, "No forecast ID available from previous test")
            return False
        
        try:
            request_body = {
                "scenarios": [
                    {
                        "name": "High Exercise Tempo",
                        "description": "Increased training exercises by 30%",
                        "exercise_intensity_multiplier": 1.3,
                        "additional_events": 2
                    },
                    {
                        "name": "Supply Chain Delay",
                        "description": "30-day delay in procurement",
                        "lead_time_increase_days": 30,
                        "supplier_reliability_factor": 0.8
                    }
                ]
            }
            
            async with self.session.post(
                f"{self.base_url}/forecasts/{self.forecast_id}/scenarios",
                json=request_body
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if isinstance(data, list):
                        # Validate scenario results structure
                        if data:  # If scenarios were processed
                            first_scenario = data[0]
                            required_scenario_fields = [
                                'scenario_name', 'base_readiness', 'scenario_readiness',
                                'readiness_impact', 'risk_assessment', 'recommendations'
                            ]
                            
                            missing_fields = [field for field in required_scenario_fields 
                                            if field not in first_scenario]
                            
                            if missing_fields:
                                self.log_test("Scenario Analysis - Structure", False, 
                                            f"Missing scenario fields: {missing_fields}", first_scenario)
                                return False
                        
                        self.log_test("Scenario Analysis", True, 
                                    f"Analyzed {len(data)} scenarios for forecast {self.forecast_id}")
                        return True
                    else:
                        self.log_test("Scenario Analysis", False, 
                                    f"Expected list, got {type(data)}", data)
                        return False
                        
                elif response.status == 404:
                    self.log_test("Scenario Analysis", False, 
                                f"Forecast {self.forecast_id} not found for scenario analysis")
                    return False
                else:
                    error_text = await response.text()
                    self.log_test("Scenario Analysis", False, 
                                f"Status: {response.status}, Error: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test("Scenario Analysis", False, f"Exception: {str(e)}")
            return False
    
    async def test_active_alerts(self):
        """Test GET /api/forecasts/alerts/active endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/forecasts/alerts/active") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if isinstance(data, list):
                        # Check structure of alerts if any exist
                        if data:  # If there are active alerts
                            first_alert = data[0]
                            required_alert_fields = [
                                'id', 'alert_id', 'forecast_id', 'category', 
                                'severity', 'predicted_date', 'status', 'created_at'
                            ]
                            
                            missing_fields = [field for field in required_alert_fields 
                                            if field not in first_alert]
                            
                            if missing_fields:
                                self.log_test("Active Alerts - Structure", False, 
                                            f"Missing alert fields: {missing_fields}", first_alert)
                                return False
                        
                        self.log_test("Active Alerts", True, 
                                    f"Retrieved {len(data)} active alerts")
                        return True
                    else:
                        self.log_test("Active Alerts", False, 
                                    f"Expected list, got {type(data)}", data)
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Active Alerts", False, 
                                f"Status: {response.status}, Error: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test("Active Alerts", False, f"Exception: {str(e)}")
            return False
    
    async def test_active_alerts_with_filters(self):
        """Test GET /api/forecasts/alerts/active with filters"""
        try:
            # Test with severity filter
            async with self.session.get(
                f"{self.base_url}/forecasts/alerts/active?severity=high"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Active Alerts with Severity Filter", True, 
                                f"Retrieved {len(data)} high severity alerts")
                else:
                    error_text = await response.text()
                    self.log_test("Active Alerts with Severity Filter", False, 
                                f"Status: {response.status}, Error: {error_text}")
                    return False
            
            # Test with category filter
            async with self.session.get(
                f"{self.base_url}/forecasts/alerts/active?category=Missile"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Active Alerts with Category Filter", True, 
                                f"Retrieved {len(data)} missile category alerts")
                    return True
                else:
                    error_text = await response.text()
                    self.log_test("Active Alerts with Category Filter", False, 
                                f"Status: {response.status}, Error: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test("Active Alerts with Filters", False, f"Exception: {str(e)}")
            return False
    
    async def test_ai_integration(self):
        """Test AI integration by checking if EMERGENT_LLM_KEY is configured"""
        try:
            # This is an indirect test - we check if the forecast generation
            # includes AI-specific metadata or falls back to rule-based
            async with self.session.post(f"{self.base_url}/forecasts/generate") as response:
                if response.status == 200:
                    data = await response.json()
                    metadata = data.get('metadata', {})
                    generated_as = metadata.get('generated_as', 'unknown')
                    
                    if generated_as == 'ai_service':
                        self.log_test("AI Integration", True, 
                                    "AI service is working - forecast generated using GPT-5")
                        return True
                    elif generated_as == 'fallback_rule_based':
                        self.log_test("AI Integration", False, 
                                    "AI service failed - using fallback rule-based approach")
                        return False
                    else:
                        self.log_test("AI Integration", True, 
                                    f"Forecast generated (method: {generated_as})")
                        return True
                else:
                    self.log_test("AI Integration", False, 
                                f"Could not test AI integration - API error: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_test("AI Integration", False, f"Exception: {str(e)}")
            return False
    
    async def test_data_model_validation(self):
        """Test data model validation by sending invalid data"""
        try:
            # Test with invalid scenario request
            invalid_request = {
                "scenarios": [
                    {
                        "name": "",  # Empty name should be invalid
                        "invalid_field": "should_be_ignored"
                    }
                ]
            }
            
            # First generate a forecast to get an ID
            async with self.session.post(f"{self.base_url}/forecasts/generate") as response:
                if response.status == 200:
                    data = await response.json()
                    test_forecast_id = data.get('forecast_id')
                    
                    # Now test with invalid scenario data
                    async with self.session.post(
                        f"{self.base_url}/forecasts/{test_forecast_id}/scenarios",
                        json=invalid_request
                    ) as scenario_response:
                        # Should either handle gracefully or return validation error
                        if scenario_response.status in [200, 400, 422]:
                            self.log_test("Data Model Validation", True, 
                                        f"API handled invalid data appropriately (status: {scenario_response.status})")
                            return True
                        else:
                            self.log_test("Data Model Validation", False, 
                                        f"Unexpected status for invalid data: {scenario_response.status}")
                            return False
                else:
                    self.log_test("Data Model Validation", False, 
                                "Could not generate test forecast for validation test")
                    return False
                    
        except Exception as e:
            self.log_test("Data Model Validation", False, f"Exception: {str(e)}")
            return False
    
    async def test_mongodb_integration(self):
        """Test MongoDB integration by verifying data persistence"""
        try:
            # Generate a forecast
            async with self.session.post(f"{self.base_url}/forecasts/generate") as response:
                if response.status == 200:
                    data = await response.json()
                    new_forecast_id = data.get('forecast_id')
                    
                    # Wait a moment for background task to complete
                    await asyncio.sleep(2)
                    
                    # Try to retrieve the same forecast
                    async with self.session.get(f"{self.base_url}/forecasts/{new_forecast_id}") as get_response:
                        if get_response.status == 200:
                            retrieved_data = await get_response.json()
                            
                            # Verify the data matches
                            if retrieved_data.get('forecast_id') == new_forecast_id:
                                self.log_test("MongoDB Integration", True, 
                                            f"Forecast {new_forecast_id} successfully stored and retrieved")
                                return True
                            else:
                                self.log_test("MongoDB Integration", False, 
                                            "Retrieved forecast ID doesn't match generated ID")
                                return False
                        elif get_response.status == 404:
                            self.log_test("MongoDB Integration", False, 
                                        "Forecast not found - may indicate storage issue")
                            return False
                        else:
                            self.log_test("MongoDB Integration", False, 
                                        f"Error retrieving forecast: {get_response.status}")
                            return False
                else:
                    self.log_test("MongoDB Integration", False, 
                                "Could not generate forecast for MongoDB test")
                    return False
                    
        except Exception as e:
            self.log_test("MongoDB Integration", False, f"Exception: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all test cases"""
        print("🚀 Starting Predictive Readiness Forecasting API Tests")
        print("=" * 60)
        
        # Basic connectivity
        if not await self.test_health_check():
            print("❌ API is not responding. Stopping tests.")
            return
        
        # Core forecasting functionality
        await self.test_generate_forecast()
        await self.test_generate_forecast_with_scenarios()
        await self.test_list_forecasts()
        await self.test_get_specific_forecast()
        await self.test_get_nonexistent_forecast()
        
        # Scenario analysis
        await self.test_scenario_analysis()
        
        # Alerts functionality
        await self.test_active_alerts()
        await self.test_active_alerts_with_filters()
        
        # Integration tests
        await self.test_ai_integration()
        await self.test_data_model_validation()
        await self.test_mongodb_integration()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  ❌ {result['test']}: {result['details']}")
        
        print("\n" + "=" * 60)
        
        # Return success status
        return failed_tests == 0


async def main():
    """Main test runner"""
    async with ForecastingAPITester() as tester:
        success = await tester.run_all_tests()
        
        if success:
            print("🎉 All tests passed!")
            sys.exit(0)
        else:
            print("💥 Some tests failed!")
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())