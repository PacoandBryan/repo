import unittest
import os
import shutil
import json
from io import BytesIO
import tempfile
from PIL import Image
from app import create_app

class FileUploadTestCase(unittest.TestCase):
    """Test case for file upload functionality."""
    
    def setUp(self):
        self.app = create_app({'TESTING': True})
        self.client = self.app.test_client()
        
        # Create a temporary directory for uploads
        self.temp_upload_dir = tempfile.mkdtemp()
        self.app.config['UPLOADS_FOLDER'] = self.temp_upload_dir
        
        # Ensure the chunks directory exists
        os.makedirs(os.path.join(self.temp_upload_dir, 'chunks'), exist_ok=True)
        
        # Create test images
        self.test_jpg = BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(self.test_jpg, 'JPEG')
        self.test_jpg.seek(0)
        
        self.test_png = BytesIO()
        image = Image.new('RGBA', (100, 100), color=(0, 0, 255, 255))
        image.save(self.test_png, 'PNG')
        self.test_png.seek(0)
        
        # Create test document
        self.test_txt = BytesIO(b'This is a test document')
    
    def tearDown(self):
        # Clean up the temporary directory
        shutil.rmtree(self.temp_upload_dir)
    
    def test_basic_upload(self):
        """Test basic file upload."""
        response = self.client.post(
            '/api/uploads',
            data={
                'file': (self.test_jpg, 'test.jpg'),
                'entityType': 'product',
                'entityId': '12345'
            },
            content_type='multipart/form-data'
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        
        self.assertTrue('id' in data)
        self.assertEqual(data['originalFilename'], 'test.jpg')
        self.assertEqual(data['mimeType'], 'image/jpeg')
        self.assertEqual(data['entityType'], 'product')
        self.assertEqual(data['entityId'], '12345')
        self.assertEqual(data['width'], 100)
        self.assertEqual(data['height'], 100)
        
        # Check that the file was saved
        self.assertTrue(os.path.exists(os.path.join(self.temp_upload_dir, data['filename'])))
    
    def test_document_upload(self):
        """Test document upload."""
        response = self.client.post(
            '/api/uploads',
            data={
                'file': (self.test_txt, 'test.txt'),
                'entityType': 'product',
                'entityId': '12345'
            },
            content_type='multipart/form-data'
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        
        self.assertTrue('id' in data)
        self.assertEqual(data['originalFilename'], 'test.txt')
        self.assertEqual(data['mimeType'], 'text/plain')
        self.assertEqual(data['size'], 22)  # Length of 'This is a test document'
        
        # Check that the file was saved
        self.assertTrue(os.path.exists(os.path.join(self.temp_upload_dir, data['filename'])))
    
    def test_chunked_upload(self):
        """Test chunked upload."""
        # Initialize upload
        init_response = self.client.post(
            '/api/uploads/init',
            json={
                'filename': 'test_chunked.jpg',
                'size': len(self.test_jpg.getvalue()),
                'mimeType': 'image/jpeg',
                'chunkSize': 1024,
                'totalChunks': 1,
                'entityType': 'product',
                'entityId': '12345'
            }
        )
        
        self.assertEqual(init_response.status_code, 201)
        init_data = json.loads(init_response.data)
        upload_id = init_data['uploadId']
        
        # Upload chunk
        self.test_jpg.seek(0)
        chunk_response = self.client.post(
            f'/api/uploads/{upload_id}/chunk',
            data={
                'file': (self.test_jpg, 'test_chunked.jpg'),
                'chunkIndex': '0'
            },
            content_type='multipart/form-data'
        )
        
        self.assertEqual(chunk_response.status_code, 200)
        chunk_data = json.loads(chunk_response.data)
        
        self.assertEqual(chunk_data['status'], 'completed')
        self.assertTrue('file' in chunk_data)
        
        # Check that the file was saved
        self.assertTrue(os.path.exists(os.path.join(self.temp_upload_dir, chunk_data['file']['filename'])))
    
    def test_get_file(self):
        """Test getting file metadata."""
        # First upload a file
        response = self.client.post(
            '/api/uploads',
            data={
                'file': (self.test_png, 'test.png'),
                'entityType': 'product',
                'entityId': '12345'
            },
            content_type='multipart/form-data'
        )
        
        self.assertEqual(response.status_code, 201)
        upload_data = json.loads(response.data)
        file_id = upload_data['id']
        
        # Get the file metadata
        get_response = self.client.get(f'/api/uploads/{file_id}')
        
        self.assertEqual(get_response.status_code, 200)
        get_data = json.loads(get_response.data)
        
        self.assertEqual(get_data['id'], file_id)
        self.assertEqual(get_data['originalFilename'], 'test.png')
        self.assertEqual(get_data['mimeType'], 'image/png')
    
    def test_delete_file(self):
        """Test deleting a file."""
        # First upload a file
        response = self.client.post(
            '/api/uploads',
            data={
                'file': (self.test_jpg, 'test_delete.jpg'),
                'entityType': 'product',
                'entityId': '12345'
            },
            content_type='multipart/form-data'
        )
        
        self.assertEqual(response.status_code, 201)
        upload_data = json.loads(response.data)
        file_id = upload_data['id']
        filename = upload_data['filename']
        
        # Check that the file exists
        file_path = os.path.join(self.temp_upload_dir, filename)
        self.assertTrue(os.path.exists(file_path))
        
        # Delete the file
        delete_response = self.client.delete(f'/api/uploads/{file_id}')
        
        self.assertEqual(delete_response.status_code, 200)
        delete_data = json.loads(delete_response.data)
        
        self.assertEqual(delete_data['message'], 'File deleted successfully')
        
        # Check that the file no longer exists
        self.assertFalse(os.path.exists(file_path))

if __name__ == '__main__':
    unittest.main() 