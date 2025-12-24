// routes/products.js
const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * 获取商品列表（需要登录）
 * GET /api/products
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        // 查询所有商品
        const [products] = await db.query(
            'SELECT id, name, price FROM products ORDER BY id ASC'
        );
        
        res.json({
            success: true,
            message: '获取商品列表成功',
            data: {
                total: products.length,
                products: products
            },
            // 显示当前登录用户信息
            user: {
                userId: req.user.userId,
                username: req.user.username
            }
        });
        
    } catch (error) {
        console.error('获取商品列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取单个商品详情（需要登录）
 * GET /api/products/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const productId = req.params.id;
        
        const [products] = await db.query(
            'SELECT id, name, price FROM products WHERE id = ?',
            [productId]
        );
        
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: '商品不存在'
            });
        }
        
        res.json({
            success: true,
            message: '获取商品详情成功',
            data: products[0]
        });
        
    } catch (error) {
        console.error('获取商品详情错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;
