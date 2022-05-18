# Rule Engine

## Philosophy
* Rule Engine is created to provide dynamic rule configuration as per the users requirement.  
* User can control what conditions to use, what result to be sent if conditions are met.  
* Rules can have priorities assigned to it.  

## Features
* Define multiple rules.
* Supports complex expressions.
* Priority based evaluation of rules.
* Evaluates Relation and Mathematical Operators ( '>','<','>=','<=','==','!=')
* Evaluates Logical Operators (AND and OR)
* Evaluates Array Based Operators ('~=' one of)

## Usage
```
try {
    let result = EvaluateRules(variables,ruleEngineObj);
    console.log(result);
}
catch (error) {
    console.log(error.message);
}
```

## Function Parameters for EvaluateRules

### Variables (variables)
- Variable is JSON object of variables against which expression needs to be evaluated.
- `{ var1:1, var2:'test'}`

### Rule Engine Object (ruleEngineObj)

```
{
        "rules" : [{
                    name:"rule1",
                    expression:"var1>=1 AND var2 == test",
                    result:"rule1 passed",
                    priority:2
                },
                {
                    name:"rule2",
                    expression:"(var1>=1 AND var2!=test2) OR var2==test",
                    result:{passed:true},
                    priority:1
                },
                {
                    name:"rule3",
                    expression:"var2 ~= [1,2,3]",
                    result:"array integer contains",
                    priority:1
                },
                {
                    name:"rule4",
                    expression:"var2 ~= [\"test\",\"test2\"]",
                    result:"String array contains",
                    priority:1
                }
            ]
}
```

- name : Name of the rule (Optional)(String)
- expression : Expression to be evaluated (Mandatory)(String)
- result : Result returned if rule is passed (Mandatory) (Any Object Ex: String, JSON, Array, Integer)
- priority : Priority based on which rules will be evaluated. If not specified the default priority will be set to 1. Highest priority (Optional)(Number)


## Notes
- `var2 == test` compares variable 'var2' value with string 'test'. (No need to use quotes for string inside expression)
- `var2 ~= [\"test\",\"test2\"]" ` checks variable 'var2' value is one of 'test' and 'test2' (test and test2 are elements of string array)
