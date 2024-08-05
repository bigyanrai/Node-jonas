const { error } = require('console');
const fs = require('fs');
const superagent = require('superagent');

const readFilePro = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('I could not find the file');
      resolve(data);
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${file}`, `${data}`, (err) => {
      if (err) return reject('Error writing file');

      resolve('data written sucessfully');
    });
  });
};

const getDogPic = async () => {
  try {
    const data = await readFilePro(`${__dirname}/dog.txt`);
    // console.log(`Breed:${data}`);
    const resPro1 = await superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const resPro2 = await superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const resPro3 = await superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const all = await Promise.all([resPro1, resPro2, resPro3]);
    // console.log(all);

    const imgs = all.map((el) => el.body.message);
    console.log(imgs);
    await writeFilePro(`${__dirname}/dog-img.txt`, imgs.join('\n'));

    console.log('Random dog image saved to file');
  } catch (error) {
    console.log(error);
    throw error;
  }

  return `2:READY`;
};

(async () => {
  try {
    console.log('1: will get dog pics!');
    const x = await getDogPic();
    console.log(x);
    console.log('3.done getting pics');
  } catch (error) {
    console.log(error);
  }
})();

/*
console.log('1: will get dog pics!');
getDogPic()
.then((data) => {
    console.log(data);
    console.log('3.done getting pics');
  })
  .catch((err) => {
    console.log(err);
  });

   
  */

// console.log('2: done getting pics!');

// readFilePro(`${__dirname}/dog.txt`)
//   .then((data) => {
//     console.log(`Breed:${data}`);

//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then((data) => {
//     console.log(data);
//     return writeFilePro(`${__dirname}/dog-img.txt`, data.body.message);
//   })
//   .then((data) => {
//     console.log(data);
//   })

//   .catch((err) => {
//     console.log(err.message);
//   });
