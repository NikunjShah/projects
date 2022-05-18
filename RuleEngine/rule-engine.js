import { constants } from "./constants.js";

const validateExpression = (expression, result = true) => {
    if (result == false) return false;
    const logicalOperators=constants.LOGICAL_OPERATORS.join('|');
    const regex = new RegExp('(?!\\(.*)(' + logicalOperators + ')(?![^(]*?\\))', 'g');
    let logicalExpr = expression.split(regex);
    if (logicalExpr[0] == 'OR' || logicalExpr[0] == 'AND') return false;
    for (let i = 0; i < logicalExpr.length; i++) {
        let exp = logicalExpr[i]?.trim();
        if (exp != 'AND' && exp != 'OR' && exp) {
            let len = exp.length;
            if ((exp[0] == '(' && exp[len - 1] != ')') || (exp[0] != '(' && exp[len - 1] == ')')) {
                result = false;
                break;
            }
            if (exp[0] == '(' && exp[len - 1] == ')') {
                result = validateExpression(exp.slice(1, -1), result)
            } else {
                if (logicalExpr.length == 1) {
                    let mathematicalExpr = exp.split(new RegExp(constants.MATHEMATICAL_OPERATORS.join('|'), 'g'));
                    let arrayExpr=exp.split(new RegExp(constants.ARRAY_OPERATORS.join('|'), 'g'));
                    if(mathematicalExpr.length==1 && arrayExpr.length==1) result=true;
                    else if (mathematicalExpr.length>1 && isNaN(mathematicalExpr[1]?.trim())) result = false;
                    else if (arrayExpr.length>1)  {
                        try {
                            let parsedArray=JSON.parse(arrayExpr[1].trim());
                            if (!(parsedArray instanceof Array)) result=false;
                        }
                        catch {
                            result=false;
                        }
                    }                   
                    break;
                }
                result = validateExpression(exp, result);
            }
        }
    }
    return result;
}

const validateRules = (ruleEngObj) => {
    const rules = ruleEngObj.rules;
    if (!(rules instanceof Array)) throw new Error(`The rules property is not an array`);
    rules.forEach(function (rule, key) {
        const expression = rule.expression
        if (!expression || expression == '' || typeof expression != 'string') {
            throw new Error(`The expression for rule ${rule?.name} is not present or is not in string format`);
        }
        const result = rule.result
        if (!result) {
            throw new Error(`The result for rule ${rule?.name} is not present`);
        }
        const priority = rule.priority
        if (priority && isNaN(priority)) {
            throw new Error(`The priority for rule ${rule?.name} is not a number`);
        }
        let isValid = validateExpression(expression);
        if (!isValid) throw new Error(`The expression for rule ${rule?.name} is not in correct format`);
    })
}

const validateRulesObj = (ruleEngObj) => {

    //Check Object in ValidFormat for  Rules and Variables.

    if (!ruleEngObj?.rules) {
        throw new Error('Rule Engine Object passed does not have rules property or is not in correct format');
    }

    //Validate rules in ruleEngObj
    try {
        validateRules(ruleEngObj);
    } catch (error) {
        throw error;
    }
    console.log('Success');
}

const evaluateSubExpression = (variables, subExpr) => {
    let result = false;
    const relationalOperators=constants.RELATIONAL_OPERATORS.join('|');
    const regex = new RegExp('(?!\\(.*)(' + relationalOperators + ')(?![^(]*?\\))', 'g');
    let subExprArr = subExpr.split(regex);
    let lhsExpr = subExprArr[0]?.trim();
    let rhsExpr = subExprArr[2]?.trim();
    let operator = subExprArr[1]?.trim();
    if (!isNaN(rhsExpr)) {
        if (!isNaN(variables[lhsExpr])) {
            variables[lhsExpr] = parseInt(variables[lhsExpr]);
            rhsExpr = parseInt(rhsExpr);
        }
        else {
            result = false;
            operator = '';
        }
    }
    
    switch (operator) {
        case '==':
            variables[lhsExpr] == rhsExpr ? result = true : result = false;
            break;
        case '!=':
            variables[lhsExpr] != rhsExpr ? result = true : result = false;
            break;
        case '>=':
            variables[lhsExpr] >= rhsExpr ? result = true : result = false;
            break;
        case '<=':
            variables[lhsExpr] <= rhsExpr ? result = true : result = false;
            break;
        case '>':
            variables[lhsExpr] > rhsExpr ? result = true : result = false;
            break;
        case '<':
            variables[lhsExpr] < rhsExpr ? result = true : result = false;
            break;
        case '~=':
            rhsExpr=JSON.parse(rhsExpr);
            rhsExpr.includes(variables[lhsExpr]) ? result = true : result = false;
            break;
        default:
            result = false;
    }
    return result;
}

const evaluateExpression = (variables, expression) => {
    const logicalOperators=constants.LOGICAL_OPERATORS.join('|');
    const regex = new RegExp('(?!\\(.*)(' + logicalOperators + ')(?![^(]*?\\))', 'g');
    let exprArr = expression.split(regex);
    let evalArr = []
    let result = false;
    exprArr.forEach(expr => {
        expr = expr?.trim();
        if (expr[0] == '(') evalArr.push(evaluateExpression(variables, expr.slice(1, -1)));
        else if (constants.LOGICAL_OPERATORS.includes(expr)) evalArr.push(expr);
        else evalArr.push(evaluateSubExpression(variables, expr))
    });
    if(evalArr.length==1) return evalArr[0];
    for (let i = 0; i < evalArr.length - 2; i += 2) {
        let lhs = evalArr[i];
        let rhs = evalArr[i + 2];
        let operator = evalArr[i + 1];
        switch (operator) {
            case 'AND':
                result = lhs && rhs;
                break;
            case 'OR':
                result = lhs || rhs;
                break;
            default:
                result = false;
        }
        evalArr[i + 2] = result;
    }
    return result;
}

export const evaluateRules = (variables, ruleEngObj) => {
    let result;
    try {
        validateRulesObj(ruleEngObj);
    }
    catch (error) {
        throw error;
    }

    const rules = ruleEngObj.rules;
    rules.sort(function(a, b){
        return a.priority - b.priority;
    });
    for (var key in rules) {
        const expression = rules[key].expression
        let exprEvalResult = evaluateExpression(variables, expression);
        if (exprEvalResult) {
            result = rules[key].result;
            break;
        }
    }
    return result;
}