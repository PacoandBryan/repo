<?php
// Configuration
$backend_url = 'http://35.192.187.21:8080'; // Your VM IP

// Get the requested path
$request_uri = $_SERVER['REQUEST_URI'];
$script_name = $_SERVER['SCRIPT_NAME'];
$path = str_replace($script_name, '', $request_uri);

if (empty($path) || $path == '/') {
    if (isset($_GET['path'])) {
        $path = $_GET['path'];
    } else {
        $path = '/ping'; 
    }
}

$target_url = $backend_url . $path;

// Initialize cURL
$ch = curl_init($target_url);

// Forward the HTTP Method
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward Headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) != 'host' && strtolower($name) != 'content-length' && strtolower($name) != 'content-type') {
        $headers[] = "$name: $value";
    }
}

// Handle Body and Uploads
if ($method === 'POST' || $method === 'PUT') {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    // Check if it's a file upload (multipart/form-data)
    if (strpos($contentType, 'multipart/form-data') !== false && !empty($_FILES)) {
        // Prepare data for cURL
        $postData = $_POST; // Start with normal fields
        
        foreach ($_FILES as $key => $file) {
            // Create CURLFile object
            $cFile = new CURLFile($file['tmp_name'], $file['type'], $file['name']);
            $postData[$key] = $cFile;
        }
        
        // When passing an array to CURLOPT_POSTFIELDS, cURL automatically sets Content-Type to multipart/form-data
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        // Do NOT manually set Content-Type header here, cURL does it with the boundary
    } else {
        // Normal JSON or Form Body
        $input_data = file_get_contents('php://input');
        if (!empty($input_data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $input_data);
            $headers[] = "Content-Type: " . $contentType;
        }
    }
} else {
    // For GET/DELETE using Content-Type might be rare but good to keep
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if($contentType) {
        $headers[] = "Content-Type: " . $contentType;
    }
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);

// Execute
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

curl_close($ch);

$response_headers = substr($response, 0, $header_size);
$response_body = substr($response, $header_size);

// Forward Response Headers
foreach (explode("\r\n", $response_headers) as $header) {
    if (!empty($header) && strpos($header, 'Transfer-Encoding') === false) {
        header($header);
    }
}

http_response_code($http_code);
echo $response_body;
?>
