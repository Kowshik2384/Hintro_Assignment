const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../routes/auth');
const prisma = require('../prisma/client'); // Mock client

// Mock Env
process.env.JWT_SECRET = 'testsecret';

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
    beforeEach(() => {
        // Clear mock db
        prisma.user.deleteMany({});
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should login an existing user', async () => {
        // Register first
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });

        // Login
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
