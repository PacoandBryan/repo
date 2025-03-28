import unittest
from app import create_app

class AppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
    def test_app_exists(self):
        self.assertIsNotNone(self.app)
        
    def test_home_page(self):
        response = self.client.get('/')
        self.assertIn(response.status_code, [200, 302, 404])
        
if __name__ == '__main__':
    unittest.main() 