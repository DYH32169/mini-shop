// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 验证 JWT 的中间件
const authMiddleware = (req, res, next) => {
    // 从请求头获取 token
    const authHeader = req.headers['authorization'];
    
    // 检查是否有 Authorization 头
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: '未提供认证令牌，请先登录'
        });
    }
    
    // Token 格式: "Bearer xxxxx"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: '令牌格式错误'
        });
    }
    
    try {
        // 验证 token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 把用户信息存到 req 对象，后续可以使用
        req.user = decoded;
        // 继续执行下一个中间件或路由
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: '令牌无效或已过期，请重新登录'
        });
    }
};

module.exports = authMiddleware;
