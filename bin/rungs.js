// Wrapper of gobstones-cli --mulang_ast --from_stdin
// It can be compiled with `nexe`: nexe -i rungs.js -o rungs-ubuntu64

var reporter = require('../src/reporter');

function withCode(action) {
  var code = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      code += chunk;
    }
  });
  process.stdin.on('end', function() {
    action(code);
  });
}

withCode(code => {
  console.log(reporter.getMulangAst(code));
})
