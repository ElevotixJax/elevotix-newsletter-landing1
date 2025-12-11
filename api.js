// Simple Express server to proxy Mailchimp API requests securely
// Run: node api.js
// Deploy to Vercel or similar

const http = require('http');
const querystring = require('querystring');

// Load from environment variables.
// Prefer GitHub secret names: MCKEY, MCLID, MCDC (these will be provided via GitHub Actions as `${{ secrets.NAME }}`),
// but fall back to older MAILCHIMP_* names for compatibility.
const MAILCHIMP_API_KEY = process.env.MCKEY || process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MCLID || process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_DC = process.env.MCDC || process.env.MAILCHIMP_DC || 'us5';

if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
    console.error('Error: Mailchimp credentials not found. Set MCKEY and MCLID (or MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID).');
    process.exit(1);
}

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle POST /api/subscribe
    if (req.method === 'POST' && req.url === '/api/subscribe') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { email } = JSON.parse(body);
                if (!email) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Email required' }));
                    return;
                }

                // Call Mailchimp API from server (hides credentials)
                const mailchimpUrl = `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
                const auth = Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64');

                const options = {
                    hostname: `${MAILCHIMP_DC}.api.mailchimp.com`,
                    path: `/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json'
                    }
                };

                const mailchimpReq = http.request(options, (mailchimpRes) => {
                    let data = '';
                    mailchimpRes.on('data', chunk => { data += chunk; });
                    mailchimpRes.on('end', () => {
                        res.writeHead(mailchimpRes.statusCode);
                        res.end(data);
                    });
                });

                mailchimpReq.on('error', (err) => {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'API error' }));
                });

                mailchimpReq.write(JSON.stringify({
                    email_address: email,
                    status: 'subscribed',
                    tags: ['newsletter']
                }));
                mailchimpReq.end();
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
