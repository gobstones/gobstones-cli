[![Build Status](https://travis-ci.org/gobstones/gobstones-cli.svg?branch=master)](https://travis-ci.org/gobstones/gobstones-cli)

# gobstones-cli
CLI for the Gobstones interpreter

## Install

```bash
# requires node > 6
sudo npm install -g gobstones-cli
```

## Run tests

```bash
npm test
```

## Building wrapper

The cli can be wrapped as an executable using [nexe](https://github.com/jaredallard/nexe): `npm install nexe -g`.

```
git clone https://github.com/gobstones/gobstones-cli
cd gobstones-cli
nexe -i src/index.js -o gobstones-cli
```

## Usage

```bash
gobstones-cli --help
```

### Run

#### simple program

```bash
echo "program {\n Poner(Rojo)\n }" > /tmp/gobs.gbs
gobstones-cli /tmp/gobs.gbs -f gbb
```

See [the tests](test/run-spec.js) for more examples!

### Batch run

`batch.json`:
```json
{
  "extraCode": "function a() { return (2) }", /* Teacher's code */
  "requests": [
    {
      "code": "program 1 { ...", /* Code to be executed */
      "originalCode": "procedure A() { ...", /* Original student's code (for AST computation) */
      "examples": [ /* Boards */
        { "initialBoard": "GBB 1...", "extraBoard": "GBB 1..." },
        { "initialBoard": "GBB 2...", "extraBoard": "GBB 2..." }
      ]
    },
    {
      "code": "program 2 { ...",
      "examples": [
        { "initialBoard": "GBB..." }
      ]
    }
  ]
}
```

```bash
gobstones-cli --batch batch.json
# returns an array with the responses
```

### Generate AST

This tool can also generate the AST of a Gobstones program, in two different fashions:

 * native AST - that is, the AST internally used by the tool to execute programs
 * mulang AST - a simple AST suited to perform code analysys, that can be processed by the [Mulang tool](https://github.com/mumuki/mulang)

#### Native AST


```bash
echo "program { Poner(Azul) }" | gobstones-cli --ast --from_stdin
```

```json
{
  "alias": "program",
  "body": [
    {
      "arity": "statement",
      "alias": "Drop",
      "parameters": [
        {
          "value": 0,
          "alias": "Blue"
        }
      ]
    }
  ]
}
```

#### Mulang AST

```bash
echo "program { Poner(Azul) }" | gobstones-cli --mulang_ast --from_stdin | json_pp
```

```json
{
   "tag" : "EntryPoint",
   "contents" : [
      "program",
      {
         "tag" : "Application",
         "contents" : [
            {
               "tag" : "Reference",
               "contents" : "Poner"
            },
            [
               {
                  "tag" : "MuSymbol",
                  "contents" : "Azul"
               }
            ]
         ]
      }
   ]
}

```
