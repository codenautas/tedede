"use strict";

var PORT = 43091;

var Path = require('path');
var winOS = Path.sep==='\\';

var _ = require('lodash');
var express = require('express');
var app = express();
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var session = require('express-session');
// var Promises = require('best-promise');
// var fs = require('fs-promise');
// var readYaml = require('read-yaml-promise');
var extensionServeStatic = require('extension-serve-static');
// var jade = require('jade');

// app.use(cookieParser());
// app.use(bodyParser.urlencoded({extended:true}));

var html = require('js-to-html').html;

app.get('/demo', function(req,res){
    res.end(html.html([
        html.head([
        //link rel="stylesheet" type="text/css" href="mystyle.css"> </head>.
            html.link({rel:'stylesheet', type:'text/css', href:'pdemo.css'}),
        ]),
        html.body([
            html.h1("tedede demo for phantom"),
            html.div([
                html.input({type: "checkbox", id:"bool1"}),
                html.label({"for": "bool1"}, "has tri-state booleans"),
            ]),
            html.div([
                html.label({"for": "text1"}, "text with empty"),
                html.input({type: "text", id:"text1", "accesskey": "t"}),
            ]),
            html.pre({id: "messages"}),
            html.script({src:'lib3/best-globals.js'}),
            html.script({src:'lib2/js-to-html.js'}),
            html.script({src:'lib/tedede.js'}),
            html.script({src:'pdemo-client.js'}),
        ])
    ]).toHtmlDoc({title:'tedede demo'}));
});


app.use('/lib3',extensionServeStatic('./node_modules/best-globals', {staticExtensions: ['js']}));
app.use('/lib2',extensionServeStatic('./node_modules/js-to-html', {staticExtensions: ['js']}));
app.use('/lib',extensionServeStatic('./lib', {staticExtensions: ['js']}));

app.use('/',extensionServeStatic('./server', {
    extensions: ['html', 'htm'], 
    index: 'index.html', 
    staticExtensions: ['', 'html', 'htm', 'png', 'jpg', 'jpeg', 'gif', 'js', 'css']
})); 

var pidPhantom;

var server = app.listen(PORT, function(){
    console.log('Listening on port %d', server.address().port);
    console.log('launch phantom');
    var spawn = require('child_process').spawn;
    pidPhantom = spawn(
        (process.env.TRAVIS?'phantomjs':'./node_modules/phantomjs/lib/phantom/'+(winOS?'phantomjs.exe':'bin/phantomjs')),
        ['./server/ptest.js'].concat(process.argv.map(function(arg){ return arg.substr(0,5)=='--p--'?arg.substr(3):''})),
        { stdio: 'inherit' }
    );
    pidPhantom.on('close', function (code, signal) {
        console.log('Phantom closed', code, signal);
        pidPhantom = null;
        process.exit();
    });
    console.log('all launched');
});

process.on('exit', function(code){
    console.log('process exit',code);
    if(pidPhantom){
        pidPhantom.kill('SIGHUP');
        console.log('SIGHUP sended to phantom');
    }else{
        console.log('phantom already closed');
    }
});


process.on('uncaughtException', function(err){
    console.log('process NOT CAPTURED ERROR',err);
    console.log(err.stack);
    process.exit(1);
});
