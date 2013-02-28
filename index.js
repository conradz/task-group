var Q = require('q');

// Helper function to avoid `hasOwnProperty` overwriting
function hasOwn(obj, name) {
    return Object.prototype.hasOwnProperty.call(obj, name);
}

function defaultAction(callback) {
    callback();
}

function taskGroup() {
    var self = {},
        tasks = {};

    function run(task, running) {
        if (hasOwn(running, task)) {
            if (running[task] === null) {
                return Q.reject(new Error(
                    'Task "' + task + ' has circular dependency'));
            }
            return running[task];
        } else if (!hasOwn(tasks, task)) {
            return Q.reject(new Error('Task "' + task + '" is not defined'));
        }

        running[task] = null;
        task = tasks[task];

        // Run all dependencies and then run the action
        var deps = Q.all(task.dependencies
            .map(function(d) { return run(d, running); }));
        return (running[task.name] =
            deps.then(function() { return Q.nfcall(task.action); }));
    }

    function addTask(name, dependencies, action) {
        if (typeof dependencies === 'function') {
            action = dependencies;
            dependencies = null;
        } else if (!action) {
            action = defaultAction;
        }

        tasks[name] = {
            name: name,
            dependencies: dependencies || [],
            action: action
        };

        return self;
    }

    function runTask(names, callback) {
        if (typeof names === 'function') {
            callback = names;
            names = null;
        } else if (typeof names === 'string') {
            names = [names];
        }
        names = names || Object.keys(tasks);

        var running = {};
        var all = names.map(function(n) { return run(n, running); });
        Q.all(all).nodeify(callback);

        return self;
    }

    self.task = addTask;
    self.run = runTask;
    return self;
}

module.exports = taskGroup;

