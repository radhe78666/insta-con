const API_KEY = '53486e69damsh849d76ef8e45538p1b0650jsn3fbe496ab440';
const TEST_USERNAME = 'totalgaming_official';

async function testScraperStable(amount) {
  console.log(`\n=== Scraper Stable (amount=${amount}) ===`);
  
  const res = await fetch('https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-rapidapi-host': 'instagram-scraper-stable-api.p.rapidapi.com',
      'x-rapidapi-key': API_KEY
    },
    body: new URLSearchParams({
      username_or_url: 'https://www.instagram.com/' + TEST_USERNAME + '/',
      amount: String(amount),
      pagination_token: ''
    })
  });
  const data = await res.json();
  const posts = data?.posts || data?.items || data?.data || [];
  console.log('Posts requested:', amount);
  console.log('Posts returned:', Array.isArray(posts) ? posts.length : 'N/A');
  console.log('Has next page?', data?.pagination_token ? 'YES' : 'NO');
  console.log('Keys:', Object.keys(data || {}));
  
  if (Array.isArray(posts) && posts.length > 0) {
    console.log('First post code:', posts[0]?.node?.code || posts[0]?.code || 'N/A');
    console.log('Last post code:', posts[posts.length-1]?.node?.code || posts[posts.length-1]?.code || 'N/A');
  }
  return Array.isArray(posts) ? posts.length : 0;
}

(async () => {
  console.log('Testing Scraper Stable - @' + TEST_USERNAME);
  console.log('='.repeat(50));
  
  const count50 = await testScraperStable(50);
  
  console.log('\n' + '='.repeat(50));
  console.log('RESULT: amount=50 gave', count50, 'posts');
  console.log('Credits used: 1');
  console.log('Posts per credit:', count50);
})();
