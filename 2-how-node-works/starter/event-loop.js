// const fs = require("fs");

// setTimeout(() => {
//   console.log("Timeout 1 finished");
// }, 0);
// setImmediate(() => {
//   console.log("Immediate 1 finished");
// });

// fs.readFile("test-file.txt", "utf8", () => {
//   console.log("I/O finished");

//   fs.readFile("example.txt", "utf8", () => {
//     console.log("I/0 2 FINISHED");
//     fs.readFile("example.txt", "utf8", () => {
//       console.log("I/0 3 FINISHED");
//       setTimeout(() => {
//         console.log("Timeout 4 finished");
//       }, 3000);
//       setImmediate(() => {
//         console.log("Immediate 3 finished");
//       });
//     });
//   });
//   setTimeout(() => {
//     console.log("Timeout 2 finished");
//   }, 0);
//   setTimeout(() => {
//     console.log("Timeout 3 finished");
//   }, 3000);
//   setImmediate(() => {
//     console.log("Immediate 2 finished");
//   });
// });

// console.log("Hello from top level code");

const fs = require("fs");
const crypto = require("crypto");

const start = Date.now();

setTimeout(() => {
  console.log("Timeout 1 finished");
}, 0);
setImmediate(() => {
  console.log("Immediate 1 finished");
});

fs.readFile("test-file.txt", "utf8", () => {
  console.log("I/O finished");

  setTimeout(() => {
    console.log("Timeout 2 finished");
  }, 0);
  setTimeout(() => {
    console.log("Timeout 3 finished");
  }, 3000);
  setImmediate(() => {
    console.log("Immediate 2 finished");
  });

  process.nextTick(() => console.log("Process.nextTick"));

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "password encrypted");
  });
});

console.log("Hello from top level code");
