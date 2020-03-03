
const nodemailer = require('nodemailer');
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const mongoose = require('mongoose');
var cors = require('cors');
require('./models/signupsource')
require('./models/freesignup')
require('./models/User')

const uuidv4 = require('uuid/v4');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

var SignupSource = mongoose.model('signupsource')
var FreeSignUp = mongoose.model('freesignup')
var User = mongoose.model('User')
const env = "dev";
var config = require('./config/' + env + '.config');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
//to hold multiple responses and return all together
var responseData = {};
responseData.isError = false,
    responseData.Data = new Array()

const smtpOptions = config.smtp;
app.get('/hello', (req, res) => {
    res.json('working ....');
})
app.post('/sendmail', (req, res) => {
    if (!req) {
        res.send('Invalid Request. Expecting valid data in  request')
    }
    console.log('body', req.body.name)
    let _emailObj = req.body;
    console.log(_emailObj)
    try {
        responseData.isError = false;
        responseData.Data = new Array();
        sendEmail(getMailTransport(), getCustomerMailOptions(false, _emailObj));
        sendEmail(getMailTransport(), getAdminMailOptions(false, _emailObj));
        checkResponses(res);

    } catch (error) {
        return res.send(error);
    }


})
function checkResponses(res) {
    var _flagCheck = setInterval(function () {
        if (responseData.isError === true) {
            clearInterval(_flagCheck);
            console.log('responseArray', responseData);
            res.status(503).send(responseData);
        }
        else if (responseData.Data.length == 2) {
            clearInterval(_flagCheck);
            console.log('responseArray', responseData);
            res.status(200).send(JSON.stringify(responseData));
        }

    }, 100);
}
function isValidEmail(email) {
    console.log('fff', email);
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegexp.test(email)
}
function sendEmail(transporter, options) {
    console.log('send email', options)
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!isValidEmail(options.to)) {
        // return 'Invalid email';
        responseData.Data.push('Invalid Email::: ' + options.to);
        responseData.isError = true;
        return;
    }

    return transporter.sendMail(options, (error, response) => {
        if (error) {
            console.log('errorrrr', error)
            responseData.isError = true;
            responseData.Data.push('error sending email:::' + error);

        } else {
            console.log('response', response)
            responseData.Data.push('successfully sent email:::' + JSON.stringify(response));
            //return response;


        }
    });
}

function getMailTransport() {
    console.log('smtp options', smtpOptions);
    const transporter = nodemailer.createTransport(smtpOptions);
    return transporter;
}

function getCustomerMailOptions(ispromo, params) {
    let _name = "customer"
    if (ispromo) {
        _name = params.email
    } else {
        _name = params.name
    }
    let mailbodycustomer = `<p>Dear ${_name},<br/><br/>
    We would like to acknowledge that we have received your query.<br/><br/>
    One of our colleagues will reach out to you shortly. 
    You can also send us an email at support.com. 
    <br/><br/>Sincerely,
    <br/>Yovza</p>`;


    // email options
    let mailOptions = {
        from: config.defaultMailOptions.from,
        to: params.email,
        subject: 'Thank you for Interest in Yovza ',
        html: mailbodycustomer
    };
    return mailOptions;
}
function getAdminMailOptions(isPromo, params) {
    let mailbodysupport = '';
    if (isPromo) {
        mailbodysupport = `<p>Dear Support,<br/><br/> 
    We would like to acknowledge that we have recieved request<br/>
                            Email : ${params.email}<br/>
                            Source: ${params.source}<br/>
    One of our colleagues will reach out to you shortly.<br/>
    <br/>Sincerely,<br/>Yovza.</p>`;

    } else {
        mailbodysupport = `<p>Dear Support,<br/><br/>Name : ${params.name}<br/><br/> 
                            Email : ${params.email}<br/> Contact No. : ${params.phone}<br/> 
    
    We would like to acknowledge that we have received your query.<br/>
    One of our colleagues will reach out to you shortly.<br/><br/>Sincerely,<br/>Yovza.</p>`;

    }
    let adminMailOptions = {
        from: config.defaultMailOptions.from,
        to: config.defaultMailOptions.to,
        subject: config.defaultMailOptions.subject,
        html: mailbodysupport
    };
    return adminMailOptions;
}
function getConfirmationEmailOptions(isAdmin, params) {
    let rep="";
    if(isAdmin){
        rep="Support"
    }else{
        rep=params.name;
    }
    let mailbodysupport = `<p>Dear ${rep},<br/><br/> 
    We would like to acknowledge that we have recieved request<br/>
                            Name : ${params.name}<br/>
                            Phone: ${params.phone}<br/>
                            Email: ${params.email}<br/>
                            Company : ${params.company}<br/>
                            Website : ${params.companywebsite}<br/>
    One of our colleagues will reach out to you shortly.<br/>
    
    Please click on below link to Activate Your Email
    ###link
    <br/>Sincerely,<br/>Yovza.</p>`;
    if (!isAdmin) {
        // /localhost:3900
        mailbodysupport = mailbodysupport.replace('###link',
            `<a class="btn btn-primary" href="https://api.mail.yovza.com/activate?ref=${params.email}&source=email&t=${params.trackId}">Activate</a>`)
    } else {
        mailbodysupport = mailbodysupport.replace('###link', '');
    }

    let mailOptions = {}
    if (isAdmin) {

        // email options
        mailOptions = {
            from: config.defaultMailOptions.from,
            to: config.defaultMailOptions.to,
            subject: 'Recevied Free SignUp Request',
            html: mailbodysupport
        };
    } else {
        // email options
        mailOptions = {
            from: config.defaultMailOptions.from,
            to: params.email,
            subject: 'Thank you for Interest in Yovza Free SignUp ',
            html: mailbodysupport
        };
    }


    return mailOptions;
}
function getTempPwdEmail(isAdmin, params) {
    let mailbodysupport = `
    <br/><br/>
    <p>Dear ${params.username},<br/><br/> 
    We would like to acknowledge that Your Account is Verified Succssfully.<br/>
    Please use the password for login.
    Temporary Password : ${params.password}<br/>
    <br/>
    Note: After successful login System will force you to change the Password.
    
    
    <br/>Sincerely,<br/>Yovza.</p>`;


    let mailOptions = {}
    if (isAdmin) {

        // email options
        mailOptions = {
            from: config.defaultMailOptions.from,
            to: config.defaultMailOptions.to,
            subject: 'Recevied Free SignUp Request',
            html: mailbodysupport
        };
    } else {
        // email options
        mailOptions = {
            from: config.defaultMailOptions.from,
            to: params.email,
            subject: 'Thank you for Interest in Yovza Free SignUp ',
            html: mailbodysupport
        };
    }


    return mailOptions;
}
app.post('/promosignup', (req, res) => {
    if (req.body.signupData === undefined || req.body.signupData === null) {
        return res.status(403).send('Invalid request. Expecting signupData as body in request');
    }
    console.log(req.body.signupData)
    _signupData = req.body.signupData
    let dev_db_url = config.database;// 'mongodb://localhost:27017/youzatesting';

    mongoose.connect(dev_db_url, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.Promise = global.Promise;
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    let signupsource = new SignupSource();
    signupsource.email = _signupData.email;
    signupsource.source = _signupData.source;
    try {
        responseData.isError = false;
        responseData.Data = new Array();
        signupsource.save(function (err) {
            if (err) {
                db.close();
                return res.json(err);
            } else {
                db.close();

                sendEmail(getMailTransport(), getCustomerMailOptions(true, _signupData));
                sendEmail(getMailTransport(), getAdminMailOptions(true, _signupData));
                console.log('response', responseData)
                checkResponses(res);

            }
        })
    } catch (error) {
        res.status(500).send(error)
    }


})


app.get('/signupdata', (req, res) => {

    let dev_db_url = 'mongodb://localhost:27017/youzatesting';
    mongoose.connect(dev_db_url, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.Promise = global.Promise;
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    SignupSource.find({}, function (err, product) {
        if (err) {
            db.close();
            return res.send(err);
        } else {
            db.close();
            res.send(product);
        }


    });

})



app.post('/isEmailExist', (req, res) => {
    console.log('came')
    if (req.body.email === undefined || req.body.email === null) {
        return res.status(403).send('Invalid request. Expecting email as body in request');
    }
    let dev_db_url = config.database;// 'mongodb://localhost:27017/youzatesting';

    mongoose.connect(dev_db_url, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.Promise = global.Promise;
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    try {
        isfound = false;
        User.findOne({ 'email': req.body.email },
            function (err, result) {
                if (err) { /* handle err */ }

                if (result) {
                    isfound = true;
                    //res.send('Email exists')    ;
                } else {
                    isfound = false;
                }
            });
        FreeSignUp.findOne({ 'email': req.body.email },
            function (err, result) {
                if (err) { /* handle err */ }

                if (result) {
                    isfound = true;
                    //res.send('Email exists')    ;
                } else {
                    isfound = false
                }
            });
        db.close();
        if (isfound) {
            res.send({ valid: false, message: 'taken' });
        } else {
            res.send({ valid: true, message: 'ok' });
        }

    } catch (error) {
        db.close();
        res.status(500).send(error)
    }

})

app.post('/sendConfirm', (req, res) => {
    if (req.body.email === undefined || req.body.email === null) {
        return res.status(403).send('Invalid request. Expecting email as body in request');
    }

    console.log(req.body.email)
    let _freesignup = req.body;
    let dev_db_url = config.database;// 'mongodb://localhost:27017/youzatesting';

    mongoose.connect(dev_db_url, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.Promise = global.Promise;
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    let freesignup = new FreeSignUp();
    freesignup.email = _freesignup.email;
    freesignup.name = _freesignup.name;
    freesignup.phone = _freesignup.phone;
    freesignup.company = _freesignup.company;
    freesignup.companywebsite = _freesignup.companywebsite;
    freesignup.trackId = uuidv4();
    freesignup.isVerified = false;
    try {
        responseData.isError = false;
        responseData.Data = new Array();
        freesignup.save(function (err) {
            if (err) {
                db.close();
                return res.json(err);
            } else {

                db.close();
                //res.send('success')
                sendEmail(getMailTransport(), getConfirmationEmailOptions(false, freesignup));
                sendEmail(getMailTransport(), getConfirmationEmailOptions(true, freesignup));
                console.log('response', responseData)
                checkResponses(res);

            }
        })
    } catch (error) {
        res.status(500).send(error)
    }

})

app.get('/activate', (req, res) => {
    console.log('reqqqqq', req.query)
    if (!isValidEmail(req.query.ref)) {
        res.status(404).send('Invalid Email ===>' + req.query.ref);
    }
    else {
        let dev_db_url = 'mongodb://localhost:27017/youzatesting';
        mongoose.connect(dev_db_url, { useNewUrlParser: true, useUnifiedTopology: true });
        mongoose.Promise = global.Promise;
        let db = mongoose.connection;
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));        
        FreeSignUp.findOneAndUpdate(
            { email: req.query.ref, trackId: req.query.t, isVerified: false }, // query                
            { $set: { isVerified: true } }, // replacement, replaces only the field "isVerified",
            { "new": true })
            .exec()
            .then(object => {

                if (object === null || object === undefined) {
                    console.log('not found')
                    res.send(` <br/> <br/> Email verification Not happen  <br/> <br/>
        <b>Possible Reasons</b>
         <br/> 
        <br/>
        <li> Email has been already verified</li> <br/>
        <li> Invalid Request</li> <br/>
        `)
                } else {
                    console.log('lllllllllllll', object)
                    _tempPwd = Math.random().toString(36).slice(-8);
                    let _user = new User();
                    _user.email = object.email;
                    _user.username = object.name;
                    _user.phone_no = object.phone;
                    _user.company_name = object.company;
                    _user.website = object.companywebsite;
                    _user.isverify = true;
                    _user.isVerifiedByAdmin = true;
                    _user.password = _tempPwd;
                    _user.pwdchangeonfirstlogin = 'NotChanged';
                    _user.save((e, o) => {
                        if (e) {
                            res.status(404).send('Error Occurred While inserting Data from Freesignup to User table...' + err);
                        } else {
                            sendEmail(getMailTransport(), getTempPwdEmail(false, _user));
                            res.send('Email has been verified successfully. Please <a href="https://admin.yovza.com/auth/login">Login</a> ')
                        }
                        db.close();
                    })
                }


            })

        

    }
})
app.listen(3900);
console.log('port', 3900)

