'use strict';
var minimatch = require('minimatch');

var process = function (fn, P, opts) {
	if (typeof fn !== 'function') {
		return P.reject(new TypeError('Expected a function'));
	}

	return function () {
		var that = this;
		var args = [].slice.call(arguments);

		return new P(function (resolve, reject) {
			args.push(function (err, result) {
				if (err) {
					reject(err);
				} else if (opts.multiArgs) {
					resolve([].slice.call(arguments, 1));
				} else {
					resolve(result);
				}
			});

			fn.apply(that, args);
		});
	};
};

var pify = module.exports = function (obj, P, opts) {
	if (typeof P !== 'function') {
		opts = P;
		P = Promise;
	}

	opts = opts || {};
	opts.match = opts.match || opts.include;

	if (opts.exclude && !opts.match) {
		opts.match = opts.exclude.map(function (glob) {
			return '!' + glob;
		});
	}

	var filter = function (key) {
		if (opts.match) {
			var include = false;
			var exclude = false;

			[].concat(opts.match).forEach(function (glob) {
				exclude = (glob[0] === '!') && minimatch(key, glob, {flipNegate: true}) || exclude;
				include = minimatch(key, glob) || include;
			});

			return include && !exclude;
		}

		return true;
	};

	var ret = (typeof obj === 'function') ? function () {
		if (opts.excludeMain) {
			return obj.apply(this, arguments);
		}

		return process(obj, P, opts).apply(this, arguments);
	} : {};

	return Object.keys(obj).reduce(function (ret, key) {
		var x = obj[key];
		ret[key] = (typeof x === 'function') && filter(key) ? process(x, P, opts) : x;
		return ret;
	}, ret);
};

pify.all = pify;
