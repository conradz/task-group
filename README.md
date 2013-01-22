# task-group

Node module to run a graph of tasks

This module manages a list of tasks and their dependencies. It will run tasks
in parallel and will complete all of a tasks dependencies before running a
task.

A task is very similar to a Makefile task, except that it will run a plain JS
function. As in Makefile tasks, a task can have zero or more dependencies that
must be completed before the task can be run. A TaskGroup will run as many
tasks as possible in parallel, including dependencies, but will always ensure
that all dependencies are complete before calling the task action.

## Example

Also see the tests in the `spec` directory.

```js
var TaskGroup = require('task-group');

var tasks = new TaskGroup();
tasks.task('dir', function(done) {
    fs.mkdir('my-dir', done);
});

tasks.task('file', ['dir'], function(done) {
    fs.writeFile('my-dir/file', 'Test file', done);
});

// Runs `dir` task first, and then `file` task
tasks.run('file', function(err) {
    // `err` contains the error if an error occurred in any of the tasks that
    // were run.
});

// Runs all tasks
tasks.run(function(err) {

});

// Run multiple tasks
tasks.run(['file', ...], function(err) {

});
```

## Reference

### TaskGroup()

This is the main class to use to manage the tasks. It contains an object
containing the task names mapped to their dependencies and actions. The
`TaskGroup` constructor is the only export from the module.

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

