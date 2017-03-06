import _getIterator from 'babel-runtime/core-js/get-iterator';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import _typeof from 'babel-runtime/helpers/typeof';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
// a part of this code is adopted from
// https://github.com/yahoo/intl-relativeformat/

import IntlMessageFormat from 'intl-messageformat';
import classify_elapsed from './classify elapsed';
import style from './style';

var Javascript_time_ago = function () {

	// For all configured locales
	// their relative time formatter messages will be stored here
	function Javascript_time_ago(locales, options) {
		_classCallCheck(this, Javascript_time_ago);

		this.formatters = {};

		// Make a copy of `locales` if it's an array, so that it doesn't change
		// since it's used lazily.
		if (Array.isArray(locales)) {
			locales = locales.concat();
		}

		// Choose the most appropriate locale
		this.locale = resolve_locale(locales);

		// Is passed later on to `IntlMessageFormat`
		this.locales = locales;

		// Presets
		this.style = style(locales);
	}

	// Formats the relative date.
	//
	// Returns: a string
	//
	// Parameters:
	//
	//    options - (optional)
	//
	//       units     - a list of allowed time units
	//                   (e.g. ['second', 'minute', 'hour', …])
	//
	//       gradation - time scale gradation steps.
	//                   (e.g.
	//                   [
	//                      { unit: 'second', factor: 1 }, 
	//                      { unit: 'minute', factor: 60, threshold: 60 },
	//                      …
	//                   ])
	//
	//       override - function ({ elapsed, time, date, now })
	//
	//                  If the `override` function returns a value,
	//                  then the `.format()` call will return that value.
	//                  Otherwise it has no effect.
	//


	// Relative time interval message formatters cache

	// Fallback locale
	// (when not a single supplied preferred locale is available)


	_createClass(Javascript_time_ago, [{
		key: 'format',
		value: function format(input) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			// Get locale messages for this formatting flavour
			var _locale_data = this.locale_data(options.flavour),
			    flavour = _locale_data.flavour,
			    locale_data = _locale_data.locale_data;

			var date = void 0;
			var time = void 0;

			if (input.constructor === Date) {
				date = input;
				time = input.getTime();
			} else if (typeof input === 'number') {
				time = input;
				date = new Date(input);
			} else {
				throw new Error('Unsupported relative time formatter input: ' + (typeof input === 'undefined' ? 'undefined' : _typeof(input)) + ', ' + input);
			}

			// can pass a custom `now` for testing purpose
			var now = options.now || Date.now();

			// how much time elapsed (in seconds)
			var elapsed = (now - time) / 1000; // in seconds

			// Allows output customization.
			// For example, seconds, minutes and hours can be shown relatively,
			// and other intervals can be shown using full date format.
			// (see Twitter style)
			if (options.override) {
				var override = options.override({ elapsed: elapsed, time: time, date: date, now: now });
				if (override !== undefined) {
					return override;
				}
			}

			// Available time interval measurement units
			var units = _Object$keys(locale_data);

			if (options.units) {
				// Find available time interval measurement units
				units = options.units.filter(function (unit) {
					return units.indexOf(unit) >= 0;
				});
			}

			// Choose the appropriate time measurement unit 
			// and get the corresponding rounded time amount

			var _classify_elapsed = classify_elapsed(Math.abs(elapsed), units, options.gradation),
			    unit = _classify_elapsed.unit,
			    amount = _classify_elapsed.amount;

			// If no time unit is suitable, just output empty string


			if (!unit) {
				return '';
			}

			// format the message for the chosen time measurement unit
			// (second, minute, hour, day, etc)

			var formatters = this.get_formatters(unit, flavour);

			// default formatter: "X units"
			var formatter = formatters.default;

			// in case of "0 units"
			if (amount === 0 && formatters.current) {
				formatter = formatters.current;
			}

			// in case of "previous unit" or "next unit"
			if ((amount === -1 || amount === 1) && formatters.previous_next) {
				formatter = formatters.previous_next;
			}

			// return formatted time amount
			return formatter.format({
				'0': amount,
				when: elapsed >= 0 ? 'past' : 'future'
			});
		}

		// Gets locale messages for this formatting flavour

	}, {
		key: 'locale_data',
		value: function locale_data(flavour) {
			// Get relative time formatter messages for this locale
			var locale_data = Javascript_time_ago.locale_data[this.locale];

			// Fallback to "default" flavour if the given flavour isn't available
			if (!flavour || !locale_data[flavour]) {
				flavour = 'default';
			}

			return { flavour: flavour, locale_data: locale_data[flavour] };
		}

		// lazy creation of a formatter for a given time measurement unit
		// (second, minute, hour, day, etc)

	}, {
		key: 'get_formatters',
		value: function get_formatters(unit, flavour) {
			if (!this.formatters[flavour]) {
				this.formatters[flavour] = {};
			}

			var formatters = this.formatters[flavour];

			// Create a new synthetic message based on the locale data from CLDR.
			if (!formatters[unit]) {
				formatters[unit] = this.compile_formatters(unit, flavour);
			}

			return formatters[unit];
		}

		// compiles formatter for the specified time measurement unit 
		// (second, minute, hour, day, etc)

	}, {
		key: 'compile_formatters',
		value: function compile_formatters(unit, flavour) {
			// Locale specific time interval formatter messages
			// for the given time interval measurement unit
			var formatter_messages = Javascript_time_ago.locale_data[this.locale][flavour][unit];

			// Locale specific time interval formatter messages
			// for the given time interval measurement unit
			// for "past" and "future"
			//
			// (e.g.
			//  {
			//   "relativeTimePattern-count-one": "{0} second ago",
			//   "relativeTimePattern-count-other": "{0} seconds ago"
			//  })
			//
			var past_formatter_messages = formatter_messages.past;
			var future_formatter_messages = formatter_messages.future;

			// `format.js` number formatter messages
			// e.g. "one {# second ago} other {# seconds ago}"
			var past_formatter = '';
			var future_formatter = '';

			// Compose "past" formatter specification
			// (replacing CLDR number placeholder "{0}" 
			//  with format.js number placeholder "#")
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = _getIterator(_Object$keys(past_formatter_messages)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var key = _step.value;

					past_formatter += ' ' + key + ' \n\t\t\t\t\t{' + past_formatter_messages[key].replace('{0}', '#') + '}';
				}

				// Compose "future" formatter specification
				// (replacing CLDR number placeholder "{0}" 
				//  with format.js number placeholder "#")
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = _getIterator(_Object$keys(future_formatter_messages)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _key = _step2.value;

					// e.g. += " one {# sec. ago}"
					future_formatter += ' ' + _key + ' \n\t\t\t\t\t{' + future_formatter_messages[_key].replace('{0}', '#') + '}';
				}

				// The ultimate time interval `format.js` specification
				// ("0" will be replaced with the first argument
				//  when the message will be formatted)
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			var message = '{ when, select, past   {{0, plural, ' + past_formatter + '}}\n\t\t                                 future {{0, plural, ' + future_formatter + '}} }';

			// Create the synthetic IntlMessageFormat instance 
			// using the original locales specified by the user
			var default_formatter = new IntlMessageFormat(message, this.locales);

			var formatters = {
				default: default_formatter
			};

			// "0 units" formatter
			if (formatter_messages.current) {
				formatters.current = {
					format: function format() {
						return formatter_messages.current;
					}
				};
			}

			// "previous unit" and "next unit" formatter
			if (formatter_messages.previous && formatter_messages.next) {
				var previous_next_message = '{ when, select, past   {' + formatter_messages.previous + '}\n\t\t\t                                               future {' + formatter_messages.next + '} }';

				// Create the synthetic IntlMessageFormat instance 
				// using the original locales specified by the user
				formatters.previous_next = new IntlMessageFormat(previous_next_message, this.locales);
			}

			return formatters;
		}
	}]);

	return Javascript_time_ago;
}();

// Chooses the most appropriate locale 
// based on the list of preferred locales supplied by the user


Javascript_time_ago.default_locale = 'en';
Javascript_time_ago.locale_data = {};
export default Javascript_time_ago;
export function resolve_locale(locales) {
	// Suppose it's an array
	if (typeof locales === 'string') {
		locales = [locales];
	}

	// Create a copy of the array so we can push on the default locale.
	locales = (locales || []).concat(Javascript_time_ago.default_locale);

	// Using the set of locales + the default locale, we look for the first one
	// which that has been registered. When data does not exist for a locale, we
	// traverse its ancestors to find something that's been registered within
	// its hierarchy of locales. Since we lack the proper `parentLocale` data
	// here, we must take a naive approach to traversal.
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = _getIterator(locales), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var locale = _step3.value;

			var locale_parts = locale.split('-');

			while (locale_parts.length) {
				var locale_try = locale_parts.join('-');

				if (Javascript_time_ago.locale_data[locale_try]) {
					// Return the normalized locale string; 
					// e.g., we return "en-US",
					// instead of "en-us".
					return locale_try;
				}

				locale_parts.pop();
			}
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	throw new Error('No locale data has been added for any of the locales: ' + locales.join(', '));
}

// Adds locale data
Javascript_time_ago.locale = function (locale_data) {
	var locale = void 0;
	var locale_data_map = void 0;

	if (!locale_data) {
		throw new Error('The passed in locale data is undefined');
	}

	if (locale_data.main) {
		locale = _Object$keys(locale_data.main)[0];

		// Convert from CLDR format
		locale_data_map = from_CLDR(locale_data);
	} else {
		locale = locale_data.locale;

		locale_data_map = {};

		// Supports multiple locale variations
		// (e.g. "default", "short", "normal", "long", etc)
		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = _getIterator(_Object$keys(locale_data)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var key = _step4.value;

				if (key !== 'locale') {
					locale_data_map[key] = locale_data[key];
				}
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}
	}

	// Guard against malformed input
	if (!locale) {
		throw new Error('Couldn\'t determine locale for this locale data. Make sure the "locale" property is present.');
	}

	// Ensure default formatting flavour is set
	if (!locale_data_map.default) {
		locale_data_map.default = locale_data_map.long || locale_data_map[_Object$keys(locale_data_map)[0]];
	}

	// Store locale specific messages in the static variable
	Javascript_time_ago.locale_data[locale] = locale_data_map;

	// (will be added manually by this library user)
	// // Add locale data to IntlMessageFormat
	// // (to be more specific: the `pluralRuleFunction`)
	// require('intl-messageformat/locale-data/ru')
};

// Converts locale data from CLDR format (if needed)
export function from_CLDR(data) {
	// the usual time measurement units
	var units = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

	// result
	var converted = { long: {} };

	// detects the short flavour of labels (yr., mo., etc)
	var short = /-short$/;

	var locale = _Object$keys(data.main)[0];
	data = data.main[locale].dates.fields;

	var _iteratorNormalCompletion5 = true;
	var _didIteratorError5 = false;
	var _iteratorError5 = undefined;

	try {
		for (var _iterator5 = _getIterator(_Object$keys(data)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
			var key = _step5.value;

			// take only the usual time measurement units
			if (units.indexOf(key) < 0 && units.indexOf(key.replace(short, '')) < 0) {
				continue;
			}

			var entry = data[key];
			var converted_entry = {};

			// if a key ends with `-short`, then it's a "short" flavour
			if (short.test(key)) {
				if (!converted.short) {
					converted.short = {};
				}

				converted.short[key.replace(short, '')] = converted_entry;
			} else {
				converted.long[key] = converted_entry;
			}

			// the "relative" values aren't suitable for "ago" or "in a" cases,
			// because "1 year ago" != "last year"

			// if (entry['relative-type--1'])
			// {
			// 	converted_entry.previous = entry['relative-type--1']
			// }

			// if (entry['relative-type-0'])
			// {
			// 	converted_entry.current = entry['relative-type-0']
			// }

			// if (entry['relative-type-1'])
			// {
			// 	converted_entry.next = entry['relative-type-1']
			// }

			if (entry['relativeTime-type-past']) {
				var past = entry['relativeTime-type-past'];
				converted_entry.past = {};

				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = _getIterator(_Object$keys(past)), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var subkey = _step6.value;

						var prefix = 'relativeTimePattern-count-';
						var converted_subkey = subkey.replace(prefix, '');

						converted_entry.past[converted_subkey] = past[subkey];
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}
			}

			if (entry['relativeTime-type-future']) {
				var future = entry['relativeTime-type-future'];
				converted_entry.future = {};

				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;

				try {
					for (var _iterator7 = _getIterator(_Object$keys(future)), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						var _subkey = _step7.value;

						var _prefix = 'relativeTimePattern-count-';
						var _converted_subkey = _subkey.replace(_prefix, '');

						converted_entry.future[_converted_subkey] = future[_subkey];
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}
			}
		}
	} catch (err) {
		_didIteratorError5 = true;
		_iteratorError5 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion5 && _iterator5.return) {
				_iterator5.return();
			}
		} finally {
			if (_didIteratorError5) {
				throw _iteratorError5;
			}
		}
	}

	return converted;
}
//# sourceMappingURL=time ago.js.map