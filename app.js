// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 导入路由
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// 创建 Express 应用
const app = express();

// ============ 中间件配置 ============
// 解析 JSON 请求体
app.use(express.json());

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// 允许跨域请求
app.use(cors());

// ============ 路由配置 ============
// 健康检查接口（不需要登录）
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API 服务运行正常',
        timestamp: new Date().toISOString()
    });
});

// 用户认证路由 - /api/auth/register, /api/auth/login
app.use('/api/auth', authRoutes);

// 商品路由 - /api/products
app.use('/api/products', productRoutes);

// ============ 404 处理 ============
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// ============ 错误处理 ============
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// ============ 启动服务器 ============
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 服务器启动成功！`);
    console.log(`📡 运行地址: http://localhost:${PORT}`);
    console.log(`📋 API 列表:`);
    console.log(`   - GET  /api/health          (健康检查)`);
    console.log(`   - POST /api/auth/register   (用户注册)`);
    console.log(`   - POST /api/auth/login      (用户登录)`);
    console.log(`   - GET  /api/products        (商品列表-需登录)`);
    console.log(`   - GET  /api/products/:id    (商品详情-需登录)`);
    console.log('========================================');
});
