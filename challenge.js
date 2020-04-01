const urlGet = 'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=ebee2df12d2bfc9ba987ca002d169141a1f5845e'
const urlPost = 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=ebee2df12d2bfc9ba987ca002d169141a1f5845e'

const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const FormData = require('form-data');

const fullPathJsonFile = __dirname + '/answer.json'

function getJsonData() {
    axios.get(urlGet)
        .then(response => {
            const jsonObj = response.data
            const textDecoded = decodeText(jsonObj.cifrado, jsonObj.numero_casas)
            console.log(textDecoded)
            const shasum = crypto.createHash('sha1')
            shasum.update(textDecoded)

            jsonObj.decifrado = textDecoded
            jsonObj.resumo_criptografico = shasum.digest('hex')

            fs.writeFile(fullPathJsonFile, JSON.stringify(jsonObj), err => {
                console.log(err || 'File saved!')
                postJsonData()
            })
        }).catch(err => {
            console.error('Response GET error:', err)
        })
}

function postJsonData() {
    const form = new FormData();
    form.append('answer', fs.createReadStream(fullPathJsonFile));

    axios({
        method: 'post',
        url: urlPost,
        data: form,
        headers: {
            'content-type': `multipart/form-data; boundary=${form._boundary}`,
        },
    }).then(response => {
        console.log('Response POST success:', response)
    }).catch(err => {
        console.error('Response POST error:', err)
    })
}

function decodeText(textEncoded, key) {
    arrIn = textEncoded.toLowerCase().split('')
    const arrOut = []

    arrIn.forEach(element => {
        if (element.match(/[0-9 .]/) !== null) {
            arrOut.push(element)
        } else {
            let charCode = element.charCodeAt(0) - key

            if (charCode < 97) {
                charCode = 122 - (97 - charCode) + 1
            }

            const newElement = String.fromCharCode(charCode)
            arrOut.push(newElement)
        }
    });

    return arrOut.join('')
}

getJsonData()