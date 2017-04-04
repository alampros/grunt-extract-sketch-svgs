const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

module.exports = function extractSketch(grunt) {
  grunt.registerMultiTask('extract-sketch', 'Extract artboards from sketch document.', function extractSketchTask() {
    const done = this.async()
    const options = this.options({
      binpath: process.env.SKETCHTOOL_BIN || '/Applications/Sketch.app/Contents/Resources/sketchtool/bin/sketchtool',
      pageNameExportRegex: '- EXPORT - ',
    })
    const {
      binpath,
      pageNameExportRegex,
    } = options
    const pageNameRegex = new RegExp(pageNameExportRegex)
    if(!fs.existsSync(binpath)) {
      grunt.fail.fatal(`Sketchtool binary not found at path "${binpath}".`)
    }
    function run(...args) {
      return new Promise((resolve, reject) => {
        child_process.execFile(binpath, args, (error, stdout, stderr) => {
          if(error) {
            console.warn(error)
            return reject(error)
          }
          resolve(stdout)
        })
      })
    }
    this.files.forEach(function(file) {
      const filtered = file.src.filter(filepath => {
        if(grunt.file.exists(filepath)) {
          return true
        }
        grunt.fail.fatal('Source file "' + filepath + '" not found.')
        return false
      })
      filtered.forEach(srcFilePath => {
        run('list', 'artboards', srcFilePath)
          .catch(err => {
            grunt.fail.warn(err)
            done(err)
          })
          .then(out => JSON.parse(out))
          .then(doc => {
            return doc.pages.filter(page => {
              return page.name.match(pageNameExportRegex)
            })
          })
          .then(pages => {
            return pages.map(page => {
              return {
                name: page.name.replace(pageNameRegex, ''),
                id: page.id,
                artboards: page.artboards,
              }
            })
          })
          .then(pages => {
            if(pages.length === 0) {
              grunt.fail.warn(`No pages matching the pageNameExportRegex ("${pageNameExportRegex}") prefix option were found.`)
            }
            return Promise.all(pages.map(page => {
              const ids = page.artboards.map(ab => ab.id)
              const idString = ids.join(',')
              const args = [
                'export',
                'artboards',
                srcFilePath,
                '--format=svg',
                '--use-id-for-name=YES',
                `--output=${file.dest}/${page.name}`,
                `--items=${idString}`,
              ]
              grunt.verbose.writeln('Executing: sketchtool', args.join(' '))
              return run(...args)
                .then((stdout) => {
                  grunt.verbose.writeln('STDOUT from sketchtool:', stdout)
                  grunt.log.ok('Exported %d artboards from page "%s"', ids.length, page.name)
                  return page
                }, err => {
                  console.warn('Export error:', err)
                })
            }))
          })
          .then(pages => {
            pages.forEach(page => {
              page.artboards.forEach(ab => {
                const _src = path.resolve(file.dest, page.name, ab.id + '.svg')
                const _dest = path.resolve(file.dest, page.name, ab.name + '.svg')
                if(grunt.file.exists(_src)) {
                  grunt.file.copy(_src, _dest)
                  grunt.file.delete(_src)
                } else {
                  console.error('Error:', ab)
                  grunt.fail.warn('Error exporting artboard.', ab)
                }
              })
            })
            return pages
          })
          .then(out => {
            done()
          })
          .catch(err => {
            grunt.fail.fatal(err)
          })
      })
    })
  })
}
