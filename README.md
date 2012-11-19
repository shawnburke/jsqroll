#Description

JSqroll is a flexible scrolling helper that allows for efficient and pagable scrolling through lots of data.  It supports AJAX in a natural way.

The main thing to know about JSqroll is that it works with placeholder items rather than always dynamically loading things.  If you have data sets of less than a few items, the user gets a similar experience, but one that is more natural with how browsers like to scroll.

What JSqroll does is track which items are visible on the screen, then issues load callbacks for just those items.  When the user scrolls, they'll see placeholder items (these can look any way you'd like).  Once they stop scrolling for a period (default, 200ms), the load callback is invoked and the placeholders will be replaced with content you supply.

See a live demo [here](http://shawnburke.github.com/jsqroll/demo_el.html).

JSqroll depends on JQuery for DOM operations and [Underscore](http://underscorejs.org) for templates.

JSqroll currently supports:
			
* Incremental loading of element content
* Easy integration with AJAX-sourced data
* Element- or page-level scrolling
* Template-based element definitions

With a bit more work, JSqroll would be able to also support the infinite scroll scenario once the pre-provisioned number of items is scrolled through.  Perhaps a forker can do this.

#Docs
			
##Intro

JSqroll is designed to provide easy, paged loading of elements on a page using an AJAX callback.  It's different than the other infinite scroll plugins that use the JQuery load event to fault in HTML.  JSqroll is designed to give you more control of the process if you've got an AJAX endpoint to serve your data, but pre-loads elements rather than loading them as the user scrolls.  For small-to-medium (a few thousand) known-size data sets, this gives a better experience for users.

##Overview

JSqroll uses Underscore templates for two things:

1. The HTML template for the placeholder container element.
2. The HTML template for the created items.
			
JSqroll then creates all of the containers up front.  This requires that all of the containers be the same size.  If you need different sized containers, JScqroll is not for you.

##Example

Configuring JSqroll is easy.  With the following HTML:

<pre>
	&lt;-- The Container Template.  Default data items will have the field 'index' set. --&gt;
	&lt;script id='item_container_template' type='text/html'&gt;
			&lt;div class='container-item'&gt;
				&lt;div class='content-parent'&gt;
					&lt;h1&gt;&lt;%=index%&gt;&lt;/h1&gt;
				&lt;/div&gt;
			&lt;/div&gt;
	&lt;/script&gt;

	&lt;-- The Item Template.  Index field will be set if not supplied by the data  This content will be parented into the appropriate container under the 'contentParentSelector' element. --&gt;
	
	&lt;script id='item_template' type='text/html'&gt;
			&lt;h1&gt;&lt;div class='loaded'&gt;&lt;%=index%&gt;&lt;/div&gt;&lt;/h1&gt;
	&lt;/script&gt;


	&lt;-- The element that will host the scrolled content. --&gt;
	
	&lt;div id='scroller' style='height:600px;overflow-y:scroll;width:100%'&gt;&lt;/div&gt;
</pre>

JSqroll setup is as follows.


	// Check hash for a start index.
	var startIndex = 0;
	if (window.location.hash) {
		var i = Number(window.location.hash.substring(1));
		if (!_.isNaN(i)) {
			startIndex = i;
		}
	}


	function loadItems(start, end, setFunc){
		// simulate an async load.  Make your AJAX call(s) here.
		//
		_.defer(function(){

			for (var i = start; i <= end; i++) {
				var index = i;
				// setFunc is our callback to tell JSqroll what to use for the data.
				//
				setFunc(index, window._data[index]);
				
			}
		});
	}

	// set options.
	var options = {
		// set the template for the container element
		containerTemplateSelector: '#item_container_template',

		// a selector that will select an item in the container element.
		// item content will be parented into here.
		contentParentSelector: '.content-parent',
		
		// set the template for the element itself.  This will
		// be instantiated and parented under the container's 
		// contentParentSector.  
		// In other words $(contentParentSelector, container).html(itemHtml);
		itemTemplateSelector: '#item_template',

		// The total number of item containers to create.
		itemCount: _data.length,

		// The load callback.  This sig should be 
		// 		function loadCallback(startIndex, endIndex, setFunc)
		// Where setFunc is called with the data for each index item.  The value passed to setFunc
		// will be used in template instantiation
		loadCallback: loadItems,

		// The initial position
		//
		position: startIndex
	}

	// create and bind to the position_changed event.
	$('.scroller').jSqroll(options).bind('position_changed', function(e, index) {
		window.location.hash = index;
	});

## License

###(The MIT License)
####Copyright (c) 2012 Shawn Burke

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.  

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.