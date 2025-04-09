const { load } = require('cheerio');
const got = require('got');
const metascraper = require('metascraper')([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-description')()
]);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Fetch HTML content with a timeout
    const { body: html, url: resolvedUrl } = await got(url, {
      timeout: 8000,
      retry: 2
    });
    
    // Extract metadata
    const metadata = await metascraper({ html, url: resolvedUrl });
    
    return res.status(200).json({
      success: true,
      metadata
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  }
};
