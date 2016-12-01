# gs-weblang-cli
CLI for the Gobstones interpreter

## Examples

### passed

```bash
echo "program {\n Poner(Rojo)\n }" > /tmp/gobs.gbs
gbs /tmp/gobs.gbs -f gbb
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

### compilation_error

```bash
echo "programita {\n Poner(Rojo)\n }" > /tmp/gobs.gbs
gbs /tmp/gobs.gbs
```

```json

```

### runtime_error

```bash
echo "program {\n Ponerrrrrrr(Rojo)\n }" > /tmp/gobs.gbs
gbs /tmp/gobs.gbs
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
