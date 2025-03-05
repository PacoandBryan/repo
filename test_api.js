// Test script to diagnose API issues
async function testAdminLogin() {
  console.log("Testing admin login API...");
  
  try {
    // Test direct fetch to the API endpoint
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'dikythnks'
      })
    });
    
    console.log("Response status:", response.status);
    console.log("Response status text:", response.statusText);
    console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));
    
    // Try to get response content
    const text = await response.text();
    console.log("Response text:", text);
    
    // Try to parse as JSON if possible
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log("Response JSON:", json);
      } catch (e) {
        console.log("Not valid JSON:", e.message);
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
  
  // Test using XMLHttpRequest for comparison
  console.log("\nTesting with XMLHttpRequest...");
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/admin/auth', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');
  
  xhr.onload = function() {
    console.log("XHR status:", xhr.status);
    console.log("XHR response:", xhr.responseText);
    try {
      const json = JSON.parse(xhr.responseText);
      console.log("XHR JSON:", json);
    } catch (e) {
      console.log("XHR not valid JSON:", e.message);
    }
  };
  
  xhr.onerror = function() {
    console.error("XHR error:", xhr.statusText);
  };
  
  xhr.send(JSON.stringify({
    email: 'admin@example.com',
    password: 'dikythnks'
  }));
}

// Run the test
testAdminLogin(); 