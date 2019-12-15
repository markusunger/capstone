/*
  i: string containing different kinds of parentheses
  o: boolean value representing validity of input string's brackets
  p: opening and closing brackets
     string is valid if all types of brackets have the same amount of opening
      and closing brackets and are closed in order
  d: stack with opening brackets, remove from the stack when the closing bracket
       matches the opening bracket on top of the stack
  a: initialize a stack array
     loop
      shift from input string (converted into array)
      push on stack if opening bracket
      if closing bracket, compare to pop'ed item from stack
*/

const validParentheses = function validParentheses(string) {
  const brackets = string.split('');
  const stack = [];
  const types = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  while (brackets.length > 0) {
    const next = brackets.shift();
    if (next === '(' || next === '[' || next === '{') stack.push(next);
    if (next in types) {
      if (stack.length === 0) return false;
      const previous = stack.pop();
      if (types[next] !== previous) return false;
    }
  }
  if (stack.length !== 0) return false;
  return true;
};


console.log(validParentheses('()[]{}')); // true
console.log(validParentheses('(]')); // false
console.log(validParentheses('([)]')); // false
console.log(validParentheses('{[]}')); // true
