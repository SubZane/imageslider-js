;(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root))
	} else if (typeof exports === 'object') {
		module.exports = factory(root)
	} else {
		root.imageSlider = factory(root)
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {
	'use strict'

	//
	// Variables
	//

	var imageSlider = {} // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener // Feature test
	var settings
	var currentSlide = Number(0)
	var slides = []
	var thumbnails = []
	var indicators = []
	var nextButton
	var prevButton
	var slideCount = Number(0)
	var el

	// Default settings
	var defaults = {
		initClass: 'imageslider-js',
		onInit: function () {},
		OnAttachEvents: function () {},
		onDestroy: function () {},
	}

	//
	// Methods
	//

	var setIndicators = function (activeIndicator) {
		indicators.map(function (element) {
			element.classList.remove('active')
		})

		activeIndicator.classList.add('active')
	}

	var setActiveIndicator = function (active) {
		indicators.map(function (element) {
			element.classList.remove('active')
		})
		indicators[active].classList.add('active')
	}

	var setActiveThumbnail = function (active) {
		thumbnails.map(function (element) {
			element.classList.remove('active')
		})
		thumbnails[active].classList.add('active')
	}

	var setActiveSlide = function (nextSlide) {
		slides.map(function (element) {
			element.classList.remove('active')
		})
		if (currentSlide < nextSlide) {
			//slides[nextSlide].classList.add('imageslider-item-start')
			//slides[currentSlide].classList.add('imageslider-item-start')
		} else {
		}
		console.log('nextSlide', nextSlide)
		console.log('slides[nextSlide]', slides[nextSlide])
		slides[nextSlide].classList.add('active')
		currentSlide = nextSlide
		setActiveIndicator(nextSlide)
		setActiveThumbnail(nextSlide)
	}

	var attachEvents = function () {
		document.querySelector('.imageslider-control-fullscreen').addEventListener('click', function (e) {
			var imageSrc = slides[currentSlide].querySelector('img').getAttribute('src')
			var fullscreen = document.querySelector('#fullscreen .image')
			fullscreen.style.backgroundImage = 'url(' + imageSrc + ')'
			fullscreen.parentElement.style.display = 'block'
		})

		document.querySelector('#fullscreen').addEventListener('click', function (e) {
			e.currentTarget.style.display = 'none'
		})

		indicators.map(function (element) {
			element.addEventListener('click', function (e) {
				setIndicators(e.target)
				var nextSlide = Number(element.getAttribute('data-slide-to'))
				setActiveSlide(nextSlide)
			})
		})

		thumbnails.map(function (element) {
			element.addEventListener('click', function (e) {
				setIndicators(e.target)
				var nextSlide = Number(element.getAttribute('data-slide-to'))
				setActiveSlide(nextSlide)
			})
		})

		prevButton.addEventListener('click', function (e) {
			console.log('currentSlide', currentSlide)
			console.log('slides.length', slides.length)
			if (currentSlide === 0) {
				setActiveSlide(slides.length - 1)
			} else {
				setActiveSlide(currentSlide - 1)
			}
		})

		nextButton.addEventListener('click', function (e) {
			console.log('currentSlide', currentSlide)
			console.log('slides.length', slides.length)
			if (currentSlide >= slides.length - 1) {
				setActiveSlide(0)
			} else {
				var nextSlide = currentSlide + 1
				setActiveSlide(nextSlide)
			}
		})

		hook('OnAttachEvents')
	}

	/**
	 * Callback hooks.
	 * Usage: In the defaults object specify a callback function:
	 * hookName: function() {}
	 * Then somewhere in the plugin trigger the callback:
	 * hook('hookName');
	 */
	var hook = function (hookName) {
		if (settings[hookName] !== undefined) {
			// Call the user defined function.
			// Scope is set to the jQuery element we are operating on.
			settings[hookName].call(el)
		}
	}

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function (defaults, options) {
		var extended = {}
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop]
		})
		forEach(options, function (value, prop) {
			extended[prop] = options[prop]
		})
		return extended
	}

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection)
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection)
			}
		}
	}

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	imageSlider.destroy = function () {
		// If plugin isn't already initialized, stop
		if (!settings) {
			return
		}

		// Remove init class for conditional CSS
		document.documentElement.classList.remove(settings.initClass)

		// @todo Undo any other init functions...

		// Remove event listeners
		document.removeEventListener('click', eventHandler, false)

		// Reset variables
		settings = null
		hook('onDestroy')
	}

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	imageSlider.init = function (options) {
		// feature test
		if (!supports) {
			return
		}

		prevButton = document.querySelector('.imageslider-control-prev')
		nextButton = document.querySelector('.imageslider-control-next')

		Array.from(document.querySelectorAll('.imageslider-thumbitem')).forEach((el) => {
			thumbnails.push(el)
		})

		Array.from(document.querySelectorAll('.imageslider-item')).forEach((el) => {
			el.addEventListener('transitionend', (event) => {
				console.log('transitionend')
				el.classList.remove('imageslider-item-start')
				el.classList.remove('imageslider-item-end')
			})
			slides.push(el)
		})
		slideCount = Number(slides.length)

		Array.from(document.querySelectorAll('.imageslider-indicators button')).forEach((el) => {
			indicators.push(el)
			if (el.classList.contains('active')) {
				currentSlide = Number(el.getAttribute('data-slide-to'))
			}
		})

		// Destroy any existing initializations
		imageSlider.destroy()

		// Merge user options with defaults
		settings = extend(defaults, options || {})

		el = document.querySelector(settings.container)

		attachEvents()

		// Remove preload class when page has loaded to allow transitions/animations
		//el.classList.remove("preload");
		hook('onInit')
	}

	imageSlider.closePanels = function () {
		close()
	}
	//
	// Public APIs
	//

	return imageSlider
})
