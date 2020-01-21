/**
 * Data Logic for the API
 */

//  Dependencies
const fs = require('fs');
const path = require('path');
const util = require('util');
// lib object
const lib = {};

// base direct for the file
lib.baseDir = path.join(__dirname, '/../');

// Promisify all fs methods
const write = util.promisify(fs.writeFile);
const read = util.promisify(fs.readFile);
const open = util.promisify(fs.open);
const close = util.promisify(fs.close);
const deleteFile = util.promisify(fs.unlink);
const truncate = util.promisify(fs.truncate);
const readAll = util.promisify(fs.readdir);
const append = util.promisify(fs.appendFile);

// read files

lib.read = async (dir, file) => {
  const data = await read(`${lib.baseDir}${dir}/${file}.json`, 'utf8');
  if (data) {
    return JSON.parse(data);
  } else {
    return {
      resCode: 404,
      msg: 'Could not get any data'
    };
  }
};

// append to a file
lib.append = async (file, data) => {
  try {
    const fd = await open(`${lib.baseDir}${file}.json`, 'a');
    if (fd) {
      const appended = await append(fd, `${data}\n`);
      if (appended) {
        const closeFile = await close(fd);
        if (closeFile) {
          return false;
        }
      }
    }
  } catch (error) {
    console.log(error);
    return true;
  }
};

// create file
lib.create = async (dir, file, data) => {
  // open the file to write
  // open(`${lib.baseDir}${dir}/${file}.json`, 'wx')
  //   .then(fd => {
  //     // convert to string
  //     const stringData = JSON.stringify(data);
  //     // write file and close the file
  //     write(fd, stringData)
  //       .then(() => {
  //         close(fd)
  //           .then(() => {
  //             callback(false);
  //           })
  //           .catch(e => {
  //             callback(e);
  //           });
  //       })
  //       .catch(e => {
  //         callback('Error writing data to file');
  //       });
  //   })
  //   .catch(e => {
  //     callback('Could not create a new file, it may already exist');
  //   });

  try {
    const fd = await open(`${lib.baseDir}${dir}/${file}.json`, 'wx');
    if (fd) {
      // convert to string
      const stringData = JSON.stringify(data);

      // write file and close
      const writtenFile = await write(fd, stringData);
      console.log(writtenFile);
      const closedFile = await close(fd);
      console.log(closedFile);
      return false;
    }
  } catch (error) {
    console.log(error);
    return true;
  }
};

// update file
lib.update = (dir, file, data, callback) => {
  open(`${lib.baseDir}${dir}/${file}.json`, 'a+')
    .then(fd => {
      // convert to string
      const stringData = JSON.stringify(data);

      // truncate file
      truncate(`${lib.baseDir}${dir}/${file}.json`)
        .then(() => {
          // write data to file and close it
          write(fd, stringData)
            .then(() => {
              // close file
              close(fd)
                .then(() => {
                  callback(false);
                })
                .catch(e => {
                  callback(e);
                });
            })
            .catch(e => {
              callback(e);
            });
        })
        .catch(e => {
          callback(e);
        });
    })
    .catch(e => {
      callback(e);
    });
};

// delete file
lib.delete = (dir, file, callback) => {
  deleteFile(`${lib.baseDir}${dir}/${file}.json`)
    .then(() => {
      callback(false);
    })
    .catch(e => {
      callback('File could not be deleted');
    });
};

// read files in a directory
lib.list = (dir, callback) => {
  readAll(`${lib.baseDir}${dir}/`)
    .then(data => {
      //  array for list
      const returnedList = [];
      data.forEach(file => {
        returnedList.push(file.replace('.json', ''));
      });
      callback(false, returnedList);
    })
    .catch(e => {
      callback(e);
    });
};

// export lib
module.exports = lib;
