# gs-weblang-cli
CLI for the Gobstones interpreter

## Install

```bash
# requires node > 4
sudo npm install -g gs-weblang-cli
```

## Run tests

```bash
npm test
```

## Building wrapper

The cli can be wrapped as an executable using [nexe](https://github.com/jaredallard/nexe): `npm install nexe -g`.

```
git clone https://github.com/gobstones/gs-weblang-cli
cd gs-weblang-cli
nexe -i src/index.js -o gs-weblang-cli
```

## Usage

```bash
gs-weblang-cli --help
```

### Run

#### passed

```bash
echo "program {\n Poner(Rojo)\n }" > /tmp/gobs.gbs
gs-weblang-cli /tmp/gobs.gbs -f gbb
```

```json
{
  "status": "passed",
  "result": {
    "x": 0,
    "y": 0,
    "sizeX": 9,
    "sizeY": 9,
    "table": "GBB/1.0\r\nsize 9 9\r\ncell 0 0 Azul 0 Negro 0 Rojo 1 Verde 0\r\nhead 0 0\r\n"
  }
}
```

#### compilation_error

```bash
echo "programita {\n Poner(Rojo)\n }" > /tmp/gobs.gbs
gs-weblang-cli /tmp/gobs.gbs
```

```json
{
  "status": "compilation_error",
  "result": {
    "on": {
      "range": {
        "start": {
          "row": 0,
          "column": 1
        },
        "end": {
          "row": 0,
          "column": 10
        }
      },
      "value": "programita",
      "arity": "name"
    },
    "message": "Se esperaba una definición de programa, función o procedimiento."
  }
}
```

#### runtime_error

```bash
echo "program {\n Ponerrrrr(Rojo)\n }" > /tmp/gobs.gbs
gs-weblang-cli /tmp/gobs.gbs
```

```json
{
  "status": "runtime_error",
  "result": {
    "on": {
      "token": {
        "range": {
          "start": {
            "row": 1,
            "column": 2
          },
          "end": {
            "row": 1,
            "column": 10
          }
        },
        "value": "Ponerrrrr",
        "arity": "name"
      }
    },
    "message": "El procedimiento Ponerrrrr no se encuentra definido."
  }
}
```

#### all_is_broken_error

This one **shouldn't** happen very often, but for now... :sweat_smile:

```bash
echo "" > /tmp/gobs.gbs
gs-weblang-cli /tmp/gobs.gbs
```

```json
{
  "status": "all_is_broken_error",
  "message": "Something has gone very wrong",
  "detail": {},
  "moreDetail": "Cannot read property 'range' of null"
}
```

### Batch run

`request.json`:
```json
[
  {
    "initialBoard": "GBB...",
    "code": "program {\n ..."
  },
  {
    "initialBoard": "GBB...",
    "code": "program {\n ..."
  },
]
```

```bash
gs-weblang-cli --batch request.json
# returns an array with the responses
```

### Generate AST

```bash
echo "program {\n Poner(Azul)\n }" | ./bin/gs-weblang-cli --ast --from_stdin
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
