const fs = require('fs')
const Printer = require('ipp-printer')
const fetch = require('isomorphic-fetch')

const concat = require('concat-stream')
const printer = new Printer({ name: 'Ministry of Silly Walks', port: 10001 })
const exec = require('child_process').exec
const randomstring = require('randomstring')

printer.on('job', function (job) {
  const filename = `file-${randomstring.generate()}`
  const pdfFileName = `${filename}.pdf`
  const psFileName = `${filename}.ps`
  const file = fs.createWriteStream(psFileName)

  job.on('end', () => {
    const cmd = `cat ${psFileName} | ps2ascii >&1 | egrep -o '\\b([0-9]{14})\\b' | uniq | while read -r line; do data=$(curl -L http://koha2.deichman.no:8081/api/v1/labelgenerator/\${line}); java -jar labelpdf.jar --data="$data" --output=./${pdfFileName} && lpr -P DYMO_LabelWriter_450___raspberrypi ${pdfFileName}; done; rm ${pdfFileName} ${psFileName}`
    console.log(cmd)
    exec(cmd, (error, stdout, stderr)=> {
      console.log(stderr)
    })
  })

  job.pipe(file)
})