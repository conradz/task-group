var async = require('async');

// Helper function to avoid `hasOwnProperty` overwriting
function hasOwn(obj, name) {
    return Object.prototype.hasOwnProperty.call(obj, name);
}

function TaskGroup() {
    this.tasks = {};
}

function defaultAction(done) {
    done();
}

TaskGroup.prototype.task = function(name, dependencies, action) {
    if (typeof name !== 'string') {
        throw new Error('Invalid name specified');
    }
    if (typeof dependencies === 'function') {
        action = dependencies;
        dependencies = [];
    }
    if (!action) {
        action = defaultAction;
    }

    this.tasks[name] = {
        name: name,
        dependencies: dependencies,
        action: action
    };

    return this;
};

TaskGroup.prototype.run = function(tasks, callback) {
    if (typeof tasks === 'function' || tasks == null) {
        // Run all tasks if none are specified
        callback = tasks;
        tasks = Object.keys(this.tasks);
    } else if (!Array.isArray(tasks)) {
        tasks = [tasks];
    }

    var taskIndex = this.tasks;
    var running = {};
    function run(task, callback) {
        // If task is already running, register the callback to be called when
        // it is completed.
        if (hasOwn(running, task)) {
            return running[task](callback);
        }

        var waiting = [callback];
        var error = null;
        // Register the function that will be called to add a function to the
        // waiting list, or will call it immediately if completed.
        running[task] = function(callback) {
            if (waiting === null) {
                callback(error);
            } else {
                waiting.push(callback);
            }
        };

        function done(e) {
            // Call all waiting functions
            var w = waiting;
            waiting = null;
            error = e;
            w.forEach(function(func) { func(e); });
        }

        if (!hasOwn(taskIndex, task)) {
            return done(new Error('Could not find task ' + task + '.'));
        }

        task = taskIndex[task];

        // Run all the dependencies and then run the task action
        async.forEach(task.dependencies, run, function(e) {
            // Skip the action if a dependency failed
            if (e) { return done(e); }

            var action = task.action;
            try {
                action(done);
            } catch(e) { return done(e); }
        });
    }

    // Run all the specified tasks
    async.forEach(tasks, run, function(e) {
        if (callback) {
            // Force error to === null if there is no error
            callback(e || null);
        }
    });

    return this;
};

module.exports = TaskGroup;
