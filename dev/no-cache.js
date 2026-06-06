module.exports = function noCache(req, res, next) {
    if (/\.(html?|js|css)$/i.test(req.url.split('?')[0])) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
};
