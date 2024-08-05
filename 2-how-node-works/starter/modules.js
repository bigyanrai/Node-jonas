// console.log(arguments);
// console.log(require("module").wrapper);

// const { Calculator: C, foo } = require("./test-module-1");
const C = require("./test-module-1");

// const calc1 = new C();
// console.log(calc1.add(2, 5));

// foo();

const { add, multiply, division } = require("./test-module-2");
// console.log(typeof calc2.);

//caching
require("./test-module-3")();
