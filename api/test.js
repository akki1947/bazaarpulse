// Health check — visit /api/test to confirm serverless functions are running
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    ok: true, 
    message: 'BazaarPulse API is running',
    time: new Date().toISOString(),
    node: process.version
  });
};
