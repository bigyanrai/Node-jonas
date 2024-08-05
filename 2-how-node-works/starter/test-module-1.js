class Calculator {
  add(a, b) {
    return a + b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    return a / b;
  }
}

// module.exports = {
//   Calculator,
//   foo() {
//     console.log("hello from module-1");
//   },
// };
module.exports = Calculator;
