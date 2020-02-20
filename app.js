
const nodemailer = require('nodemailer');
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var cors = require('cors');
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'




//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ProtectedRoutes = express.Router();

app.post('/sendmail', (req, res) => {
    if(!req){
        res.send('Invalid Request')
    }
    let _mailObject={};

    console.log(req.body)
    console.log(req.params)
    let fromMail = 'k.ksamba@gmail.com';
    let toMail = 'k.ksamba@gmail.com';
    let subject = 'Enter subject line here';
    let text = "Enter email content."
    const transporter = nodemailer.createTransport({
        
        host: 'smtp.zoho.com',
            port: 587,
            secureConnection: true, // use SSL
            auth: {
                user: 'noreply@yovza.com',
                pass: 'Yovza@#99'
            },
            tls:{
                secureProtocol: "TLSv1_method"
            }
    });
    // email options
    let mailOptions = {
        from: 'noreply@yovza.com',
        to: 'k.ksamba@gmail.com',
        subject: 'subject',
        text: 'text'
    };

    transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log(error);
            return res.send(error)
        }else{
            console.log('ggg',response)
            return res.send(response)
        }
        
        

    })

})
app.listen(3900);

console.log('port', 3900)

