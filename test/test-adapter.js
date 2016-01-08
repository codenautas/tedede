"use strict";

var toTest = {
    "text": {
        validData:[
            {value:null        , display:''          , valueEmpty:false, htmlDisplay: ''         },
            {value:'hello'     , display:'hello'     , valueEmpty:false, htmlDisplay: 'hello'    },
            {value:'hi\nWorld' , display:'hi\nWorld' , valueEmpty:false, htmlDisplay: 'hi\nWorld', multiline:true},
            {value:''          , display:''          , valueEmpty:true , htmlDisplay: ''         }
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            // {value:'sarasa'},
            // {value:'0'},
            {value:0},
            {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }, 
    "number": {
        validData:[
            {value:null        , display:''          , },
            {value:42          , display:'42'        , },
            {value:0           , display:'0'         , },
            {value:12345.125   , display:'12345.125' , htmlDisplay: 
                '<span class="number_miles">12</span>'+
                '<span class="number_miles">345</span>'+
                '<span class="number_dot">.</span>'+
                '<span class="number_decimals">125</span>'    
            },
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            // {value:0},
            // {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    },
    "date": {
        validData:[
            {value:null                   , display:'' },
            {value:new Date(2015,12-1,31) , display:'31/12/2015'  , htmlDisplay:
                '<span class="date_day">31</span>'+
                '<span class="date_sep">/</span>'+
                '<span class="date_month">12</span>'+
                '<span class="date_sep">/</span>'+
                '<span class="date_year">2015</span>',
                valueISO: '2015-12-31'
            },
        ],
        invalidData:[
            {value:true},
            // {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            {value:0},
            {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    },
    "boolean": {
        validData:[
            {value:null , display:''  , htmlDisplay:''},
            {value:true , display:'Sí', htmlDisplay:'<span class="bool_true">Sí</span>' },
            {value:false, display:'no', htmlDisplay:'<span class="bool_false">no</span>'},
        ],
        invalidData:[
            // {value:true},
            {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            {value:0},
            {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    } 
};

toTest["text_no_empty"] = changing(toTest["text"],{});
toTest["text_no_empty"].validData = toTest["text"].validData.filter(function(data){ return data.value !=='' && !data.multiline; });
toTest["text_no_empty"].invalidData = toTest["text"].invalidData.concat({value:'', errRegexp:/text cannot be empty/});

describe("adapter",function(){
    describe.skip("for text without empty strings",function(){
        var inputElement;
        var divElement;
        beforeEach(function(done){
            inputElement = html.input().create();
            divElement = html.div().create();
            Tedede.adaptElement(inputElement,'text_no_empty');
            Tedede.adaptElement(divElement,'text_no_empty');
            done();
        });
        it("sets and get normal string in input",function(){
            inputElement.setTypedValue('the value');
            expect(inputElement.value).to.be('the value');
            expect(inputElement.getTypedValue()).to.be('the value');
        });
        it("set and gets null in input",function(){
            inputElement.setTypedValue(null);
            expect(inputElement.value).to.be('');
            expect(inputElement.getTypedValue()).to.be(null);
        });
        it("sets and get normal string in div",function(){
            divElement.setTypedValue('the value');
            expect(divElement.textContent).to.be('the value');
            expect(divElement.getTypedValue()).to.be('the value');
        });
        it("set and gets null in div",function(){
            divElement.setTypedValue(null);
            expect(divElement.textContent).to.be('');
            expect(divElement.getTypedValue()).to.be(null);
        });
        it("reject invalid value",function(){
            divElement.setTypedValue('untouch');
            sinon.stub(divElement,'validateTypedData', function(data){
                expect(data).to.be('alfa');
                throw new Error('invalid data "alfa"');
            });
            expect(function(){
                divElement.setTypedValue('alfa');
            }).to.throwError(/invalid data "alfa"/);
            expect(divElement.getTypedValue()).to.be('untouch');
            divElement.validateTypedData.restore();
        });
        it("reject empty value",function(){
            divElement.setTypedValue('untouched');
            expect(function(){
                divElement.setTypedValue('');
            }).to.throwError(/text cannot be empty/);
            expect(divElement.getTypedValue()).to.be('untouched');
        });
    });
    describe("when addapt element with options must control that the name does not repeats",function(){
        it("must control that tedede-option-group == id",function(){
            var theElement=html.div({id:'bool21', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool2', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ]).create();
            document.body.appendChild(theElement);
            expect(function(){
                Tedede.adaptElement(theElement, "boolean");
            }).to.throwError(/tedede-option-group must match id/);
        });
        it("must control that tedede-option-group == name",function(){
            var theElement=html.div({id:'bool2', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool22', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ]).create();
            document.body.appendChild(theElement);
            expect(function(){
                Tedede.adaptElement(theElement, "boolean");
            }).to.throwError(/tedede-option-group must match name of radiobuttons/);
        });
        it("must control that option tagName == 'input'",function(){
            var theElement=html.div({id:'bool2', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.button({type:'radio', name:'bool2', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ]).create();
            document.body.appendChild(theElement);
            expect(function(){
                Tedede.adaptElement(theElement, "boolean");
            }).to.throwError(/option of tedede-option-group must be a input.type radio/);
        });
        it.skip("must control that option type='radio'",function(){
            var theElement=html.div({id:'bool2', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.input({type:'checkbox', name:'bool2', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ]).create();
            document.body.appendChild(theElement);
            expect(function(){
                Tedede.adaptElement(theElement, "boolean");
            }).to.throwError(/option of tedede-option-group must be a input.type radio/);
        });
        it.skip("must control options must be childs of respective tedede-option-group",function(){
            var theElement1=html.div({id:'bool2', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool1-true' }), html.label({"for":'bool1-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool2', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ]).create();
            var theElement2=html.div({id:'bool1', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool2', value:'false', id:'bool1-false'}), html.label({"for":'bool1-false'},"No"),
            ]).create();
            document.body.appendChild(theElement1);
            document.body.appendChild(theElement2);
            expect(function(){
                Tedede.adaptElement(theElement1, "boolean");
            }).to.throwError(/options must be childs of respective tedede-option-group/);
        })
        it.skip("must control options must be childs of respective tedede-option-group in identical create",function(){
            var theElement1=html.div({id:'bool2', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool2', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ]).create();
            var theElement2=html.div({id:'bool2', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool2', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ]).create();
            document.body.appendChild(theElement1);
            document.body.appendChild(theElement2);
            expect(function(){
                Tedede.adaptElement(theElement1, "boolean");
            }).to.throwError(/options must be childs of respective tedede-option-group/);
        })
        it.skip("must control no others elements with the same name",function(){
            var theElement1=html.div({id:'bool2', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool2', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ]).create();
            var theElement2=html.div({id:'bool1', "tedede-option-group": "bool1"},[
                html.input({type:'radio', name:'bool1', value:'true' , id:'bool1-true' }), html.label({"for":'bool1-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool1', value:'false', id:'bool1-false'}), html.label({"for":'bool1-false'},"No"),
                html.input({type:'button', name:'bool2', value:'false', id:'bool1-x'}), html.label({"for":'bool1-x'},"No"),
            ]).create();
            document.body.appendChild(theElement1);
            document.body.appendChild(theElement2);
            expect(function(){
                Tedede.adaptElement(theElement1, "boolean");
            }).to.throwError(/invalid option with the same tedede-option-group/);
        })
    });
    describe.skip("boolean with options implemented with radiobuttons",function(){
        var theElement;
        beforeEach(function(){
            theElement=html.div({id:'bool2', "tedede-option-group": "bool2"},[html.div([
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool2', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false'},"No"),
            ])]).create();
            document.body.appendChild(theElement);
            Tedede.adaptElement(theElement, "boolean");
        });
        it("must be null by default",function(){
            expect(document.getElementById('bool2-true').checked).to.be(false);
            expect(document.getElementById('bool2-false').checked).to.be(false);
            expect(theElement.getTypedValue()).to.be(null);
        });
        it("must get true for true",function(){
            theElement.setTypedValue(true);
            expect(document.getElementById('bool2-true').checked).to.be(true);
            expect(document.getElementById('bool2-false').checked).to.be(false);
            expect(theElement.getTypedValue()).to.be(true);
        });
        it("must get false for false and can change",function(){
            theElement.setTypedValue(false);
            expect(document.getElementById('bool2-true').checked).to.be(false);
            expect(document.getElementById('bool2-false').checked).to.be(true);
            expect(theElement.getTypedValue()).to.be(false);
            theElement.setTypedValue(null);
            expect(document.getElementById('bool2-true').checked).to.be(false);
            expect(document.getElementById('bool2-false').checked).to.be(false);
            expect(theElement.getTypedValue()).to.be(null);
            theElement.setTypedValue(true);
            expect(document.getElementById('bool2-true').checked).to.be(true);
            expect(document.getElementById('bool2-false').checked).to.be(false);
            expect(theElement.getTypedValue()).to.be(true);
            theElement.setTypedValue(false);
            expect(document.getElementById('bool2-true').checked).to.be(false);
            expect(document.getElementById('bool2-false').checked).to.be(true);
            expect(theElement.getTypedValue()).to.be(false);
        });
    });
    Object.keys(BestTypes).forEach(function(typeName){ BestTypes[typeName].domFixtures.forEach(function(def){
        describe("for type '"+typeName+"' and fixture "+JSON.stringify(def), function(){
            var theElement;
            var theElementErr;
            var skip;
            beforeEach(function(done){
                try{
                    theElement = Tedede.createFromFixture(def).create();
                }catch(err){
                    theElementErr = err;
                    theElement = null;
                }
                skip = NOT_SUPPORTED_SITUATION({
                    when: def.attributes.type==='date',
                    must: theElement && theElement.type==='date',
                    description: 'input of type date',
                    excluding: 'Firefox 31.0, Firefox 39.0, Firefox 43.0, IE 11.0'.split(', '),
                    context: theElementErr
                });
                if(!skip){
                    Tedede.adaptElement(theElement,typeName);
                    document.body.appendChild(theElement);
                }
                done();
            });
            toTest[typeName].validData.map(function(data){
                it("sets and get "+data.value+" in "+def.tagName,function(){
                    if(skip) return;
                    theElement.setTypedValue(data.value);
                    if('htmlDisplay' in data && (def.tagName!=='input' && def.tagName!=='textarea')){
                        expect(theElement.innerHTML).to.be(data.htmlDisplay);
                    }
                    if(!data.multiline){
                        var inspect = def.tagName==='input' || def.tagName==='textarea'?'value':'textContent';
                        if(def.attributes.type==='checkbox'){
                            expect(theElement.indeterminate).to.be(data.value===null);
                            expect(theElement.checked).to.be(data.value===true);
                        }else if(def.attributes.type==='date' && data.value!=null){
                            expect(theElement.value).to.eql(data.valueISO);
                        }else{
                            expect(theElement[inspect]).to.eql('display' in data?data.display:data.value);
                        }
                    }
                    expect(theElement.getTypedValue()).to.eql(data.value);
                    if(typeName==='text'){
                        expect(theElement.valueEmpty).to.eql(data.valueEmpty);
                    }
                });
            });
            toTest[typeName].invalidData.forEach(function(def){
                it("reject invalid value "+def.value,function(){
                    if(skip) return;
                    var UNTOUCH = toTest[typeName].validData[1].value;
                    theElement.setTypedValue(UNTOUCH);
                    expect(function(){
                        theElement.setTypedValue(def.value);
                    }).to.throwError(def.errRegexp||/Not a .* in input/);
                    expect(theElement.getTypedValue()).to.eql(UNTOUCH);
                });
            });
        });
    }); });
});