'use strict';
const errorFirstMultiArgsExecutor = (resolve, reject) => function (err) {
	const results = new Array(arguments.length - 1);

	for (let i = 1; i < arguments.length; i++) {
		results[i - 1] = arguments[i];
	}

	if (err) {
		results.unshift(err);
		reject(results);
	} else {
		resolve(results);
	}
};

const errorFirstNonMulitArgsExecutor = (resolve, reject) => (err, result) => {
	if (err) {
		reject(err);
	} else {
		resolve(result);
	}
};

const nonErrorFirstMultiArgsExecutor = resolve => function () {
	const results = new Array(arguments.length - 1);

	for (let i = 0; i < arguments.length; i++) {
		results[i] = arguments[i];
	}

	resolve(results);
};

const nonErrorFirstNonMulitArgsExecutor = resolve => resolve;

exports.get = opts => {
	if (opts.errorFirst) {
		return opts.multiArgs ? errorFirstMultiArgsExecutor : errorFirstNonMulitArgsExecutor;
	}

	return opts.multiArgs ? nonErrorFirstMultiArgsExecutor : nonErrorFirstNonMulitArgsExecutor;
};
