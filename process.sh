#!/bin/bash
filename="$1"
filenameBase=$(basename "$1" .ps)

function getBarcodes {
    echo $(grep -oP '(0301[0-9]{10})' $1 | uniq)
}

function textualScan {
    $(cat $1 | ps2ascii >&1 | getBarcodes)
}

function ocrScan {
    mkdir -p "$filenameBase"
    cd "$filenameBase"

    convert -density 200 "../$1" pg.png
    for i in pg*png ; do
       echo $(tesseract "$i" stdout | getBarcodes)
    done
}

function printAll {
    read -a words

    for i in ${words[@]}; do 
        pdfFile="${filenameBase}_${i}.pdf"
        data=$(curl -L "http://koha2.deichman.no:8081/api/v1/labelgenerator/${i}")
        echo "http://koha2.deichman.no:8081/api/v1/labelgenerator/${i}"
        java -jar bin/labelpdf.jar --data="$data" --output="./${pdfFile}"
        echo "printing"
        lpr -P QL720NW -o PageSize=Custom.29x90mm "${pdfFile}";

        rm "${pdfFile}"
   done
}

echo "Receiving file $1"

text=$(textualScan $filename)
echo "$text"
if [[ $text == "" ]] ; then
    ocrScan $filename | printAll
else
    echo "$text" | printAll
fi


rm -R "$filenameBase"

rm "$filename"
