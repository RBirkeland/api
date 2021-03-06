var context;

module.exports = {
    start: function(callback) {
        callback = callback || function() {};

        // Imports
        const pg = require('pg');
        const fs = require('fs');
        const path = require('path');
        const Sequelize = require('sequelize');

        // Initialize the context
        context = {
            fs: fs,
            pg: pg,
            path: path,
            Sequelize: Sequelize,
            constants: {}
        };

        // Function to load all components from the respective folders (models, controllers,  )
        context.component = function(componentName) {
            if (!context[componentName]) {
                context[componentName] = {};
            }

            return {
                module: function(moduleName) {
                    if (!context[componentName][moduleName]) {
                        console.log('Loading component ' + componentName);
                        context[componentName][moduleName] = require(path.join(__dirname, "api", componentName, moduleName))(context,
                            componentName, moduleName);
                        console.log('LOADED ' + componentName + '.' + moduleName);
                    }

                    return context[componentName][moduleName];
                }
            }
        };

        callback(context);
        return context;
    },
    connect: function(callback) {
        const context = this.start();

        var config = require(__dirname + '/config/postgresConfig.json');
        context.config = config;


        //initalize Sequelize and create tables
        context.sequelize = new context.Sequelize(config.database, config.username, config.password, {
            host: config.hostname,
            dialect: 'postgres',
            port: config.port,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        });


        return context.sequelize
            .authenticate()
            .then(function(err) {
                console.log('Connection has been established successfully.');
                return callback(context);
            })
            .catch(function(err) {
                // Logs all application errors that happen after succesful db test OR error in connecting to DB

                console.error(err.code);
                console.error(err);
                return process.exit(1);
            });
    },
    getContext: function() {
        const context = this.start();
        var config = require(__dirname + '/config/postgresConfig.json');

        context.config = config;

        //initalize Sequelize and create tables
        context.sequelize = new context.Sequelize(config.database, config.username, config.password, {
            host: config.hostname,
            dialect: 'postgres',
            port: config.port,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        });

        return context;
    }
}
