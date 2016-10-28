var http = require('http');
var fs = require('fs');
var spawn = require('child_process').spawn;
var console = require('sfconsole')("START");

module.exports = {
  run: function (config) {
    if(config.timeout && config.timeout < 1) {
      console.err('too fast! should better over 1 minutes');
    }
    console.log('waiting....');

    var timeout = (config.timeout || 10) * 1000 * 60;

    setInterval(function () {
      changeFile().then(add).then(commit).then(push).then(function () {
        console.log(('Commit success at ' + (new Date()).toString()).green);
        console.log('waiting....');
      }).catch(function (e) {
        console.log(('Commit error: ' + e.message).red);
        console.log('waiting....');
      });
    }, timeout);
  }
}

function changeFile() {
  return new Promise(function (resolve, reject) {
    fs.writeFileSync('good-looking', 'good-looking: ' + new Date().toString());
    resolve();
  });
}

function add() {
  return run('git', ['add', '--all']);
}

function commit() {
  return run('git', ['commit', '-m', '"good-looking: ' + new Date().toString() + '"']);
}

function push() {
  return run('git', ['push', 'origin', 'master']);
}

function run(command, args) {
  return new Promise(function (resolve, reject) {
    var task = spawn(command, args, {
      cwd: process.cwd()
    });
    task.on('close', function (code) {

      if (code !== 0) reject(new Error(code));
      else resolve();
    });
    task.stdout.pipe(process.stdout);
    task.stderr.pipe(process.stderr);
  })
}