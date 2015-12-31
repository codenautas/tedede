"use strict";

var Tedede={};

var html=jsToHtml.html;
var coalesce = bestGlobals.coalesce;

Tedede.Form = function Form(formInfo, medium){
    this.info=formInfo;
    this.medium=medium;
}

Tedede.Form.prototype.render = function render(container){
    var formHtml=html.div({id: JSON.stringify(this.medium.superId)},
        this.info.fields.map(function(field){
            return html.div({id:'div_'+field.name},[
                html.label({"for":field.name},field.name), 
                html.input({id:field.name})
            ]);
        })
    );
    var div=formHtml.create();
    this.dom=div;
    if(!this.medium.forms){
        this.medium.forms=[];
    }
    this.medium.forms.push(this);
    container.appendChild(div);
    return Promise.resolve();
}

Tedede.createForm = function createForm(formInfo, data){
    var form = new this.Form(formInfo, data);
    return form;
}

var BestTypes = {};

BestTypes["text"] = {
    translates:{true:{
        '\n': '\u21b5'
    },false:{}},
    translatesRegExp:{},
    translatesRev:{},
    translate: function(right, textValue){
        return textValue.replace(new RegExp(BestTypes["text"].translatesRegExp[right],'g'),function(chartt){
            return BestTypes["text"].translates[right][chartt];
        });
    },
    adapters:{
        validateTypedData: function validateTypedDataNoObjectAccepted(typedValue){
            if(typedValue!==null && typeof typedValue !== 'string'){
                throw new Error("Not a string value");
            }
        },
        getTypedValue: function getTypedValueText(){
            var typedValue = this.getPlainValue();
            if(this.tagName==='INPUT' && typedValue!==null){
                typedValue = BestTypes["text"].translate(false, typedValue);
            }
            if(typedValue==null && this.valueEmpty){
                return '';
            }else{
                return typedValue;
            }
        },
        setValidatedTypedValue: function setValidatedTypedValueText(typedValue){
            if(this.tagName==='INPUT' && typedValue!=null){
                typedValue = BestTypes["text"].translate(true, typedValue);
            }
            if(this.tagName==='TEXTAREA' && typedValue==null){
                this.setPlainValue('');
            }else{
                this.setPlainValue(typedValue);
            }
            this.valueEmpty = typedValue==='';
        },
    },
    domFixtures:[
        {tagName:'div'     , attributes:{}},
        {tagName:'input'   , attributes:{type:'text'}},
        {tagName:'textarea', attributes:{}},
    ]
};

for(var charToTranslate in BestTypes["text"].translates[true]){
    BestTypes["text"].translates[false][BestTypes["text"].translates[true][charToTranslate]] = charToTranslate;
}

for(var groups in BestTypes["text"].translates){
    BestTypes["text"].translatesRegExp[groups] = '['+Object.keys(BestTypes["text"].translates[groups])+']';
}

BestTypes["text_no_empty"] = {
    adapters:{
        validateTypedData: function validateTypedDataTextNoEmpty(typedValue){
            if(typedValue===''){
                throw new Error('text cannot be empty');
            }
        },
        getTypedValue: function getTypedValueText(){
            return this.getPlainValue();
        },
        setValidatedTypedValue: function setValidatedTypedValueTextNoEmpty(typedValue){
            this.setPlainValue(typedValue);
        },
    },
    domFixtures:BestTypes["text"].domFixtures
};

BestTypes["number"] = {
    adapters:{
        validateTypedData: function validateTypedDataNumber(typedValue){
            if(isNaN(typedValue)){
                throw new Error('Not a Number in input');
            }
        },
        getTypedValue: function getTypedValueNumber(){
            var value = this.getPlainValue();
            if(value===null){
                return null;
            }else{
                value = Number(value);
            }
            
            return value;
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyNumber(typedValue){
            if(typedValue==null){
                this.setPlainValue(typedValue);
            }else if('value' in this){
                this.value = typedValue.toString();
            }else{
                var str = typedValue.toString();
                var formated = str.replace(/^([-+]?[0-9 ]*)((\.)([0-9 ]*))?$/, function(str, left, dotPart, dot, right){
                    var rta = [];
                    left.replace(/^([-+]?[0-9]?[0-9]?)(([0-9][0-9][0-9])*)$/, function(str, prefix, triplets){
                        rta.push(html.span({"class": "number_miles"}, prefix));
                       
                        triplets.replace(/[0-9][0-9][0-9]/,function(triplet){
                            rta.push(html.span({"class": "number_miles"}, triplet));
                        });
                    });
                    if(dot){
                        rta.push(html.span({"class": "number_dot"},dot));
                    }
                    if(right){
                        rta.push(html.span({"class": "number_decimals"},right));
                    }
                    return rta.map(function(x){ return x.toHtmlText(); }).join('');
                });
                
                this.innerHTML = formated;
            }
        },
    },
    domFixtures:[
        {tagName:'div'     , attributes:{}},
        {tagName:'input'   , attributes:{type:'text'}},
        {tagName:'input'   , attributes:{type:'number'}},
    ]
};

BestTypes["boolean"] = {
    adapters:{
        validateTypedData: function validateTypedDataBoolean(typedValue){
            if(typedValue!==false && typedValue!==true && typedValue!=null){
                throw new Error('Not a boolean in input');
            }
        },
        getTypedValue: function getTypedValueBoolean(){
            if(this.type==='checkbox'){
                return this.indeterminate?null:this.checked;
            }else{
                var value = this.getPlainValue();
                if(value==null){
                    return null;
                }else{
                    return value[0]!=='n';
                }
            }
            
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyBoolean(typedValue){
            if(this.type==='checkbox'){
                this.checked = typedValue;
                this.indeterminate = typedValue==null;
            }else{
                var plainValue = typedValue==null?'':(typedValue?'Sí':'no');
                this.setPlainValue(plainValue);
                if(this.tagName!=='INPUT'){
                    if(typedValue!==null){
                        this.innerHTML = html.span({"class": "bool_"+JSON.stringify(typedValue)}, plainValue).toHtmlText();
                    }
                }
            }
        },
    },
    listeners:{
        'keydown': function onKeyDownListenerForBoolean(event){
            if(this.type==='checkbox' && (event.keyCode == 8 || event.keyCode == 46)){
                this.checked = false;
                this.indeterminate = true;
                event.preventDefault();
            }
        },
        'click': function onClickListenerForBoolean(event){
            if(this.type==='checkbox'){
                this.focus();
            }
        }
    },
    domFixtures:[
        {tagName:'div'     , attributes:{}},
        {tagName:'input'   , attributes:{type:'text'}},
        {tagName:'input'   , attributes:{type:'checkbox'}},
    ]
};

BestTypes["date"] = {
    adapters:{
        validateTypedData: function validateTypedDataDate(typedValue){
            if(typedValue!=null && !(typedValue instanceof Date)){
                throw new Error('Not a date in input');
            }
        },
        getTypedValue: function getTypedValueDate(){
            var plainValue = this.getPlainValue();
            if(plainValue==null){
                return null;
            }else if (this.type==='date') {
                var parts = plainValue.split(/[-\/]/);
                var value= new Date(parts[0],parts[1]-1,parts[2]);
            }else{
                var parts = plainValue.split(/[-\/]/);
                return new Date(parts[2],parts[1]-1,parts[0]);
            }
            return value;
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyDate(typedValue){
             if(typedValue==null){
                this.setPlainValue(typedValue);
            }else if(this.type==='date'){
                this.value = typedValue.toISOString().substr(0,10);
            }else{
                var month = typedValue.getUTCMonth()+1; 
                var day = typedValue.getUTCDate();
                var year = typedValue.getUTCFullYear();
                this.setPlainValue(day+'/'+month+'/'+year);
                if(this.tagName!=='INPUT'){
                    var rta=[];
                    rta.push(html.span({"class":"date_day"},day));
                    rta.push(html.span({"class":"date_sep"},'/'));
                    rta.push(html.span({"class":"date_month"},month));
                    rta.push(html.span({"class":"date_sep"},'/'));
                    rta.push(html.span({"class":"date_year"},year));
                    rta = rta.map(function(x){ return x.toHtmlText(); }).join('');
                   // console.log("QUE ES ESO     =  " + JSON.stringify(rta));
                    this.innerHTML = rta;
                }
            }
            
        },
    },
    listeners:{
        'keydown': function onKeyDownListenerForDate(event){
            if(event.keyCode == 72) {
                if(this.type==='date' || this.type ==='text'){
                    this.setTypedValue(new Date(Date.now()));
                } else if(this.tagName!=='INPUT') {
                    this.setValidatedTypedValue(new Date(Date.now()));
                }
                event.preventDefault();
            } 
        }
    },
    domFixtures:[
        {tagName:'div'     , attributes:{}},
        {tagName:'input'   , attributes:{type:'text'}},
        {tagName:'input'   , attributes:{type:'checkbox'}},
    ]
};

Tedede.adaptElement = function adaptElement(domElement, typeName){
    var dataAttr=domElement.tagName==='INPUT' || domElement.tagName==='TEXTAREA'?'value':'textContent';
    if(dataAttr==='textContent'){
        domElement.contentEditable = true;
    }
    domElement.getPlainValue = function getPlainValue(plainValue){
        return this[dataAttr]===''?null:this[dataAttr];
    }
    domElement.setPlainValue = function setPlainValue(plainValue){
        this[dataAttr] = plainValue;
    }
    domElement.setTypedValue = function setTypedValue(typedValue){
        this.validateTypedData(typedValue);
        this.setValidatedTypedValue(typedValue);
    }
    for(var attr in BestTypes[typeName].adapters){
        domElement[attr] = BestTypes[typeName].adapters[attr];
    }
    for(var listenerName in BestTypes[typeName].listeners || {}){
        domElement.addEventListener(listenerName, BestTypes[typeName].listeners[listenerName]);
    }
}

Tedede.createFromFixture = function createFromFixture(fixture){
    var thisModule = this;
    return html[fixture.tagName].call(html,fixture.attributes,(fixture.content||[]).map(function(subFixture){
        return thisModule.createFromFixture(subFixture);
    }));
}

Tedede.connect = function connect(opts){
    opts.input.value = opts.almacen[opts.field];
}
