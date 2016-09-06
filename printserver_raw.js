const fs = require('fs')
const Printer = require('ipp-printer')
const fetch = require('isomorphic-fetch')

const concat = require('concat-stream')
const printer = new Printer({ name: 'RAWPR', port: 10002 })
const exec = require('child_process').exec
const randomstring = require('randomstring')

printer.on('job', function (job) {
  const filename = `file-${randomstring.generate()}`
  const pdfFileName = `${filename}.pdf`
  const psFileName = `${filename}.ps`
  const file = fs.createWriteStream(psFileName)

  job.on('end', () => {
    const cmd = `cat ${psFileName} | sed 's/[^0-9]//g'  | grep -oP '(0301[0-9]{10})' | uniq | while read -r line; do data=$(curl -L http://koha2.deichman.no:8081/api/v1/labelgenerator/\${line}); java -jar bin/labelpdf.jar --data="$data" --output=./${pdfFileName} && lpr -P QL720NW -o PageSize=Custom.62x89mm ${pdfFileName}; done` //; rm ${pdfFileName} ${psFileName}`
    console.log(cmd)
    exec(cmd, (error, stdout, stderr)=> {
      console.log(stdout)
      console.log(stderr)
    })
  })

  job.pipe(file)
})
