"use strict";

var PORT = 43091;

var Path = require('path');
var winOS = Path.sep==='\\';

// var _ = require('lodash');
var express = require('express');
var app = express();

var coverageON = process.argv.indexOf('--coverage') !== -1 && !"no more coverage collect";

if(coverageON) {
    var urlParse = require('url').parse;
    var im = require('istanbul-middleware');
}

var bodyParser = require('body-parser');
var serveContent = require('serve-content');
       
var html = require('js-to-html').html;
var changing = require('best-globals').changing;

function coverageMatcher(req) {
    var parsed = urlParse(req.url);
    var r = (parsed.pathname && parsed.pathname.match(/\.js$/) && parsed.pathname.match(/\/lib\//)) ? true : false;
    //console.log("url", parsed.pathname, r);
    return r;
}

function coveragePathTransformer(req) {
    return function (req) {
        var parsed = urlParse(req.url),
            pathName = parsed.pathname;
        var r = pathName;
        if (pathName && pathName.match(/\/lib\/typed-controls.js/)) {
            r = Path.resolve('./lib/typed-controls.js');
        } else {
            r = Path.normalize(__dirname + r);
        }
        //console.log("r", r, __dirname)
        return r;
    }(req);
}

if(coverageON) {
    console.log('Activando coverage');
    im.hookLoader(__dirname, { verbose: true });
    app.use('/coverage', im.createHandler({ verbose: true, resetOnGet: true }));
    app.use(im.createClientHandler(__dirname, { matcher:coverageMatcher, pathTransformer:coveragePathTransformer }));
}

app.get('/demo', function(req,res){
    res.end(html.html([
        html.head([
        //link rel="stylesheet" type="text/css" href="mystyle.css"> </head>.
            html.link({rel:'stylesheet', type:'text/css', href:'pdemo.css'}),
        ]),
        html.body({id:'elBody'},[
            html.h1("typed-controls demo for browser"),
            ('checkbox-based-controls-not-ready'?null:
                html.div([
                    html.input({type: "checkbox", id:"bool1"}),
                    html.label({"for": "bool1"}, "has tri-state booleans"),
                ])
            ),
            html.div([
                html.label({"for": "text1"}, "text with empty"),
                html.input({type: "text", id:"text1", "accesskey": "t"}),
            ]),
            ('options-based-controls-not-ready'?null:
                html.div({id:'bool2', "typed-controls-option-group": "bool2"},[
                    html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' ,id:'label-bool2-true' },"Sí"), html.br(),
                    html.input({type:'radio', name:'bool2', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false',id:'label-bool2-false'},"No"),
                ])
            ),
            html.input({type: "text", id:"txtEmiter"}),
            html.pre({id: "messages"}),
            html.div([
                html.label({"for": "number1"}, "number:"),
                html.input({type: "text", id:"number1"}),
            ]),
            html.div([
                html.label({"for": "number2"}, "number:"),
                html.div({id:"number2", "typed-controls-direct-input":true}),
            ]),
            html.div({style:"width:100px", "typed-controls-direct-input":true, id:'textDiv'},"with nl\n"),
            html.script({src:'lib10/pikaday.js'}),
            html.script({src:'lib6/big.js'}),
            html.script({src:'lib11/dialog-promise.js'}),
            html.script({src:'lib4/require-bro.js'}),
            html.script({src:'lib8/like-ar.js'}),
            html.script({src:'lib3/best-globals.js'}),
            html.script({src:'lib7/json4all.js'}),
            html.script({src:'lib5/postgres-interval4client.js'}),
            html.script({src:'lib2/js-to-html.js'}),
            html.script({src:'lib9/discrepances.js'}),
            html.script({src:'lib5/type-store.js'}),
            html.script({src:'lib/typed-controls.js'}),
            html.script({src:'pdemo-client.js'}),
        ])
    ]).toHtmlDoc({title:'typed-controls demo'}));
});

app.use('/lib11',serveContent('./node_modules/dialog-promise/lib', {allowedExts: ['js']}));
app.use('/lib10',serveContent('./node_modules/pikaday', {allowedExts: ['js']}));
app.use('/lib9',serveContent('./node_modules/discrepances/lib', {allowedExts: ['js']}));
app.use('/lib8',serveContent('./node_modules/like-ar', {allowedExts: ['js']}));
app.use('/lib7',serveContent('./node_modules/json4all', {allowedExts: ['js']}));
app.use('/lib6',serveContent('./node_modules/big.js', {allowedExts: ['js']}));
app.use('/lib5',serveContent('./node_modules/type-store', {allowedExts: ['js']}));
app.use('/lib4',serveContent('./node_modules/require-bro/lib', {allowedExts: ['js']}));
app.use('/lib3',serveContent('./node_modules/best-globals', {allowedExts: ['js']}));
app.use('/lib2',serveContent('./node_modules/js-to-html/lib', {allowedExts: ['js']}));
app.use('/lib',serveContent('./lib', {allowedExts: ['js']}));

app.use('/',serveContent('./server', {
    extensions: ['html', 'htm'], 
    index: 'index.html', 
    allowedExts: ['', 'html', 'htm', 'png', 'jpg', 'jpeg', 'gif', 'js', 'css']
})); 

var pidBrowser;

var server = app.listen(PORT, function(){
    console.log('Listening on port %d', server.address().port);
    console.log('launch browser');
    var spawn = require('child_process').spawn;
    var args = process.argv;
    var phantomPath=process.env.TRAVIS && process.env.TRAVIS_NODE_VERSION<'4'?'phantomjs':'./node_modules/phantomjs-prebuilt/lib/phantom/'+(winOS?'bin/phantomjs.exe':'bin/phantomjs');
    var slimerPath=process.env.TRAVIS?'slimerjs':'./node_modules/slimerjs/lib/slimer/'+(winOS?'slimerjs.bat':'bin/slimerjs');
    
    pidBrowser = spawn(
        (process.env.TRAVIS && false?'casperjs':'./node_modules/casperjs/bin/'+(winOS?'casperjs.exe':'casperjs')),
        ['test',
         '--verbose',
         // '--loglevel=debug',
         //'--value=true',
         //'--engine=slimerjs',
         //'--fail-fast',
         Path.resolve('./server/ctest.js')
        ],
        { stdio: 'inherit' , env: changing(process.env,{PHANTOMJS_EXECUTABLE: phantomPath, SLIMERJS_EXECUTABLE:slimerPath},changing.options({mostlyPlain:true}))}
        // { stdio: 'inherit' , env: {PHANTOMJS_EXECUTABLE: phantomPath, SLIMERJS_EXECUTABLE:slimerPath}}
    );
    /*
    pidBrowser = spawn(
        'node',
        [Path.normalize('d:/cnautas/prog.js')],
        { stdio: 'inherit' , cwd: process.cwd()}
    );
    */
    pidBrowser.on('close', function (code, signal) {
        console.log('browser closed', code, signal);
        pidBrowser = null;
        if(!(process.argv.indexOf('--hold')>0)){
            process.exit(code);
        }
    });
    console.log('all launched');
});

process.on('exit', function(code){
    console.log('process exit',code);
    if(pidBrowser){
        pidBrowser.kill('SIGHUP');
        console.log('SIGHUP sended to browser');
    }else{
        console.log('browser already closed');
    }
});


process.on('uncaughtException', function(err){
    console.log('process NOT CAPTURED ERROR',err);
    console.log(err.stack);
    process.exit(1);
});

