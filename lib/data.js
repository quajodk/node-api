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
      await append(fd, `${data}\n`);
      await close(fd);
      return false;
    }
  } catch (error) {
    console.log(error);
    return true;
  }
};

// create file
lib.create = async (dir, file, data) => {
  // open the file to write
  try {
    const fd = await open(`${lib.baseDir}${dir}/${file}.json`, 'wx');
    if (fd) {
      // convert to string
      const stringData = JSON.stringify(data);

      // write file and close
      await write(fd, stringData);
      await close(fd);
      return false;
    }
  } catch (error) {
    console.log(error);
    return true;
  }
};

// update file
lib.update = async (dir, file, data) => {
  try {
    const fd = await open(`${lib.baseDir}${dir}/${file}.json`, 'a+');
    if (fd) {
      // convert to string
      const stringData = JSON.stringify(data);

      await truncate(`${lib.baseDir}${dir}/${file}.json`);
      // write file and close
      await write(fd, stringData);
      await close(fd);
      return false;
    }
  } catch (error) {
    console.log(error);
    return true;
  }
};

// delete file
lib.delete = async (dir, file) => {
  try {
    await deleteFile(`${lib.baseDir}${dir}/${file}.json`);
    return false;
  } catch (error) {
    console.log(error);
    return true;
  }
};

// read files in a directory
lib.list = async dir => {
  try {
    const data = await readAll(`${lib.baseDir}${dir}/`);
    //  array for list
    const returnedList = [];
    data.forEach(file => {
      returnedList.push(file.replace('.json', ''));
    });
    return returnedList;
  } catch (error) {
    console.log(error);
    return true;
  }
};

// export lib
module.exports = lib;
