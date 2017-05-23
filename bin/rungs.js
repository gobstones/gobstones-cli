// Wrapper of gs-weblang-cli --ast --from_stdin
// It can be compiled with `nexe`: nexe -i rungs.js -o rungs-ubuntu64

var gbs = require('gs-weblang-core/umd/index.umd.min');
var reporter = require('../src/reporter');

function withCode(action) {
  var code = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      code += chunk;
    }
  });
  process.stdin.on('end', () => {
    action(code);
  });
}

withCode(code => {
  console.log(reporter.getAst(code));
})
