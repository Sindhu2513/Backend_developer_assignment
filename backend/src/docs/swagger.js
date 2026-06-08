const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scalable REST API with Auth + RBAC (MongoDB)',
      version: '1.0.0',
      description: 'Express and MongoDB Mongoose REST API secured with JWT and Role-Based Access Control.'
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'V1 local server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6614fae57c6b412eb0be6ef9' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-06-08T12:00:00.000Z' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6614fb387c6b412eb0be6efd' },
            title: { type: 'string', example: 'Complete assignment' },
            description: { type: 'string', example: 'Implement Mongoose model and route validations.' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], example: 'pending' },
            createdBy: { type: 'string', description: 'Reference User ID or populated user object' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-06-08T12:00:00.000Z' }
          }
        },
        AuthSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Invalid credentials or resource not found.' }
          }
        }
      }
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user account',
          tags: ['Auth APIs'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', minLength: 6, example: 'secret123' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Account created successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthSuccess' } } }
            },
            400: {
              description: 'Invalid inputs or email already in use',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'Authenticate credentials and generate token',
          tags: ['Auth APIs'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', example: 'secret123' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthSuccess' } } }
            },
            401: {
              description: 'Invalid credentials',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/auth/me': {
        get: {
          summary: 'Fetch the active profile session info',
          tags: ['Auth APIs'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User details retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: { user: { $ref: '#/components/schemas/User' } }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/tasks': {
        get: {
          summary: 'Get tasks (Standard user sees own tasks, Admin sees all)',
          tags: ['Task APIs'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Tasks list retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Task' } }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        post: {
          summary: 'Create a new task',
          tags: ['Task APIs'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string', example: 'Finish Homework' },
                    description: { type: 'string', example: 'Do calculus problems.' },
                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], default: 'pending', example: 'pending' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Task created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Task' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Validation failed',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/tasks/{id}': {
        get: {
          summary: 'Get details of a single task (Owner or Admin only)',
          tags: ['Task APIs'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Task ID' }
          ],
          responses: {
            200: {
              description: 'Task retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Task' }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Access denied',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            404: {
              description: 'Task not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        put: {
          summary: 'Update task details (Owner or Admin only)',
          tags: ['Task APIs'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Update title' },
                    description: { type: 'string', example: 'New description' },
                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Task updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Task' }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Forbidden access',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            404: {
              description: 'Task not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        delete: {
          summary: 'Delete a task (Owner or Admin only)',
          tags: ['Task APIs'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Task deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Task deleted successfully.' }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Forbidden access',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            404: {
              description: 'Task not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/admin/users': {
        get: {
          summary: 'Fetch all users in the system (Admin only)',
          tags: ['Admin APIs'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Users list retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Access denied. Admin role required.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/admin/tasks': {
        get: {
          summary: 'Fetch all tasks in the system (Admin only)',
          tags: ['Admin APIs'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Tasks list retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Task' } }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Access denied. Admin role required.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
