import { EvaluateRules } from "./rule-engine.js";

const variables = {var1:1,var2:'test'}
const ruleEngineObj = {
        "rules" : [{
                    name:"rule1",
                    expression:"var1>=1 AND var2 == test",
                    result:"rule1 passed",
                    priority:2
                },
                {
                    name:"rule2",
                    expression:"(var1>=1 AND var2==test2) OR var2==test",
                    result:{'test':'test2'},
                    priority:1
                }
            ]
}



try {
    let result = EvaluateRules(variables,ruleEngineObj);
    console.log(result);
}
catch (error) {
    console.log(error.message);
}