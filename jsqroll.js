	(function( $ ) {



		$.fn.jSqroll = function(method) {

			

			function ensureContainers(count) {
				var children = this.scrollParent.children();

				for (var i = 0; i < count ;i++) {
					var c = children[i];

					if (!c) {
						var c = $(this.containerTemplate({index:i}));
						this.scrollParent.append(c);
					}
				}
			}

			function computeVisibleItems() {
				var top = this.scrollParent.scrollTop();

				var item = this.scrollParent.children().first();


				var w = Math.floor(this.scrollParent.width() / item.outerWidth());
				var start = Math.floor(top / item.outerHeight()) * w;

				var end = (w * Math.ceil((top + this.scrollParent.height()) / item.outerHeight())) -1;

				return {
					start: start,
					end: Math.min(end, this.options.itemCount - 1)
				}

			}

			function setItem(index, value) {
				
				this.loaded[index] = 1;

				try {
					
					// get the parent.
					//
					var p = $('.content-parent', this.scrollParent)[index];

					var html = this.itemTemplate(value);
					$(p).html(html);
					
				}
				catch(ex) {
					console.error(ex);
				}
			}

			function loadItems(start, end) {

				var firstUnloaded = -1;
				for (var i = start; i <= end; i++) {
					if (!_.isUndefined(this.loaded[i])) {
						continue;
					}
					if (firstUnloaded < 0) {
						firstUnloaded = i;
					}
					this.loaded[i] = 0;
				}
				if (firstUnloaded >= 0) {
					this.options.loadCallback && this.options.loadCallback(firstUnloaded, end, this.setItem.bind(this));
				}
				
			}

			function onIndexChanged(index) {
				if (this.options.positionChanged) {
					this.options.positionChanged(index);
				}
			}

			function onScroll() {

				var items = this.computeVisibleItems();

				/*var bottom = scrollParent.innerHeight() + scrollParent.scrollTop()

				if (scrollParent.scrollTop() + scrollParent.innerHeight() >= bottom) {
					
					var os = options.onOverscroll(items.end);
					if (os) {
						items.end = os;
						maxItems = os;
					}
				}*/
		
			
				this.onIndexChanged(items.start);

				this.ensureContainers(items.end);

				this.loadItems(items.start, items.end);
			}

			function scrollToIndex(index) {
				var item = this.scrollParent.children().first();

				var w = Math.floor(this.scrollParent.width() / item.outerWidth());
				
				var top = (index / w) * item.outerHeight();
				this.scrollParent.scrollTop(top);
			}


			var methods = {
				init: function(opts) {
					
					return this.each(function(){
					 		
					 		var $this = $(this);


					 		var data = $this.data('state');

					 		if (!data) {

					 			data = {
					 				options: $.extend({
												position: 0,
												itemCount: 0,
												loadDelay: 200
											}, opts),
					 				scrollParent: $this,
					 				loaded: {}
					 				
					 			};

					 			data.scrollToIndex = scrollToIndex.bind(data);
					 			data.onScroll = onScroll.bind(data);
					 			data.loadItems = loadItems.bind(data);
								data.setItem = setItem.bind(data);
								data.computeVisibleItems = computeVisibleItems.bind(data);
								data.ensureContainers = ensureContainers.bind(data);
								data.onIndexChanged= onIndexChanged.bind(data);

					 			data.containerTemplate = _.template($(data.options.containerTemplateSelector).html());
								data.itemTemplate = _.template($(data.options.itemTemplateSelector).html());
				
					 			$this.data('state', data);

					 			// create a container item for measuring.
								//
								var firstContainer = $(data.containerTemplate({index:0}));
								$this.append(firstContainer);
								data.ensureContainers(data.options.itemCount);

								if (data.options.position) {
									data.scrollToIndex(data.options.position);
								}
								data.scrollParent.scroll(_.debounce(data.onScroll, data.options.loadDelay));
								data.onScroll();

								$(window).resize(data.onScroll);
					 		}
							
						});
				}
			}

			if ( methods[method] ) {
		      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		    } else if ( typeof method === 'object' || ! method ) {
		      return methods.init.apply( this, arguments );
		    } else {
		      $.error( 'Method ' +  method + ' does not exist on jQuery.jSqroll' );
		    }   
			
		};
	})( jQuery );
