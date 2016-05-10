"use strict";

describe("create-from-fixture",function(){
    it("create simple element", function(){
        var element = Tedede.createFromFixture({tagName:'span', attributes:{}});
        expect(element).to.eql(html.span());
        element.create();
    });
    it("create simple element with attributes", function(){
        var element = Tedede.createFromFixture({tagName:'b', attributes:{"class": "the-class"}});
        expect(element).to.eql(html.b({"class": "the-class"}));
        element.create();
    });
    it("create complex elements", function(){
        var element = Tedede.createFromFixture(
            {tagName:'i', attributes:{}, content:[
                {tagName:'span', attributes:{}},
                {tagName:'b', attributes:{"class": "the-class"}}
            ]}
        );
        expect(element).to.eql(
            html.i([
                html.span(),
                html.b({"class": "the-class"})
            ])
        );
        element.create();
    });
    it("funcion Tedede.optionsCtrl",function(){
        var typeInfo={
            typeName:"enum",
            showOption: true,
            options:[
                {option: 'a', label: 'es una vocal'      },
                {option: 'b', label: 'es una consonante' },
            ]
        };
        var element=Tedede.optionsCtrl(typeInfo);
        var esperado=html.div({"tedede-option-group": 'simple-option'},[
            html.div([
                html.label({"for-value": 'a'},'a'),
                html.input({type:'radio', value:'a'}),
                html.label({"for-value": 'a'},'es una vocal')
            ]),
            html.div([
                html.label({"for-value": 'b'},'b'),
                html.input({type:'radio', value:'b'}),
                html.label({"for-value": 'b'},'es una consonante')
            ])
        ]);
        expect(element).to.eql(esperado)
    })
});
