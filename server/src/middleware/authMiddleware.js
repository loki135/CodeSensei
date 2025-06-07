import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
      } else {
        // Attach user information to the request object
        req.user = { id: decodedToken.userId }; // Assuming your token payload has a userId
        next();
      }
    });
  } else {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }
}; 