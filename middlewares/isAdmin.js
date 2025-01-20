function isAdmin(req, res, next) {
if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
}

if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
}

next();
}

module.exports = isAdmin;
