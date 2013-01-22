var TaskGroup = require('../index'),
    expect = require('chai').expect;

describe('TaskGroup', function() {
    it('should run task', function(done) {
        var group = new TaskGroup();
        var ran = false;
        group.task('test', function(done) {
            ran = true;
            done();
        });

        group.run('test', function(e) {
            expect(e).to.not.exist;
            expect(ran).to.be.true;
            done();
        });
    });

    it('should run multiple tasks', function(done) {
        var group = new TaskGroup();
        var ran = [];
        group.task('test1', function(done) {
            ran.push('test1');
            done();
        });
        group.task('test2', function(done) {
            ran.push('test2');
            done();
        });

        group.run(['test1', 'test2'], function(e) {
            expect(e).to.not.exist;
            expect(ran).to.include('test1');
            expect(ran).to.include('test2');
            expect(ran.length).to.equal(2);
            done();
        });
    });

    it('should handle errors', function(done) {
        var error = new Error('Test error');
        var group = new TaskGroup();
        group.task('test', function(done) {
            done(error);
        });

        group.run('test', function(e) {
            expect(e).to.equal(error);
            done();
        });
    });

    it('should run task asynchronously', function(done) {
        var ran = false;
        new TaskGroup()
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

    it('should run all tasks', function(done) {
        var ran = [];
        new TaskGroup()
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

    it('should run multiple times', function(done) {
        var ran = 0;
        var group = new TaskGroup()
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
