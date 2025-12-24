// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

/**
 * 用户注册接口
 * POST /api/auth/register
 * 请求体: { username, password }
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. 验证输入
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '密码长度至少6位'
            });
        }
        
        // 2. 检查用户名是否已存在
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: '用户名已被注册'
            });
        }
        
        // 3. 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 4. 保存用户到数据库
        const [result] = await db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );
        
        // 5. 返回成功响应
        res.status(201).json({
            success: true,
            message: '注册成功',
            data: {
                userId: result.insertId,
                username: username
            }
        });
        
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

/**
 * 用户登录接口
 * POST /api/auth/login
 * 请求体: { username, password }
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. 验证输入
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }
        
        // 2. 查找用户
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }
        
        const user = users[0];
        
        // 3. 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }
        
        // 4. 生成 JWT Token
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }  // 24小时后过期
        );
        
        // 5. 返回成功响应和 Token
        res.json({
            success: true,
            message: '登录成功',
            data: {
                userId: user.id,
                username: user.username,
                token: token
            }
        });
        
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;
