
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

	(function( $ ) {



		$.fn.jSqroll = function(method) {

			

			function ensureContainers(count, enforce) {
				var children = this.itemParent.children();

				for (var i = 0; i < count ;i++) {
					var c = children[i];

					if (!c) {
						var c = $(this.containerTemplate({index:i}));
						this.itemParent.append(c);
					}
				}

				if (enforce) {
					for (var i = count; i < children.length; i++) {
						var c = children[i];
						if (c) {
							$(c).remove();
						}
					}
				}
			}

			function getHeight(el) {
				if (el[0] == window) {
					return window.innerHeight || document.documentElement.clientHeight;
				}
				else {
					return el.height();
				}
			}

			function computeVisibleItems() {

				var viewTop = this.scrollParent.scrollTop();
				//var topOffset = 0;

				var viewHeight = getHeight(this.scrollParent);


				if (this.itemParent[0] != (this.scrollParent && this.scrollParent[0])) {
					viewTop -= this.itemParent.position().top;
				}

			
				var item = this.itemParent.children().first();


				var w = Math.floor(this.itemParent.width() / item.outerWidth());

				var start = Math.floor(viewTop / item.outerHeight()) * w;

				var bottom = viewTop + viewHeight;

				var end = (w * Math.ceil(bottom / item.outerHeight())) -1;
				return {
					start: Math.max(0,start),
					end: Math.min(end, this.options.itemCount - 1)
				}

			}

			function setItem(index, value) {
				
				this.loaded[index] = 1;

				try {
					
					// get the parent.
					//
					var p = $(this.options.contentParentSelector, this.itemParent)[index];

					if (_.isUndefined(value.index)) {
						value.index = index;
					}
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
					console.log("Loading " + start + '->' + end);
					this.options.loadCallback && this.options.loadCallback(firstUnloaded, end, this.setItem.bind(this));
				}
				
			}

			function onIndexChanged(index) {
				this.jqThis.trigger('position_changed', index);
			}

			function onScroll() {

				var items = this.computeVisibleItems();

				/*var bottom = itemParent.innerHeight() + itemParent.scrollTop()

				if (itemParent.scrollTop() + itemParent.innerHeight() >= bottom) {
					
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
				var item = this.itemParent.children().first();

				var w = Math.floor(this.itemParent.width() / item.outerWidth());
				
				var top = (index / w) * item.outerHeight();

				if (this.itemParent[0] != (this.scrollParent && this.scrollParent[0])) {
					top += this.itemParent.position().top;
				}

				this.scrollParent.scrollTop(top);

			}


			var methods = {
				init: function(opts) {
					
					return this.each(function(){
					 		
					 		var $this = $(this);


					 		var data = $this.data('state');

					 		if (!data) {

					 			data = {

					 				jqThis : $this,
					 				options: $.extend({
												position: 0,
												itemCount: 0,
												loadDelay: 200,
												contentParentSelector: '.content-parent'
											}, opts),
					 				itemParent: $this,
					 				scrollParent: $(opts.scrollSourceSelector || $this),
					 				isPage: opts.scrollSourceSelector == window,
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
								data.scrollFunc = _.debounce(data.onScroll, data.options.loadDelay);
								data.scrollParent.scroll(data.scrollFunc);
								
								if (data.options.position) {
									data.scrollToIndex(data.options.position);
								}
								else {
									data.onScroll();
								}
								

								$(window).resize(data.onScroll);
					 		}
							
						});
				},
				destroy: function(){
					return this.each(function(){
						var $this = $(this);
						var data = $(this).data('state');
						if (!data) return;
						
						data.scrollParent.unbind('scroll', data.scrollFunc);
						$(window).unbind('resize', data.scrollFunc);
						$this.removeData('state');

					})
				},
				itemCount: function(newCount) {
					return this.each(function() {
						var data = $(this).data('state');
						if (!data) return;
						if (_.isUndefined(newCount)) {
							return data.options.itemCount;
						}
						else {
							data.options.itemCount = newCount;
							data.ensureContainers(newCount, true);
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
