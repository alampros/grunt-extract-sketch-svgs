# grunt-extract-sketch-svgs
Extract artboards from sketch files to SVGs

You need to provide the `sketchtool` binary. See [sketchapp.com/tool](https://www.sketchapp.com/tool/) for where to find it.

## extract-sketch task
_Run this task with the `grunt extract-sketch` command._

### Options

#### binpath
Type: `String`  
Default: `'/Applications/Sketch.app/Contents/Resources/sketchtool/bin/sketchtool'`

The path to to the `sketchtool` binary.

#### pageNameExportRegex
Type: `String`  
Default: `'- EXPORT - '`

Will only export artboards from pages that match this prefix.

### Usage Examples

```js
'extract-sketch': {
  options: {
    binpath: '/opt/bin/sketchtool',
    pageNameExportRegex: 'icon-',
  },
  main: {
    files: [{
      src: 'src/icons.sketch',
      dest: 'build',
    }],
  },
},
```
