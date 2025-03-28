"""
Test script for the scan_file_for_viruses function.
This script directly imports and tests the function to make sure it works.
"""
import os
import sys

# Add the project directory to the Python path
sys.path.insert(0, os.path.abspath('.'))

# Import the function directly from module
try:
    from app.utils.file_upload import scan_file_for_viruses
    print("Successfully imported scan_file_for_viruses function")
    
    # Get a list of files to test with
    test_files = [
        __file__,  # This script itself
        os.path.abspath(os.path.join('app', 'utils', 'file_upload.py')),
        os.path.join('requirements.txt')
    ]
    
    # Test each file
    for test_file in test_files:
        if os.path.exists(test_file):
            print(f"\nTesting file: {test_file}")
            print(f"  Full path: {os.path.abspath(test_file)}")
            try:
                result = scan_file_for_viruses(test_file)
                print(f"  Scan result: {result}")
            except Exception as e:
                print(f"  Error scanning file: {e}")
        else:
            print(f"\nFile not found: {test_file}")
    
except ImportError as e:
    print(f"ImportError: {e}")
    
    # Try to see what's in the module
    try:
        import inspect
        from app.utils import file_upload
        
        print("\nFunctions in file_upload module:")
        for name, obj in inspect.getmembers(file_upload):
            if inspect.isfunction(obj):
                print(f"- {name}")
    except Exception as e2:
        print(f"Error listing functions: {e2}")

print("\nTest completed.") 