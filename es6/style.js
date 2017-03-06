import _getIterator from 'babel-runtime/core-js/get-iterator';
import { resolve_locale } from './time ago';
import { gradation, a_day } from './classify elapsed';

var twitter_formatters = {};

export default function (locales) {
	var styles = {
		// Twitter style relative time.
		// Seconds, minutes and hours are shown relatively,
		// and other intervals can be shown using full date format.
		twitter: function twitter() {
			var locale = resolve_locale(locales);

			if (!twitter_formatters[locale]) {
				twitter_formatters[locale] = {
					// "Apr 11" (MMMd)
					same_year: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),

					// "Apr 11, 2017" (yMMMd)
					another_year: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' })
				};
			}

			var twitter_same_year_date_formatter = twitter_formatters[locale].same_year;
			var twitter_another_year_date_formatter = twitter_formatters[locale].another_year;

			var twitter_gradation = gradation.canonical();
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = _getIterator(twitter_gradation), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var step = _step.value;

					if (step.unit === 'minute') {
						step.threshold = 45;
						break;
					}
				}
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

			var options = {
				// Twitter style relative time.
				// Seconds, minutes and hours are shown relatively,
				// and other intervals can be shown using full date format.
				override: function override(_ref) {
					var elapsed = _ref.elapsed,
					    date = _ref.date,
					    now = _ref.now;

					// If less than 24 hours elapsed,
					// then format it relatively.
					if (Math.abs(elapsed) < a_day - 30 * 60) {
						return;
					}

					// If `date` and `now` happened the same year,
					// then show month and day
					if (new Date(now).getFullYear() === date.getFullYear()) {
						return twitter_same_year_date_formatter.format(date, 'MMMd');
					}

					// If `date` and `now` happened in defferent years,
					// then show full date
					return twitter_another_year_date_formatter.format(date, 'yMMMd');
				},


				units: ['just-now', 'minute', 'hour'],

				gradation: twitter_gradation,

				flavour: 'tiny'
			};

			return options;
		},


		// I prefer this one.
		//
		// just now
		// 5 minutes
		// 10 minutes
		// 15 minutes
		// 20 minutes
		// half an hour
		// an hour
		// 2 hours
		// …
		// 20 hours
		// 1 day
		// 2 days
		// a week
		// 2 weeks
		// 3 weeks
		// a month
		// 2 months
		// 3 months
		// 4 months
		// half a year
		// a year
		// 2 years
		//
		fuzzy: function fuzzy() {
			var options = {
				gradation: gradation.convenient(),
				flavour: 'long_concise',
				units: ['just-now', 'minute', 'half-hour', 'hour', 'day', 'week', 'month', 'half-year', 'year']
			};

			return options;
		}
	};

	return styles;
}
//# sourceMappingURL=style.js.map