"""
This is a simple test script to verify if we can import the scan_file_for_viruses function.
"""
import os
import sys

# Add the current directory to the path so we can import app modules
sys.path.insert(0, os.path.abspath('.'))

try:
    from app.utils.file_upload import scan_file_for_viruses
    print("Successfully imported scan_file_for_viruses function")
    
    # Test the function with a simple file
    test_file = "test_import.py"  # Use this script itself as a test file
    
    result = scan_file_for_viruses(test_file)
    print(f"Scan result: {result}")
    
except ImportError as e:
    print(f"ImportError: {e}")
    
    # Try listing all available functions in the module
    try:
        import inspect
        from app.utils import file_upload
        
        print("\nAvailable functions in file_upload module:")
        for name, obj in inspect.getmembers(file_upload):
            if inspect.isfunction(obj):
                print(f"- {name}")
    except Exception as e2:
        print(f"Error listing functions: {e2}") 