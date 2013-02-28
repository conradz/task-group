var taskGroup = require('../index'),
    expect = require('chai').expect;

describe('taskGroup', function() {
    it('should run task', function(done) {
        var ran = false;
        taskGroup()
            .task('test', function(done) {
                ran = true;
                done();
            })
            .run('test', function(e) {
                expect(e).to.not.exist;
                expect(ran).to.be.true;
                done();
            });
    });

    it('should run multiple tasks', function(done) {
        var ran = [];
        taskGroup()
            .task('test1', function(done) {
                ran.push('test1');
                done();
            })
            .task('test2', function(done) {
                ran.push('test2');
                done();
            })
            .run(['test1', 'test2'], function(e) {
                expect(e).to.not.exist;
                expect(ran).to.include('test1');
                expect(ran).to.include('test2');
                expect(ran.length).to.equal(2);
                done();
            });
    });

    it('should handle errors', function(done) {
        var error = new Error('Test error');
        taskGroup()
            .task('test', function(done) {
                done(error);
            })
            .run('test', function(e) {
                expect(e).to.equal(error);
                done();
            });
    });

    it('should run task asynchronously', function(done) {
        var ran = false;
        taskGroup()
            .task('test', function(done) {
                process.nextTick(function() {
                    ran = true;
                    done();
                });
            })
            .run('test', function(e) {
                expect(e).to.not.exist;
                expect(ran).to.be.true;
                done();
            });
    });

    it('should run all tasks when task parameter is omitted', function(done) {
        var ran = [];
        taskGroup()
            .task('test1', function(done) {
                ran.push('test1');
                done();
            })
            .task('test2', function(done) {
                ran.push('test2');
                done();
            })
            .run(function(e) {
                expect(e).to.not.exist;
                expect(ran).to.include('test1');
                expect(ran).to.include('test2');
                expect(ran.length).to.equal(2);
                done();
            });
    });

    it('should run all tasks when null task specified', function(done) {
        var ran = [];
        taskGroup()
            .task('test1', function(done) {
                ran.push('test1');
                done();
            })
            .task('test2', function(done) {
                ran.push('test2');
                done();
            })
            .run(null, function(e) {
                expect(e).to.not.exist;
                expect(ran).to.include('test1');
                expect(ran).to.include('test2');
                expect(ran.length).to.equal(2);
                done();
            });
    });

    it('should run multiple times', function(done) {
        var ran = 0;
        var group = taskGroup()
            .task('test', function(done) {
                ran++;
                done();
            });

        group.run('test', function(e) {
            expect(e).to.not.exist;
            group.run('test', function(e) {
                expect(e).to.not.exist;
                expect(ran).to.equal(2);
                done();
            });
        });
    });
});
