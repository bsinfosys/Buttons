/* Buttons for DataTables
 * 2015 SpryMedia Ltd - datatables.net/license
 */
(function(window, document, undefined) {


var factory = function( $, DataTable ) {
"use strict";



var Buttons = function( dt, config )
{
	this.c = $.extend( true, {}, Buttons.defaults, config );

	// Don't want a deep copy for the buttons
	if ( config.buttons ) {
		this.c.buttons = config.buttons;
	}

	this.s = {
		dt: new DataTable.Api( dt ),
		buttons: [],
		subButtons: []
	};

	this.dom = {
		container: $('<'+this.c.dom.container.tag+'/>')
			.addClass( this.c.dom.container.className )
	};

	this._constructor();
};

Buttons.prototype = {
	action: function ( idx, action )
	{
		var button = this._indexToButton( idx ).conf;

		if ( action === undefined ) {
			return button.action;
		}

		button.action = action;

		return this;
	},


	add: function ( idx, config )
	{
		if ( typeof idx === 'string' && idx.indexOf('-') !== -1 ) {
			var idxs = idx.split('-');
			this.c.buttons[idxs[0]*1].buttons.splice( idxs[1]*1, 0, config );
		}
		else {
			this.c.buttons.splice( idx*1, 0, config );
		}

		this.dom.container.empty();
		this._buildButtons( this.c.buttons );

		return this;
	},


	container: function ()
	{
		return this.dom.container;
	},


	disable: function ( idx ) {
		var button = this._indexToButton( idx );
		button.node.addClass( 'disabled' );

		return this;
	},

	destroy: function ()
	{
		this.dom.container.remove();

		var buttonInsts = this.s.dt.settings()[0];

		for ( var i=0, ien=buttonInsts.length ; i<ien ; i++ ) {
			if ( buttonInsts.inst === this ) {
				buttonInsts.splice( i, 1 );
				break;
			}
		}

		return this;
	},

	enable: function ( idx, flag )
	{
		if ( flag === false ) {
			return this.disable( idx );
		}

		var button = this._indexToButton( idx );
		button.node.removeClass( 'disabled' );

		return this;
	},

	name: function ()
	{
		this.c.name;
	},

	node: function ( idx )
	{
		var button = this._indexToButton( idx );
		return button.node;
	},

	removePrep: function ( idx )
	{
		if ( typeof idx === 'number' || idx.indexOf('-') === -1 ) {
			this.s.buttons[ idx*1 ].node.remove();
			this.s.buttons[ idx*1 ] = null;
		}
		else {
			var idxs = idx.split('-');
			this.s.subButtons[ idxs[0]*1 ][ idxs[1]*1 ].node.remove();
			this.s.subButtons[ idxs[0]*1 ][ idxs[1]*1 ] = null;
		}

		return this;
	},

	removeCommit: function ()
	{
		var buttons = this.s.buttons;
		var subButtons = this.s.subButtons;
		var i, ien, j;

		for ( i=buttons.length-1 ; i>=0 ; i-- ) {
			if ( buttons[i] === null ) {
				buttons.splice( i, 1 );
				subButtons.splice( i, 1 );
				this.c.buttons.splice( i, 1 );
			}
		}

		for ( i=0, ien=subButtons.length ; i<ien ; i++ ) {
			for ( j=subButtons[i].length-1 ; j>=0 ; j-- ) {
				if ( subButtons[i][j] === null ) {
					subButtons[i].splice( j, 1 );
					this.c.buttons[i].buttons.splice( j, 1 );
				}
			}
		}

		return this;
	},

	text: function ( idx, label )
	{
		var button = this._indexToButton( idx );
		var linerTag = this.c.dom.buttonLiner.tag;

		if ( label === undefined ) {
			return button.conf.text;
		}

		button.conf.text = label;

		if ( linerTag ) {
			button.node.children( linerTag ).html( label );
		}
		else {
			button.node.html( label );
		}

		return this;
	},

	toIndex: function ( node )
	{
		var i, ien, j, jen;
		var buttons = this.s.buttons;
		var subButtons = this.s.subButtons;

		// Loop the main buttons first
		for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
			if ( buttons[i].node[0] === node ) {
				return i+'';
			}
		}

		// Then the sub-buttons
		for ( i=0, ien=subButtons.length ; i<ien ; i++ ) {
			for ( j=0, jen=subButtons[i].length ; j<jen ; j++ ) {
				if ( subButtons[i][j].node[0] === node ) {
					return i+'-'+j;
				}
			}
		}
	},

	_indexToButton: function ( idx )
	{
		if ( typeof idx === 'number' || idx.indexOf('-') === -1 ) {
			return this.s.buttons[ idx*1 ];
		}

		var idxs = idx.split('-');
		return this.s.subButtons[ idxs[0]*1 ][ idxs[1]*1 ];
	},


	_constructor: function ()
	{
		var that = this;
		var dt = this.s.dt;
		var dtSettings = dt.settings()[0];

		if ( ! dtSettings._buttons ) {
			dtSettings._buttons = [];
		}

		if ( $.inArray( this.c.name, $.map( dtSettings._buttons, function (v) { return v.name; } ) ) !== -1 ) {
			throw 'A button set of this name ('+this.c.name+') is already attached to this table';
		}

		dtSettings._buttons.push( {
			inst: this,
			name: this.c.name
		} );

		this._buildButtons( this.c.buttons );

		dt.on( 'destroy', function () {
			that.destroy();
		} );
	},


	_buildButtons: function ( buttons, container, collectionCounter )
	{
		var dtButtons = DataTable.ext.buttons;

		if ( ! container ) {
			container = this.dom.container;
			this.s.buttons = [];
			this.s.subButtons = [];
		}

		for ( var i=0, ien=buttons.length ; i<ien ; i++ ) {
			var conf = buttons[i];

			if ( typeof conf === 'function' ) {
				conf = conf( this.s.dt );
			}

			if ( typeof conf === 'string' ) {
				conf = $.extend( {}, dtButtons[ conf ] );
			}

			while ( conf.extend ) {
				// xxx what if dtButtons[ conf.extend ] is a function? or a string (why would it be a string?)
				// xxx drop the function and string resolver into a function?
				conf = $.extend( {}, dtButtons[ conf.extend ], conf );

				// Although we want the `conf` object to overwrite almost all of
				// the properties of the object being extended, the `extend`
				// property should from from the object being extended
				conf.extend = dtButtons[ conf.extend ].extend;
			}

			var button = this._buildButton( conf );

			container.append( button );

			if ( collectionCounter === undefined ) {
				this.s.buttons.push( {
					node: button,
					conf: conf
				} );
				this.s.subButtons.push( [] );
			}
			else {
				this.s.subButtons[ collectionCounter ].push( {
					node: button,
					conf: conf
				} );
			}

			if ( conf.buttons ) {
				var collectionDom = this.c.dom.collection;
				conf._collection = $('<'+collectionDom.tag+'/>')
					.addClass( collectionDom.className );

				this._buildButtons( conf.buttons, conf._collection, i );
			}
		}
	},


	_buildButton: function ( config )
	{
		var that = this;
		var buttonDom = this.c.dom.button;
		var linerDom = this.c.dom.buttonLiner;

		var button = $('<'+buttonDom.tag+'/>')
			.addClass( buttonDom.className )
			.on( 'click', function (e) {
				config.action.call( that, e, that.s.dt, button, config );
			} );

		if ( linerDom.tag ) {
			button.append(
				$('<'+linerDom.tag+'/>')
					.html( config.text )
					.addClass( linerDom.className )
			);
		}
		else {
			button.html( config.text );
		}

		return button;
	}
};


Buttons.defaults = {
	buttons: [ 'copy', 'csv', 'pdf', 'print' ],
	name: 'main',
	dom: {
		container: {
			tag: 'div',
			className: 'dt-buttons'
		},
		collection: {
			tag: 'div',
			className: 'dt-button-collection'
		},
		button: {
			tag: 'a',
			className: 'dt-button'
		},
		buttonLiner: {
			tag: 'span',
			className: ''
		}
	}
};



/**
 * Version information
 *
 * @name Buttons.version
 * @static
 */
Buttons.version = '0.0.1-dev';



$.extend( DataTable.ext.buttons, {
	text: {
		text: '',
		className: 'buttons-text',
		action: function ( e, dt, button, config ) {}
	},
	collection: {
		text: 'Collection',
		className: 'buttons-collection',
		action: function ( e, dt, button, config ) {
			var background;
			var host = button;
			var hostOffset = host.offset();
			var tableContainer = $( dt.table().container() );

			config._collection
				.appendTo( 'body' )
				.css( {
					top: hostOffset.top + host.height(),
					left: hostOffset.left
				} );

			// xxx only do this if it is position: absolute
			// xxx add css options for two-column three-column
			var listRight = hostOffset.left + config._collection.outerWidth();
			var tableRight = tableContainer.offset().left + tableContainer.width();
			if ( listRight > tableRight ) {
				config._collection.css( 'left', hostOffset.left - ( listRight - tableRight ) );
			}

			if ( config.background ) {
				background = $('<div/>')
					.addClass( config.backgroundClassName )
					.appendTo( 'body' );
			}

			// Need to break the 'thread' for the collection button being
			// activated by a click - it would also trigger this event
			setTimeout( function () {
				$(document).on( 'click.dtb-collection', function (e) {
					if ( ! $(e.target).parents().andSelf().filter( config._collection ).length ) {
						config._collection.detach();

						if ( background ) {
							background.remove();
						}

						$(document).off( 'click.dtb-collection' );
					}
				} );
			}, 10 );
		},
		background: true,
		backgroundClassName: 'dt-button-background',
		fade: true
	},
	copy: {
		text: 'Copy',
		className: 'buttons-copy',
		action: function ( e, dt, button, config ) {

		}
	},
	csv: {
		text: 'CSV',
		className: 'buttons-csv',
		action: function ( e, dt, button, config ) {

		}
	},
	pdf: {
		text: 'PDF',
		className: 'buttons-pdf',
		action: function ( e, dt, button, config ) {

		}
	},
	print: {
		text: 'Print',
		className: 'buttons-print',
		action: function ( e, dt, button, config ) {

		}
	}
} );



$.fn.dataTable.Buttons = Buttons;
$.fn.DataTable.Buttons = Buttons;


function groupSelector ( group, buttons )
{
	if ( ! group ) {
		return $.map( buttons, function ( v ) {
			return v.inst;
		} );
	}

	var ret = [];
	var names = $.map( buttons, function ( v ) {
		return v.name;
	} );

	// Flatten the group selector into an array of single options
	var process = function ( input ) {
		if ( $.isArray( input ) ) {
			for ( var i=0, ien=input.length ; i<ien ; i++ ) {
				process( input[i] );
			}
			return;
		}

		if ( typeof input === 'string' ) {
			if ( input.indexOf( ',' ) !== 0 ) {
				// String selector, list of names
				process( input.split(',') );
			}
			else {
				// String selector individual name
				var idx = $.inArray( $.trim(input), names );

				if ( idx !== -1 ) {
					ret.push( buttons[ idx ].inst );
				}
			}
		}
		else if ( typeof input === 'number' ) {
			// Index selector
			ret.push( buttons[ input ].inst );
		}
	};
	
	process( group );

	return ret;
}


function buttonSelector ( insts, selector )
{
	var ret = [];
	var run = function ( selector, inst ) {
		var i, ien, j, jen;
		var buttons = [];

		$.each( inst.s.buttons, function (i, v) {
			buttons.push( {
				node: v.node[0],
				name: v.name
			} );
		} );

		$.each( inst.s.subButtons, function (i, v) {
			$.each( v, function (j, w) {
				buttons.push( {
					node: w.node[0],
					name: w.name
				} );
			} );
		} );

		var nodes = $.map( buttons, function (v) {
			return v.node;
		} );

		if ( $.isArray( selector ) || selector instanceof $ ) {
			for ( i=0, ien=selector.length ; i<ien ; i++ ) {
				run( selector[i], inst );
			}
			return;
		}

		if ( selector === undefined || selector === '*' ) {
			// Select all
			for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
				ret.push( {
					inst: inst,
					idx: inst.toIndex( buttons[i].node )
				} );
			}
		}
		else if ( typeof selector === 'number' ) {
			// Main button index selector
			ret.push( {
				inst: inst,
				idx: selector
			} );
		}
		else if ( typeof selector === 'string' ) {
			if ( selector.indexOf( ',' ) !== -1 ) {
				// Split
				var a = selector.split(',');

				for ( i=0, ien=a.length ; i<ien ; i++ ) {
					run( $.trim(a[i]), inst );
				}
			}
			else if ( selector.match( /^\d+(\-\d+)?$/ ) ) {
				// Sub-button index selector
				ret.push( {
					inst: inst,
					idx: selector
				} );
			}
			else if ( selector.indexOf( ':name' ) !== -1 ) {
				// Button name selector
				var name = selector.replace( ':name', '' );

				for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
					if ( buttons[i].name === name ) {
						ret.push( {
							inst: inst,
							idx: inst.toIndex( buttons[i].node )
						} );
					}
				}
			}
			else {
				// jQuery selector on the nodes
				$( nodes ).filter( selector ).each( function () {
					ret.push( {
						inst: inst,
						idx: inst.toIndex( this )
					} );
				} );
			}
		}
		else if ( typeof selector === 'object' && selector.nodeName ) {
			// Node selector
			var idx = $.inArray( selector, nodes );

			if ( idx !== -1 ) {
				ret.push( {
					inst: inst,
					idx: inst.toIndex( nodes[ idx ] )
				} );
			}
		}
	};


	for ( var i=0, ien=insts.length ; i<ien ; i++ ) {
		var inst = insts[i];

		run( selector, inst );
	}

	return ret;
}


// DataTables 1.10 API
DataTable.Api.register( 'buttons()', function ( group, selector ) {
	// Argument shifting
	if ( selector === undefined ) {
		selector = group;
		group = undefined;
	}

	return this.iterator( true, 'table', function ( ctx ) {
		if ( ctx._buttons ) {
			var buttonInsts = groupSelector( group, ctx._buttons );

			return buttonSelector( buttonInsts, selector );
		}
	}, true );
} );


DataTable.Api.register( 'button()', function ( group, selector ) {
	// just run buttons() and truncate
	var buttons = this.buttons( group, selector );

	if ( buttons.length > 1 ) {
		buttons.splice( 1, buttons.length );
	}

	return buttons;
} );


DataTable.Api.registerPlural( 'buttons().action()', 'button().action()', function ( action ) {
	if ( action === undefined ) {
		return this.map( function ( set ) {
			 return set.inst.action( set.idx );
		} );
	}

	return this.each( function ( set ) {
		set.inst.action( set.idx, action );
	} );
} );

DataTable.Api.register( ['buttons().enable()', 'button().enable()'], function ( flag ) {
	return this.each( function ( set ) {
		set.inst.enable( set.idx, flag );
	} );
} );

DataTable.Api.register( ['buttons().disable()', 'button().disable()'], function () {
	return this.each( function ( set ) {
		set.inst.disable( set.idx );
	} );
} );

DataTable.Api.registerPlural( 'buttons().nodes()', 'button().node()', function () {
	return this.map( function ( set ) {
		return set.inst.node( set.idx );
	} );
} );

DataTable.Api.registerPlural( 'buttons().text()', 'button().text()', function ( label ) {
	if ( label === undefined ) {
		return this.map( function ( set ) {
			 return set.inst.text( set.idx );
		} );
	}

	return this.each( function ( set ) {
		set.inst.text( set.idx, label );
	} );
} );

DataTable.Api.registerPlural( 'buttons().trigger()', 'button().trigger()', function () {
	return this.each( function ( set ) {
		set.inst.node( set.idx ).trigger( 'click' );
	} );
} );

DataTable.Api.registerPlural( 'buttons().containers()', 'buttons().container()', function () {
	return this.map( function ( set ) {
		return set.inst.container();
	} ).unique();
} );

DataTable.Api.register( 'button().add()', function ( idx, conf ) {
	if ( this.length === 1 ) {
		this[0].inst.add( idx, conf );
	}

	return this;
} );

DataTable.Api.register( 'buttons().destroy()', function ( idx ) {
	this.pluck( 'inst' ).unique().each( function ( inst ) {
		inst.destroy();
	} );

	return this;
} );

DataTable.Api.registerPlural( 'buttons().remove()', 'buttons().remove()', function () {
	// Need to split into prep and commit so the indexes remain constant during the remove
	this.each( function ( set ) {
		set.inst.removePrep( set.idx );
	} );

	this.pluck( 'inst' ).unique().each( function ( inst ) {
		inst.removeCommit();
	} );

	return this;
} );


// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'init.dt.dtb', function (e, settings, json) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

/* xxx
	if ( settings.oInit.buttons ||
		 DataTable.defaults.buttons
	) {

	}
*/
} );


DataTable.ext.feature.push( {
	fnInit: function( settings ) {
		var api = new DataTable.Api( settings );
		var opts = api.init().buttons;

		if ( $.isArray( opts ) ) {
			opts = { buttons: opts };
		}

		return new Buttons( api, opts ).container();
	},
	cFeature: "B"
} );

return Buttons;
}; // /factory


// Define as an AMD module if possible
if ( typeof define === 'function' && define.amd ) {
	define( ['jquery', 'datatables'], factory );
}
else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    factory( require('jquery'), require('datatables') );
}
else if ( jQuery && !jQuery.fn.dataTable.Buttons ) {
	// Otherwise simply initialise as normal, stopping multiple evaluation
	factory( jQuery, jQuery.fn.dataTable );
}


})(window, document);

