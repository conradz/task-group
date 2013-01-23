var TaskGroup = require('../index'),
    expect = require('chai').expect;

describe('TaskGroup', function() {
    it('should run dependencies', function(done) {
        var group = new TaskGroup();
        var ran = [];
        group
            .task('depend', function(done) {
                ran.push('depend');
                done();
            })
            .task('test', ['depend'], function(done) {
                ran.push('test');
                done();
            });

        group.run('test', function(e) {
            expect(e).to.not.exist;
            expect(ran).to.eql(['depend', 'test']);
            done();
        });
    });

    it('should run dependencies only once', function(done) {
        var ran = [];
        new TaskGroup()
            .task('depend', function(done) {
                ran.push('depend');
                done();
            })
            .task('test1', ['depend'], function(done) {
                ran.push('test1');
                done();
            })
            .task('test2', ['depend'], function(done) {
                ran.push('test2');
                done();
            })
            .run(['test1', 'test2'], function(e) {
                expect(e).to.not.exist;
                expect(ran[0]).to.equal('depend');
                expect(ran).to.include('test1');
                expect(ran).to.include('test2');
                expect(ran.length).to.equal(3);
                done();
            });
    });

    it('should propagate dependency errors', function(done) {
        var error = new Error('Test error');
        new TaskGroup()
            .task('depend', function(done) {
                done(error);
            })
            .task('test', ['depend'])
            .run('test', function(e) {
                expect(e).to.equal(error);
                done();
            });
    });

    it('should skip tasks when dependencies failed', function(done) {
        var error = new Error('Test error');
        var ran = false;
        new TaskGroup()
            .task('error', function(done) {
                done(error);
            })
            .task('test', ['error'], function(done) {
                ran = true;
                done();
            })
            .run('test', function(e) {
                expect(e).to.equal(error);
                expect(ran).to.be.false;
                done();
            });
    });
});
