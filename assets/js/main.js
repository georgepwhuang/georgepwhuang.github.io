/*
	Stellar by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$main = $('#main'),
		$header = $('#header'),
		$wrapper = $('#wrapper'),
		$nav = $('#nav'),
		$navPanelToggle, $navPanel, $navPanelInner;

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Nav.
		var $nav = $('#nav');

		if ($nav.length > 0) {

			// Shrink effect.
				$main
					.scrollex({
						mode: 'top',
						enter: function() {
							$nav.addClass('alt');
						},
						leave: function() {
							$nav.removeClass('alt');
						},
					});

			// Links.
				var $nav_a = $nav.find('a');

				$nav_a
					.scrolly({
						speed: 1000,
						offset: function() { 
							return $nav.height();
						}
					})
					.on('click', function() {

						var $this = $(this);


						// External link? Bail.
							if ($this.attr('href').charAt(0) != '#')
								return;

						// Deactivate all links.
							$nav_a
								.removeClass('active')
								.removeClass('active-locked');

						// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
							$this
								.addClass('active')
								.addClass('active-locked');

					})
					.each(function() {

						var	$this = $(this),
							id = $this.attr('href'),
							$section = $(id);

						// No section for this link? Bail.
							if ($section.length < 1)
								return;

						// Scrollex.
							$section.scrollex({
								mode: 'middle',
								initialize: function() {

									// Deactivate section.
										if (browser.canUse('transition'))
											$section.addClass('inactive');

								},
								enter: function() {

									// Activate section.
										$section.removeClass('inactive');

									// No locked links? Deactivate all links and activate this section's one.
										if ($nav_a.filter('.active-locked').length == 0) {

											$nav_a.removeClass('active');
											$this.addClass('active');

										}

									// Otherwise, if this section's link is the one that's locked, unlock it.
										else if ($this.hasClass('active-locked'))
											$this.removeClass('active-locked');

								},
							});

					});

		}

		// Nav Panel.

		// Toggle.
		$navPanelToggle = $(
			'<a href="#navPanel" id="navPanelToggle">Menu</a>'
		)
			.appendTo($wrapper);

		// Change toggle styling once we've scrolled past the header.
			$header.scrollex({
				bottom: '5vh',
				enter: function() {
					$navPanelToggle.removeClass('alt');
				},
				leave: function() {
					$navPanelToggle.addClass('alt');
				}
			});

	// Panel.
		$navPanel = $(
			'<div id="navPanel">' +
				'<nav>' +
				'</nav>' +
				'<a href="#navPanel" class="close"></a>' +
			'</div>'
		)
			.appendTo($body)
			.panel({
				delay: 500,
				hideOnClick: true,
				hideOnSwipe: true,
				resetScroll: true,
				resetForms: true,
				side: 'right',
				target: $body,
				visibleClass: 'is-navPanel-visible'
			});

		// Get inner.
			$navPanelInner = $navPanel.children('nav');

		// Move nav content on breakpoint change.
			var $navContent = $nav.children();

			breakpoints.on('>small', function() {

				// NavPanel -> Nav.
					$navContent.appendTo($nav);

			});

			breakpoints.on('<=small', function() {

				// Nav -> NavPanel.
					$navContent.appendTo($navPanelInner);

			});

		// Hack: Disable transitions on WP.
			if (browser.os == 'wp'
			&&	browser.osVersion < 10)
				$navPanel
					.css('transition', 'none');

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000
		});

})(jQuery);

function reveal() {
	var reveals = document.querySelectorAll(".reveal");
	for (var i = 0; i < reveals.length; i++) {
	  var windowHeight = window.innerHeight;
	  var elementTop = reveals[i].getBoundingClientRect().top;
	  var elementVisible = 150;
	  if (elementTop < windowHeight - elementVisible) {
		reveals[i].classList.add("alive");
	  } else {
		reveals[i].classList.remove("alive");
	  }
	}
  }

  window.addEventListener("scroll", reveal);



  // To check the scroll position on page load
  reveal();