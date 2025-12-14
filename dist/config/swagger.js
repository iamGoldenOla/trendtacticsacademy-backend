"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Trendtactics Academy LMS API',
            version: '1.0.0',
            description: 'A comprehensive Learning Management System API for Trendtactics Academy',
            contact: {
                name: 'Trendtactics Academy',
                email: 'support@trendtactics.com',
                url: 'https://academy.trendtactics.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://api.academy.trendtactics.com/api/v1'
                    : 'http://localhost:5000/api/v1',
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                            example: 'John Doe',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'john@example.com',
                        },
                        role: {
                            type: 'string',
                            enum: ['student', 'instructor', 'admin'],
                            description: 'User role',
                            example: 'student',
                        },
                        avatar: {
                            type: 'string',
                            description: 'User avatar URL',
                        },
                        bio: {
                            type: 'string',
                            description: 'User biography',
                        },
                        isEmailVerified: {
                            type: 'boolean',
                            description: 'Email verification status',
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Account active status',
                        },
                        lastLogin: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last login timestamp',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Account creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                        },
                    },
                },
                Course: {
                    type: 'object',
                    required: ['title', 'description', 'instructor', 'category', 'level', 'price'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Course ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Course title',
                            example: 'Introduction to Web Development',
                        },
                        description: {
                            type: 'string',
                            description: 'Course description',
                        },
                        instructor: {
                            type: 'string',
                            description: 'Instructor ID',
                        },
                        category: {
                            type: 'string',
                            description: 'Course category',
                            example: 'Technology',
                        },
                        level: {
                            type: 'string',
                            enum: ['beginner', 'intermediate', 'advanced'],
                            description: 'Course difficulty level',
                        },
                        price: {
                            type: 'number',
                            description: 'Course price in USD',
                            example: 99.99,
                        },
                        duration: {
                            type: 'number',
                            description: 'Course duration in hours',
                            example: 20,
                        },
                        thumbnail: {
                            type: 'string',
                            description: 'Course thumbnail URL',
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Course tags',
                        },
                        rating: {
                            type: 'number',
                            minimum: 0,
                            maximum: 5,
                            description: 'Course average rating',
                        },
                        reviewCount: {
                            type: 'number',
                            description: 'Number of reviews',
                        },
                        isPublished: {
                            type: 'boolean',
                            description: 'Course publication status',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Lesson: {
                    type: 'object',
                    required: ['title', 'description', 'content', 'course', 'order'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Lesson ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Lesson title',
                        },
                        description: {
                            type: 'string',
                            description: 'Lesson description',
                        },
                        content: {
                            type: 'string',
                            description: 'Lesson content',
                        },
                        course: {
                            type: 'string',
                            description: 'Course ID',
                        },
                        order: {
                            type: 'number',
                            description: 'Lesson order in course',
                        },
                        duration: {
                            type: 'number',
                            description: 'Lesson duration in minutes',
                        },
                        videoUrl: {
                            type: 'string',
                            description: 'Lesson video URL',
                        },
                        attachments: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Lesson attachments',
                        },
                        isPreview: {
                            type: 'boolean',
                            description: 'Whether lesson is available as preview',
                        },
                    },
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Request success status',
                        },
                        message: {
                            type: 'string',
                            description: 'Response message',
                        },
                        data: {
                            type: 'object',
                            description: 'Response data',
                        },
                        error: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        field: {
                            type: 'string',
                            description: 'Field name with error',
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
    ],
};
const specs = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Trendtactics Academy API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            showRequestHeaders: true,
        },
    }));
    // Serve swagger.json
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};
exports.setupSwagger = setupSwagger;
exports.default = specs;
