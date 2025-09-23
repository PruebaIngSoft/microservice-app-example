'use strict';
const TodoController = require('./todoController');

module.exports = function (app, {tracer, redisClient, logChannel}) {
  const todoController = new TodoController({tracer, redisClient, logChannel});
  
  app.route('/todos')
    .get(async function(req, resp) { 
        try {
            return await todoController.list(req, resp);
        } catch (error) {
            console.error('Route error:', error);
            resp.status(500).json({ error: 'Internal server error' });
        }
    })
    .post(async function(req, resp) { 
        try {
            return await todoController.create(req, resp);
        } catch (error) {
            console.error('Route error:', error);
            resp.status(500).json({ error: 'Internal server error' });
        }
    });

  app.route('/todos/:taskId')
    .delete(async function(req, resp) { 
        try {
            return await todoController.delete(req, resp);
        } catch (error) {
            console.error('Route error:', error);
            resp.status(500).json({ error: 'Internal server error' });
        }
    });
};