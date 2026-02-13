// Quick test script to verify courses pages are working
console.log('🧪 Testing Courses Pages...\n');

// Test 1: Check if courses page loads
fetch('http://localhost:3000/courses')
  .then(response => response.text())
  .then(html => {
    console.log('✅ Courses page HTML length:', html.length);
    if (html.includes('Discover Your Perfect Course')) {
      console.log('✅ Courses page loaded successfully');
    } else {
      console.log('❌ Courses page may have issues');
    }
  })
  .catch(error => {
    console.error('❌ Error loading courses page:', error.message);
  });

// Test 2: Check if admin courses page loads
fetch('http://localhost:3000/admin/courses')
  .then(response => response.text())
  .then(html => {
    console.log('✅ Admin courses page HTML length:', html.length);
    if (html.includes('Manage your course catalog')) {
      console.log('✅ Admin courses page loaded successfully');
    } else {
      console.log('❌ Admin courses page may have issues');
    }
  })
  .catch(error => {
    console.error('❌ Error loading admin courses page:', error.message);
  });

// Test 3: Check API endpoint
fetch('http://localhost:3000/api/courses')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Response:', data);
    if (data.success && data.courses) {
      console.log('✅ API working, courses found:', data.courses.length);
    } else {
      console.log('❌ API may have issues');
    }
  })
  .catch(error => {
    console.error('❌ Error calling API:', error.message);
  });

console.log('\n🎯 Expected Results:');
console.log('- Both pages should load without errors');
console.log('- Filter dropdowns should be populated with course data');
console.log('- Created courses should appear in both pages');
console.log('- Search and filtering should work properly');
