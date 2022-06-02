/* eslint-disable import/no-commonjs */
'use strict';

var globalConfig = require('./config');
var OSS = require('ali-oss');
var ora = require('ora');

var tool = {
	uploadFile: uploadFile,
};

function uploadFile(_config, fromPath, toPath, cb) {
	var client = new OSS({
		accessKeyId: globalConfig.cos.secret_id,
		accessKeySecret: globalConfig.cos.secret_key,
		bucket: globalConfig.cos.bucket,
		region: globalConfig.cos.region,
	});

	// 桶里的文件夹
	var cosFolder = globalConfig.cos.folder || '/';
	if (cosFolder.substr(-1, 1) !== '/') {
		cosFolder = cosFolder + '/';
	}

	var opt = {};
	toPath = toPath.replace(/\\/g, '/');
	opt.Key = cosFolder + toPath;

	var spinner = ora('upload:' + opt.Key).start();
	async function put(err) {
		let hasUpload = false;
		try {
			await client.head(opt.Key);
			hasUpload = true;
		} catch (e) {
			hasUpload = false;
		}

		if (hasUpload) {
			console.log('');
			console.log(`\n${toPath} 已经存在在阿里云，不要覆盖。如果需要请改名字。`);
			console.log(
				`可以访问对应的域名前缀 ${'http://' + _config.bucket + '.' + _config.region + '.aliyuncs.com'}${opt.Key} 试试看`
			);
			console.log(`压缩尚未完成，请修复这个已存在的文件先`);
			process.exit(1);
		}

		var result = await client.put(opt.Key, fromPath);
		// console.log('result', result);
		if (result.res.statusMessage == 'OK') {
			spinner.succeed();
		}

		const picUrl = result.url;

		cb && cb(err, picUrl);
	}
	put();
}

module.exports = tool;
