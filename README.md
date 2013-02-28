task-group
==========

Node module to run a graph of tasks. This makes it super easy to manage groups
of tasks that have dependencies, while running everything asynchronously and in
parallel.

Example
-------

```js
var taskGroup = require('task-group');

taskGroup()
    .task('dir', function(done) {
        fs.mkdir('my-dir', done);
    })

    // The `file` task must have the `dir` task completed before it runs
    .task('file', ['dir'], function(done) {
        fs.writeFile('my-dir/file', 'Test file', done);
    })

    // Runs the `file` task, which depends on the `dir` task
    .run('file', function(err) {
        // `err` contains the error if an error occurred in any of the tasks that
        // were run.
    })

    // Runs all tasks
    .run(function(err) {

    })

    // Run multiple tasks
    .run(['file', ...], function(err) {

    });
```

Reference
---------

### `taskGroup()`

This returns a new task group, which has the `#task` and `#run` methods. The
module exports this function directly.

The returned object's methods can be chained for more concise code.

### `#task(name, [dependencies], [action])`

This method registers a task with the specified name. The name must be a
string. Dependencies can be specified as an array containing the names of tasks
that must be run before this task. If `dependencies` is omitted, it is assumed
that there are not dependencies. `action` is a function that will be called
when the task is to be run. It will be provided a callback function that it
*must* call when the task is complete, optionally passing an error to it.

### `#run([tasks], [callback])`

Runs the specified tasks. `tasks` can be a single string or an array of strings
specifying all the tasks to run. If `tasks` is `null` or omitted, it will run
all the registered tasks. `callback` is a function that is called when all
tasks are complete, with the first parameter being the error if an error
occured, or `null`.

License
-------

MIT License. See the `LICENSE` file.
