/**
 * Created by kenhuang on 2018/12/16.
 */

(function (window) {

    function patchConsole(window) {
        /**
         * 直接禁用console相关功能。可以在IE6安装companionjs启用
         * IE8/9只能在调试模式下才启用console
         */
        var prop, method
        var dummy = function() {}
        var properties = ['memory']
        var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
        'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
        'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',')
        if (window  && !window.console) {
            var console
            window.console = {}
            console = window.console
            while (prop = properties.pop()){ // jshint ignore:line
                if (!console[prop]) {
                    console[prop] = {}
                }
            }
            while (method = methods.pop()) { // jshint ignore:line
                if (!console[method]) {
                    console[method] = dummy
                }
            }
        }
    }
    function patchWebSockets(window) {
        // import ''
    }
    function patchHistory(window) {
        // import ''
    }

    function patchCSS3(window) {
/*
PIE: CSS3 rendering for IE
Version 2.0beta1
http://css3pie.com
Dual-licensed for use under the Apache License Version 2.0 or the General Public License (GPL) Version 2.
*/
(function( win, doc ) {
    var PIE = win[ 'PIE' ] || ( win[ 'PIE' ] = {} );
/**
 * Simple utility for merging objects
 * @param {Object} obj1 The main object into which all others will be merged
 * @param {...Object} var_args Other objects which will be merged into the first, in order
 */
PIE.merge = function( obj1 ) {
    var i, len, p, objN, args = arguments;
    for( i = 1, len = args.length; i < len; i++ ) {
        objN = args[i];
        for( p in objN ) {
            if( objN.hasOwnProperty( p ) ) {
                obj1[ p ] = objN[ p ];
            }
        }
    }
    return obj1;
};


PIE.merge(PIE, {

    // Constants
    CSS_PREFIX: '-pie-',
    STYLE_PREFIX: 'Pie',
    CLASS_PREFIX: 'pie_',

    tableCellTags: {
        'TD': 1,
        'TH': 1
    },

    /**
     * Lookup table of elements which cannot take custom children.
     */
    childlessElements: {
        'TABLE':1,
        'THEAD':1,
        'TBODY':1,
        'TFOOT':1,
        'TR':1,
        'INPUT':1,
        'TEXTAREA':1,
        'SELECT':1,
        'OPTION':1,
        'IMG':1,
        'HR':1
    },

    /**
     * Elements that can receive user focus
     */
    focusableElements: {
        'A':1,
        'INPUT':1,
        'TEXTAREA':1,
        'SELECT':1,
        'BUTTON':1
    },

    /**
     * Values of the type attribute for input elements displayed as buttons
     */
    inputButtonTypes: {
        'submit':1,
        'button':1,
        'reset':1
    },

    emptyFn: function() {}
});

// Force the background cache to be used. No reason it shouldn't be.
try {
    doc.execCommand( 'BackgroundImageCache', false, true );
} catch(e) {}

(function() {
    /*
     * IE version detection approach by James Padolsey, with modifications -- from
     * http://james.padolsey.com/javascript/detect-ie-in-js-using-conditional-comments/
     */
    var ieVersion = 4,
        div = doc.createElement('div'),
        all = div.getElementsByTagName('i'),
        shape;
    while (
        div.innerHTML = '<!--[if gt IE ' + (++ieVersion) + ']><i></i><![endif]-->',
        all[0]
    ) {}
    PIE.ieVersion = ieVersion;

    // Detect IE6
    if( ieVersion === 6 ) {
        // IE6 can't access properties with leading dash, but can without it.
        PIE.CSS_PREFIX = PIE.CSS_PREFIX.replace( /^-/, '' );
    }

    PIE.ieDocMode = doc.documentMode || PIE.ieVersion;

    // Detect VML support (a small number of IE installs don't have a working VML engine)
    div.innerHTML = '<v:shape adj="1"/>';
    shape = div.firstChild;
    shape.style['behavior'] = 'url(#default#VML)';
    PIE.supportsVML = (typeof shape['adj'] === "object");
})();
/**
 * Utility functions
 */
(function() {
    var idNum = 0,
        imageSizes = {};


    PIE.Util = {

        /**
         * Generate and return a unique ID for a given object. The generated ID is stored
         * as a property of the object for future reuse. For DOM Elements, don't use this
         * but use the IE-native uniqueID property instead.
         * @param {Object} obj
         */
        getUID: function( obj ) {
            return obj && obj[ '_pieId' ] || ( obj[ '_pieId' ] = '_' + idNum++ );
        },


        /**
         * Execute a callback function, passing it the dimensions of a given image once
         * they are known.
         * @param {string} src The source URL of the image
         * @param {function({w:number, h:number})} func The callback function to be called once the image dimensions are known
         * @param {Object} ctx A context object which will be used as the 'this' value within the executed callback function
         */
        withImageSize: function( src, func, ctx ) {
            var size = imageSizes[ src ], img, queue;
            if( size ) {
                // If we have a queue, add to it
                if( Object.prototype.toString.call( size ) === '[object Array]' ) {
                    size.push( [ func, ctx ] );
                }
                // Already have the size cached, call func right away
                else {
                    func.call( ctx, size );
                }
            } else {
                queue = imageSizes[ src ] = [ [ func, ctx ] ]; //create queue
                img = new Image();
                img.onload = function() {
                    size = imageSizes[ src ] = { w: img.width, h: img.height };
                    for( var i = 0, len = queue.length; i < len; i++ ) {
                        queue[ i ][ 0 ].call( queue[ i ][ 1 ], size );
                    }
                    img.onload = null;
                };
                img.src = src;
            }
        }
    };
})();/**
 * Utility functions for handling gradients
 */
PIE.GradientUtil = {

    toSideAngles: {
        'top': 0,
        'right': 90,
        'bottom': 180,
        'left': 270
    },

    getGradientMetrics: function( el, width, height, gradientInfo ) {
        var angle = gradientInfo.angle,
            toPos = gradientInfo.gradientTo,
            dX, dY,
            endPoint,
            startX, startY,
            endX, endY;

        // If an angle was specified, just use it
        if (angle) {
            angle = angle.degrees();
        }
        // If a to-position was specified, find the appropriate angle for it
        else if (toPos) {
            // To a corner; find the adjacent corners and use the angle perpendicular to them
            if (toPos[1]) {
                dX = ( toPos[0] == 'top' || toPos[1] == 'top' ) ? width : -width;
                dY = ( toPos[0] == 'left' || toPos[1] == 'left' ) ? -height : height;
                angle = Math.atan2(dY, dX) * 180 / Math.PI;
            }
            // To a side; map to a vertical/horizontal angle
            else {
                angle = this.toSideAngles[toPos[0]];
            }
        }
        // Neither specified; default is top to bottom
        else {
            angle = 180;
        }

        // Normalize the angle to a value between [0, 360)
        while( angle < 0 ) {
            angle += 360;
        }
        angle = angle % 360;

        // Find the end point of the gradient line, extending the angle from the center point
        // to where it intersects the perpendicular line passing through the nearest corner.
        endPoint = PIE.GradientUtil.perpendicularIntersect(width / 2, height / 2, angle,
            ( angle >= 180 ? 0 : width ), ( angle < 90 || angle > 270 ? 0 : height )
        );
        endX = endPoint[0];
        endY = endPoint[1];
        startX = width - endX;
        startY = height - endY;

        return {
            angle: angle,
            endX: endX,
            endY: endY,
            startX: startX,
            startY: startY,
            lineLength: PIE.GradientUtil.distance( startX, startY, endX, endY )
        };
    },

    /**
     * Find the point along a given line (defined by a starting point and an angle), at which
     * that line is intersected by a perpendicular line extending through another point.
     * @param x1 - x coord of the starting point
     * @param y1 - y coord of the starting point
     * @param angle - angle of the line extending from the starting point (in degrees)
     * @param x2 - x coord of point along the perpendicular line
     * @param y2 - y coord of point along the perpendicular line
     * @return [ x, y ]
     */
    perpendicularIntersect: function( x1, y1, angle, x2, y2 ) {
        // Handle straight vertical and horizontal angles, for performance and to avoid
        // divide-by-zero errors.
        if( angle === 0 || angle === 180 ) {
            return [ x1, y2 ];
        }
        else if( angle === 90 || angle === 270 ) {
            return [ x2, y1 ];
        }
        else {
            // General approach: determine the Ax+By=C formula for each line (the slope of the second
            // line is the negative inverse of the first) and then solve for where both formulas have
            // the same x/y values.
            var a1 = Math.tan( ( angle - 90 ) * Math.PI / 180 ),
                c1 = a1 * x1 - y1,
                a2 = -1 / a1,
                c2 = a2 * x2 - y2,
                d = a2 - a1,
                endX = ( c2 - c1 ) / d,
                endY = ( a1 * c2 - a2 * c1 ) / d;
            return [ endX, endY ];
        }
    },

    /**
     * Find the distance between two points
     * @param {Number} p1x
     * @param {Number} p1y
     * @param {Number} p2x
     * @param {Number} p2y
     * @return {Number} the distance
     */
    distance: function( p1x, p1y, p2x, p2y ) {
        var dx = p2x - p1x,
            dy = p2y - p1y;
        return Math.abs(
            dx === 0 ? dy :
            dy === 0 ? dx :
            Math.sqrt( dx * dx + dy * dy )
        );
    }

};/**
 * 
 */
PIE.Observable = function() {
    /**
     * List of registered observer functions
     */
    this.observers = [];

    /**
     * Hash of function ids to their position in the observers list, for fast lookup
     */
    this.indexes = {};
};
PIE.Observable.prototype = {

    observe: function( fn ) {
        var id = PIE.Util.getUID( fn ),
            indexes = this.indexes,
            observers = this.observers;
        if( !( id in indexes ) ) {
            indexes[ id ] = observers.length;
            observers.push( fn );
        }
    },

    unobserve: function( fn ) {
        var id = PIE.Util.getUID( fn ),
            indexes = this.indexes;
        if( id && id in indexes ) {
            delete this.observers[ indexes[ id ] ];
            delete indexes[ id ];
        }
    },

    fire: function() {
        var o = this.observers,
            i = o.length;
        while( i-- ) {
            o[ i ] && o[ i ]();
        }
    }

};/*
 * Simple heartbeat timer - this is a brute-force workaround for syncing issues caused by IE not
 * always firing the onmove and onresize events when elements are moved or resized. We check a few
 * times every second to make sure the elements have the correct position and size. See Element.js
 * which adds heartbeat listeners based on the custom -pie-poll flag, which defaults to true in IE8-9
 * and false elsewhere.
 */

PIE.Heartbeat = new PIE.Observable();
PIE.Heartbeat.run = function() {
    var me = this,
        interval;
    if( !me.running ) {
        interval = doc.documentElement.currentStyle.getAttribute( PIE.CSS_PREFIX + 'poll-interval' ) || 250;
        (function beat() {
            me.fire();
            setTimeout(beat, interval);
        })();
        me.running = 1;
    }
};
/**
 * Create an observable listener for the onunload event
 */
(function() {
    PIE.OnUnload = new PIE.Observable();

    function handleUnload() {
        PIE.OnUnload.fire();
        win.detachEvent( 'onunload', handleUnload );
        win[ 'PIE' ] = null;
    }

    win.attachEvent( 'onunload', handleUnload );

    /**
     * Attach an event which automatically gets detached onunload
     */
    PIE.OnUnload.attachManagedEvent = function( target, name, handler ) {
        target.attachEvent( name, handler );
        this.observe( function() {
            target.detachEvent( name, handler );
        } );
    };
})()/**
 * Create a single observable listener for window resize events.
 */
PIE.OnResize = new PIE.Observable();

PIE.OnUnload.attachManagedEvent( win, 'onresize', function() { PIE.OnResize.fire(); } );
/**
 * Create a single observable listener for scroll events. Used for lazy loading based
 * on the viewport, and for fixed position backgrounds.
 */
(function() {
    PIE.OnScroll = new PIE.Observable();

    function scrolled() {
        PIE.OnScroll.fire();
    }

    PIE.OnUnload.attachManagedEvent( win, 'onscroll', scrolled );

    PIE.OnResize.observe( scrolled );
})();
/**
 * Create a single observable listener for document mouseup events.
 */
PIE.OnMouseup = new PIE.Observable();

PIE.OnUnload.attachManagedEvent( doc, 'onmouseup', function() { PIE.OnMouseup.fire(); } );
/**
 * Wrapper for length and percentage style values. The value is immutable. A singleton instance per unique
 * value is returned from PIE.getLength() - always use that instead of instantiating directly.
 * @constructor
 * @param {string} val The CSS string representing the length. It is assumed that this will already have
 *                 been validated as a valid length or percentage syntax.
 */
PIE.Length = (function() {
    var lengthCalcEl = doc.createElement( 'length-calc' ),
        parent = doc.body || doc.documentElement,
        s = lengthCalcEl.style,
        conversions = {},
        units = [ 'mm', 'cm', 'in', 'pt', 'pc' ],
        i = units.length,
        instances = {};

    s.position = 'absolute';
    s.top = s.left = '-9999px';

    parent.appendChild( lengthCalcEl );
    while( i-- ) {
        s.width = '100' + units[i];
        conversions[ units[i] ] = lengthCalcEl.offsetWidth / 100;
    }
    parent.removeChild( lengthCalcEl );

    // All calcs from here on will use 1em
    s.width = '1em';


    function Length( val ) {
        this.val = val;
    }
    Length.prototype = {
        /**
         * Regular expression for matching the length unit
         * @private
         */
        unitRE: /(px|em|ex|mm|cm|in|pt|pc|%)$/,

        /**
         * Get the numeric value of the length
         * @return {number} The value
         */
        getNumber: function() {
            var num = this.num,
                UNDEF;
            if( num === UNDEF ) {
                num = this.num = parseFloat( this.val );
            }
            return num;
        },

        /**
         * Get the unit of the length
         * @return {string} The unit
         */
        getUnit: function() {
            var unit = this.unit,
                m;
            if( !unit ) {
                m = this.val.match( this.unitRE );
                unit = this.unit = ( m && m[0] ) || 'px';
            }
            return unit;
        },

        /**
         * Determine whether this is a percentage length value
         * @return {boolean}
         */
        isPercentage: function() {
            return this.getUnit() === '%';
        },

        /**
         * Resolve this length into a number of pixels.
         * @param {Element} el - the context element, used to resolve font-relative values
         * @param {(function():number|number)=} pct100 - the number of pixels that equal a 100% percentage. This can be either a number or a
         *                  function which will be called to return the number.
         */
        pixels: function( el, pct100 ) {
            var num = this.getNumber(),
                unit = this.getUnit();
            switch( unit ) {
                case "px":
                    return num;
                case "%":
                    return num * ( typeof pct100 === 'function' ? pct100() : pct100 ) / 100;
                case "em":
                    return num * this.getEmPixels( el );
                case "ex":
                    return num * this.getEmPixels( el ) / 2;
                default:
                    return num * conversions[ unit ];
            }
        },

        /**
         * The em and ex units are relative to the font-size of the current element,
         * however if the font-size is set using non-pixel units then we get that value
         * rather than a pixel conversion. To get around this, we keep a floating element
         * with width:1em which we insert into the target element and then read its offsetWidth.
         * For elements that won't accept a child we insert into the parent node and perform
         * additional calculation. If the font-size *is* specified in pixels, then we use that
         * directly to avoid the expensive DOM manipulation.
         * @param {Element} el
         * @return {number}
         */
        getEmPixels: function( el ) {
            var fs = el.currentStyle.fontSize,
                px, parent, me;

            if( fs.indexOf( 'px' ) > 0 ) {
                return parseFloat( fs );
            }
            else if( el.tagName in PIE.childlessElements ) {
                me = this;
                parent = el.parentNode;
                return PIE.getLength( fs ).pixels( parent, function() {
                    return me.getEmPixels( parent );
                } );
            }
            else {
                el.appendChild( lengthCalcEl );
                px = lengthCalcEl.offsetWidth;
                if( lengthCalcEl.parentNode === el ) { //not sure how this could be false but it sometimes is
                    el.removeChild( lengthCalcEl );
                }
                return px;
            }
        }
    };

    /**
     * Convert a pixel length into a point length
     */
    Length.pxToPt = function( px ) {
        return px / conversions[ 'pt' ];
    };


    /**
     * Retrieve a PIE.Length instance for the given value. A shared singleton instance is returned for each unique value.
     * @param {string} val The CSS string representing the length. It is assumed that this will already have
     *                 been validated as a valid length or percentage syntax.
     */
    PIE.getLength = function( val ) {
        return instances[ val ] || ( instances[ val ] = new Length( val ) );
    };

    return Length;
})();
/**
 * Wrapper for a CSS3 bg-position value. Takes up to 2 position keywords and 2 lengths/percentages.
 * @constructor
 * @param {Array.<PIE.Tokenizer.Token>} tokens The tokens making up the background position value.
 */
PIE.BgPosition = (function() {

    var length_fifty = PIE.getLength( '50%' ),
        vert_idents = { 'top': 1, 'center': 1, 'bottom': 1 },
        horiz_idents = { 'left': 1, 'center': 1, 'right': 1 };


    function BgPosition( tokens ) {
        this.tokens = tokens;
    }
    BgPosition.prototype = {
        /**
         * Normalize the values into the form:
         * [ xOffsetSide, xOffsetLength, yOffsetSide, yOffsetLength ]
         * where: xOffsetSide is either 'left' or 'right',
         *        yOffsetSide is either 'top' or 'bottom',
         *        and x/yOffsetLength are both PIE.Length objects.
         * @return {Array}
         */
        getValues: function() {
            if( !this._values ) {
                var tokens = this.tokens,
                    len = tokens.length,
                    Tokenizer = PIE.Tokenizer,
                    identType = Tokenizer.Type,
                    length_zero = PIE.getLength( '0' ),
                    type_ident = identType.IDENT,
                    type_length = identType.LENGTH,
                    type_percent = identType.PERCENT,
                    type, value,
                    vals = [ 'left', length_zero, 'top', length_zero ];

                // If only one value, the second is assumed to be 'center'
                if( len === 1 ) {
                    tokens.push( new Tokenizer.Token( type_ident, 'center' ) );
                    len++;
                }

                // Two values - CSS2
                if( len === 2 ) {
                    // If both idents, they can appear in either order, so switch them if needed
                    if( type_ident & ( tokens[0].tokenType | tokens[1].tokenType ) &&
                        tokens[0].tokenValue in vert_idents && tokens[1].tokenValue in horiz_idents ) {
                        tokens.push( tokens.shift() );
                    }
                    if( tokens[0].tokenType & type_ident ) {
                        if( tokens[0].tokenValue === 'center' ) {
                            vals[1] = length_fifty;
                        } else {
                            vals[0] = tokens[0].tokenValue;
                        }
                    }
                    else if( tokens[0].isLengthOrPercent() ) {
                        vals[1] = PIE.getLength( tokens[0].tokenValue );
                    }
                    if( tokens[1].tokenType & type_ident ) {
                        if( tokens[1].tokenValue === 'center' ) {
                            vals[3] = length_fifty;
                        } else {
                            vals[2] = tokens[1].tokenValue;
                        }
                    }
                    else if( tokens[1].isLengthOrPercent() ) {
                        vals[3] = PIE.getLength( tokens[1].tokenValue );
                    }
                }

                // Three or four values - CSS3
                else {
                    // TODO
                }

                this._values = vals;
            }
            return this._values;
        },

        /**
         * Find the coordinates of the background image from the upper-left corner of the background area.
         * Note that these coordinate values are not rounded.
         * @param {Element} el
         * @param {number} width - the width for percentages (background area width minus image width)
         * @param {number} height - the height for percentages (background area height minus image height)
         * @return {Object} { x: Number, y: Number }
         */
        coords: function( el, width, height ) {
            var vals = this.getValues(),
                pxX = vals[1].pixels( el, width ),
                pxY = vals[3].pixels( el, height );

            return {
                x: vals[0] === 'right' ? width - pxX : pxX,
                y: vals[2] === 'bottom' ? height - pxY : pxY
            };
        }
    };

    return BgPosition;
})();
/**
 * Wrapper for a CSS3 background-size value.
 * @constructor
 * @param {String|PIE.Length} w The width parameter
 * @param {String|PIE.Length} h The height parameter, if any
 */
PIE.BgSize = (function() {

    var CONTAIN = 'contain',
        COVER = 'cover',
        AUTO = 'auto';


    function BgSize( w, h ) {
        this.w = w;
        this.h = h;
    }
    BgSize.prototype = {

        pixels: function( el, areaW, areaH, imgW, imgH ) {
            var me = this,
                w = me.w,
                h = me.h,
                areaRatio = areaW / areaH,
                imgRatio = imgW / imgH;

            if ( w === CONTAIN ) {
                w = imgRatio > areaRatio ? areaW : areaH * imgRatio;
                h = imgRatio > areaRatio ? areaW / imgRatio : areaH;
            }
            else if ( w === COVER ) {
                w = imgRatio < areaRatio ? areaW : areaH * imgRatio;
                h = imgRatio < areaRatio ? areaW / imgRatio : areaH;
            }
            else if ( w === AUTO ) {
                h = ( h === AUTO ? imgH : h.pixels( el, areaH ) );
                w = h * imgRatio;
            }
            else {
                w = w.pixels( el, areaW );
                h = ( h === AUTO ? w / imgRatio : h.pixels( el, areaH ) );
            }

            return { w: w, h: h };
        }

    };

    BgSize.DEFAULT = new BgSize( AUTO, AUTO );

    return BgSize;
})();
/**
 * Wrapper for angle values; handles conversion to degrees from all allowed angle units
 * @constructor
 * @param {string} val The raw CSS value for the angle. It is assumed it has been pre-validated.
 */
PIE.Angle = (function() {
    function Angle( val ) {
        this.val = val;
    }
    Angle.prototype = {
        unitRE: /[a-z]+$/i,

        /**
         * @return {string} The unit of the angle value
         */
        getUnit: function() {
            return this._unit || ( this._unit = this.val.match( this.unitRE )[0].toLowerCase() );
        },

        /**
         * Get the numeric value of the angle in degrees.
         * @return {number} The degrees value
         */
        degrees: function() {
            var deg = this._deg, u, n;
            if( deg === undefined ) {
                u = this.getUnit();
                n = parseFloat( this.val, 10 );
                deg = this._deg = ( u === 'deg' ? n : u === 'rad' ? n / Math.PI * 180 : u === 'grad' ? n / 400 * 360 : u === 'turn' ? n * 360 : 0 );
            }
            return deg;
        }
    };

    return Angle;
})();/**
 * Abstraction for colors values. Allows detection of rgba values. A singleton instance per unique
 * value is returned from PIE.getColor() - always use that instead of instantiating directly.
 * @constructor
 * @param {string} val The raw CSS string value for the color
 */
PIE.Color = (function() {

    /*
     * hsl2rgb from http://codingforums.com/showthread.php?t=11156
     * code by Jason Karl Davis (http://www.jasonkarldavis.com)
     * swiped from cssSandpaper by Zoltan Hawryluk (http://www.useragentman.com/blog/csssandpaper-a-css3-javascript-library/)
     * modified for formatting and size optimizations
     */
    function hsl2rgb( h, s, l ) {
        var m1, m2, r, g, b,
            round = Math.round;
        s /= 100;
        l /= 100;
        if ( !s ) { r = g = b = l * 255; }
        else {
            if ( l <= 0.5 ) { m2 = l * ( s + 1 ); }
            else { m2 = l + s - l * s; }
            m1 = l * 2 - m2;
            h = ( h % 360 ) / 360;
            r = hueToRgb( m1, m2, h + 1/3 );
            g = hueToRgb( m1, m2, h );
            b = hueToRgb( m1, m2, h - 1/3 );
        }
        return { r: round( r ), g: round( g ), b: round( b ) };
    }
    function hueToRgb( m1, m2, hue ) {
        var v;
        if ( hue < 0 ) { hue += 1; }
        else if ( hue > 1 ) { hue -= 1; }
        if ( 6 * hue < 1 ) { v = m1 + ( m2 - m1 ) * hue * 6; }
        else if ( 2 * hue < 1 ) { v = m2; }
        else if ( 3 * hue < 2 ) { v = m1 + ( m2 - m1 ) * ( 2/3 - hue ) * 6; }
        else { v = m1; }
        return 255 * v;
    }




    var instances = {};

    function Color( val ) {
        this.val = val;
    }

    /**
     * Regular expression for matching rgba colors and extracting their components
     * @type {RegExp}
     */
    Color.rgbOrRgbaRE = /\s*rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(\d+|\d*\.\d+))?\s*\)\s*/;
    Color.hslOrHslaRE = /\s*hsla?\(\s*(\d*\.?\d+)\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(,\s*(\d+|\d*\.\d+))?\s*\)\s*/;

    /**
     * Hash of color keyword names to their corresponding hex values. Encoded for
     * small size and expanded into a hash on startup.
     */
    Color.names = {};

    var names = 'black|0|navy|3k|darkblue|b|mediumblue|1u|blue|1e|darkgreen|jk1|green|5j4|teal|3k|darkcyan|26j|deepskyblue|ad0|darkturquoise|2xe|mediumspringgreen|8nd|lime|va|springgreen|3j|aqua|3k|cyan|0|midnightblue|xunl|dodgerblue|7ogf|lightseagreen|2zsb|forestgreen|2lbs|seagreen|guut|darkslategray|12pk|limegreen|4wkj|mediumseagreen|dwlb|turquoise|5v8f|royalblue|r2p|steelblue|75qr|darkslateblue|2fh3|mediumturquoise|ta9|indigo|32d2|darkolivegreen|emr1|cadetblue|ebu9|cornflowerblue|6z4d|mediumaquamarine|3459|dimgray|3nwf|slateblue|1bok|olivedrab|1opi|slategray|6y5p|lightslategray|9vk9|mediumslateblue|5g0l|lawngreen|27ma|chartreuse|48ao|aquamarine|5w|maroon|18|purple|3k|olive|p6o|gray|3k|lightslateblue|5j7j|skyblue|4q98|lightskyblue|f|blueviolet|3bhk|darkred|15we|darkmagenta|3v|saddlebrown|djc|darkseagreen|69vg|lightgreen|1og1|mediumpurple|3ivc|darkviolet|sfv|palegreen|6zt1|darkorchid|awk|yellowgreen|292e|sienna|7r3v|brown|6sxp|darkgray|6bgf|lightblue|5vlp|greenyellow|7k9|paleturquoise|2pxb|lightsteelblue|169c|powderblue|5jc|firebrick|1rgc|darkgoldenrod|8z55|mediumorchid|2jm0|rosybrown|34jg|darkkhaki|1mfw|silver|49jp|mediumvioletred|8w5h|indianred|8tef|peru|82r|violetred|3ntd|feldspar|212d|chocolate|16eh|tan|ewe|lightgrey|1kqv|palevioletred|6h8g|metle|fnp|orchid|2dj2|goldenrod|abu|crimson|20ik|gainsboro|13mo|plum|12pt|burlywood|1j8q|lightcyan|3794|lavender|8agr|darksalmon|3rsw|violet|6wz8|palegoldenrod|k3g|lightcoral|28k6|khaki|k5o|aliceblue|3n7|honeydew|1dd|azure|f|sandybrown|5469|wheat|1q37|beige|4kp|whitesmoke|p|mintcream|1z9|ghostwhite|46bp|salmon|25bn|antiquewhite|l7p|linen|zz|lightgoldenrodyellow|1yk|oldlace|46qc|red|1gka|magenta|73|fuchsia|0|deeppink|3v8|orangered|9kd|tomato|5zb|hotpink|19p|coral|49o|darkorange|2i8|lightsalmon|41m|orange|w6|lightpink|3i9|pink|1ze|gold|4dx|peachpuff|qh|navajowhite|s4|moccasin|16w|bisque|f|mistyrose|t|blanchedalmond|1d8|papayawhip|so|lavenderblush|80|seashell|zd|cornsilk|ku|lemonchiffon|dt|floralwhite|z|snow|a|yellow|sm|lightyellow|68|ivory|g|white|f'.split('|'),
        i = 0, len = names.length, color = 0, hexColor;
    for(; i < len; i += 2) {
        color += parseInt(names[i + 1], 36);
        hexColor = color.toString(16);
        Color.names[names[i]] = '#000000'.slice(0, -hexColor.length) + hexColor;
    }

    Color.prototype = {
        /**
         * @private
         */
        parse: function() {
            if( !this._color ) {
                var me = this,
                    color = me.val,
                    alpha, vLower, m, rgb;

                // RGB or RGBA colors
                if( m = color.match( Color.rgbOrRgbaRE ) ) {
                    color = me.rgbToHex( +m[1], +m[2], +m[3] );
                    alpha = m[5] ? +m[5] : 1;
                }
                // HSL or HSLA colors
                else if( m = color.match( Color.hslOrHslaRE ) ) {
                    rgb = hsl2rgb( m[1], m[2], m[3] );
                    color = me.rgbToHex( rgb.r, rgb.g, rgb.b );
                    alpha = m[5] ? +m[5] : 1;
                }
                else {
                    if( Color.names.hasOwnProperty( vLower = color.toLowerCase() ) ) {
                        color = Color.names[vLower];
                    }
                    alpha = ( color === 'transparent' ? 0 : 1 );
                }
                me._color = color;
                me._alpha = alpha;
            }
        },

        /**
         * Converts RGB color channels to a hex value string
         */
        rgbToHex: function( r, g, b ) {
            return '#' + ( r < 16 ? '0' : '' ) + r.toString( 16 ) +
                         ( g < 16 ? '0' : '' ) + g.toString( 16 ) +
                         ( b < 16 ? '0' : '' ) + b.toString( 16 );
        },

        /**
         * Retrieve the value of the color in a format usable by IE natively. This will be the same as
         * the raw input value, except for rgb(a) and hsl(a) values which will be converted to a hex value.
         * @param {Element} el The context element, used to get 'currentColor' keyword value.
         * @return {string} Color value
         */
        colorValue: function( el ) {
            this.parse();
            return this._color === 'currentColor' ? PIE.getColor( el.currentStyle.color ).colorValue( el ) : this._color;
        },

        /**
         * Retrieve the value of the color in a normalized six-digit hex format.
         * @param el
         */
        hexValue: function( el ) {
            var color = this.colorValue( el );
            // At this point the color should be either a 3- or 6-digit hex value, or the string "transparent".

            function ch( i ) {
                return color.charAt( i );
            }

            // Fudge transparent to black - should be ignored anyway since its alpha will be 0
            if( color === 'transparent' ) {
                color = '#000';
            }
            // Expand 3-digit to 6-digit hex
            if( ch(0) === '#' && color.length === 4 ) {
                color = '#' + ch(1) + ch(1) + ch(2) + ch(2) + ch(3) + ch(3);
            }
            return color;
        },

        /**
         * Retrieve the alpha value of the color. Will be 1 for all values except for rgba values
         * with an alpha component.
         * @return {number} The alpha value, from 0 to 1.
         */
        alpha: function() {
            this.parse();
            return this._alpha;
        }
    };


    /**
     * Retrieve a PIE.Color instance for the given value. A shared singleton instance is returned for each unique value.
     * @param {string} val The CSS string representing the color. It is assumed that this will already have
     *                 been validated as a valid color syntax.
     */
    PIE.getColor = function(val) {
        return instances[ val ] || ( instances[ val ] = new Color( val ) );
    };

    return Color;
})();/**
 * A tokenizer for CSS value strings.
 * @constructor
 * @param {string} css The CSS value string
 */
PIE.Tokenizer = (function() {
    function Tokenizer( css ) {
        this.css = css;
        this.ch = 0;
        this.tokens = [];
        this.tokenIndex = 0;
    }

    /**
     * Enumeration of token type constants.
     * @enum {number}
     */
    var Type = Tokenizer.Type = {
        ANGLE: 1,
        CHARACTER: 2,
        COLOR: 4,
        DIMEN: 8,
        FUNCTION: 16,
        IDENT: 32,
        LENGTH: 64,
        NUMBER: 128,
        OPERATOR: 256,
        PERCENT: 512,
        STRING: 1024,
        URL: 2048
    };

    /**
     * A single token
     * @constructor
     * @param {number} type The type of the token - see PIE.Tokenizer.Type
     * @param {string} value The value of the token
     */
    Tokenizer.Token = function( type, value ) {
        this.tokenType = type;
        this.tokenValue = value;
    };
    Tokenizer.Token.prototype = {
        isLength: function() {
            return this.tokenType & Type.LENGTH || ( this.tokenType & Type.NUMBER && this.tokenValue === '0' );
        },
        isLengthOrPercent: function() {
            return this.isLength() || this.tokenType & Type.PERCENT;
        }
    };

    Tokenizer.prototype = {
        whitespace: /\s/,
        number: /^[\+\-]?(\d*\.)?\d+/,
        url: /^url\(\s*("([^"]*)"|'([^']*)'|([!#$%&*-~]*))\s*\)/i,
        ident: /^\-?[_a-z][\w-]*/i,
        string: /^("([^"]*)"|'([^']*)')/,
        operator: /^[\/,]/,
        hash: /^#[\w]+/,
        hashColor: /^#([\da-f]{6}|[\da-f]{3})/i,

        unitTypes: {
            'px': Type.LENGTH, 'em': Type.LENGTH, 'ex': Type.LENGTH,
            'mm': Type.LENGTH, 'cm': Type.LENGTH, 'in': Type.LENGTH,
            'pt': Type.LENGTH, 'pc': Type.LENGTH,
            'deg': Type.ANGLE, 'rad': Type.ANGLE, 'grad': Type.ANGLE
        },

        colorFunctions: {
            'rgb': 1, 'rgba': 1, 'hsl': 1, 'hsla': 1
        },


        /**
         * Advance to and return the next token in the CSS string. If the end of the CSS string has
         * been reached, null will be returned.
         * @param {boolean} forget - if true, the token will not be stored for the purposes of backtracking with prev().
         * @return {PIE.Tokenizer.Token}
         */
        next: function( forget ) {
            var css, ch, firstChar, match, val,
                me = this;

            function newToken( type, value ) {
                var tok = new Tokenizer.Token( type, value );
                if( !forget ) {
                    me.tokens.push( tok );
                    me.tokenIndex++;
                }
                return tok;
            }
            function failure() {
                me.tokenIndex++;
                return null;
            }

            // In case we previously backed up, return the stored token in the next slot
            if( this.tokenIndex < this.tokens.length ) {
                return this.tokens[ this.tokenIndex++ ];
            }

            // Move past leading whitespace characters
            while( this.whitespace.test( this.css.charAt( this.ch ) ) ) {
                this.ch++;
            }
            if( this.ch >= this.css.length ) {
                return failure();
            }

            ch = this.ch;
            css = this.css.substring( this.ch );
            firstChar = css.charAt( 0 );
            switch( firstChar ) {
                case '#':
                    if( match = css.match( this.hashColor ) ) {
                        this.ch += match[0].length;
                        return newToken( Type.COLOR, match[0] );
                    }
                    break;

                case '"':
                case "'":
                    if( match = css.match( this.string ) ) {
                        this.ch += match[0].length;
                        return newToken( Type.STRING, match[2] || match[3] || '' );
                    }
                    break;

                case "/":
                case ",":
                    this.ch++;
                    return newToken( Type.OPERATOR, firstChar );

                case 'u':
                    if( match = css.match( this.url ) ) {
                        this.ch += match[0].length;
                        return newToken( Type.URL, match[2] || match[3] || match[4] || '' );
                    }
            }

            // Numbers and values starting with numbers
            if( match = css.match( this.number ) ) {
                val = match[0];
                this.ch += val.length;

                // Check if it is followed by a unit
                if( css.charAt( val.length ) === '%' ) {
                    this.ch++;
                    return newToken( Type.PERCENT, val + '%' );
                }
                if( match = css.substring( val.length ).match( this.ident ) ) {
                    val += match[0];
                    this.ch += match[0].length;
                    return newToken( this.unitTypes[ match[0].toLowerCase() ] || Type.DIMEN, val );
                }

                // Plain ol' number
                return newToken( Type.NUMBER, val );
            }

            // Identifiers
            if( match = css.match( this.ident ) ) {
                val = match[0];
                this.ch += val.length;

                // Named colors
                if( val.toLowerCase() in PIE.Color.names || val === 'currentColor' || val === 'transparent' ) {
                    return newToken( Type.COLOR, val );
                }

                // Functions
                if( css.charAt( val.length ) === '(' ) {
                    this.ch++;

                    // Color values in function format: rgb, rgba, hsl, hsla
                    if( val.toLowerCase() in this.colorFunctions ) {
                        function isNum( tok ) {
                            return tok && tok.tokenType & Type.NUMBER;
                        }
                        function isNumOrPct( tok ) {
                            return tok && ( tok.tokenType & ( Type.NUMBER | Type.PERCENT ) );
                        }
                        function isValue( tok, val ) {
                            return tok && tok.tokenValue === val;
                        }
                        function next() {
                            return me.next( 1 );
                        }

                        if( ( val.charAt(0) === 'r' ? isNumOrPct( next() ) : isNum( next() ) ) &&
                            isValue( next(), ',' ) &&
                            isNumOrPct( next() ) &&
                            isValue( next(), ',' ) &&
                            isNumOrPct( next() ) &&
                            ( val === 'rgb' || val === 'hsa' || (
                                isValue( next(), ',' ) &&
                                isNum( next() )
                            ) ) &&
                            isValue( next(), ')' ) ) {
                            return newToken( Type.COLOR, this.css.substring( ch, this.ch ) );
                        }
                        return failure();
                    }

                    return newToken( Type.FUNCTION, val );
                }

                // Other identifier
                return newToken( Type.IDENT, val );
            }

            // Standalone character
            this.ch++;
            return newToken( Type.CHARACTER, firstChar );
        },

        /**
         * Determine whether there is another token
         * @return {boolean}
         */
        hasNext: function() {
            var next = this.next();
            this.prev();
            return !!next;
        },

        /**
         * Back up and return the previous token
         * @return {PIE.Tokenizer.Token}
         */
        prev: function() {
            return this.tokens[ this.tokenIndex-- - 2 ];
        },

        /**
         * Retrieve all the tokens in the CSS string
         * @return {Array.<PIE.Tokenizer.Token>}
         */
        all: function() {
            while( this.next() ) {}
            return this.tokens;
        },

        /**
         * Return a list of tokens from the current position until the given function returns
         * true. The final token will not be included in the list.
         * @param {function():boolean} func - test function
         * @param {boolean} require - if true, then if the end of the CSS string is reached
         *        before the test function returns true, null will be returned instead of the
         *        tokens that have been found so far.
         * @return {Array.<PIE.Tokenizer.Token>}
         */
        until: function( func, require ) {
            var list = [], t, hit;
            while( t = this.next() ) {
                if( func( t ) ) {
                    hit = true;
                    this.prev();
                    break;
                }
                list.push( t );
            }
            return require && !hit ? null : list;
        }
    };

    return Tokenizer;
})();/**
 * Handles calculating, caching, and detecting changes to size and position of the element.
 * @constructor
 * @param {Element} el the target element
 */
PIE.BoundsInfo = function( el ) {
    this.targetElement = el;
};
PIE.BoundsInfo.prototype = {

    _locked: 0,

    /**
     * Determines if the element's position has changed since the last update.
     * TODO this does a simple getBoundingClientRect comparison for detecting the
     * changes in position, which may not always be accurate; it's possible that
     * an element will actually move relative to its positioning parent, but its position
     * relative to the viewport will stay the same. Need to come up with a better way to
     * track movement. The most accurate would be the same logic used in RootRenderer.updatePos()
     * but that is a more expensive operation since it performs DOM walking, and we want this
     * check to be as fast as possible. Perhaps introduce a -pie-* flag to trigger the slower
     * but more accurate method?
     */
    positionChanged: function() {
        var last = this._lastBounds,
            bounds;
        return !last || ( ( bounds = this.getBounds() ) && ( last.x !== bounds.x || last.y !== bounds.y ) );
    },

    sizeChanged: function() {
        var last = this._lastBounds,
            bounds;
        return !last || ( ( bounds = this.getBounds() ) && ( last.w !== bounds.w || last.h !== bounds.h ) );
    },

    getLiveBounds: function() {
        var el = this.targetElement,
            rect = el.getBoundingClientRect(),
            isIE9 = PIE.ieDocMode === 9,
            isIE7 = PIE.ieVersion === 7,
            width = rect.right - rect.left;
        return {
            x: rect.left,
            y: rect.top,
            // In some cases scrolling the page will cause IE9 to report incorrect dimensions
            // in the rect returned by getBoundingClientRect, so we must query offsetWidth/Height
            // instead. Also IE7 is inconsistent in using logical vs. device pixels in measurements
            // so we must calculate the ratio and use it in certain places as a position adjustment.
            w: isIE9 || isIE7 ? el.offsetWidth : width,
            h: isIE9 || isIE7 ? el.offsetHeight : rect.bottom - rect.top,
            logicalZoomRatio: ( isIE7 && width ) ? el.offsetWidth / width : 1
        };
    },

    getBounds: function() {
        return this._locked ? 
                ( this._lockedBounds || ( this._lockedBounds = this.getLiveBounds() ) ) :
                this.getLiveBounds();
    },

    hasBeenQueried: function() {
        return !!this._lastBounds;
    },

    lock: function() {
        ++this._locked;
    },

    unlock: function() {
        if( !--this._locked ) {
            if( this._lockedBounds ) this._lastBounds = this._lockedBounds;
            this._lockedBounds = null;
        }
    }

};
(function() {

function cacheWhenLocked( fn ) {
    var uid = PIE.Util.getUID( fn );
    return function() {
        if( this._locked ) {
            var cache = this._lockedValues || ( this._lockedValues = {} );
            return ( uid in cache ) ? cache[ uid ] : ( cache[ uid ] = fn.call( this ) );
        } else {
            return fn.call( this );
        }
    }
}


PIE.StyleInfoBase = {

    _locked: 0,

    /**
     * Create a new StyleInfo class, with the standard constructor, and augmented by
     * the StyleInfoBase's members.
     * @param proto
     */
    newStyleInfo: function( proto ) {
        function StyleInfo( el ) {
            this.targetElement = el;
            this._lastCss = this.getCss();
        }
        PIE.merge( StyleInfo.prototype, PIE.StyleInfoBase, proto );
        StyleInfo._propsCache = {};
        return StyleInfo;
    },

    /**
     * Get an object representation of the target CSS style, caching it for each unique
     * CSS value string.
     * @return {Object}
     */
    getProps: function() {
        var css = this.getCss(),
            cache = this.constructor._propsCache;
        return css ? ( css in cache ? cache[ css ] : ( cache[ css ] = this.parseCss( css ) ) ) : null;
    },

    /**
     * Get the raw CSS value for the target style
     * @return {string}
     */
    getCss: cacheWhenLocked( function() {
        var el = this.targetElement,
            ctor = this.constructor,
            s = el.style,
            cs = el.currentStyle,
            cssProp = this.cssProperty,
            styleProp = this.styleProperty,
            prefixedCssProp = ctor._prefixedCssProp || ( ctor._prefixedCssProp = PIE.CSS_PREFIX + cssProp ),
            prefixedStyleProp = ctor._prefixedStyleProp || ( ctor._prefixedStyleProp = PIE.STYLE_PREFIX + styleProp.charAt(0).toUpperCase() + styleProp.substring(1) );
        return s[ prefixedStyleProp ] || cs.getAttribute( prefixedCssProp ) || s[ styleProp ] || cs.getAttribute( cssProp );
    } ),

    /**
     * Determine whether the target CSS style is active.
     * @return {boolean}
     */
    isActive: cacheWhenLocked( function() {
        return !!this.getProps();
    } ),

    /**
     * Determine whether the target CSS style has changed since the last time it was used.
     * @return {boolean}
     */
    changed: cacheWhenLocked( function() {
        var currentCss = this.getCss(),
            changed = currentCss !== this._lastCss;
        this._lastCss = currentCss;
        return changed;
    } ),

    cacheWhenLocked: cacheWhenLocked,

    lock: function() {
        ++this._locked;
    },

    unlock: function() {
        if( !--this._locked ) {
            delete this._lockedValues;
        }
    }
};

})();/**
 * Handles parsing, caching, and detecting changes to background (and -pie-background) CSS
 * @constructor
 * @param {Element} el the target element
 */
PIE.BackgroundStyleInfo = PIE.StyleInfoBase.newStyleInfo( {

    cssProperty: PIE.CSS_PREFIX + 'background',
    styleProperty: PIE.STYLE_PREFIX + 'Background',

    attachIdents: { 'scroll':1, 'fixed':1, 'local':1 },
    repeatIdents: { 'repeat-x':1, 'repeat-y':1, 'repeat':1, 'no-repeat':1 },
    originAndClipIdents: { 'padding-box':1, 'border-box':1, 'content-box':1 },
    positionIdents: { 'top':1, 'right':1, 'bottom':1, 'left':1, 'center':1 },
    sizeIdents: { 'contain':1, 'cover':1 },
    tbIdents: { 'top': 1, 'bottom': 1 },
    lrIdents: { 'left': 1, 'right': 1 },
    propertyNames: {
        CLIP: 'backgroundClip',
        COLOR: 'backgroundColor',
        IMAGE: 'backgroundImage',
        ORIGIN: 'backgroundOrigin',
        POSITION: 'backgroundPosition',
        REPEAT: 'backgroundRepeat',
        SIZE: 'backgroundSize'
    },

    /**
     * For background styles, we support the -pie-background property but fall back to the standard
     * backround* properties.  The reason we have to use the prefixed version is that IE natively
     * parses the standard properties and if it sees something it doesn't know how to parse, for example
     * multiple values or gradient definitions, it will throw that away and not make it available through
     * currentStyle.
     *
     * Format of return object:
     * {
     *     color: <PIE.Color>,
     *     colorClip: <'border-box' | 'padding-box'>,
     *     bgImages: [
     *         {
     *             imgType: 'image',
     *             imgUrl: 'image.png',
     *             imgRepeat: <'no-repeat' | 'repeat-x' | 'repeat-y' | 'repeat'>,
     *             bgPosition: <PIE.BgPosition>,
     *             bgAttachment: <'scroll' | 'fixed' | 'local'>,
     *             bgOrigin: <'border-box' | 'padding-box' | 'content-box'>,
     *             bgClip: <'border-box' | 'padding-box'>,
     *             bgSize: <PIE.BgSize>,
     *             origString: 'url(img.png) no-repeat top left'
     *         },
     *         {
     *             imgType: 'linear-gradient',
     *             gradientTo: [<'top' | 'bottom'>, <'left' | 'right'>?],
     *             angle: <PIE.Angle>,
     *             stops: [
     *                 { color: <PIE.Color>, offset: <PIE.Length> },
     *                 { color: <PIE.Color>, offset: <PIE.Length> }, ...
     *             ]
     *         }
     *     ]
     * }
     * @param {String} css
     * @override
     */
    parseCss: function( css ) {
        var el = this.targetElement,
            cs = el.currentStyle,
            tokenizer, token, image,
            tok_type = PIE.Tokenizer.Type,
            type_operator = tok_type.OPERATOR,
            type_ident = tok_type.IDENT,
            type_color = tok_type.COLOR,
            tokType, tokVal,
            beginCharIndex = 0,
            positionIdents = this.positionIdents,
            gradient, stop, width, height, gradientTo, len, tbIdents, lrIdents,
            props = { bgImages: [] };

        function isBgPosToken( token ) {
            return token && token.isLengthOrPercent() || ( token.tokenType & type_ident && token.tokenValue in positionIdents );
        }

        function sizeToken( token ) {
            return token && ( ( token.isLengthOrPercent() && PIE.getLength( token.tokenValue ) ) || ( token.tokenValue === 'auto' && 'auto' ) );
        }

        // If the CSS3-specific -pie-background property is present, parse it
        if( this.getCss3() ) {
            tokenizer = new PIE.Tokenizer( css );
            image = {};

            while( token = tokenizer.next() ) {
                tokType = token.tokenType;
                tokVal = token.tokenValue;

                if( !image.imgType && tokType & tok_type.FUNCTION && tokVal === 'linear-gradient' ) {
                    gradient = { stops: [], imgType: tokVal };
                    stop = {};
                    while( token = tokenizer.next() ) {
                        tokType = token.tokenType;
                        tokVal = token.tokenValue;

                        // If we reached the end of the function and had at least 2 stops, flush the info
                        if( tokType & tok_type.CHARACTER && tokVal === ')' ) {
                            if( stop.color ) {
                                gradient.stops.push( stop );
                            }
                            if( gradient.stops.length > 1 ) {
                                PIE.merge( image, gradient );
                            }
                            break;
                        }

                        // Color stop - must start with color
                        if( tokType & type_color ) {
                            // if we already have an angle/position, make sure that the previous token was a comma
                            if( gradient.angle || gradient.gradientTo ) {
                                token = tokenizer.prev();
                                if( token.tokenType !== type_operator ) {
                                    break; //fail
                                }
                                tokenizer.next();
                            }

                            stop = {
                                color: PIE.getColor( tokVal )
                            };
                            // check for offset following color
                            token = tokenizer.next();
                            if( token.isLengthOrPercent() ) {
                                stop.offset = PIE.getLength( token.tokenValue );
                            } else {
                                tokenizer.prev();
                            }
                        }
                        // Angle - can only appear in first spot
                        else if( tokType & tok_type.ANGLE && !gradient.angle && !gradient.gradientTo && !stop.color && !gradient.stops.length ) {
                            gradient.angle = new PIE.Angle( token.tokenValue );
                        }
                        // "to <side-or-corner>" - can only appear in first spot
                        else if( tokType & tok_type.IDENT && tokVal === 'to' && !gradient.gradientTo && !gradient.angle && !stop.color && !gradient.stops.length ) {
                            tbIdents = this.tbIdents;
                            lrIdents = this.lrIdents;

                            gradientTo = tokenizer.until( function( t ) {
                                return !(t && t.tokenType & tok_type.IDENT && ( t.tokenValue in tbIdents || t.tokenValue in lrIdents ));
                            } );
                            len = gradientTo.length;
                            gradientTo = [ gradientTo[0] && gradientTo[0].tokenValue, gradientTo[1] && gradientTo[1].tokenValue ];

                            // bail unless there are 1 or 2 values, or if the 2 values are from the same pair of sides
                            if ( len < 1 || len > 2 || ( len > 1 && (
                                ( gradientTo[0] in tbIdents && gradientTo[1] in tbIdents ) ||
                                ( gradientTo[0] in lrIdents && gradientTo[1] in lrIdents )
                            ) ) ) {
                                break;
                            }
                            gradient.gradientTo = gradientTo;
                        }
                        else if( tokType & type_operator && tokVal === ',' ) {
                            if( stop.color ) {
                                gradient.stops.push( stop );
                                stop = {};
                            }
                        }
                        else {
                            // Found something we didn't recognize; fail without adding image
                            break;
                        }
                    }
                }
                else if( !image.imgType && tokType & tok_type.URL ) {
                    image.imgUrl = tokVal;
                    image.imgType = 'image';
                }
                else if( isBgPosToken( token ) && !image.bgPosition ) {
                    tokenizer.prev();
                    image.bgPosition = new PIE.BgPosition(
                        tokenizer.until( function( t ) {
                            return !isBgPosToken( t );
                        }, false )
                    );
                }
                else if( tokType & type_ident ) {
                    if( tokVal in this.repeatIdents && !image.imgRepeat ) {
                        image.imgRepeat = tokVal;
                    }
                    else if( tokVal in this.originAndClipIdents && !image.bgOrigin ) {
                        image.bgOrigin = tokVal;
                        if( ( token = tokenizer.next() ) && ( token.tokenType & type_ident ) &&
                            token.tokenValue in this.originAndClipIdents ) {
                            image.bgClip = token.tokenValue;
                        } else {
                            image.bgClip = tokVal;
                            tokenizer.prev();
                        }
                    }
                    else if( tokVal in this.attachIdents && !image.bgAttachment ) {
                        image.bgAttachment = tokVal;
                    }
                    else {
                        return null;
                    }
                }
                else if( tokType & type_color && !props.color ) {
                    props.color = PIE.getColor( tokVal );
                }
                else if( tokType & type_operator && tokVal === '/' && !image.bgSize && image.bgPosition ) {
                    // background size
                    token = tokenizer.next();
                    if( token.tokenType & type_ident && token.tokenValue in this.sizeIdents ) {
                        image.bgSize = new PIE.BgSize( token.tokenValue );
                    }
                    else if( width = sizeToken( token ) ) {
                        height = sizeToken( tokenizer.next() );
                        if ( !height ) {
                            height = width;
                            tokenizer.prev();
                        }
                        image.bgSize = new PIE.BgSize( width, height );
                    }
                    else {
                        return null;
                    }
                }
                // new layer
                else if( tokType & type_operator && tokVal === ',' && image.imgType ) {
                    image.origString = css.substring( beginCharIndex, tokenizer.ch - 1 );
                    beginCharIndex = tokenizer.ch;
                    props.bgImages.push( image );
                    image = {};
                }
                else {
                    // Found something unrecognized; chuck everything
                    return null;
                }
            }

            // leftovers
            if( image.imgType ) {
                image.origString = css.substring( beginCharIndex );
                props.bgImages.push( image );
            }

            props.colorClip = image.bgClip;
        }

        // Otherwise, use the standard background properties; let IE give us the values rather than parsing them
        else {
            this.withActualBg( PIE.ieDocMode < 9 ?
                function() {
                    var propNames = this.propertyNames,
                        posX = cs[propNames.POSITION + 'X'],
                        posY = cs[propNames.POSITION + 'Y'],
                        img = cs[propNames.IMAGE],
                        color = cs[propNames.COLOR];

                    if( color !== 'transparent' ) {
                        props.color = PIE.getColor( color )
                    }
                    if( img !== 'none' ) {
                        props.bgImages = [ {
                            imgType: 'image',
                            imgUrl: new PIE.Tokenizer( img ).next().tokenValue,
                            imgRepeat: cs[propNames.REPEAT],
                            bgPosition: new PIE.BgPosition( new PIE.Tokenizer( posX + ' ' + posY ).all() )
                        } ];
                    }
                } :
                function() {
                    var propNames = this.propertyNames,
                        splitter = /\s*,\s*/,
                        images = cs[propNames.IMAGE].split( splitter ),
                        color = cs[propNames.COLOR],
                        repeats, positions, origins, clips, sizes, i, len, image, sizeParts;

                    if( color !== 'transparent' ) {
                        props.color = PIE.getColor( color )
                    }

                    len = images.length;
                    if( len && images[0] !== 'none' ) {
                        repeats = cs[propNames.REPEAT].split( splitter );
                        positions = cs[propNames.POSITION].split( splitter );
                        origins = cs[propNames.ORIGIN].split( splitter );
                        clips = cs[propNames.CLIP].split( splitter );
                        sizes = cs[propNames.SIZE].split( splitter );

                        props.bgImages = [];
                        for( i = 0; i < len; i++ ) {
                            image = images[ i ];
                            if( image && image !== 'none' ) {
                                sizeParts = sizes[i].split( ' ' );
                                props.bgImages.push( {
                                    origString: image + ' ' + repeats[ i ] + ' ' + positions[ i ] + ' / ' + sizes[ i ] + ' ' +
                                                origins[ i ] + ' ' + clips[ i ],
                                    imgType: 'image',
                                    imgUrl: new PIE.Tokenizer( image ).next().tokenValue,
                                    imgRepeat: repeats[ i ],
                                    bgPosition: new PIE.BgPosition( new PIE.Tokenizer( positions[ i ] ).all() ),
                                    bgOrigin: origins[ i ],
                                    bgClip: clips[ i ],
                                    bgSize: new PIE.BgSize( sizeParts[ 0 ], sizeParts[ 1 ] )
                                } );
                            }
                        }
                    }
                }
            );
        }

        return ( props.color || props.bgImages[0] ) ? props : null;
    },

    /**
     * Execute a function with the actual background styles (not overridden with runtimeStyle
     * properties set by the renderers) available via currentStyle.
     * @param fn
     */
    withActualBg: function( fn ) {
        var isIE9 = PIE.ieDocMode > 8,
            propNames = this.propertyNames,
            rs = this.targetElement.runtimeStyle,
            rsImage = rs[propNames.IMAGE],
            rsColor = rs[propNames.COLOR],
            rsRepeat = rs[propNames.REPEAT],
            rsClip, rsOrigin, rsSize, rsPosition, ret;

        if( rsImage ) rs[propNames.IMAGE] = '';
        if( rsColor ) rs[propNames.COLOR] = '';
        if( rsRepeat ) rs[propNames.REPEAT] = '';
        if( isIE9 ) {
            rsClip = rs[propNames.CLIP];
            rsOrigin = rs[propNames.ORIGIN];
            rsPosition = rs[propNames.POSITION];
            rsSize = rs[propNames.SIZE];
            if( rsClip ) rs[propNames.CLIP] = '';
            if( rsOrigin ) rs[propNames.ORIGIN] = '';
            if( rsPosition ) rs[propNames.POSITION] = '';
            if( rsSize ) rs[propNames.SIZE] = '';
        }

        ret = fn.call( this );

        if( rsImage ) rs[propNames.IMAGE] = rsImage;
        if( rsColor ) rs[propNames.COLOR] = rsColor;
        if( rsRepeat ) rs[propNames.REPEAT] = rsRepeat;
        if( isIE9 ) {
            if( rsClip ) rs[propNames.CLIP] = rsClip;
            if( rsOrigin ) rs[propNames.ORIGIN] = rsOrigin;
            if( rsPosition ) rs[propNames.POSITION] = rsPosition;
            if( rsSize ) rs[propNames.SIZE] = rsSize;
        }

        return ret;
    },

    getCss: PIE.StyleInfoBase.cacheWhenLocked( function() {
        return this.getCss3() ||
               this.withActualBg( function() {
                   var cs = this.targetElement.currentStyle,
                       propNames = this.propertyNames;
                   return cs[propNames.COLOR] + ' ' + cs[propNames.IMAGE] + ' ' + cs[propNames.REPEAT] + ' ' +
                   cs[propNames.POSITION + 'X'] + ' ' + cs[propNames.POSITION + 'Y'];
               } );
    } ),

    getCss3: PIE.StyleInfoBase.cacheWhenLocked( function() {
        var el = this.targetElement;
        return el.style[ this.styleProperty ] || el.currentStyle.getAttribute( this.cssProperty );
    } ),


    /**
     * For a given background-origin value, return the dimensions of the background area.
     * @param {String} bgOrigin
     * @param {PIE.BoundsInfo} boundsInfo
     * @param {PIE.BorderStyleInfo} borderInfo
     */
    getBgAreaSize: function( bgOrigin, boundsInfo, borderInfo, paddingInfo ) {
        var el = this.targetElement,
            bounds = boundsInfo.getBounds(),
            w = bounds.w,
            h = bounds.h,
            borders, paddings;

        if( bgOrigin !== 'border-box' ) {
            borders = borderInfo.getProps();
            if( borders && ( borders = borders.widths ) ) {
                w -= borders[ 'l' ].pixels( el ) + borders[ 'l' ].pixels( el );
                h -= borders[ 't' ].pixels( el ) + borders[ 'b' ].pixels( el );
            }
        }

        if ( bgOrigin === 'content-box' ) {
            paddings = paddingInfo.getProps();
            if ( paddings ) {
                w -= paddings[ 'l' ].pixels( el ) + paddings[ 'l' ].pixels( el );
                h -= paddings[ 't' ].pixels( el ) + paddings[ 'b' ].pixels( el );
            }
        }

        return { w: w, h: h };
    },


    /**
     * Tests if style.PiePngFix or the -pie-png-fix property is set to true in IE6.
     */
    isPngFix: function() {
        var val = 0, el;
        if( PIE.ieVersion < 7 ) {
            el = this.targetElement;
            val = ( '' + ( el.style[ PIE.STYLE_PREFIX + 'PngFix' ] || el.currentStyle.getAttribute( PIE.CSS_PREFIX + 'png-fix' ) ) === 'true' );
        }
        return val;
    },
    
    /**
     * The isActive logic is slightly different, because getProps() always returns an object
     * even if it is just falling back to the native background properties.  But we only want
     * to report is as being "active" if either the -pie-background override property is present
     * and parses successfully or '-pie-png-fix' is set to true in IE6.
     */
    isActive: PIE.StyleInfoBase.cacheWhenLocked( function() {
        return (this.getCss3() || this.isPngFix()) && !!this.getProps();
    } )

} );/**
 * Handles parsing, caching, and detecting changes to border CSS
 * @constructor
 * @param {Element} el the target element
 */
PIE.BorderStyleInfo = PIE.StyleInfoBase.newStyleInfo( {

    sides: [ 'Top', 'Right', 'Bottom', 'Left' ],
    namedWidths: {
        'thin': '1px',
        'medium': '3px',
        'thick': '5px'
    },

    parseCss: function( css ) {
        var w = {},
            s = {},
            c = {},
            active = false,
            colorsSame = true,
            stylesSame = true,
            widthsSame = true;

        this.withActualBorder( function() {
            var el = this.targetElement,
                cs = el.currentStyle,
                i = 0,
                style, color, width, lastStyle, lastColor, lastWidth, side, ltr;
            for( ; i < 4; i++ ) {
                side = this.sides[ i ];

                ltr = side.charAt(0).toLowerCase();
                style = s[ ltr ] = cs[ 'border' + side + 'Style' ];
                color = cs[ 'border' + side + 'Color' ];
                width = cs[ 'border' + side + 'Width' ];

                if( i > 0 ) {
                    if( style !== lastStyle ) { stylesSame = false; }
                    if( color !== lastColor ) { colorsSame = false; }
                    if( width !== lastWidth ) { widthsSame = false; }
                }
                lastStyle = style;
                lastColor = color;
                lastWidth = width;

                c[ ltr ] = PIE.getColor( color );

                width = w[ ltr ] = PIE.getLength( s[ ltr ] === 'none' ? '0' : ( this.namedWidths[ width ] || width ) );
                if( width.pixels( this.targetElement ) > 0 ) {
                    active = true;
                }
            }
        } );

        return active ? {
            widths: w,
            styles: s,
            colors: c,
            widthsSame: widthsSame,
            colorsSame: colorsSame,
            stylesSame: stylesSame
        } : null;
    },

    getCss: PIE.StyleInfoBase.cacheWhenLocked( function() {
        var el = this.targetElement,
            cs = el.currentStyle,
            css;

        // Don't redraw or hide borders for cells in border-collapse:collapse tables
        if( !( el.tagName in PIE.tableCellTags && el.offsetParent.currentStyle.borderCollapse === 'collapse' ) ) {
            this.withActualBorder( function() {
                css = cs.borderWidth + '|' + cs.borderStyle + '|' + cs.borderColor;
            } );
        }
        return css;
    } ),

    /**
     * Execute a function with the actual border styles (not overridden with runtimeStyle
     * properties set by the renderers) available via currentStyle.
     * @param fn
     */
    withActualBorder: function( fn ) {
        var rs = this.targetElement.runtimeStyle,
            rsWidth = rs.borderWidth,
            rsColor = rs.borderColor,
            ret;

        if( rsWidth ) rs.borderWidth = '';
        if( rsColor ) rs.borderColor = '';

        ret = fn.call( this );

        if( rsWidth ) rs.borderWidth = rsWidth;
        if( rsColor ) rs.borderColor = rsColor;

        return ret;
    }

} );
/**
 * Handles parsing, caching, and detecting changes to border-image CSS
 * @constructor
 * @param {Element} el the target element
 */
PIE.BorderImageStyleInfo = PIE.StyleInfoBase.newStyleInfo( {

    cssProperty: 'border-image',
    styleProperty: 'borderImage',

    repeatIdents: { 'stretch':1, 'round':1, 'repeat':1, 'space':1 },

    parseCss: function( css ) {
        var p = null, tokenizer, token, type, value,
            slices, widths, outsets,
            slashCount = 0,
            Type = PIE.Tokenizer.Type,
            IDENT = Type.IDENT,
            NUMBER = Type.NUMBER,
            PERCENT = Type.PERCENT;

        if( css ) {
            tokenizer = new PIE.Tokenizer( css );
            p = {};

            function isSlash( token ) {
                return token && ( token.tokenType & Type.OPERATOR ) && ( token.tokenValue === '/' );
            }

            function isFillIdent( token ) {
                return token && ( token.tokenType & IDENT ) && ( token.tokenValue === 'fill' );
            }

            function collectSlicesEtc() {
                slices = tokenizer.until( function( tok ) {
                    return !( tok.tokenType & ( NUMBER | PERCENT ) );
                } );

                if( isFillIdent( tokenizer.next() ) && !p.fill ) {
                    p.fill = true;
                } else {
                    tokenizer.prev();
                }

                if( isSlash( tokenizer.next() ) ) {
                    slashCount++;
                    widths = tokenizer.until( function( token ) {
                        return !token.isLengthOrPercent() && !( ( token.tokenType & IDENT ) && token.tokenValue === 'auto' );
                    } );

                    if( isSlash( tokenizer.next() ) ) {
                        slashCount++;
                        outsets = tokenizer.until( function( token ) {
                            return !token.isLength();
                        } );
                    }
                } else {
                    tokenizer.prev();
                }
            }

            while( token = tokenizer.next() ) {
                type = token.tokenType;
                value = token.tokenValue;

                // Numbers and/or 'fill' keyword: slice values. May be followed optionally by width values, followed optionally by outset values
                if( type & ( NUMBER | PERCENT ) && !slices ) {
                    tokenizer.prev();
                    collectSlicesEtc();
                }
                else if( isFillIdent( token ) && !p.fill ) {
                    p.fill = true;
                    collectSlicesEtc();
                }

                // Idents: one or values for 'repeat'
                else if( ( type & IDENT ) && this.repeatIdents[value] && !p.repeat ) {
                    p.repeat = { h: value };
                    if( token = tokenizer.next() ) {
                        if( ( token.tokenType & IDENT ) && this.repeatIdents[token.tokenValue] ) {
                            p.repeat.v = token.tokenValue;
                        } else {
                            tokenizer.prev();
                        }
                    }
                }

                // URL of the image
                else if( ( type & Type.URL ) && !p.src ) {
                    p.src =  value;
                }

                // Found something unrecognized; exit.
                else {
                    return null;
                }
            }

            // Validate what we collected
            if( !p.src || !slices || slices.length < 1 || slices.length > 4 ||
                ( widths && widths.length > 4 ) || ( slashCount === 1 && widths.length < 1 ) ||
                ( outsets && outsets.length > 4 ) || ( slashCount === 2 && outsets.length < 1 ) ) {
                return null;
            }

            // Fill in missing values
            if( !p.repeat ) {
                p.repeat = { h: 'stretch' };
            }
            if( !p.repeat.v ) {
                p.repeat.v = p.repeat.h;
            }

            function distributeSides( tokens, convertFn ) {
                return {
                    't': convertFn( tokens[0] ),
                    'r': convertFn( tokens[1] || tokens[0] ),
                    'b': convertFn( tokens[2] || tokens[0] ),
                    'l': convertFn( tokens[3] || tokens[1] || tokens[0] )
                };
            }

            p.slice = distributeSides( slices, function( tok ) {
                return PIE.getLength( ( tok.tokenType & NUMBER ) ? tok.tokenValue + 'px' : tok.tokenValue );
            } );

            if( widths && widths[0] ) {
                p.widths = distributeSides( widths, function( tok ) {
                    return tok.isLengthOrPercent() ? PIE.getLength( tok.tokenValue ) : tok.tokenValue;
                } );
            }

            if( outsets && outsets[0] ) {
                p.outset = distributeSides( outsets, function( tok ) {
                    return tok.isLength() ? PIE.getLength( tok.tokenValue ) : tok.tokenValue;
                } );
            }
        }

        return p;
    }

} );/**
 * Handles parsing, caching, and detecting changes to padding CSS
 * @constructor
 * @param {Element} el the target element
 */
PIE.PaddingStyleInfo = PIE.StyleInfoBase.newStyleInfo( {

    parseCss: function( css ) {
        var tokenizer = new PIE.Tokenizer( css ),
            arr = [],
            token;

        while( ( token = tokenizer.next() ) && token.isLengthOrPercent() ) {
            arr.push( PIE.getLength( token.tokenValue ) );
        }
        return arr.length > 0 && arr.length < 5 ? {
                't': arr[0],
                'r': arr[1] || arr[0],
                'b': arr[2] || arr[0],
                'l': arr[3] || arr[1] || arr[0]
            } : null;
    },

    getCss: PIE.StyleInfoBase.cacheWhenLocked( function() {
        var el = this.targetElement,
            rs = el.runtimeStyle,
            rsPadding = rs.padding,
            padding;
        if( rsPadding ) rs.padding = '';
        padding = el.currentStyle.padding;
        if( rsPadding ) rs.padding = rsPadding;
        return padding;
    } )

} );
PIE.RendererBase = {

    /**
     * Create a new Renderer class, with the standard constructor, and augmented by
     * the RendererBase's members.
     * @param proto
     */
    newRenderer: function( proto ) {
        function Renderer( el, boundsInfo, styleInfos, parent ) {
            this.targetElement = el;
            this.boundsInfo = boundsInfo;
            this.styleInfos = styleInfos;
            this.parent = parent;
        }
        PIE.merge( Renderer.prototype, PIE.RendererBase, proto );
        return Renderer;
    },

    /**
     * Determine if the renderer needs to be updated
     * @return {boolean}
     */
    needsUpdate: function() {
        return false;
    },

    /**
     * Run any preparation logic that would affect the main update logic of this
     * renderer or any of the other renderers, e.g. things that might affect the
     * element's size or style properties.
     */
    prepareUpdate: PIE.emptyFn,

    /**
     * Tell the renderer to update based on modified properties or element dimensions
     */
    updateRendering: function() {
        if( this.isActive() ) {
            this.draw();
        } else {
            this.destroy();
        }
    },

    /**
     * Hide the target element's border
     */
    hideBorder: function() {
        this.targetElement.runtimeStyle.borderColor = 'transparent';
    },

    /**
     * Destroy the rendered objects. This is a base implementation which handles common renderer
     * structures, but individual renderers may override as necessary.
     */
    destroy: function() {
    }
};
/**
 * Root renderer for IE9; manages the rendering layers in the element's background
 * @param {Element} el The target element
 * @param {Object} styleInfos The StyleInfo objects
 */
PIE.IE9RootRenderer = PIE.RendererBase.newRenderer( {

    outerCommasRE: /^,+|,+$/g,
    innerCommasRE: /,+/g,

    setBackgroundLayer: function(zIndex, bg) {
        var me = this,
            bgLayers = me._bgLayers || ( me._bgLayers = [] ),
            undef;
        bgLayers[zIndex] = bg || undef;
    },

    updateRendering: function() {
        var me = this,
            bgLayers = me._bgLayers,
            bg;
        if( bgLayers && ( bg = bgLayers.join( ',' ).replace( me.outerCommasRE, '' ).replace( me.innerCommasRE, ',' ) ) !== me._lastBg ) {
            me._lastBg = me.targetElement.runtimeStyle.background = bg;
        }
    },

    destroy: function() {
        this.targetElement.runtimeStyle.background = '';
        delete this._bgLayers;
    }

} );
/**
 * Renderer for element backgrounds, specific for IE9. Only handles translating CSS3 gradients
 * to an equivalent SVG data URI.
 * @constructor
 * @param {Element} el The target element
 * @param {Object} styleInfos The StyleInfo objects
 */
PIE.IE9BackgroundRenderer = PIE.RendererBase.newRenderer( {

    drawingCanvas: doc.createElement( 'canvas' ),

    bgLayerZIndex: 1,

    needsUpdate: function() {
        var si = this.styleInfos;
        return si.backgroundInfo.changed();
    },

    isActive: function() {
        var si = this.styleInfos;
        return si.backgroundInfo.isActive() || si.borderImageInfo.isActive();
    },

    draw: function() {
        var me = this,
            styleInfos = me.styleInfos,
            bgInfo = styleInfos.backgroundInfo,
            props = bgInfo.getProps(),
            bg, images, i = 0, img, bgAreaSize, bgSize;

        if ( props ) {
            bg = [];

            images = props.bgImages;
            if ( images ) {
                while( img = images[ i++ ] ) {
                    if (img.imgType === 'linear-gradient' ) {
                        bgAreaSize = bgInfo.getBgAreaSize( bg.bgOrigin, me.boundsInfo, styleInfos.borderInfo, styleInfos.paddingInfo );
                        bgSize = ( img.bgSize || PIE.BgSize.DEFAULT ).pixels(
                            me.targetElement, bgAreaSize.w, bgAreaSize.h, bgAreaSize.w, bgAreaSize.h
                        );
                        bg.push(
                            'url(' + me.getGradientImgData( img, bgSize.w, bgSize.h )  + ') ' +
                            me.bgPositionToString( img.bgPosition ) + ' / ' + bgSize.w + 'px ' + bgSize.h + 'px ' +
                            ( img.bgAttachment || '' ) + ' ' + ( img.bgOrigin || '' ) + ' ' + ( img.bgClip || '' )
                        );
                    } else {
                        bg.push( img.origString );
                    }
                }
            }

            if ( props.color ) {
                bg.push( props.color.val + ' ' + ( props.colorClip || '' ) );
            }

            me.parent.setBackgroundLayer(me.bgLayerZIndex, bg.join(','));
        }
    },

    bgPositionToString: function( bgPosition ) {
        return bgPosition ? bgPosition.tokens.map(function(token) {
            return token.tokenValue;
        }).join(' ') : '0 0';
    },

    getGradientImgData: function( info, bgWidth, bgHeight ) {
        var me = this,
            el = me.targetElement,
            stopsInfo = info.stops,
            stopCount = stopsInfo.length,
            metrics = PIE.GradientUtil.getGradientMetrics( el, bgWidth, bgHeight, info ),
            lineLength = metrics.lineLength,
            canvas = me.drawingCanvas,
            context = canvas.getContext( '2d' ),
            gradient = context.createLinearGradient( metrics.startX, metrics.startY, metrics.endX, metrics.endY ),
            stopPx = [],
            i, j, before, after;

        // Find the pixel offsets along the CSS3 gradient-line for each stop.
        for( i = 0; i < stopCount; i++ ) {
            stopPx.push( stopsInfo[i].offset ? stopsInfo[i].offset.pixels( el, lineLength ) :
                i === 0 ? 0 : i === stopCount - 1 ? lineLength : null );
        }
        // Fill in gaps with evenly-spaced offsets
        for( i = 1; i < stopCount; i++ ) {
            if( stopPx[ i ] === null ) {
                before = stopPx[ i - 1 ];
                j = i;
                do {
                    after = stopPx[ ++j ];
                } while( after === null );
                stopPx[ i ] = before + ( after - before ) / ( j - i + 1 );
            }
        }

        // Convert stops to percentages along the gradient line and add a stop for each
        for( i = 0; i < stopCount; i++ ) {
            gradient.addColorStop( stopPx[ i ] / lineLength, stopsInfo[ i ].color.val );
        }

        canvas.width = bgWidth;
        canvas.height = bgHeight;
        context.fillStyle = gradient;
        context.fillRect( 0, 0, bgWidth, bgHeight );
        return canvas.toDataURL();
    },

    destroy: function() {
        this.parent.setBackgroundLayer( this.bgLayerZIndex );
    }

} );
/**
 * Renderer for border-image
 * @constructor
 * @param {Element} el The target element
 * @param {Object} styleInfos The StyleInfo objects
 * @param {PIE.RootRenderer} parent
 */
PIE.IE9BorderImageRenderer = PIE.RendererBase.newRenderer( {

    REPEAT: 'repeat',
    STRETCH: 'stretch',
    ROUND: 'round',

    bgLayerZIndex: 0,

    needsUpdate: function() {
        return this.styleInfos.borderImageInfo.changed();
    },

    isActive: function() {
        return this.styleInfos.borderImageInfo.isActive();
    },

    draw: function() {
        var me = this,
            props = me.styleInfos.borderImageInfo.getProps(),
            borderProps = me.styleInfos.borderInfo.getProps(),
            bounds = me.boundsInfo.getBounds(),
            repeat = props.repeat,
            repeatH = repeat.h,
            repeatV = repeat.v,
            el = me.targetElement,
            isAsync = 0;

        PIE.Util.withImageSize( props.src, function( imgSize ) {
            var elW = bounds.w,
                elH = bounds.h,
                imgW = imgSize.w,
                imgH = imgSize.h,

                // The image cannot be referenced as a URL directly in the SVG because IE9 throws a strange
                // security exception (perhaps due to cross-origin policy within data URIs?) Therefore we
                // work around this by converting the image data into a data URI itself using a transient
                // canvas. This unfortunately requires the border-image src to be within the same domain,
                // which isn't a limitation in true border-image, so we need to try and find a better fix.
                imgSrc = me.imageToDataURI( props.src, imgW, imgH ),

                REPEAT = me.REPEAT,
                STRETCH = me.STRETCH,
                ROUND = me.ROUND,
                ceil = Math.ceil,

                zero = PIE.getLength( '0' ),
                widths = props.widths || ( borderProps ? borderProps.widths : { 't': zero, 'r': zero, 'b': zero, 'l': zero } ),
                widthT = widths['t'].pixels( el ),
                widthR = widths['r'].pixels( el ),
                widthB = widths['b'].pixels( el ),
                widthL = widths['l'].pixels( el ),
                slices = props.slice,
                sliceT = slices['t'].pixels( el ),
                sliceR = slices['r'].pixels( el ),
                sliceB = slices['b'].pixels( el ),
                sliceL = slices['l'].pixels( el ),
                centerW = elW - widthL - widthR,
                middleH = elH - widthT - widthB,
                imgCenterW = imgW - sliceL - sliceR,
                imgMiddleH = imgH - sliceT - sliceB,

                // Determine the size of each tile - 'round' is handled below
                tileSizeT = repeatH === STRETCH ? centerW : imgCenterW * widthT / sliceT,
                tileSizeR = repeatV === STRETCH ? middleH : imgMiddleH * widthR / sliceR,
                tileSizeB = repeatH === STRETCH ? centerW : imgCenterW * widthB / sliceB,
                tileSizeL = repeatV === STRETCH ? middleH : imgMiddleH * widthL / sliceL,

                svg,
                patterns = [],
                rects = [],
                i = 0;

            // For 'round', subtract from each tile's size enough so that they fill the space a whole number of times
            if (repeatH === ROUND) {
                tileSizeT -= (tileSizeT - (centerW % tileSizeT || tileSizeT)) / ceil(centerW / tileSizeT);
                tileSizeB -= (tileSizeB - (centerW % tileSizeB || tileSizeB)) / ceil(centerW / tileSizeB);
            }
            if (repeatV === ROUND) {
                tileSizeR -= (tileSizeR - (middleH % tileSizeR || tileSizeR)) / ceil(middleH / tileSizeR);
                tileSizeL -= (tileSizeL - (middleH % tileSizeL || tileSizeL)) / ceil(middleH / tileSizeL);
            }


            // Build the SVG for the border-image rendering. Add each piece as a pattern, which is then stretched
            // or repeated as the fill of a rect of appropriate size.
            svg = [
                '<svg width="' + elW + '" height="' + elH + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
            ];

            function addImage( x, y, w, h, cropX, cropY, cropW, cropH, tileW, tileH ) {
                patterns.push(
                    '<pattern patternUnits="userSpaceOnUse" id="pattern' + i + '" ' +
                            'x="' + (repeatH === REPEAT ? x + w / 2 - tileW / 2 : x) + '" ' +
                            'y="' + (repeatV === REPEAT ? y + h / 2 - tileH / 2 : y) + '" ' +
                            'width="' + tileW + '" height="' + tileH + '">' +
                        '<svg width="' + tileW + '" height="' + tileH + '" viewBox="' + cropX + ' ' + cropY + ' ' + cropW + ' ' + cropH + '" preserveAspectRatio="none">' +
                            '<image xlink:href="' + imgSrc + '" x="0" y="0" width="' + imgW + '" height="' + imgH + '" />' +
                        '</svg>' +
                    '</pattern>'
                );
                rects.push(
                    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#pattern' + i + ')" />'
                );
                i++;
            }
            addImage( 0, 0, widthL, widthT, 0, 0, sliceL, sliceT, widthL, widthT ); // top left
            addImage( widthL, 0, centerW, widthT, sliceL, 0, imgCenterW, sliceT, tileSizeT, widthT ); // top center
            addImage( elW - widthR, 0, widthR, widthT, imgW - sliceR, 0, sliceR, sliceT, widthR, widthT ); // top right
            addImage( 0, widthT, widthL, middleH, 0, sliceT, sliceL, imgMiddleH, widthL, tileSizeL ); // middle left
            if ( props.fill ) { // center fill
                addImage( widthL, widthT, centerW, middleH, sliceL, sliceT, imgCenterW, imgMiddleH, 
                          tileSizeT || tileSizeB || imgCenterW, tileSizeL || tileSizeR || imgMiddleH );
            }
            addImage( elW - widthR, widthT, widthR, middleH, imgW - sliceR, sliceT, sliceR, imgMiddleH, widthR, tileSizeR ); // middle right
            addImage( 0, elH - widthB, widthL, widthB, 0, imgH - sliceB, sliceL, sliceB, widthL, widthB ); // bottom left
            addImage( widthL, elH - widthB, centerW, widthB, sliceL, imgH - sliceB, imgCenterW, sliceB, tileSizeB, widthB ); // bottom center
            addImage( elW - widthR, elH - widthB, widthR, widthB, imgW - sliceR, imgH - sliceB, sliceR, sliceB, widthR, widthB ); // bottom right

            svg.push(
                    '<defs>' +
                        patterns.join('\n') +
                    '</defs>' +
                    rects.join('\n') +
                '</svg>'
            );

            me.parent.setBackgroundLayer( me.bgLayerZIndex, 'url(data:image/svg+xml,' + escape( svg.join( '' ) ) + ') no-repeat border-box border-box' );

            // If the border-image's src wasn't immediately available, the SVG for its background layer
            // will have been created asynchronously after the main element's update has finished; we'll
            // therefore need to force the root renderer to sync to the final background once finished.
            if( isAsync ) {
                me.parent.updateRendering();
            }
        }, me );

        isAsync = 1;
    },

    /**
     * Convert a given image to a data URI
     */
    imageToDataURI: (function() {
        var uris = {};
        return function( src, width, height ) {
            var uri = uris[ src ],
                image, canvas;
            if ( !uri ) {
                image = new Image();
                canvas = doc.createElement( 'canvas' );
                image.src = src;
                canvas.width = width;
                canvas.height = height;
                canvas.getContext( '2d' ).drawImage( image, 0, 0 );
                uri = uris[ src ] = canvas.toDataURL();
            }
            return uri;
        }
    })(),

    prepareUpdate: function() {
        if (this.isActive()) {
            var me = this,
                el = me.targetElement,
                rs = el.runtimeStyle,
                widths = me.styleInfos.borderImageInfo.getProps().widths;

            // Force border-style to solid so it doesn't collapse
            rs.borderStyle = 'solid';

            // If widths specified in border-image shorthand, override border-width
            if ( widths ) {
                rs.borderTopWidth = widths['t'].pixels( el ) + 'px';
                rs.borderRightWidth = widths['r'].pixels( el ) + 'px';
                rs.borderBottomWidth = widths['b'].pixels( el ) + 'px';
                rs.borderLeftWidth = widths['l'].pixels( el ) + 'px';
            }

            // Make the border transparent
            me.hideBorder();
        }
    },

    destroy: function() {
        var me = this,
            rs = me.targetElement.runtimeStyle;
        me.parent.setBackgroundLayer( me.bgLayerZIndex );
        rs.borderColor = rs.borderStyle = rs.borderWidth = '';
    }

} );

PIE.Element = (function() {

    var wrappers = {},
        lazyInitCssProp = PIE.CSS_PREFIX + 'lazy-init',
        pollCssProp = PIE.CSS_PREFIX + 'poll',
        trackActiveCssProp = PIE.CSS_PREFIX + 'track-active',
        trackHoverCssProp = PIE.CSS_PREFIX + 'track-hover',
        hoverClass = PIE.CLASS_PREFIX + 'hover',
        activeClass = PIE.CLASS_PREFIX + 'active',
        focusClass = PIE.CLASS_PREFIX + 'focus',
        firstChildClass = PIE.CLASS_PREFIX + 'first-child',
        ignorePropertyNames = { 'background':1, 'bgColor':1, 'display': 1 },
        classNameRegExes = {},
        dummyArray = [];


    function addClass( el, className ) {
        el.className += ' ' + className;
    }

    function removeClass( el, className ) {
        var re = classNameRegExes[ className ] ||
            ( classNameRegExes[ className ] = new RegExp( '\\b' + className + '\\b', 'g' ) );
        el.className = el.className.replace( re, '' );
    }

    function delayAddClass( el, className /*, className2*/ ) {
        var classes = dummyArray.slice.call( arguments, 1 ),
            i = classes.length;
        setTimeout( function() {
            if( el ) {
                while( i-- ) {
                    addClass( el, classes[ i ] );
                }
            }
        }, 0 );
    }

    function delayRemoveClass( el, className /*, className2*/ ) {
        var classes = dummyArray.slice.call( arguments, 1 ),
            i = classes.length;
        setTimeout( function() {
            if( el ) {
                while( i-- ) {
                    removeClass( el, classes[ i ] );
                }
            }
        }, 0 );
    }



    function Element( el ) {
        var me = this,
            childRenderers,
            rootRenderer,
            boundsInfo = new PIE.BoundsInfo( el ),
            styleInfos,
            styleInfosArr,
            initializing,
            initialized,
            eventsAttached,
            eventListeners = [],
            delayed,
            destroyed,
            poll;

        me.el = el;

        /**
         * Initialize PIE for this element.
         */
        function init() {
            if( !initialized ) {
                var docEl,
                    bounds,
                    ieDocMode = PIE.ieDocMode,
                    cs = el.currentStyle,
                    lazy = cs.getAttribute( lazyInitCssProp ) === 'true',
                    trackActive = cs.getAttribute( trackActiveCssProp ) !== 'false',
                    trackHover = cs.getAttribute( trackHoverCssProp ) !== 'false';

                // Polling for size/position changes: default to on in IE8, off otherwise, overridable by -pie-poll
                poll = cs.getAttribute( pollCssProp );
                poll = ieDocMode > 7 ? poll !== 'false' : poll === 'true';

                // Force layout so move/resize events will fire. Set this as soon as possible to avoid layout changes
                // after load, but make sure it only gets called the first time through to avoid recursive calls to init().
                if( !initializing ) {
                    initializing = 1;
                    el.runtimeStyle.zoom = 1;
                    initFirstChildPseudoClass();
                }

                boundsInfo.lock();

                // If the -pie-lazy-init:true flag is set, check if the element is outside the viewport and if so, delay initialization
                if( lazy && ( bounds = boundsInfo.getBounds() ) && ( docEl = doc.documentElement || doc.body ) &&
                        ( bounds.y > docEl.clientHeight || bounds.x > docEl.clientWidth || bounds.y + bounds.h < 0 || bounds.x + bounds.w < 0 ) ) {
                    if( !delayed ) {
                        delayed = 1;
                        PIE.OnScroll.observe( init );
                    }
                } else {
                    initialized = 1;
                    delayed = initializing = 0;
                    PIE.OnScroll.unobserve( init );

                    // Create the style infos and renderers
                    if ( ieDocMode === 9 ) {
                        styleInfos = {
                            backgroundInfo: new PIE.BackgroundStyleInfo( el ),
                            borderImageInfo: new PIE.BorderImageStyleInfo( el ),
                            borderInfo: new PIE.BorderStyleInfo( el ),
                            paddingInfo: new PIE.PaddingStyleInfo( el )
                        };
                        styleInfosArr = [
                            styleInfos.backgroundInfo,
                            styleInfos.borderInfo,
                            styleInfos.borderImageInfo,
                            styleInfos.paddingInfo
                        ];
                        rootRenderer = new PIE.IE9RootRenderer( el, boundsInfo, styleInfos );
                        childRenderers = [
                            new PIE.IE9BackgroundRenderer( el, boundsInfo, styleInfos, rootRenderer ),
                            new PIE.IE9BorderImageRenderer( el, boundsInfo, styleInfos, rootRenderer )
                        ];
                    } else {

                        styleInfos = {
                            backgroundInfo: new PIE.BackgroundStyleInfo( el ),
                            borderInfo: new PIE.BorderStyleInfo( el ),
                            borderImageInfo: new PIE.BorderImageStyleInfo( el ),
                            borderRadiusInfo: new PIE.BorderRadiusStyleInfo( el ),
                            boxShadowInfo: new PIE.BoxShadowStyleInfo( el ),
                            paddingInfo: new PIE.PaddingStyleInfo( el ),
                            visibilityInfo: new PIE.VisibilityStyleInfo( el )
                        };
                        styleInfosArr = [
                            styleInfos.backgroundInfo,
                            styleInfos.borderInfo,
                            styleInfos.borderImageInfo,
                            styleInfos.borderRadiusInfo,
                            styleInfos.boxShadowInfo,
                            styleInfos.paddingInfo,
                            styleInfos.visibilityInfo
                        ];
                        rootRenderer = new PIE.RootRenderer( el, boundsInfo, styleInfos );
                        childRenderers = [
                            new PIE.BoxShadowOutsetRenderer( el, boundsInfo, styleInfos, rootRenderer ),
                            new PIE.BackgroundRenderer( el, boundsInfo, styleInfos, rootRenderer ),
                            //new PIE.BoxShadowInsetRenderer( el, boundsInfo, styleInfos, rootRenderer ),
                            new PIE.BorderRenderer( el, boundsInfo, styleInfos, rootRenderer ),
                            new PIE.BorderImageRenderer( el, boundsInfo, styleInfos, rootRenderer )
                        ];
                        if( el.tagName === 'IMG' ) {
                            childRenderers.push( new PIE.ImgRenderer( el, boundsInfo, styleInfos, rootRenderer ) );
                        }
                        rootRenderer.childRenderers = childRenderers; // circular reference, can't pass in constructor; TODO is there a cleaner way?
                    }

                    // Add property change listeners to ancestors if requested
                    initAncestorEventListeners();

                    // Add to list of polled elements when -pie-poll:true
                    if( poll ) {
                        PIE.Heartbeat.observe( update );
                        PIE.Heartbeat.run();
                    }

                    // Trigger rendering
                    update( 0, 1 );
                }

                if( !eventsAttached ) {
                    eventsAttached = 1;
                    if( ieDocMode < 9 ) {
                        addListener( el, 'onmove', handleMoveOrResize );
                    }
                    addListener( el, 'onresize', handleMoveOrResize );
                    addListener( el, 'onpropertychange', propChanged );
                    if( trackHover ) {
                        addListener( el, 'onmouseenter', mouseEntered );
                    }
                    if( trackHover || trackActive ) {
                        addListener( el, 'onmouseleave', mouseLeft );
                    }
                    if( trackActive ) {
                        addListener( el, 'onmousedown', mousePressed );
                    }
                    if( el.tagName in PIE.focusableElements ) {
                        addListener( el, 'onfocus', focused );
                        addListener( el, 'onblur', blurred );
                    }
                    PIE.OnResize.observe( handleMoveOrResize );

                    PIE.OnUnload.observe( removeEventListeners );
                }

                boundsInfo.unlock();
            }
        }




        /**
         * Event handler for onmove and onresize events. Invokes update() only if the element's
         * bounds have previously been calculated, to prevent multiple runs during page load when
         * the element has no initial CSS3 properties.
         */
        function handleMoveOrResize() {
            if( boundsInfo && boundsInfo.hasBeenQueried() ) {
                update();
            }
        }


        /**
         * Update position and/or size as necessary. Both move and resize events call
         * this rather than the updatePos/Size functions because sometimes, particularly
         * during page load, one will fire but the other won't.
         */
        function update( isPropChange, force ) {
            if( !destroyed ) {
                if( initialized ) {
                    lockAll();

                    var i = 0, len = childRenderers.length,
                        sizeChanged = boundsInfo.sizeChanged();
                    for( ; i < len; i++ ) {
                        childRenderers[i].prepareUpdate();
                    }
                    for( i = 0; i < len; i++ ) {
                        if( force || sizeChanged || ( isPropChange && childRenderers[i].needsUpdate() ) ) {
                            childRenderers[i].updateRendering();
                        }
                    }
                    if( force || sizeChanged || isPropChange || boundsInfo.positionChanged() ) {
                        rootRenderer.updateRendering();
                    }

                    unlockAll();
                }
                else if( !initializing ) {
                    init();
                }
            }
        }

        /**
         * Handle property changes to trigger update when appropriate.
         */
        function propChanged() {
            // Some elements like <table> fire onpropertychange events for old-school background properties
            // ('background', 'bgColor') when runtimeStyle background properties are changed, which
            // results in an infinite loop; therefore we filter out those property names. Also, 'display'
            // is ignored because size calculations don't work correctly immediately when its onpropertychange
            // event fires, and because it will trigger an onresize event anyway.
            if( initialized && !( event && event.propertyName in ignorePropertyNames ) ) {
                update( 1 );
            }
        }


        /**
         * Handle mouseenter events. Adds a custom class to the element to allow IE6 to add
         * hover styles to non-link elements, and to trigger a propertychange update.
         */
        function mouseEntered() {
            //must delay this because the mouseenter event fires before the :hover styles are added.
            delayAddClass( el, hoverClass );
        }

        /**
         * Handle mouseleave events
         */
        function mouseLeft() {
            //must delay this because the mouseleave event fires before the :hover styles are removed.
            delayRemoveClass( el, hoverClass, activeClass );
        }

        /**
         * Handle mousedown events. Adds a custom class to the element to allow IE6 to add
         * active styles to non-link elements, and to trigger a propertychange update.
         */
        function mousePressed() {
            //must delay this because the mousedown event fires before the :active styles are added.
            delayAddClass( el, activeClass );

            // listen for mouseups on the document; can't just be on the element because the user might
            // have dragged out of the element while the mouse button was held down
            PIE.OnMouseup.observe( mouseReleased );
        }

        /**
         * Handle mouseup events
         */
        function mouseReleased() {
            //must delay this because the mouseup event fires before the :active styles are removed.
            delayRemoveClass( el, activeClass );

            PIE.OnMouseup.unobserve( mouseReleased );
        }

        /**
         * Handle focus events. Adds a custom class to the element to trigger a propertychange update.
         */
        function focused() {
            //must delay this because the focus event fires before the :focus styles are added.
            delayAddClass( el, focusClass );
        }

        /**
         * Handle blur events
         */
        function blurred() {
            //must delay this because the blur event fires before the :focus styles are removed.
            delayRemoveClass( el, focusClass );
        }


        /**
         * Handle property changes on ancestors of the element; see initAncestorEventListeners()
         * which adds these listeners as requested with the -pie-watch-ancestors CSS property.
         */
        function ancestorPropChanged() {
            var name = event.propertyName;
            if( name === 'className' || name === 'id' || name.indexOf( 'style.' ) === 0 ) {
                propChanged();
            }
        }

        function lockAll() {
            boundsInfo.lock();
            for( var i = styleInfosArr.length; i--; ) {
                styleInfosArr[i].lock();
            }
        }

        function unlockAll() {
            for( var i = styleInfosArr.length; i--; ) {
                styleInfosArr[i].unlock();
            }
            boundsInfo.unlock();
        }


        function addListener( targetEl, type, handler ) {
            targetEl.attachEvent( type, handler );
            eventListeners.push( [ targetEl, type, handler ] );
        }

        /**
         * Remove all event listeners from the element and any monitored ancestors.
         */
        function removeEventListeners() {
            if (eventsAttached) {
                var i = eventListeners.length,
                    listener;

                while( i-- ) {
                    listener = eventListeners[ i ];
                    listener[ 0 ].detachEvent( listener[ 1 ], listener[ 2 ] );
                }

                PIE.OnUnload.unobserve( removeEventListeners );
                eventsAttached = 0;
                eventListeners = [];
            }
        }


        /**
         * Clean everything up when the behavior is removed from the element, or the element
         * is manually destroyed.
         */
        function destroy() {
            if( !destroyed ) {
                var i, len;

                removeEventListeners();

                destroyed = 1;

                // destroy any active renderers
                if( childRenderers ) {
                    for( i = 0, len = childRenderers.length; i < len; i++ ) {
                        childRenderers[i].finalized = 1;
                        childRenderers[i].destroy();
                    }
                }
                rootRenderer.destroy();

                // Remove from list of polled elements in IE8
                if( poll ) {
                    PIE.Heartbeat.unobserve( update );
                }
                // Stop onresize listening
                PIE.OnResize.unobserve( update );

                // Kill references
                childRenderers = rootRenderer = boundsInfo = styleInfos = styleInfosArr = el = null;
                me.el = me = 0;
            }
        }


        /**
         * If requested via the custom -pie-watch-ancestors CSS property, add onpropertychange and
         * other event listeners to ancestor(s) of the element so we can pick up style changes
         * based on CSS rules using descendant selectors.
         */
        function initAncestorEventListeners() {
            var watch = el.currentStyle.getAttribute( PIE.CSS_PREFIX + 'watch-ancestors' ),
                i, a;
            if( watch ) {
                watch = parseInt( watch, 10 );
                i = 0;
                a = el.parentNode;
                while( a && ( watch === 'NaN' || i++ < watch ) ) {
                    addListener( a, 'onpropertychange', ancestorPropChanged );
                    addListener( a, 'onmouseenter', mouseEntered );
                    addListener( a, 'onmouseleave', mouseLeft );
                    addListener( a, 'onmousedown', mousePressed );
                    if( a.tagName in PIE.focusableElements ) {
                        addListener( a, 'onfocus', focused );
                        addListener( a, 'onblur', blurred );
                    }
                    a = a.parentNode;
                }
            }
        }


        /**
         * If the target element is a first child, add a pie_first-child class to it. This allows using
         * the added class as a workaround for the fact that PIE's rendering element breaks the :first-child
         * pseudo-class selector.
         */
        function initFirstChildPseudoClass() {
            var tmpEl = el,
                isFirst = 1;
            while( tmpEl = tmpEl.previousSibling ) {
                if( tmpEl.nodeType === 1 ) {
                    isFirst = 0;
                    break;
                }
            }
            if( isFirst ) {
                addClass( el, firstChildClass );
            }
        }


        // These methods are all already bound to this instance so there's no need to wrap them
        // in a closure to maintain the 'this' scope object when calling them.
        me.init = init;
        me.destroy = destroy;
    }

    Element.getInstance = function( el ) {
        var id = el[ 'uniqueID' ];
        return wrappers[ id ] || ( wrappers[ id ] = new Element( el ) );
    };

    Element.destroy = function( el ) {
        var id = el[ 'uniqueID' ],
            wrapper = wrappers[ id ];
        if( wrapper ) {
            wrapper.destroy();
            delete wrappers[ id ];
        }
    };

    Element.destroyAll = function() {
        var els = [], wrapper;
        if( wrappers ) {
            for( var w in wrappers ) {
                if( wrappers.hasOwnProperty( w ) ) {
                    wrapper = wrappers[ w ];
                    els.push( wrapper.el );
                    wrapper.destroy();
                }
            }
            wrappers = {};
        }
        return els;
    };

    return Element;
})();

/*
 * This file exposes the public API for invoking PIE.
 */


/**
 * The version number of this PIE build.
 */
PIE[ 'version' ] = '2.0beta1';


/**
 * @property supportsVML
 * True if the current IE browser environment has a functioning VML engine. Should be true
 * in most IEs, but in rare cases may be false. If false, PIE will exit immediately when
 * attached to an element (for IE<9) to prevent errors; this property may also be used for
 * debugging or by external scripts to perform some special action when VML support is absent.
 * @type {boolean}
 */
PIE[ 'supportsVML' ] = PIE.supportsVML;


/**
 * Programatically attach PIE to a single element.
 * @param {Element} el
 */
PIE[ 'attach' ] = function( el ) {
    if ( PIE.ieDocMode === 9 || ( PIE.ieDocMode < 9 && PIE.supportsVML ) ) {
        PIE.Element.getInstance( el ).init();
    }
};


/**
 * Programatically detach PIE from a single element.
 * @param {Element} el
 */
PIE[ 'detach' ] = function( el ) {
    PIE.Element.destroy( el );
};

})( window, document );
    }
    function patchCSS3Filter(window) {

    }
    function patchTransform(window,document) {
/*******************************************************************************
 * This notice must be untouched at all times.
 *
 * This javascript library contains helper routines to assist with event 
 * handling consinstently among browsers
 *
 * EventHelpers.js v.1.3 available at http://www.useragentman.com/
 *
 * released under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 *******************************************************************************/
var EventHelpers = new function(){
    var me = this;
    
    var safariTimer;
    var isSafari = /WebKit/i.test(navigator.userAgent);
    var globalEvent;
	
	me.init = function () {
		if (me.hasPageLoadHappened(arguments)) {
			return;	
		}
		
		if (document.createEventObject){
	        // dispatch for IE
	        globalEvent = document.createEventObject();
	    } else 	if (document.createEvent) {
			globalEvent = document.createEvent("HTMLEvents");
		} 
		
		me.docIsLoaded = true;
	}
	
    /**
     * Adds an event to the document.  Examples of usage:
     * me.addEvent(window, "load", myFunction);
     * me.addEvent(docunent, "keydown", keyPressedFunc);
     * me.addEvent(document, "keyup", keyPressFunc);
     *
     * @author Scott Andrew - http://www.scottandrew.com/weblog/articles/cbs-events
     * @author John Resig - http://ejohn.org/projects/flexible-javascript-events/
     * @param {Object} obj - a javascript object.
     * @param {String} evType - an event to attach to the object.
     * @param {Function} fn - the function that is attached to the event.
     */
    me.addEvent = function(obj, evType, fn){
    
        if (obj.addEventListener) {
            obj.addEventListener(evType, fn, false);
        } else if (obj.attachEvent) {
            obj['e' + evType + fn] = fn;
            obj[evType + fn] = function(){
                obj["e" + evType + fn](self.event);
            }
            obj.attachEvent("on" + evType, obj[evType + fn]);
        }
    }
    
    
    /**
     * Removes an event that is attached to a javascript object.
     *
     * @author Scott Andrew - http://www.scottandrew.com/weblog/articles/cbs-events
     * @author John Resig - http://ejohn.org/projects/flexible-javascript-events/	 * @param {Object} obj - a javascript object.
     * @param {String} evType - an event attached to the object.
     * @param {Function} fn - the function that is called when the event fires.
     */
    me.removeEvent = function(obj, evType, fn){
    
        if (obj.removeEventListener) {
            obj.removeEventListener(evType, fn, false);
        } else if (obj.detachEvent) {
            try {
                obj.detachEvent("on" + evType, obj[evType + fn]);
                obj[evType + fn] = null;
                obj["e" + evType + fn] = null;
            } 
            catch (ex) {
                // do nothing;
            }
        }
    }
    
    function removeEventAttribute(obj, beginName){
        var attributes = obj.attributes;
        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i]
            var name = attribute.name
            if (name.indexOf(beginName) == 0) {
                //obj.removeAttributeNode(attribute);
                attribute.specified = false;
            }
        }
    }
    
    me.addScrollWheelEvent = function(obj, fn){
        if (obj.addEventListener) {
            /** DOMMouseScroll is for mozilla. */
            obj.addEventListener('DOMMouseScroll', fn, true);
        }
        
        /** IE/Opera. */
        if (obj.attachEvent) {
            obj.attachEvent("onmousewheel", fn);
        }
        
    }
    
    me.removeScrollWheelEvent = function(obj, fn){
        if (obj.removeEventListener) {
            /** DOMMouseScroll is for mozilla. */
            obj.removeEventListener('DOMMouseScroll', fn, true);
        }
        
        /** IE/Opera. */
        if (obj.detachEvent) {
            obj.detatchEvent("onmousewheel", fn);
        }
        
    }
    
    /**
     * Given a mouse event, get the mouse pointer's x-coordinate.
     *
     * @param {Object} e - a DOM Event object.
     * @return {int} - the mouse pointer's x-coordinate.
     */
    me.getMouseX = function(e){
        if (!e) {
            return;
        }
        // NS4
        if (e.pageX != null) {
            return e.pageX;
            // IE
        } else if (window.event != null && window.event.clientX != null &&
        document.body != null &&
        document.body.scrollLeft != null) 
            return window.event.clientX + document.body.scrollLeft;
        // W3C
        else if (e.clientX != null) 
            return e.clientX;
        else 
            return null;
    }
    
    /**
     * Given a mouse event, get the mouse pointer's y-coordinate.
     * @param {Object} e - a DOM Event Object.
     * @return {int} - the mouse pointer's y-coordinate.
     */
    me.getMouseY = function(e){
        // NS4
        if (e.pageY != null) 
            return e.pageY;
        // IE
        else if (window.event != null && window.event.clientY != null &&
        document.body != null &&
        document.body.scrollTop != null) 
            return window.event.clientY + document.body.scrollTop;
        // W3C
        else if (e.clientY != null) {
            return e.clientY;
        }
    }
    /**
     * Given a mouse scroll wheel event, get the "delta" of how fast it moved.
     * @param {Object} e - a DOM Event Object.
     * @return {int} - the mouse wheel's delta.  It is greater than 0, the
     * scroll wheel was spun upwards; if less than 0, downwards.
     */
    me.getScrollWheelDelta = function(e){
        var delta = 0;
        if (!e) /* For IE. */ 
            e = window.event;
        if (e.wheelDelta) { /* IE/Opera. */
            delta = e.wheelDelta / 120;
            /** In Opera 9, delta differs in sign as compared to IE.
             */
            if (window.opera) {
                delta = -delta;
            }
        } else if (e.detail) { /** Mozilla case. */
            /** In Mozilla, sign of delta is different than in IE.
             * Also, delta is multiple of 3.
             */
            delta = -e.detail / 3;
        }
        return delta
    }
    
    /**
     * Sets a mouse move event of a document.
     *
     * @deprecated - use only if compatibility with IE4 and NS4 is necessary.  Otherwise, just
     * 		use EventHelpers.addEvent(window, 'mousemove', func) instead. Cannot be used to add
     * 		multiple mouse move event handlers.
     *
     * @param {Function} func - the function that you want a mouse event to fire.
     */
    me.addMouseEvent = function(func){
    
        if (document.captureEvents) {
            document.captureEvents(Event.MOUSEMOVE);
        }
        
        document.onmousemove = func;
        window.onmousemove = func;
        window.onmouseover = func;
        
    }
    
    
    
    /** 
     * Find the HTML object that fired an Event.
     *
     * @param {Object} e - an HTML object
     * @return {Object} - the HTML object that fired the event.
     */
    me.getEventTarget = function(e){
        // first, IE method for mouse events(also supported by Safari and Opera)
        if (e.toElement) {
            return e.toElement;
            // W3C
        } else if (e.currentTarget) {
            return e.currentTarget;
            
            // MS way
        } else if (e.srcElement) {
            return e.srcElement;
        } else {
            return null;
        }
    }
    
    
    
    
    /**
     * Given an event fired by the keyboard, find the key associated with that event.
     *
     * @param {Object} e - an event object.
     * @return {String} - the ASCII character code representing the key associated with the event.
     */
    me.getKey = function(e){
        if (e.keyCode) {
            return e.keyCode;
        } else if (e.event && e.event.keyCode) {
            return window.event.keyCode;
        } else if (e.which) {
            return e.which;
        }
    }
    
    
    /** 
     *  Will execute a function when the page's DOM has fully loaded (and before all attached images, iframes,
     *  etc., are).
     *
     *  Usage:
     *
     *  EventHelpers.addPageLoadEvent('init');
     *
     *  where the function init() has this code at the beginning:
     *
     *  function init() {
     *
     *  if (EventHelpers.hasPageLoadHappened(arguments)) return;
     *
     *	// rest of code
     *   ....
     *  }
     *
     * @author This code is based off of code from http://dean.edwards.name/weblog/2005/09/busted/ by Dean
     * Edwards, with a modification by me.
     *
     * @param {String} funcName - a string containing the function to be called.
     */
    me.addPageLoadEvent = function(funcName){
    
        var func = eval(funcName);
        
        // for Internet Explorer (using conditional comments)
        /*@cc_on @*/
        /*@if (@_win32)
         pageLoadEventArray.push(func);
         return;
         /*@end @*/
        if (isSafari) { // sniff
            pageLoadEventArray.push(func);
            
            if (!safariTimer) {
            
                safariTimer = setInterval(function(){
                    if (/loaded|complete/.test(document.readyState)) {
                        clearInterval(safariTimer);
                        
                        /*
                         * call the onload handler
                         * func();
                         */
                        me.runPageLoadEvents();
                        return;
                    }
                    set = true;
                }, 10);
            }
            /* for Mozilla */
        } else if (document.addEventListener) {
            var x = document.addEventListener("DOMContentLoaded", func, null);
            
            /* Others */
        } else {
            me.addEvent(window, 'load', func);
        }
    }
    
    var pageLoadEventArray = new Array();
    
    me.runPageLoadEvents = function(e){
        if (isSafari || e.srcElement.readyState == "complete") {
        
            for (var i = 0; i < pageLoadEventArray.length; i++) {
                pageLoadEventArray[i]();
            }
        }
    }
    /**
     * Determines if either addPageLoadEvent('funcName') or addEvent(window, 'load', funcName)
     * has been executed.
     *
     * @see addPageLoadEvent
     * @param {Function} funcArgs - the arguments of the containing. function
     */
    me.hasPageLoadHappened = function(funcArgs){
        // If the function already been called, return true;
        if (funcArgs.callee.done) 
            return true;
        
        // flag this function so we don't do the same thing twice
        funcArgs.callee.done = true;
    }
    
    
    
    /**
     * Used in an event method/function to indicate that the default behaviour of the event
     * should *not* happen.
     *
     * @param {Object} e - an event object.
     * @return {Boolean} - always false
     */
    me.preventDefault = function(e){
    
        if (e.preventDefault) {
            e.preventDefault();
        }
        
        try {
            e.returnValue = false;
        } 
        catch (ex) {
            // do nothing
        }
        
    }
    
    me.cancelBubble = function(e){
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        try {
            e.cancelBubble = true;
        } 
        catch (ex) {
            // do nothing
        }
    }
	
	/* 
	 * Fires an event manually.
	 * @author Scott Andrew - http://www.scottandrew.com/weblog/articles/cbs-events
	 * @author John Resig - http://ejohn.org/projects/flexible-javascript-events/	 * @param {Object} obj - a javascript object.
	 * @param {String} evType - an event attached to the object.
	 * @param {Function} fn - the function that is called when the event fires.
	 * 
	 */
	me.fireEvent = function (element,event, options){
		
		if(!element) {
			return;
		}
		
	    if (document.createEventObject){
	        /* 
			var stack = DebugHelpers.getStackTrace();
			var s = stack.toString();
			jslog.debug(s);
			if (s.indexOf('fireEvent') >= 0) {
				return;
			}
			*/
			return element.fireEvent('on' + event, globalEvent)
			jslog.debug('ss');
			
	    }
	    else{
	        // dispatch for firefox + others
	        globalEvent.initEvent(event, true, true); // event type,bubbling,cancelable
	        return !element.dispatchEvent(globalEvent);
	    }
}
    
    /* EventHelpers.init () */
    function init(){
        // Conditional comment alert: Do not remove comments.  Leave intact.
        // The detection if the page is secure or not is important. If 
        // this logic is removed, Internet Explorer will give security
        // alerts.
        /*@cc_on @*/
        /*@if (@_win32)
        
         document.write('<script id="__ie_onload" defer src="' +
        
         ((location.protocol == 'https:') ? '//0' : 'javascript:void(0)') + '"><\/script>');
        
         var script = document.getElementById("__ie_onload");
        
         me.addEvent(script, 'readystatechange', me.runPageLoadEvents);
        
         /*@end @*/
        
    }
    
    init();
}

EventHelpers.addPageLoadEvent('EventHelpers.init');
/*
	cssQuery, version 2.0.2 (2005-08-19)
	Copyright: 2004-2005, Dean Edwards (http://dean.edwards.name/)
	License: http://creativecommons.org/licenses/LGPL/2.1/
*/
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('7 x=6(){7 1D="2.0.2";7 C=/\\s*,\\s*/;7 x=6(s,A){33{7 m=[];7 u=1z.32.2c&&!A;7 b=(A)?(A.31==22)?A:[A]:[1g];7 1E=18(s).1l(C),i;9(i=0;i<1E.y;i++){s=1y(1E[i]);8(U&&s.Z(0,3).2b("")==" *#"){s=s.Z(2);A=24([],b,s[1])}1A A=b;7 j=0,t,f,a,c="";H(j<s.y){t=s[j++];f=s[j++];c+=t+f;a="";8(s[j]=="("){H(s[j++]!=")")a+=s[j];a=a.Z(0,-1);c+="("+a+")"}A=(u&&V[c])?V[c]:21(A,t,f,a);8(u)V[c]=A}m=m.30(A)}2a x.2d;5 m}2Z(e){x.2d=e;5[]}};x.1Z=6(){5"6 x() {\\n  [1D "+1D+"]\\n}"};7 V={};x.2c=L;x.2Y=6(s){8(s){s=1y(s).2b("");2a V[s]}1A V={}};7 29={};7 19=L;x.15=6(n,s){8(19)1i("s="+1U(s));29[n]=12 s()};x.2X=6(c){5 c?1i(c):o};7 D={};7 h={};7 q={P:/\\[([\\w-]+(\\|[\\w-]+)?)\\s*(\\W?=)?\\s*([^\\]]*)\\]/};7 T=[];D[" "]=6(r,f,t,n){7 e,i,j;9(i=0;i<f.y;i++){7 s=X(f[i],t,n);9(j=0;(e=s[j]);j++){8(M(e)&&14(e,n))r.z(e)}}};D["#"]=6(r,f,i){7 e,j;9(j=0;(e=f[j]);j++)8(e.B==i)r.z(e)};D["."]=6(r,f,c){c=12 1t("(^|\\\\s)"+c+"(\\\\s|$)");7 e,i;9(i=0;(e=f[i]);i++)8(c.l(e.1V))r.z(e)};D[":"]=6(r,f,p,a){7 t=h[p],e,i;8(t)9(i=0;(e=f[i]);i++)8(t(e,a))r.z(e)};h["2W"]=6(e){7 d=Q(e);8(d.1C)9(7 i=0;i<d.1C.y;i++){8(d.1C[i]==e)5 K}};h["2V"]=6(e){};7 M=6(e){5(e&&e.1c==1&&e.1f!="!")?e:23};7 16=6(e){H(e&&(e=e.2U)&&!M(e))28;5 e};7 G=6(e){H(e&&(e=e.2T)&&!M(e))28;5 e};7 1r=6(e){5 M(e.27)||G(e.27)};7 1P=6(e){5 M(e.26)||16(e.26)};7 1o=6(e){7 c=[];e=1r(e);H(e){c.z(e);e=G(e)}5 c};7 U=K;7 1h=6(e){7 d=Q(e);5(2S d.25=="2R")?/\\.1J$/i.l(d.2Q):2P(d.25=="2O 2N")};7 Q=6(e){5 e.2M||e.1g};7 X=6(e,t){5(t=="*"&&e.1B)?e.1B:e.X(t)};7 17=6(e,t,n){8(t=="*")5 M(e);8(!14(e,n))5 L;8(!1h(e))t=t.2L();5 e.1f==t};7 14=6(e,n){5!n||(n=="*")||(e.2K==n)};7 1e=6(e){5 e.1G};6 24(r,f,B){7 m,i,j;9(i=0;i<f.y;i++){8(m=f[i].1B.2J(B)){8(m.B==B)r.z(m);1A 8(m.y!=23){9(j=0;j<m.y;j++){8(m[j].B==B)r.z(m[j])}}}}5 r};8(![].z)22.2I.z=6(){9(7 i=0;i<1z.y;i++){o[o.y]=1z[i]}5 o.y};7 N=/\\|/;6 21(A,t,f,a){8(N.l(f)){f=f.1l(N);a=f[0];f=f[1]}7 r=[];8(D[t]){D[t](r,A,f,a)}5 r};7 S=/^[^\\s>+~]/;7 20=/[\\s#.:>+~()@]|[^\\s#.:>+~()@]+/g;6 1y(s){8(S.l(s))s=" "+s;5 s.P(20)||[]};7 W=/\\s*([\\s>+~(),]|^|$)\\s*/g;7 I=/([\\s>+~,]|[^(]\\+|^)([#.:@])/g;7 18=6(s){5 s.O(W,"$1").O(I,"$1*$2")};7 1u={1Z:6(){5"\'"},P:/^(\'[^\']*\')|("[^"]*")$/,l:6(s){5 o.P.l(s)},1S:6(s){5 o.l(s)?s:o+s+o},1Y:6(s){5 o.l(s)?s.Z(1,-1):s}};7 1s=6(t){5 1u.1Y(t)};7 E=/([\\/()[\\]?{}|*+-])/g;6 R(s){5 s.O(E,"\\\\$1")};x.15("1j-2H",6(){D[">"]=6(r,f,t,n){7 e,i,j;9(i=0;i<f.y;i++){7 s=1o(f[i]);9(j=0;(e=s[j]);j++)8(17(e,t,n))r.z(e)}};D["+"]=6(r,f,t,n){9(7 i=0;i<f.y;i++){7 e=G(f[i]);8(e&&17(e,t,n))r.z(e)}};D["@"]=6(r,f,a){7 t=T[a].l;7 e,i;9(i=0;(e=f[i]);i++)8(t(e))r.z(e)};h["2G-10"]=6(e){5!16(e)};h["1x"]=6(e,c){c=12 1t("^"+c,"i");H(e&&!e.13("1x"))e=e.1n;5 e&&c.l(e.13("1x"))};q.1X=/\\\\:/g;q.1w="@";q.J={};q.O=6(m,a,n,c,v){7 k=o.1w+m;8(!T[k]){a=o.1W(a,c||"",v||"");T[k]=a;T.z(a)}5 T[k].B};q.1Q=6(s){s=s.O(o.1X,"|");7 m;H(m=s.P(o.P)){7 r=o.O(m[0],m[1],m[2],m[3],m[4]);s=s.O(o.P,r)}5 s};q.1W=6(p,t,v){7 a={};a.B=o.1w+T.y;a.2F=p;t=o.J[t];t=t?t(o.13(p),1s(v)):L;a.l=12 2E("e","5 "+t);5 a};q.13=6(n){1d(n.2D()){F"B":5"e.B";F"2C":5"e.1V";F"9":5"e.2B";F"1T":8(U){5"1U((e.2A.P(/1T=\\\\1v?([^\\\\s\\\\1v]*)\\\\1v?/)||[])[1]||\'\')"}}5"e.13(\'"+n.O(N,":")+"\')"};q.J[""]=6(a){5 a};q.J["="]=6(a,v){5 a+"=="+1u.1S(v)};q.J["~="]=6(a,v){5"/(^| )"+R(v)+"( |$)/.l("+a+")"};q.J["|="]=6(a,v){5"/^"+R(v)+"(-|$)/.l("+a+")"};7 1R=18;18=6(s){5 1R(q.1Q(s))}});x.15("1j-2z",6(){D["~"]=6(r,f,t,n){7 e,i;9(i=0;(e=f[i]);i++){H(e=G(e)){8(17(e,t,n))r.z(e)}}};h["2y"]=6(e,t){t=12 1t(R(1s(t)));5 t.l(1e(e))};h["2x"]=6(e){5 e==Q(e).1H};h["2w"]=6(e){7 n,i;9(i=0;(n=e.1F[i]);i++){8(M(n)||n.1c==3)5 L}5 K};h["1N-10"]=6(e){5!G(e)};h["2v-10"]=6(e){e=e.1n;5 1r(e)==1P(e)};h["2u"]=6(e,s){7 n=x(s,Q(e));9(7 i=0;i<n.y;i++){8(n[i]==e)5 L}5 K};h["1O-10"]=6(e,a){5 1p(e,a,16)};h["1O-1N-10"]=6(e,a){5 1p(e,a,G)};h["2t"]=6(e){5 e.B==2s.2r.Z(1)};h["1M"]=6(e){5 e.1M};h["2q"]=6(e){5 e.1q===L};h["1q"]=6(e){5 e.1q};h["1L"]=6(e){5 e.1L};q.J["^="]=6(a,v){5"/^"+R(v)+"/.l("+a+")"};q.J["$="]=6(a,v){5"/"+R(v)+"$/.l("+a+")"};q.J["*="]=6(a,v){5"/"+R(v)+"/.l("+a+")"};6 1p(e,a,t){1d(a){F"n":5 K;F"2p":a="2n";1a;F"2o":a="2n+1"}7 1m=1o(e.1n);6 1k(i){7 i=(t==G)?1m.y-i:i-1;5 1m[i]==e};8(!Y(a))5 1k(a);a=a.1l("n");7 m=1K(a[0]);7 s=1K(a[1]);8((Y(m)||m==1)&&s==0)5 K;8(m==0&&!Y(s))5 1k(s);8(Y(s))s=0;7 c=1;H(e=t(e))c++;8(Y(m)||m==1)5(t==G)?(c<=s):(s>=c);5(c%m)==s}});x.15("1j-2m",6(){U=1i("L;/*@2l@8(@\\2k)U=K@2j@*/");8(!U){X=6(e,t,n){5 n?e.2i("*",t):e.X(t)};14=6(e,n){5!n||(n=="*")||(e.2h==n)};1h=1g.1I?6(e){5/1J/i.l(Q(e).1I)}:6(e){5 Q(e).1H.1f!="2g"};1e=6(e){5 e.2f||e.1G||1b(e)};6 1b(e){7 t="",n,i;9(i=0;(n=e.1F[i]);i++){1d(n.1c){F 11:F 1:t+=1b(n);1a;F 3:t+=n.2e;1a}}5 t}}});19=K;5 x}();',62,190,'|||||return|function|var|if|for||||||||pseudoClasses||||test|||this||AttributeSelector|||||||cssQuery|length|push|fr|id||selectors||case|nextElementSibling|while||tests|true|false|thisElement||replace|match|getDocument|regEscape||attributeSelectors|isMSIE|cache||getElementsByTagName|isNaN|slice|child||new|getAttribute|compareNamespace|addModule|previousElementSibling|compareTagName|parseSelector|loaded|break|_0|nodeType|switch|getTextContent|tagName|document|isXML|eval|css|_1|split|ch|parentNode|childElements|nthChild|disabled|firstElementChild|getText|RegExp|Quote|x22|PREFIX|lang|_2|arguments|else|all|links|version|se|childNodes|innerText|documentElement|contentType|xml|parseInt|indeterminate|checked|last|nth|lastElementChild|parse|_3|add|href|String|className|create|NS_IE|remove|toString|ST|select|Array|null|_4|mimeType|lastChild|firstChild|continue|modules|delete|join|caching|error|nodeValue|textContent|HTML|prefix|getElementsByTagNameNS|end|x5fwin32|cc_on|standard||odd|even|enabled|hash|location|target|not|only|empty|root|contains|level3|outerHTML|htmlFor|class|toLowerCase|Function|name|first|level2|prototype|item|scopeName|toUpperCase|ownerDocument|Document|XML|Boolean|URL|unknown|typeof|nextSibling|previousSibling|visited|link|valueOf|clearCache|catch|concat|constructor|callee|try'.split('|'),0,{}))

// === Sylvester ===
// Vector and Matrix mathematics modules for JavaScript
// Copyright (c) 2007 James Coglan
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var Sylvester = {
  version: '0.1.3',
  precision: 1e-6
};

function Vector() {}
Vector.prototype = {

  // Returns element i of the vector
  e: function(i) {
    return (i < 1 || i > this.elements.length) ? null : this.elements[i-1];
  },

  // Returns the number of elements the vector has
  dimensions: function() {
    return this.elements.length;
  },

  // Returns the modulus ('length') of the vector
  modulus: function() {
    return Math.sqrt(this.dot(this));
  },

  // Returns true iff the vector is equal to the argument
  eql: function(vector) {
    var n = this.elements.length;
    var V = vector.elements || vector;
    if (n != V.length) { return false; }
    do {
      if (Math.abs(this.elements[n-1] - V[n-1]) > Sylvester.precision) { return false; }
    } while (--n);
    return true;
  },

  // Returns a copy of the vector
  dup: function() {
    return Vector.create(this.elements);
  },

  // Maps the vector to another vector according to the given function
  map: function(fn) {
    var elements = [];
    this.each(function(x, i) {
      elements.push(fn(x, i));
    });
    return Vector.create(elements);
  },
  
  // Calls the iterator for each element of the vector in turn
  each: function(fn) {
    var n = this.elements.length, k = n, i;
    do { i = k - n;
      fn(this.elements[i], i+1);
    } while (--n);
  },

  // Returns a new vector created by normalizing the receiver
  toUnitVector: function() {
    var r = this.modulus();
    if (r === 0) { return this.dup(); }
    return this.map(function(x) { return x/r; });
  },

  // Returns the angle between the vector and the argument (also a vector)
  angleFrom: function(vector) {
    var V = vector.elements || vector;
    var n = this.elements.length, k = n, i;
    if (n != V.length) { return null; }
    var dot = 0, mod1 = 0, mod2 = 0;
    // Work things out in parallel to save time
    this.each(function(x, i) {
      dot += x * V[i-1];
      mod1 += x * x;
      mod2 += V[i-1] * V[i-1];
    });
    mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
    if (mod1*mod2 === 0) { return null; }
    var theta = dot / (mod1*mod2);
    if (theta < -1) { theta = -1; }
    if (theta > 1) { theta = 1; }
    return Math.acos(theta);
  },

  // Returns true iff the vector is parallel to the argument
  isParallelTo: function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (angle <= Sylvester.precision);
  },

  // Returns true iff the vector is antiparallel to the argument
  isAntiparallelTo: function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
  },

  // Returns true iff the vector is perpendicular to the argument
  isPerpendicularTo: function(vector) {
    var dot = this.dot(vector);
    return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
  },

  // Returns the result of adding the argument to the vector
  add: function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length != V.length) { return null; }
    return this.map(function(x, i) { return x + V[i-1]; });
  },

  // Returns the result of subtracting the argument from the vector
  subtract: function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length != V.length) { return null; }
    return this.map(function(x, i) { return x - V[i-1]; });
  },

  // Returns the result of multiplying the elements of the vector by the argument
  multiply: function(k) {
    return this.map(function(x) { return x*k; });
  },

  x: function(k) { return this.multiply(k); },

  // Returns the scalar product of the vector with the argument
  // Both vectors must have equal dimensionality
  dot: function(vector) {
    var V = vector.elements || vector;
    var i, product = 0, n = this.elements.length;
    if (n != V.length) { return null; }
    do { product += this.elements[n-1] * V[n-1]; } while (--n);
    return product;
  },

  // Returns the vector product of the vector with the argument
  // Both vectors must have dimensionality 3
  cross: function(vector) {
    var B = vector.elements || vector;
    if (this.elements.length != 3 || B.length != 3) { return null; }
    var A = this.elements;
    return Vector.create([
      (A[1] * B[2]) - (A[2] * B[1]),
      (A[2] * B[0]) - (A[0] * B[2]),
      (A[0] * B[1]) - (A[1] * B[0])
    ]);
  },

  // Returns the (absolute) largest element of the vector
  max: function() {
    var m = 0, n = this.elements.length, k = n, i;
    do { i = k - n;
      if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
    } while (--n);
    return m;
  },

  // Returns the index of the first match found
  indexOf: function(x) {
    var index = null, n = this.elements.length, k = n, i;
    do { i = k - n;
      if (index === null && this.elements[i] == x) {
        index = i + 1;
      }
    } while (--n);
    return index;
  },

  // Returns a diagonal matrix with the vector's elements as its diagonal elements
  toDiagonalMatrix: function() {
    return Matrix.Diagonal(this.elements);
  },

  // Returns the result of rounding the elements of the vector
  round: function() {
    return this.map(function(x) { return Math.round(x); });
  },

  // Returns a copy of the vector with elements set to the given value if they
  // differ from it by less than Sylvester.precision
  snapTo: function(x) {
    return this.map(function(y) {
      return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
    });
  },

  // Returns the vector's distance from the argument, when considered as a point in space
  distanceFrom: function(obj) {
    if (obj.anchor) { return obj.distanceFrom(this); }
    var V = obj.elements || obj;
    if (V.length != this.elements.length) { return null; }
    var sum = 0, part;
    this.each(function(x, i) {
      part = x - V[i-1];
      sum += part * part;
    });
    return Math.sqrt(sum);
  },

  // Returns true if the vector is point on the given line
  liesOn: function(line) {
    return line.contains(this);
  },

  // Return true iff the vector is a point in the given plane
  liesIn: function(plane) {
    return plane.contains(this);
  },

  // Rotates the vector about the given object. The object should be a 
  // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
  rotate: function(t, obj) {
    var V, R, x, y, z;
    switch (this.elements.length) {
      case 2:
        V = obj.elements || obj;
        if (V.length != 2) { return null; }
        R = Matrix.Rotation(t).elements;
        x = this.elements[0] - V[0];
        y = this.elements[1] - V[1];
        return Vector.create([
          V[0] + R[0][0] * x + R[0][1] * y,
          V[1] + R[1][0] * x + R[1][1] * y
        ]);
        break;
      case 3:
        if (!obj.direction) { return null; }
        var C = obj.pointClosestTo(this).elements;
        R = Matrix.Rotation(t, obj.direction).elements;
        x = this.elements[0] - C[0];
        y = this.elements[1] - C[1];
        z = this.elements[2] - C[2];
        return Vector.create([
          C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
          C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
          C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
        ]);
        break;
      default:
        return null;
    }
  },

  // Returns the result of reflecting the point in the given point, line or plane
  reflectionIn: function(obj) {
    if (obj.anchor) {
      // obj is a plane or line
      var P = this.elements.slice();
      var C = obj.pointClosestTo(P).elements;
      return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
    } else {
      // obj is a point
      var Q = obj.elements || obj;
      if (this.elements.length != Q.length) { return null; }
      return this.map(function(x, i) { return Q[i-1] + (Q[i-1] - x); });
    }
  },

  // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
  to3D: function() {
    var V = this.dup();
    switch (V.elements.length) {
      case 3: break;
      case 2: V.elements.push(0); break;
      default: return null;
    }
    return V;
  },

  // Returns a string representation of the vector
  inspect: function() {
    return '[' + this.elements.join(', ') + ']';
  },

  // Set vector's elements from an array
  setElements: function(els) {
    this.elements = (els.elements || els).slice();
    return this;
  }
};
  
// Constructor function
Vector.create = function(elements) {
  var V = new Vector();
  return V.setElements(elements);
};

// i, j, k unit vectors
Vector.i = Vector.create([1,0,0]);
Vector.j = Vector.create([0,1,0]);
Vector.k = Vector.create([0,0,1]);

// Random vector of size n
Vector.Random = function(n) {
  var elements = [];
  do { elements.push(Math.random());
  } while (--n);
  return Vector.create(elements);
};

// Vector filled with zeros
Vector.Zero = function(n) {
  var elements = [];
  do { elements.push(0);
  } while (--n);
  return Vector.create(elements);
};



function Matrix() {}
Matrix.prototype = {

  // Returns element (i,j) of the matrix
  e: function(i,j) {
    if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
    return this.elements[i-1][j-1];
  },

  // Returns row k of the matrix as a vector
  row: function(i) {
    if (i > this.elements.length) { return null; }
    return Vector.create(this.elements[i-1]);
  },

  // Returns column k of the matrix as a vector
  col: function(j) {
    if (j > this.elements[0].length) { return null; }
    var col = [], n = this.elements.length, k = n, i;
    do { i = k - n;
      col.push(this.elements[i][j-1]);
    } while (--n);
    return Vector.create(col);
  },

  // Returns the number of rows/columns the matrix has
  dimensions: function() {
    return {rows: this.elements.length, cols: this.elements[0].length};
  },

  // Returns the number of rows in the matrix
  rows: function() {
    return this.elements.length;
  },

  // Returns the number of columns in the matrix
  cols: function() {
    return this.elements[0].length;
  },

  // Returns true iff the matrix is equal to the argument. You can supply
  // a vector as the argument, in which case the receiver must be a
  // one-column matrix equal to the vector.
  eql: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    if (this.elements.length != M.length ||
        this.elements[0].length != M[0].length) { return false; }
    var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) { return false; }
      } while (--nj);
    } while (--ni);
    return true;
  },

  // Returns a copy of the matrix
  dup: function() {
    return Matrix.create(this.elements);
  },

  // Maps the matrix to another matrix (of the same dimensions) according to the given function
  map: function(fn) {
    var els = [], ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      els[i] = [];
      do { j = kj - nj;
        els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
      } while (--nj);
    } while (--ni);
    return Matrix.create(els);
  },

  // Returns true iff the argument has the same dimensions as the matrix
  isSameSizeAs: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    return (this.elements.length == M.length &&
        this.elements[0].length == M[0].length);
  },

  // Returns the result of adding the argument to the matrix
  add: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function(x, i, j) { return x + M[i-1][j-1]; });
  },

  // Returns the result of subtracting the argument from the matrix
  subtract: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function(x, i, j) { return x - M[i-1][j-1]; });
  },

  // Returns true iff the matrix can multiply the argument from the left
  canMultiplyFromLeft: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    // this.columns should equal matrix.rows
    return (this.elements[0].length == M.length);
  },

  // Returns the result of multiplying the matrix from the right by the argument.
  // If the argument is a scalar then just multiply all the elements. If the argument is
  // a vector, a vector is returned, which saves you having to remember calling
  // col(1) on the result.
  multiply: function(matrix) {
    if (!matrix.elements) {
      return this.map(function(x) { return x * matrix; });
    }
    var returnVector = matrix.modulus ? true : false;
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    if (!this.canMultiplyFromLeft(M)) { return null; }
    var ni = this.elements.length, ki = ni, i, nj, kj = M[0].length, j;
    var cols = this.elements[0].length, elements = [], sum, nc, c;
    do { i = ki - ni;
      elements[i] = [];
      nj = kj;
      do { j = kj - nj;
        sum = 0;
        nc = cols;
        do { c = cols - nc;
          sum += this.elements[i][c] * M[c][j];
        } while (--nc);
        elements[i][j] = sum;
      } while (--nj);
    } while (--ni);
    var M = Matrix.create(elements);
    return returnVector ? M.col(1) : M;
  },

  x: function(matrix) { return this.multiply(matrix); },

  // Returns a submatrix taken from the matrix
  // Argument order is: start row, start col, nrows, ncols
  // Element selection wraps if the required index is outside the matrix's bounds, so you could
  // use this to perform row/column cycling or copy-augmenting.
  minor: function(a, b, c, d) {
    var elements = [], ni = c, i, nj, j;
    var rows = this.elements.length, cols = this.elements[0].length;
    do { i = c - ni;
      elements[i] = [];
      nj = d;
      do { j = d - nj;
        elements[i][j] = this.elements[(a+i-1)%rows][(b+j-1)%cols];
      } while (--nj);
    } while (--ni);
    return Matrix.create(elements);
  },

  // Returns the transpose of the matrix
  transpose: function() {
    var rows = this.elements.length, cols = this.elements[0].length;
    var elements = [], ni = cols, i, nj, j;
    do { i = cols - ni;
      elements[i] = [];
      nj = rows;
      do { j = rows - nj;
        elements[i][j] = this.elements[j][i];
      } while (--nj);
    } while (--ni);
    return Matrix.create(elements);
  },

  // Returns true iff the matrix is square
  isSquare: function() {
    return (this.elements.length == this.elements[0].length);
  },

  // Returns the (absolute) largest element of the matrix
  max: function() {
    var m = 0, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
      } while (--nj);
    } while (--ni);
    return m;
  },

  // Returns the indeces of the first match found by reading row-by-row from left to right
  indexOf: function(x) {
    var index = null, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        if (this.elements[i][j] == x) { return {i: i+1, j: j+1}; }
      } while (--nj);
    } while (--ni);
    return null;
  },

  // If the matrix is square, returns the diagonal elements as a vector.
  // Otherwise, returns null.
  diagonal: function() {
    if (!this.isSquare) { return null; }
    var els = [], n = this.elements.length, k = n, i;
    do { i = k - n;
      els.push(this.elements[i][i]);
    } while (--n);
    return Vector.create(els);
  },

  // Make the matrix upper (right) triangular by Gaussian elimination.
  // This method only adds multiples of rows to other rows. No rows are
  // scaled up or switched, and the determinant is preserved.
  toRightTriangular: function() {
    var M = this.dup(), els;
    var n = this.elements.length, k = n, i, np, kp = this.elements[0].length, p;
    do { i = k - n;
      if (M.elements[i][i] == 0) {
        for (j = i + 1; j < k; j++) {
          if (M.elements[j][i] != 0) {
            els = []; np = kp;
            do { p = kp - np;
              els.push(M.elements[i][p] + M.elements[j][p]);
            } while (--np);
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] != 0) {
        for (j = i + 1; j < k; j++) {
          var multiplier = M.elements[j][i] / M.elements[i][i];
          els = []; np = kp;
          do { p = kp - np;
            // Elements with column numbers up to an including the number
            // of the row that we're subtracting can safely be set straight to
            // zero, since that's the point of this routine and it avoids having
            // to loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
          } while (--np);
          M.elements[j] = els;
        }
      }
    } while (--n);
    return M;
  },

  toUpperTriangular: function() { return this.toRightTriangular(); },

  // Returns the determinant for square matrices
  determinant: function() {
    if (!this.isSquare()) { return null; }
    var M = this.toRightTriangular();
    var det = M.elements[0][0], n = M.elements.length - 1, k = n, i;
    do { i = k - n + 1;
      det = det * M.elements[i][i];
    } while (--n);
    return det;
  },

  det: function() { return this.determinant(); },

  // Returns true iff the matrix is singular
  isSingular: function() {
    return (this.isSquare() && this.determinant() === 0);
  },

  // Returns the trace for square matrices
  trace: function() {
    if (!this.isSquare()) { return null; }
    var tr = this.elements[0][0], n = this.elements.length - 1, k = n, i;
    do { i = k - n + 1;
      tr += this.elements[i][i];
    } while (--n);
    return tr;
  },

  tr: function() { return this.trace(); },

  // Returns the rank of the matrix
  rank: function() {
    var M = this.toRightTriangular(), rank = 0;
    var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
      } while (--nj);
    } while (--ni);
    return rank;
  },
  
  rk: function() { return this.rank(); },

  // Returns the result of attaching the given argument to the right-hand side of the matrix
  augment: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    var T = this.dup(), cols = T.elements[0].length;
    var ni = T.elements.length, ki = ni, i, nj, kj = M[0].length, j;
    if (ni != M.length) { return null; }
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        T.elements[i][cols + j] = M[i][j];
      } while (--nj);
    } while (--ni);
    return T;
  },

  // Returns the inverse (if one exists) using Gauss-Jordan
  inverse: function() {
    if (!this.isSquare() || this.isSingular()) { return null; }
    var ni = this.elements.length, ki = ni, i, j;
    var M = this.augment(Matrix.I(ni)).toRightTriangular();
    var np, kp = M.elements[0].length, p, els, divisor;
    var inverse_elements = [], new_element;
    // Matrix is non-singular so there will be no zeros on the diagonal
    // Cycle through rows from last to first
    do { i = ni - 1;
      // First, normalise diagonal elements to 1
      els = []; np = kp;
      inverse_elements[i] = [];
      divisor = M.elements[i][i];
      do { p = kp - np;
        new_element = M.elements[i][p] / divisor;
        els.push(new_element);
        // Shuffle of the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= ki) { inverse_elements[i].push(new_element); }
      } while (--np);
      M.elements[i] = els;
      // Then, subtract this row from those above it to
      // give the identity matrix on the left hand side
      for (j = 0; j < i; j++) {
        els = []; np = kp;
        do { p = kp - np;
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        } while (--np);
        M.elements[j] = els;
      }
    } while (--ni);
    return Matrix.create(inverse_elements);
  },

  inv: function() { return this.inverse(); },

  // Returns the result of rounding all the elements
  round: function() {
    return this.map(function(x) { return Math.round(x); });
  },

  // Returns a copy of the matrix with elements set to the given value if they
  // differ from it by less than Sylvester.precision
  snapTo: function(x) {
    return this.map(function(p) {
      return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
    });
  },

  // Returns a string representation of the matrix
  inspect: function() {
    var matrix_rows = [];
    var n = this.elements.length, k = n, i;
    do { i = k - n;
      matrix_rows.push(Vector.create(this.elements[i]).inspect());
    } while (--n);
    return matrix_rows.join('\n');
  },

  // Set the matrix's elements from an array. If the argument passed
  // is a vector, the resulting matrix will be a single column.
  setElements: function(els) {
    var i, elements = els.elements || els;
    if (typeof(elements[0][0]) != 'undefined') {
      var ni = elements.length, ki = ni, nj, kj, j;
      this.elements = [];
      do { i = ki - ni;
        nj = elements[i].length; kj = nj;
        this.elements[i] = [];
        do { j = kj - nj;
          this.elements[i][j] = elements[i][j];
        } while (--nj);
      } while(--ni);
      return this;
    }
    var n = elements.length, k = n;
    this.elements = [];
    do { i = k - n;
      this.elements.push([elements[i]]);
    } while (--n);
    return this;
  }
};

// Constructor function
Matrix.create = function(elements) {
  var M = new Matrix();
  return M.setElements(elements);
};

// Identity matrix of size n
Matrix.I = function(n) {
  var els = [], k = n, i, nj, j;
  do { i = k - n;
    els[i] = []; nj = k;
    do { j = k - nj;
      els[i][j] = (i == j) ? 1 : 0;
    } while (--nj);
  } while (--n);
  return Matrix.create(els);
};

// Diagonal matrix - all off-diagonal elements are zero
Matrix.Diagonal = function(elements) {
  var n = elements.length, k = n, i;
  var M = Matrix.I(n);
  do { i = k - n;
    M.elements[i][i] = elements[i];
  } while (--n);
  return M;
};

// Rotation matrix about some axis. If no axis is
// supplied, assume we're after a 2D transform
Matrix.Rotation = function(theta, a) {
  if (!a) {
    return Matrix.create([
      [Math.cos(theta),  -Math.sin(theta)],
      [Math.sin(theta),   Math.cos(theta)]
    ]);
  }
  var axis = a.dup();
  if (axis.elements.length != 3) { return null; }
  var mod = axis.modulus();
  var x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
  var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
  // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
  // That proof rotates the co-ordinate system so theta
  // becomes -theta and sin becomes -sin here.
  return Matrix.create([
    [ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
    [ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
    [ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
  ]);
};

// Special case rotations
Matrix.RotationX = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Matrix.create([
    [  1,  0,  0 ],
    [  0,  c, -s ],
    [  0,  s,  c ]
  ]);
};
Matrix.RotationY = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Matrix.create([
    [  c,  0,  s ],
    [  0,  1,  0 ],
    [ -s,  0,  c ]
  ]);
};
Matrix.RotationZ = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Matrix.create([
    [  c, -s,  0 ],
    [  s,  c,  0 ],
    [  0,  0,  1 ]
  ]);
};

// Random matrix of n rows, m columns
Matrix.Random = function(n, m) {
  return Matrix.Zero(n, m).map(
    function() { return Math.random(); }
  );
};

// Matrix filled with zeros
Matrix.Zero = function(n, m) {
  var els = [], ni = n, i, nj, j;
  do { i = n - ni;
    els[i] = [];
    nj = m;
    do { j = m - nj;
      els[i][j] = 0;
    } while (--nj);
  } while (--ni);
  return Matrix.create(els);
};



function Line() {}
Line.prototype = {

  // Returns true if the argument occupies the same space as the line
  eql: function(line) {
    return (this.isParallelTo(line) && this.contains(line.anchor));
  },

  // Returns a copy of the line
  dup: function() {
    return Line.create(this.anchor, this.direction);
  },

  // Returns the result of translating the line by the given vector/array
  translate: function(vector) {
    var V = vector.elements || vector;
    return Line.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.direction);
  },

  // Returns true if the line is parallel to the argument. Here, 'parallel to'
  // means that the argument's direction is either parallel or antiparallel to
  // the line's own direction. A line is parallel to a plane if the two do not
  // have a unique intersection.
  isParallelTo: function(obj) {
    if (obj.normal) { return obj.isParallelTo(this); }
    var theta = this.direction.angleFrom(obj.direction);
    return (Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision);
  },

  // Returns the line's perpendicular distance from the argument,
  // which can be a point, a line or a plane
  distanceFrom: function(obj) {
    if (obj.normal) { return obj.distanceFrom(this); }
    if (obj.direction) {
      // obj is a line
      if (this.isParallelTo(obj)) { return this.distanceFrom(obj.anchor); }
      var N = this.direction.cross(obj.direction).toUnitVector().elements;
      var A = this.anchor.elements, B = obj.anchor.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, D = this.direction.elements;
      var PA1 = P[0] - A[0], PA2 = P[1] - A[1], PA3 = (P[2] || 0) - A[2];
      var modPA = Math.sqrt(PA1*PA1 + PA2*PA2 + PA3*PA3);
      if (modPA === 0) return 0;
      // Assumes direction vector is normalized
      var cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
      var sin2 = 1 - cosTheta*cosTheta;
      return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
    }
  },

  // Returns true iff the argument is a point on the line
  contains: function(point) {
    var dist = this.distanceFrom(point);
    return (dist !== null && dist <= Sylvester.precision);
  },

  // Returns true iff the line lies in the given plane
  liesIn: function(plane) {
    return plane.contains(this);
  },

  // Returns true iff the line has a unique point of intersection with the argument
  intersects: function(obj) {
    if (obj.normal) { return obj.intersects(this); }
    return (!this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision);
  },

  // Returns the unique intersection point with the argument, if one exists
  intersectionWith: function(obj) {
    if (obj.normal) { return obj.intersectionWith(this); }
    if (!this.intersects(obj)) { return null; }
    var P = this.anchor.elements, X = this.direction.elements,
        Q = obj.anchor.elements, Y = obj.direction.elements;
    var X1 = X[0], X2 = X[1], X3 = X[2], Y1 = Y[0], Y2 = Y[1], Y3 = Y[2];
    var PsubQ1 = P[0] - Q[0], PsubQ2 = P[1] - Q[1], PsubQ3 = P[2] - Q[2];
    var XdotQsubP = - X1*PsubQ1 - X2*PsubQ2 - X3*PsubQ3;
    var YdotPsubQ = Y1*PsubQ1 + Y2*PsubQ2 + Y3*PsubQ3;
    var XdotX = X1*X1 + X2*X2 + X3*X3;
    var YdotY = Y1*Y1 + Y2*Y2 + Y3*Y3;
    var XdotY = X1*Y1 + X2*Y2 + X3*Y3;
    var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
    return Vector.create([P[0] + k*X1, P[1] + k*X2, P[2] + k*X3]);
  },

  // Returns the point on the line that is closest to the given point or line
  pointClosestTo: function(obj) {
    if (obj.direction) {
      // obj is a line
      if (this.intersects(obj)) { return this.intersectionWith(obj); }
      if (this.isParallelTo(obj)) { return null; }
      var D = this.direction.elements, E = obj.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], E1 = E[0], E2 = E[1], E3 = E[2];
      // Create plane containing obj and the shared normal and intersect this with it
      // Thank you: http://www.cgafaq.info/wiki/Line-line_distance
      var x = (D3 * E1 - D1 * E3), y = (D1 * E2 - D2 * E1), z = (D2 * E3 - D3 * E2);
      var N = Vector.create([x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1]);
      var P = Plane.create(obj.anchor, N);
      return P.intersectionWith(this);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      if (this.contains(P)) { return Vector.create(P); }
      var A = this.anchor.elements, D = this.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], A1 = A[0], A2 = A[1], A3 = A[2];
      var x = D1 * (P[1]-A2) - D2 * (P[0]-A1), y = D2 * ((P[2] || 0) - A3) - D3 * (P[1]-A2),
          z = D3 * (P[0]-A1) - D1 * ((P[2] || 0) - A3);
      var V = Vector.create([D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y]);
      var k = this.distanceFrom(P) / V.modulus();
      return Vector.create([
        P[0] + V.elements[0] * k,
        P[1] + V.elements[1] * k,
        (P[2] || 0) + V.elements[2] * k
      ]);
    }
  },

  // Returns a copy of the line rotated by t radians about the given line. Works by
  // finding the argument's closest point to this line's anchor point (call this C) and
  // rotating the anchor about C. Also rotates the line's direction about the argument's.
  // Be careful with this - the rotation axis' direction affects the outcome!
  rotate: function(t, line) {
    // If we're working in 2D
    if (typeof(line.direction) == 'undefined') { line = Line.create(line.to3D(), Vector.k); }
    var R = Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, D = this.direction.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Line.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2],
      R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2],
      R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2]
    ]);
  },

  // Returns the line's reflection in the given point or line
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, D = this.direction.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], D1 = D[0], D2 = D[1], D3 = D[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the line's direction vector to its anchor, then mirror that in the plane
      var AD1 = A1 + D1, AD2 = A2 + D2, AD3 = A3 + D3;
      var Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
      var newD = [Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2]];
      return Line.create(newA, newD);
    } else if (obj.direction) {
      // obj is a line - reflection obtained by rotating PI radians about obj
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point - just reflect the line's anchor in it
      var P = obj.elements || obj;
      return Line.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.direction);
    }
  },

  // Set the line's anchor point and direction.
  setVectors: function(anchor, direction) {
    // Need to do this so that line's properties are not
    // references to the arguments passed in
    anchor = Vector.create(anchor);
    direction = Vector.create(direction);
    if (anchor.elements.length == 2) {anchor.elements.push(0); }
    if (direction.elements.length == 2) { direction.elements.push(0); }
    if (anchor.elements.length > 3 || direction.elements.length > 3) { return null; }
    var mod = direction.modulus();
    if (mod === 0) { return null; }
    this.anchor = anchor;
    this.direction = Vector.create([
      direction.elements[0] / mod,
      direction.elements[1] / mod,
      direction.elements[2] / mod
    ]);
    return this;
  }
};

  
// Constructor function
Line.create = function(anchor, direction) {
  var L = new Line();
  return L.setVectors(anchor, direction);
};

// Axes
Line.X = Line.create(Vector.Zero(3), Vector.i);
Line.Y = Line.create(Vector.Zero(3), Vector.j);
Line.Z = Line.create(Vector.Zero(3), Vector.k);



function Plane() {}
Plane.prototype = {

  // Returns true iff the plane occupies the same space as the argument
  eql: function(plane) {
    return (this.contains(plane.anchor) && this.isParallelTo(plane));
  },

  // Returns a copy of the plane
  dup: function() {
    return Plane.create(this.anchor, this.normal);
  },

  // Returns the result of translating the plane by the given vector
  translate: function(vector) {
    var V = vector.elements || vector;
    return Plane.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.normal);
  },

  // Returns true iff the plane is parallel to the argument. Will return true
  // if the planes are equal, or if you give a line and it lies in the plane.
  isParallelTo: function(obj) {
    var theta;
    if (obj.normal) {
      // obj is a plane
      theta = this.normal.angleFrom(obj.normal);
      return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
    } else if (obj.direction) {
      // obj is a line
      return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
  },
  
  // Returns true iff the receiver is perpendicular to the argument
  isPerpendicularTo: function(plane) {
    var theta = this.normal.angleFrom(plane.normal);
    return (Math.abs(Math.PI/2 - theta) <= Sylvester.precision);
  },

  // Returns the plane's distance from the given object (point, line or plane)
  distanceFrom: function(obj) {
    if (this.intersects(obj) || this.contains(obj)) { return 0; }
    if (obj.anchor) {
      // obj is a plane or line
      var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
    }
  },

  // Returns true iff the plane contains the given point or line
  contains: function(obj) {
    if (obj.normal) { return null; }
    if (obj.direction) {
      return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
    } else {
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      var diff = Math.abs(N[0]*(A[0] - P[0]) + N[1]*(A[1] - P[1]) + N[2]*(A[2] - (P[2] || 0)));
      return (diff <= Sylvester.precision);
    }
  },

  // Returns true iff the plane has a unique point/line of intersection with the argument
  intersects: function(obj) {
    if (typeof(obj.direction) == 'undefined' && typeof(obj.normal) == 'undefined') { return null; }
    return !this.isParallelTo(obj);
  },

  // Returns the unique intersection with the argument, if one exists. The result
  // will be a vector if a line is supplied, and a line if a plane is supplied.
  intersectionWith: function(obj) {
    if (!this.intersects(obj)) { return null; }
    if (obj.direction) {
      // obj is a line
      var A = obj.anchor.elements, D = obj.direction.elements,
          P = this.anchor.elements, N = this.normal.elements;
      var multiplier = (N[0]*(P[0]-A[0]) + N[1]*(P[1]-A[1]) + N[2]*(P[2]-A[2])) / (N[0]*D[0] + N[1]*D[1] + N[2]*D[2]);
      return Vector.create([A[0] + D[0]*multiplier, A[1] + D[1]*multiplier, A[2] + D[2]*multiplier]);
    } else if (obj.normal) {
      // obj is a plane
      var direction = this.normal.cross(obj.normal).toUnitVector();
      // To find an anchor point, we find one co-ordinate that has a value
      // of zero somewhere on the intersection, and remember which one we picked
      var N = this.normal.elements, A = this.anchor.elements,
          O = obj.normal.elements, B = obj.anchor.elements;
      var solver = Matrix.Zero(2,2), i = 0;
      while (solver.isSingular()) {
        i++;
        solver = Matrix.create([
          [ N[i%3], N[(i+1)%3] ],
          [ O[i%3], O[(i+1)%3]  ]
        ]);
      }
      // Then we solve the simultaneous equations in the remaining dimensions
      var inverse = solver.inverse().elements;
      var x = N[0]*A[0] + N[1]*A[1] + N[2]*A[2];
      var y = O[0]*B[0] + O[1]*B[1] + O[2]*B[2];
      var intersection = [
        inverse[0][0] * x + inverse[0][1] * y,
        inverse[1][0] * x + inverse[1][1] * y
      ];
      var anchor = [];
      for (var j = 1; j <= 3; j++) {
        // This formula picks the right element from intersection by
        // cycling depending on which element we set to zero above
        anchor.push((i == j) ? 0 : intersection[(j + (5 - i)%3)%3]);
      }
      return Line.create(anchor, direction);
    }
  },

  // Returns the point in the plane closest to the given point
  pointClosestTo: function(point) {
    var P = point.elements || point;
    var A = this.anchor.elements, N = this.normal.elements;
    var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
    return Vector.create([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
  },

  // Returns a copy of the plane, rotated by t radians about the given line
  // See notes on Line#rotate.
  rotate: function(t, line) {
    var R = Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, N = this.normal.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Plane.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
      R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
      R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2]
    ]);
  },

  // Returns the reflection of the plane in the given point, line or plane.
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, N = this.normal.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the plane's normal to its anchor, then mirror that in the other plane
      var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
      var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
      var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
      return Plane.create(newA, newN);
    } else if (obj.direction) {
      // obj is a line
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      return Plane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
    }
  },

  // Sets the anchor point and normal to the plane. If three arguments are specified,
  // the normal is calculated by assuming the three points should lie in the same plane.
  // If only two are sepcified, the second is taken to be the normal. Normal vector is
  // normalised before storage.
  setVectors: function(anchor, v1, v2) {
    anchor = Vector.create(anchor);
    anchor = anchor.to3D(); if (anchor === null) { return null; }
    v1 = Vector.create(v1);
    v1 = v1.to3D(); if (v1 === null) { return null; }
    if (typeof(v2) == 'undefined') {
      v2 = null;
    } else {
      v2 = Vector.create(v2);
      v2 = v2.to3D(); if (v2 === null) { return null; }
    }
    var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
    var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
    var normal, mod;
    if (v2 !== null) {
      var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
      normal = Vector.create([
        (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
        (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
        (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1)
      ]);
      mod = normal.modulus();
      if (mod === 0) { return null; }
      normal = Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
    } else {
      mod = Math.sqrt(v11*v11 + v12*v12 + v13*v13);
      if (mod === 0) { return null; }
      normal = Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
  }
};

// Constructor function
Plane.create = function(anchor, v1, v2) {
  var P = new Plane();
  return P.setVectors(anchor, v1, v2);
};

// X-Y-Z planes
Plane.XY = Plane.create(Vector.Zero(3), Vector.k);
Plane.YZ = Plane.create(Vector.Zero(3), Vector.i);
Plane.ZX = Plane.create(Vector.Zero(3), Vector.j);
Plane.YX = Plane.XY; Plane.ZY = Plane.YZ; Plane.XZ = Plane.ZX;

// Utility functions
var $V = Vector.create;
var $M = Matrix.create;
var $L = Line.create;
var $P = Plane.create;

        /* jshint ignore:start */
         window.$V = Vector.create
         window.$M = Matrix.create
         window.$L = Line.create
         window.$P = Plane.create

/*******************************************************************************
 * This notice must be untouched at all times.
 *
 * CSS Sandpaper: smooths out differences between CSS implementations.
 *
 * This javascript library contains routines to implement the CSS transform,
 * box-shadow and gradient in IE.  It also provides a common syntax for other
 * browsers that support vendor-specific methods.
 *
 * Written by: Zoltan Hawryluk. Version 1.0 beta 1 completed on March 8, 2010.
 * Version 1.5 completed June 20, 2011.
 *
 * Some routines are based on code from CSS Gradients via Canvas v1.2
 *   by Weston Ruter <http://weston.ruter.net/projects/css-gradients-via-canvas/>
 * Includes code from Kazumasa Hasegawa's textshadow.js <http://asamuzak.jp/html/322>
 *   to implement text-shadows in IE.
 * 
 * Requires sylvester.js by James Coglan to implement CSS3 transforms:
 *    http://sylvester.jcoglan.com/
 *
 * cssSandpaper.js v.1.5 available at http://www.useragentman.com/
 *
 * released under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 ******************************************************************************/
if (!document.querySelectorAll) {
    document.querySelectorAll = cssQuery;
}

var cssSandpaper = new function(){
    var me = this;
    
    var styleNodes, styleSheets = new Array();
    
    var ruleSetRe = /[^\{]*{[^\}]*}/g;
    var ruleSplitRe = /[\{\}]/g;
    
    var reGradient = /gradient\([\s\S]*\)/g;
    var reHSL = /hsl\([\s\S]*\)/g;
    
    // This regexp from the article 
    // http://james.padolsey.com/javascript/javascript-comment-removal-revisted/
    var reMultiLineComment = /\/\/.+?(?=\n|\r|$)|\/\*[\s\S]+?\*\//g;
    
    var reAtRule = /@[^\{\};]*;|@[^\{\};]*\{[^\}]*\}/g;
    
    var reFunctionSpaces = /\(\s*/g
    var reMatrixFunc = /matrix\(([^\,]+),([^\,]+),([^\,]+),([^\,]+),([^\,]+),([^\,]+)\)/g
    
    
    var ruleLists = new Array();
    var styleNode;
    
    var tempObj;
    var body;
    
    
    me.init = function(reinit){
   
        if (EventHelpers.hasPageLoadHappened(arguments) && !reinit) {
            return;
        }
		
        body = document.body;
        
        tempObj = document.createElement('div');
        
        getStyleSheets();
        
        indexRules();
        
	setChromaOverrides();
	fixTransforms();
	
	if (window.textShadowForMSIE) {
		fixTextShadows();
	}
        
        fixBoxShadow();
        fixLinearGradients();
        
        fixBackgrounds();
       	fixColors();
        fixOpacity();
        setClasses();
        //fixBorderRadius();
    
    }
	
	function setChromaOverrides() {
		 var rules = getRuleList('-sand-chroma-override').values;
        
         for (var i in rules) {
            var rule = rules[i];
            var nodes = document.querySelectorAll(rule.selector);
            
            for (var j = 0; j < nodes.length; j++) {
				DOMHelpers.setDatasetItem(nodes[j], 'cssSandpaper-chroma', new RGBColor(rule.value).toHex())
            }
            
        }
	}
    
    me.setOpacity = function(obj, value){
        var property = CSS3Helpers.findProperty(document.body, 'opacity');
        
        if (property == "filter") {
            // IE must have layout, see 
            // http://jszen.blogspot.com/2005/04/ie6-opacity-filter-caveat.html
            // for details.
            obj.style.zoom = "100%";
            
            var filter = CSS3Helpers.addFilter(obj, 'DXImageTransform.Microsoft.Alpha', StringHelpers.sprintf("opacity=%d", ((value) * 100)));
            
            filter.opacity = value * 100;
            
            
        } else if (obj.style[property] != null) {
            obj.style[property] = value;
        }
    }
    
    
    function fixOpacity(){
    
        var transformRules = getRuleList('opacity').values;
        
        for (var i in transformRules) {
            var rule = transformRules[i];
            var nodes = document.querySelectorAll(rule.selector);
            
            for (var j = 0; j < nodes.length; j++) {
                me.setOpacity(nodes[j], rule.value)
            }
            
        }
        
    }
	
	
    
    
    
    me.setTransform = function(obj, transformString){
        var property = CSS3Helpers.findProperty(obj, 'transform');
        
        if (property == "filter") {
            var matrix = CSS3Helpers.getTransformationMatrix(transformString);
            CSS3Helpers.setMatrixFilter(obj, matrix)
        } else if (obj.style[property] != null) {
			/*
			 * Firefox likes the matrix notation to be like this: 
			 *   matrix(4.758, -0.016, -0.143, 1.459, -7.058px, 85.081px);
			 * All others like this:
			 *   matrix(4.758, -0.016, -0.143, 1.459, -7.058, 85.081);
			 * (Note the missing px strings at the end of the last two parameters)
			 */ 
			
			
			
			var agentTransformString = transformString;
			if (property == "MozTransform") {
				agentTransformString = agentTransformString.replace(reMatrixFunc, 'matrix($1, $2, $3, $4, $5px, $6px)');
			}
            obj.style[property] = agentTransformString;
        }
    }
    
    function fixTransforms(){
    
        var transformRules = getRuleList('-sand-transform').values;
        var property = CSS3Helpers.findProperty(document.body, 'transform');
        
        
        for (var i in transformRules) {
            var rule = transformRules[i];
            var nodes = document.querySelectorAll(rule.selector);
            
            for (var j = 0; j < nodes.length; j++) {
                me.setTransform(nodes[j], rule.value)
            }
            
        }
        
    }
	
	function fixTextShadows() {
		var rules = getRuleList('text-shadow').values;
        var property = CSS3Helpers.findProperty(document.body, 'textShadow');
        
		if (property == 'filter' && window.textShadowForMSIE == undefined) {
			// The text-shadow library is not loaded. Bail.
			return;
		}
			
			for (var i in rules) {
				var rule = rules[i];
				
				var sels = rule.selector.split(',');
				if (property == 'filter') {
					for (var j in sels) {
						textShadowForMSIE.ieShadowSettings.push({
							sel: sels[j],
							shadow: rule.value
						});
					}
				} else {
					var nodes = document.querySelectorAll(rule.selector);
            
		            for (var j = 0; j < nodes.length; j++) {
		                nodes[j].style[property] =  rule.value;
		            }
				}
			}
		textShadowForMSIE.init()
		
	}
    
    me.setBoxShadow = function(obj, value){
        var property = CSS3Helpers.findProperty(obj, 'boxShadow');
        
        var values = CSS3Helpers.getBoxShadowValues(value);
        
        if (property == "filter") {
            var filter = CSS3Helpers.addFilter(obj, 'DXImageTransform.Microsoft.DropShadow', StringHelpers.sprintf("color=%s,offX=%d,offY=%d", values.color, values.offsetX, values.offsetY));
            filter.color = values.color;
            filter.offX = values.offsetX;
            filter.offY = values.offsetY;
            
        } else if (obj.style[property] != null) {
            obj.style[property] = value;
        }
    }
    
    function fixBoxShadow(){
    
        var transformRules = getRuleList('-sand-box-shadow').values;
        
        //var matrices = new Array();
        
        
        for (var i in transformRules) {
            var rule = transformRules[i];
            
            var nodes = document.querySelectorAll(rule.selector);
            
            
            
            for (var j = 0; j < nodes.length; j++) {
                me.setBoxShadow(nodes[j], rule.value)
                
            }
            
        }
        
    }
    
    function setGradientFilter(node, values){
    
        if (values.colorStops.length == 2 &&
        values.colorStops[0].stop == 0.0 &&
        values.colorStops[1].stop == 1.0) {
            var startColor = new RGBColor(values.colorStops[0].color);
            var endColor = new RGBColor(values.colorStops[1].color);
            
            startColor = startColor.toHex();
            endColor = endColor.toHex();
            
            var filter = CSS3Helpers.addFilter(node, 'DXImageTransform.Microsoft.Gradient', StringHelpers.sprintf("GradientType = %s, StartColorStr = '%s', EndColorStr = '%s'", values.IEdir, startColor, endColor));
            
            filter.GradientType = values.IEdir;
            filter.StartColorStr = startColor;
            filter.EndColorStr = endColor;
            node.style.zoom = 1;
        }
    }
    
    me.setGradient = function(node, value){
    
        var support = CSS3Helpers.reportGradientSupport();
        
        var values = CSS3Helpers.getGradient(value);
        
        if (values == null) {
            return;
        }
        
        if (node.filters && (support != implementation.CANVAS_WORKAROUND || CSSHelpers.isMemberOfClass(document.body, 'cssSandpaper-IEuseGradientFilter') || CSSHelpers.isMemberOfClass(node, 'cssSandpaper-IEuseGradientFilter'))) {
            setGradientFilter(node, values);
        } else if (support == implementation.MOZILLA) {
        	
            node.style.backgroundImage = StringHelpers.sprintf('-moz-gradient( %s, %s, from(%s), to(%s))', values.dirBegin, values.dirEnd, values.colorStops[0].color, values.colorStops[1].color);
        } else if (support == implementation.WEBKIT) {
            var tmp = StringHelpers.sprintf('-webkit-gradient(%s, %s, %s %s, %s %s)', values.type, values.dirBegin, values.r0 ? values.r0 + ", " : "", values.dirEnd, values.r1 ? values.r1 + ", " : "", listColorStops(values.colorStops));
            node.style.backgroundImage = tmp;
        } else if (support == implementation.CANVAS_WORKAROUND) {
            try {
                CSS3Helpers.applyCanvasGradient(node, values);
            } 
            catch (ex) {
                // do nothing (for now).
            }
        }
    }
    
    me.setRGBABackground = function(node, value){
    
        var support = CSS3Helpers.reportColorSpaceSupport('RGBA', colorType.BACKGROUND);
        
        switch (support) {
            case implementation.NATIVE:
                node.style.value = value;
                break;
            case implementation.FILTER_WORKAROUND:
                setGradientFilter(node, {
                    IEdir: 0,
                    colorStops: [{
                        stop: 0.0,
                        color: value
                    }, {
                        stop: 1.0,
                        color: value
                    }]
                });
                
                break;
        }
        
    }
    
    me.setHSLABackground = function(node, value) {
    	var support = CSS3Helpers.reportColorSpaceSupport('HSLA', colorType.BACKGROUND);
        
        switch (support) {
            case implementation.NATIVE:
                /* node.style.value = value;
                break; */
            case implementation.FILTER_WORKAROUND:
            	var rgbColor =  new RGBColor(value);
            	
            	if (rgbColor.a == 1) {
            		node.style.backgroundColor = rgbColor.toHex();
            	} else {
            		var rgba = rgbColor.toRGBA();
	                setGradientFilter(node, {
	                    IEdir: 0,
	                    colorStops: [{
	                        stop: 0.0,
	                        color: rgba
	                    }, {
	                        stop: 1.0,
	                        color: rgba
	                    }]
	                });
                }
                break;
        }
    }
    
    /**
	 * Convert a hyphenated string to camelized text.  For example, the string "font-type" will be converted
	 * to "fontType".
	 * 
	 * @param {Object} s - the string that needs to be camelized.
	 * @return {String} - the camelized text.
	 */
	me.camelize = function (s) {
		var r="";
		
		for (var i=0; i<s.length; i++) {
			if (s.substring(i, i+1) == '-') {
				i++;
				r+= s.substring(i, i+1).toUpperCase();
			} else {
				r+= s.substring(i, i+1);
			}
		}
		
		return r;
	}
    
    me.setHSLColor = function (node, property, value) {
    	var support = CSS3Helpers.reportColorSpaceSupport('HSL', colorType.FOREGROUND);
    	
    	switch (support) {
            case implementation.NATIVE:
                /* node.style.value = value;
                break; */
            case implementation.HEX_WORKAROUND:
            	
            	var hslColor = value.match(reHSL)[0];
            	var hexColor = new RGBColor(hslColor).toHex()
            	var newPropertyValue = value.replace(reHSL, hexColor);
            	
            	
            	
                node.style[me.camelize(property)] = newPropertyValue;
                
                break;
        }
    		
    }
    
    
    function fixLinearGradients(){
    
        var backgroundRules = getRuleList('background').values.concat(getRuleList('background-image').values);
        
        for (var i in backgroundRules) {
            var rule = backgroundRules[i];
            var nodes = document.querySelectorAll(rule.selector);
            for (var j = 0; j < nodes.length; j++) {
                me.setGradient(nodes[j], rule.value)
            }
        }
    }
    
    function fixBackgrounds(){
    
        var support = CSS3Helpers.reportColorSpaceSupport('RGBA', colorType.BACKGROUND);
        if (support == implementation.NATIVE) {
            return;
        } 
       
        
        var backgroundRules = getRuleList('background').values.concat(getRuleList('background-color').values);
       
        for (var i in backgroundRules) {
            var rule = backgroundRules[i];
            var nodes = document.querySelectorAll(rule.selector);
            for (var j = 0; j < nodes.length; j++) {
                if (rule.value.indexOf('rgba(') == 0) {
                    me.setRGBABackground(nodes[j], rule.value);
                } else if (rule.value.indexOf('hsla(') == 0 || rule.value.indexOf('hsl(') == 0) {
                	
                	me.setHSLABackground(nodes[j], rule.value);
                } 
            }
        }
    }
    
    me.getProperties = function (obj, objName)
	{
		var result = ""
		
		if (!obj) {
			return result;
		}
		
		for (var i in obj)
		{
			try {
				result += objName + "." + i.toString() + " = " + obj[i] + ", ";
			} catch (ex) {
				// nothing
			}
		}
		return result
	}
    
    function fixColors() {
    	var support = CSS3Helpers.reportColorSpaceSupport('HSL', colorType.FOREGROUND);
    	if (support == implementation.NATIVE) {
            return;
        } 
        
        var colorRules = getRuleList('color').values;
        
        var properties = ['color', 'border', 
        	'border-left', 	'border-right', 'border-bottom', 'border-top',
        	'border-left-color', 'border-right-color', 'border-bottom-color', 'border-top-color'];
        
        for (var i=0; i<properties.length; i++) {
        	var rules = getRuleList(properties[i]).values;
    		colorRules = colorRules.concat(rules);
       	} 
       	
        for (var i in colorRules) {
            var rule = colorRules[i];
            
            var nodes = document.querySelectorAll(rule.selector);
            for (var j = 0; j < nodes.length; j++) {
            	var isBorder = (rule.name.indexOf('border') == 0);
            	var ruleMatch = rule.value.match(reHSL);
            	
            	
                if (ruleMatch) {
                	
                	var cssProperty;
                	if (isBorder && rule.name.indexOf('-color') < 0) {
                		cssProperty = rule.name;
                	} else {
                		cssProperty = rule.name;
                	}
                	
                	me.setHSLColor(nodes[j], cssProperty, rule.value);
                			
                } 
            }
        }
    }
    
    
    
    function listColorStops(colorStops){
        var sb = new StringBuffer();
        
        for (var i = 0; i < colorStops.length; i++) {
            sb.append(StringHelpers.sprintf("color-stop(%s, %s)", colorStops[i].stop, colorStops[i].color));
            if (i < colorStops.length - 1) {
                sb.append(', ');
            }
        }
        
        return sb.toString();
    }
    
    
    function getStyleSheet(node){
        var sheetCssText;
        switch (node.nodeName.toLowerCase()) {
            case 'style':
                sheetCssText = StringHelpers.uncommentHTML(node.innerHTML); //does not work with inline styles because IE doesn't allow you to get the text content of a STYLE element
                break;
            case 'link':
                try {
	                var xhr = XMLHelpers.getXMLHttpRequest(node.href, null, "GET", null, false);
	                sheetCssText = xhr.responseText;
                } catch (ex) {
                	sheetCssText = "";
                }
                break;
        }
        
        sheetCssText = sheetCssText.replace(reMultiLineComment, '').replace(reAtRule, '');
        
        return sheetCssText;
    }
    
    function getStyleSheets(){
    
        styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
        
        for (var i = 0; i < styleNodes.length; i++) {
            if (!CSSHelpers.isMemberOfClass(styleNodes[i], 'cssSandpaper-noIndex')) {
                styleSheets.push(getStyleSheet(styleNodes[i]))
            }
        }
    }
    
    function indexRules(){
    
        for (var i = 0; i < styleSheets.length; i++) {
            var sheet = styleSheets[i];
            
            rules = sheet.match(ruleSetRe);
            if (rules) {
                for (var j = 0; j < rules.length; j++) {
                    var parsedRule = rules[j].split(ruleSplitRe);
                    var selector = parsedRule[0].trim();
                    var propertiesStr = parsedRule[1];
                    var properties = propertiesStr.split(';');
                    for (var k = 0; k < properties.length; k++) {
                        if (properties[k].trim() != '') {
                            var splitProperty = properties[k].split(':')
                            var name = splitProperty[0].trim().toLowerCase();
                            var value = splitProperty[1];
                            if (!ruleLists[name]) {
                                ruleLists[name] = new RuleList(name);
                            }
                            
                            if (value && typeof(ruleLists[name]) == 'object') {
                                ruleLists[name].add(selector, value.trim());
                            }
                        }
                    }
                }
            }
        }
        
    }
    
    function getRuleList(name){
        var list = ruleLists[name];
        if (!list) {
            list = new RuleList(name);
        }
        return list;
    }
    
    function setClasses(){
    
    
        var htmlNode = document.getElementsByTagName('html')[0];
        var properties = ['transform', 'opacity'];
        
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            if (CSS3Helpers.supports(prop)) {
                CSSHelpers.addClass(htmlNode, 'cssSandpaper-' + prop);
            }
        }
		
		// Now .. remove the initially hidden classes
		var hiddenNodes = CSSHelpers.getElementsByClassName(document, 'cssSandpaper-initiallyHidden');
		
		for (var i=0; i<hiddenNodes.length; i++){
			CSSHelpers.removeClass(hiddenNodes[i], 'cssSandpaper-initiallyHidden');
		} 
    }
	
	me.getChromaColor = function (obj) {
		var background = DOMHelpers.getDatasetItem(obj, 'cssSandpaper-chroma');
			
		if (!background) {
			background = "#808080";
		}
		return background;
	}
}

function RuleList(propertyName){
    var me = this;
    me.values = new Array();
    me.propertyName = propertyName;
    me.add = function(selector, value){
        me.values.push(new CSSRule(selector, me.propertyName, value));
    }
}

function CSSRule(selector, name, value){
    var me = this;
    me.selector = selector;
    me.name = name;
    me.value = value;
    
    me.toString = function(){
        return StringHelpers.sprintf("%s { %s: %s}", me.selector, me.name, me.value);
    }
}

if (window.$M) {
	var MatrixGenerator = new function(){
		var me = this;
		var reUnit = /[a-z]+$/;
		me.identity = $M([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
		
		
		function degreesToRadians(degrees){
			return (degrees - 360) * Math.PI / 180;
		}
		
		function getRadianScalar(angleStr){
		
			var num = parseFloat(angleStr);
			var unit = angleStr.match(reUnit);
			
			
			if (angleStr.trim() == '0') {
				num = 0;
				unit = 'rad';
			}
			
			if (unit.length != 1 || num == 0) {
				return 0;
			}
			
			
			unit = unit[0];
			
			
			var rad;
			switch (unit) {
				case "deg":
					rad = degreesToRadians(num);
					break;
				case "rad":
					rad = num;
					break;
				default:
					throw "Not an angle: " + angleStr;
			}
			return rad;
		}
		
		me.prettyPrint = function(m){
			return StringHelpers.sprintf('| %s %s %s | - | %s %s %s | - |%s %s %s|', m.e(1, 1), m.e(1, 2), m.e(1, 3), m.e(2, 1), m.e(2, 2), m.e(2, 3), m.e(3, 1), m.e(3, 2), m.e(3, 3))
		}
		
		me.rotate = function(angleStr){
			var num = getRadianScalar(angleStr);
			return Matrix.RotationZ(num);
		}
		
		me.scale = function(sx, sy){
			sx = parseFloat(sx)
			
			if (!sy) {
				sy = sx;
			}
			else {
				sy = parseFloat(sy)
			}
			
			
			return $M([[sx, 0, 0], [0, sy, 0], [0, 0, 1]]);
		}
		
		me.scaleX = function(sx){
			return me.scale(sx, 1);
		}
		
		me.scaleY = function(sy){
			return me.scale(1, sy);
		}
		
		me.skew = function(ax, ay){
			var xRad = getRadianScalar(ax);
			var yRad;
			
			if (ay != null) {
				yRad = getRadianScalar(ay)
			}
			else {
				yRad = xRad
			}
			
			if (xRad != null && yRad != null) {
			
				return $M([[1, Math.tan(xRad), 0], [Math.tan(yRad), 1, 0], [0, 0, 1]]);
			}
			else {
				return null;
			}
		}
		
		me.skewX = function(ax){
		
			return me.skew(ax, "0");
		}
		
		me.skewY = function(ay){
			return me.skew("0", ay);
		}
		
		me.translate = function(tx, ty){
		
			var TX = parseInt(tx);
			var TY = parseInt(ty)
			
			//jslog.debug(StringHelpers.sprintf('translate %f %f', TX, TY));
			
			return $M([[1, 0, TX], [0, 1, TY], [0, 0, 1]]);
		}
		
		me.translateX = function(tx){
			return me.translate(tx, 0);
		}
		
		me.translateY = function(ty){
			return me.translate(0, ty);
		}
		
		
		me.matrix = function(a, b, c, d, e, f){
		
			// for now, e and f are ignored
			return $M([[a, c, parseInt(e)], [b, d, parseInt(f)], [0, 0, 1]])
		}
	}
}

var CSS3Helpers = new function(){
    var me = this;
    
    
    var reTransformListSplitter = /[a-zA-Z]+\([^\)]*\)\s*/g;
    
    var reLeftBracket = /\(/g;
    var reRightBracket = /\)/g;
    var reComma = /,/g;
    
    var reSpaces = /\s+/g
    
    var reFilterNameSplitter = /progid:([^\(]*)/g;
    
    var reLinearGradient
    
    var canvas;
    
    var cache = new Array();
    var filterDatasetName = 'csssandpaper-filter-';
    
    me.supports = function(cssProperty){
        if (CSS3Helpers.findProperty(document.body, cssProperty) != null) {
            return true;
        } else {
            return false;
        }
    }
    
    me.getCanvas = function(){
    
        if (canvas) {
            return canvas;
        } else {
            canvas = document.createElement('canvas');
            return canvas;
        }
    }
    
    me.getTransformationMatrix = function(CSS3TransformProperty, doThrowIfError){
    
        var transforms = CSS3TransformProperty.match(reTransformListSplitter);
		
		/*
		 * Do a check here to see if there is anything in the transformation
		 * besides legit transforms
		 */
		if (doThrowIfError) {
			var checkString = transforms.join(" ").replace(/\s*/g, ' ');
			var normalizedCSSProp = CSS3TransformProperty.replace(/\s*/g, ' ');
			
			if (checkString != normalizedCSSProp) {
				throw ("An invalid transform was given.")	
			}
		}
		
		
        var resultantMatrix = MatrixGenerator.identity;
        
        for (var j = 0; j < transforms.length; j++) {
        
            var transform = transforms[j];
			
            transform = transform.replace(reLeftBracket, '("').replace(reComma, '", "').replace(reRightBracket, '")');
            
            
            try {
                var matrix = eval('MatrixGenerator.' + transform);
				
				
                //jslog.debug( transform + ': ' + MatrixGenerator.prettyPrint(matrix))
                resultantMatrix = resultantMatrix.x(matrix);
            } 
            catch (ex) {
            	
				if (doThrowIfError) {
					var method = transform.split('(')[0];

					var funcCall = transform.replace(/\"/g, '');

					if (MatrixGenerator[method]  == undefined) {
						throw "Error: invalid tranform function: " + funcCall;
					} else {
						throw "Error: Invalid or missing parameters in function call: " + funcCall;

					}
				}
                // do nothing;
            }
        }
        
        return resultantMatrix;
        
    }
    
    me.getBoxShadowValues = function(propertyValue){
        var r = new Object();
        
        var values = propertyValue.split(reSpaces);
        
        if (values[0] == 'inset') {
            r.inset = true;
            values = values.reverse().pop().reverse();
        } else {
            r.inset = false;
        }
        
        r.offsetX = parseInt(values[0]);
        r.offsetY = parseInt(values[1]);
        
        if (values.length > 3) {
            r.blurRadius = values[2];
            
            if (values.length > 4) {
                r.spreadRadius = values[3]
            }
        }
        
        r.color = values[values.length - 1];
        
        return r;
    }
    
    me.getGradient = function(propertyValue){
        var r = new Object();
        r.colorStops = new Array();
        
        
        var substring = me.getBracketedSubstring(propertyValue, '-sand-gradient');
        if (substring == undefined) {
            return null;
        }
        var parameters = substring.match(/[^\(,]+(\([^\)]*\))?[^,]*/g); //substring.split(reComma);
        r.type = parameters[0].trim();
        
        if (r.type == 'linear') {
            r.dirBegin = parameters[1].trim();
            r.dirEnd = parameters[2].trim();
            var beginCoord = r.dirBegin.split(reSpaces);
            var endCoord = r.dirEnd.split(reSpaces);
            
            for (var i = 3; i < parameters.length; i++) {
                r.colorStops.push(parseColorStop(parameters[i].trim(), i - 3));
            }
            
            
            
            
            /* The following logic only applies to IE */
            if (document.body.filters) {
                if (r.x0 == r.x1) {
                    /* IE only supports "center top", "center bottom", "top left" and "top right" */
                    
                    switch (beginCoord[1]) {
                        case 'top':
                            r.IEdir = 0;
                            break;
                        case 'bottom':
                            swapIndices(r.colorStops, 0, 1);
                            r.IEdir = 0;
                            /* r.from = parameters[4].trim();
                         r.to = parameters[3].trim(); */
                            break;
                    }
                }
                
                if (r.y0 == r.y1) {
                    switch (beginCoord[0]) {
                        case 'left':
                            r.IEdir = 1;
                            break;
                        case 'right':
                            r.IEdir = 1;
                            swapIndices(r.colorStops, 0, 1);
                            
                            break;
                    }
                }
            }
        } else {
        
            // don't even bother with IE
            if (document.body.filters) {
                return null;
            }
            
            
            r.dirBegin = parameters[1].trim();
            r.r0 = parameters[2].trim();
            
            r.dirEnd = parameters[3].trim();
            r.r1 = parameters[4].trim();
            
            var beginCoord = r.dirBegin.split(reSpaces);
            var endCoord = r.dirEnd.split(reSpaces);
            
            for (var i = 5; i < parameters.length; i++) {
                r.colorStops.push(parseColorStop(parameters[i].trim(), i - 5));
            }
            
        }
        
        
        r.x0 = beginCoord[0];
        r.y0 = beginCoord[1];
        
        r.x1 = endCoord[0];
        r.y1 = endCoord[1];
        
        return r;
    }
    
    function swapIndices(array, index1, index2){
        var tmp = array[index1];
        array[index1] = array[index2];
        array[index2] = tmp;
    }
    
    function parseColorStop(colorStop, index){
        var r = new Object();
        var substring = me.getBracketedSubstring(colorStop, 'color-stop');
        var from = me.getBracketedSubstring(colorStop, 'from');
        var to = me.getBracketedSubstring(colorStop, 'to');
        
        
        if (substring) {
            //color-stop
            var parameters = substring.split(',')
            r.stop = normalizePercentage(parameters[0].trim());
            r.color = parameters[1].trim();
        } else if (from) {
            r.stop = 0.0;
            r.color = from.trim();
        } else if (to) {
            r.stop = 1.0;
            r.color = to.trim();
        } else {
            if (index <= 1) {
                r.color = colorStop;
                if (index == 0) {
                    r.stop = 0.0;
                } else {
                    r.stop = 1.0;
                }
            } else {
                throw (StringHelpers.sprintf('invalid argument "%s"', colorStop));
            }
        }
        return r;
    }
    
    function normalizePercentage(s){
        if (s.substring(s.length - 1, s.length) == '%') {
            return parseFloat(s) / 100 + "";
        } else {
            return s;
        }
        
    }
    
    me.reportGradientSupport = function(){
    
        if (!cache["gradientSupport"]) {
            var r;
            var div = document.createElement('div');
            div.style.cssText = "background-image:-webkit-gradient(linear, 0% 0%, 0% 100%, from(red), to(blue));";
            
            if (div.style.backgroundImage) {
                r = implementation.WEBKIT;
                
            } else {
            
                /* div.style.cssText = "background-image:-moz-linear-gradient(top, blue, white 80%, orange);";
                 
                 if (div.style.backgroundImage) {
                 
                 r = implementation.MOZILLA;
                 
                 } else { */
                var canvas = CSS3Helpers.getCanvas();
                if (canvas.getContext && canvas.toDataURL) {
                    r = implementation.CANVAS_WORKAROUND;
                    
                } else {
                    r = implementation.NONE;
                }
                /* } */
            }
            
            cache["gradientSupport"] = r;
        }
        return cache["gradientSupport"];
    }
    
    me.reportColorSpaceSupport = function(colorSpace, type){
    	
        if (!cache[colorSpace + type]) {
            var r;
            var div = document.createElement('div');
            
            switch (type) {
            	
            	case colorType.BACKGROUND:
            		
		            switch(colorSpace) {
		            	case 'RGBA':
		            		div.style.cssText = "background-color: rgba(255, 32, 34, 0.5)";
		            		break;
		            	case 'HSL': 
		            		div.style.cssText = "background-color: hsl(0,0%,100%)";
		            		break;
		            	case 'HSLA': 
		            		div.style.cssText = "background-color: hsla(0,0%,100%,.5)";
		            		break;
		            	
		            	default:
		            		break;
		            }
	            
	            
	            
		            var body = document.body;
		            
		            
		            if (div.style.backgroundColor) {
		                r = implementation.NATIVE;
		                
		            } else if (body.filters && body.filters != undefined) {
		                r = implementation.FILTER_WORKAROUND;
		            } else {
		                r = implementation.NONE;
		            }
		            break;
		        case colorType.FOREGROUND:
		        	switch(colorSpace) {
		            	case 'RGBA':
		            		div.style.cssText = "color: rgba(255, 32, 34, 0.5)";
		            		break;
		            	case 'HSL': 
		            		div.style.cssText = "color: hsl(0,0%,100%)";
		            		break;
		            	case 'HSLA': 
		            		div.style.cssText = "color: hsla(0,0%,100%,.5)";
		            		break;
		            	
		            	default:
		            		break;
		            }
		           
		            if (div.style.color) {
		                r = implementation.NATIVE; 
		            } else if (colorSpace == 'HSL') {
		            
						r = implementation.HEX_WORKAROUND;
		            } else {
		                r = implementation.NONE;
		            }
		            break
	        }
           
            
            cache[colorSpace] = r;
        }
        return cache[colorSpace];
    }
    
    
    
    me.getBracketedSubstring = function(s, header){
        var gradientIndex = s.indexOf(header + '(')
        
        if (gradientIndex != -1) {
            var substring = s.substring(gradientIndex);
            
            var openBrackets = 1;
            for (var i = header.length + 1; i < 100 || i < substring.length; i++) {
                var c = substring.substring(i, i + 1);
                switch (c) {
                    case "(":
                        openBrackets++;
                        break;
                    case ")":
                        openBrackets--;
                        break;
                }
                
                if (openBrackets == 0) {
                    break;
                }
                
            }
            
            return substring.substring(gradientIndex + header.length + 1, i);
        }
        
        
    }
    
    
    me.setMatrixFilter = function(obj, matrix){
	
	
		if (!hasIETransformWorkaround(obj)) {
			addIETransformWorkaround(obj)
		}
		
		var container = obj.parentNode;
		//container.xTransform = degrees;
		
		
		filter = obj.filters.item('DXImageTransform.Microsoft.Matrix');
		//jslog.debug(MatrixGenerator.prettyPrint(matrix))
		filter.M11 = matrix.e(1, 1);
		filter.M12 = matrix.e(1, 2);
		filter.M21 = matrix.e(2, 1);
		filter.M22 = matrix.e(2, 2);
		filter = me.addFilter(obj, 
			'DXImageTransform.Microsoft.Matrix', 
			StringHelpers.sprintf("M11=%f, M12=%f, M21=%f, M22=%f, sizingMethod='auto expand'",
				matrix.e(1, 1), matrix.e(1, 2), matrix.e(2, 1), matrix.e(2, 2)));
            
		
		// Now, adjust the margins of the parent object
		var offsets = me.getIEMatrixOffsets(obj, matrix, container.xOriginalWidth, container.xOriginalHeight);
		container.style.marginLeft = offsets.x;
		container.style.marginTop = offsets.y;
		container.style.marginRight = 0;
		container.style.marginBottom = 0;
	}
	
	me.getTransformedDimensions = function (obj, matrix) {
		var r = {};
		
		if (hasIETransformWorkaround(obj)) {
			r.width = obj.offsetWidth;
			r.height = obj.offsetHeight;
		} else {
			var pts = [
				matrix.x($V([0, 0, 1]))	,
				matrix.x($V([0, obj.offsetHeight, 1])),
				matrix.x($V([obj.offsetWidth, 0, 1])),
				matrix.x($V([obj.offsetWidth, obj.offsetHeight, 1]))
			];
			var maxX = 0, maxY =0, minX=0, minY=0;
			
			for (var i = 0; i < pts.length; i++) {
				var pt = pts[i];
				var x = pt.e(1), y = pt.e(2);
				var minX = Math.min(minX, x);
				var maxX = Math.max(maxX, x);
				var minY = Math.min(minY, y);
				var maxY = Math.max(maxY, y);
			}
			
			
				r.width = maxX - minX;
				r.height = maxY - minY;
				 
		}
		
		return r;
	}
	
	me.getIEMatrixOffsets = function (obj, matrix, width, height) {
        var r = {};
		
		var originalWidth = parseFloat(width);
		var originalHeight = parseFloat(height);
		
		
        var offset;
        if (CSSHelpers.getComputedStyle(obj, 'display') == 'inline') {
            offset = 0;
        } else {
            offset = 13; // This works ... don't know why.
        }
		var transformedDimensions = me.getTransformedDimensions(obj, matrix);
        
        r.x = (((originalWidth - transformedDimensions.width) / 2) - offset + matrix.e(1, 3)) + 'px';
        r.y  = (((originalHeight - transformedDimensions.height) / 2) - offset + matrix.e(2, 3)) + 'px';
        
		return r;
    }
    
    function hasIETransformWorkaround(obj){
    
        return CSSHelpers.isMemberOfClass(obj.parentNode, 'IETransformContainer');
    }
    
    function addIETransformWorkaround(obj){
        if (!hasIETransformWorkaround(obj)) {
            var parentNode = obj.parentNode;
            var filter;
            
            // This is the container to offset the strange rotation behavior
            var container = document.createElement('div');
            CSSHelpers.addClass(container, 'IETransformContainer');
            
            
            container.style.width = obj.offsetWidth + 'px';
            container.style.height = obj.offsetHeight + 'px';
            
            container.xOriginalWidth = obj.offsetWidth;
            container.xOriginalHeight = obj.offsetHeight;
            container.style.position = 'absolute'
            container.style.zIndex = obj.currentStyle.zIndex;
            
            
            var horizPaddingFactor = 0; //parseInt(obj.currentStyle.paddingLeft); 
            var vertPaddingFactor = 0; //parseInt(obj.currentStyle.paddingTop);
            if (obj.currentStyle.display == 'block') {
                container.style.left = obj.offsetLeft + 13 - horizPaddingFactor + "px";
                container.style.top = obj.offsetTop + 13 + -vertPaddingFactor + 'px';
            } else {
                container.style.left = obj.offsetLeft + "px";
                container.style.top = obj.offsetTop + 'px';
                
            }
            //container.style.float = obj.currentStyle.float;
            
            
            obj.style.top = "auto";
            obj.style.left = "auto"
            obj.style.bottom = "auto";
            obj.style.right = "auto";
            // This is what we need in order to insert to keep the document
            // flow ok
            var replacement = obj.cloneNode(true);
            replacement.style.visibility = 'hidden';
            
            obj.replaceNode(replacement);
            
            // now, wrap container around the original node ... 
            
            obj.style.position = 'absolute';
            container.appendChild(obj);
            parentNode.insertBefore(container, replacement);
            container.style.backgroundColor = 'transparent';
            
            container.style.padding = '0';
            //var background = cssSandpaper.getChromaColor(obj);
			
			//obj.style.backgroundColor = background;
			//filter = CSS3Helpers.addFilter(obj, 'DXImageTransform.Microsoft.Chroma', StringHelpers.sprintf("color=%s", background));
            //sefilter.color = background;
            filter = me.addFilter(obj, 'DXImageTransform.Microsoft.Matrix', "M11=1, M12=0, M21=0, M22=1, sizingMethod='auto expand'")
            var bgImage = obj.currentStyle.backgroundImage.split("\"")[1];
            /*
            
             
            
             if (bgImage) {
            
             
            
             var alphaFilter = me.addFilter(obj, "DXImageTransform.Microsoft.AlphaImageLoader", "src='" + bgImage + "', sizingMethod='scale'");
            
             
            
             alert(bgImage)
            
             
            
             alphaFilter.src = bgImage;
            
             
            
             sizingMethod = 'scale';
            
             
            
             obj.style.background = 'none';
            
             
            
             obj.style.backgroundImage = 'none';
            
             
            
             }
            
             
            
             */
            
        }
        
    }
    
    me.addFilter = function(obj, filterName, filterValue){
        // now ... insert the filter so we can exploit its wonders
        	
        var filter;
        
            
       
        
        
        var comma = ", ";
        
        if (obj.filters.length == 0) {
            comma = "";
        }
        
        obj.style.filter = getPreviousFilters(obj, filterName) + StringHelpers.sprintf("progid:%s(%s)", filterName, filterValue);
        
		
		try {
			filter = obj.filters.item(filterName);
		} catch (ex) {
			return null;
		}
            
        
		// set dataset
		DOMHelpers.setDatasetItem(obj, filterDatasetName + filterName, filterValue.toLowerCase())
        return filter;
    }
	
	function getPreviousFilters(obj, exceptFilter) {
		var r = new StringBuffer();
		var dataset = DOMHelpers.getDataset(obj);
		for (var i in dataset) {
			if (i.indexOf(filterDatasetName) == 0) {
				var filterName = i.replace(filterDatasetName , "");
				if (filterName != exceptFilter.toLowerCase()) {
					r.append(StringHelpers.sprintf("progid:%s(%s) ", filterName, dataset[i]));
				}
				
			}
		}
		return r.toString();
	}
    
    
    function degreesToRadians(degrees){
        return (degrees - 360) * Math.PI / 180;
    }
    
    me.findProperty = function(obj, type){
        capType = type.capitalize();
        
       
        
        var r = cache[type]
        if (!r) {
        
        	var isTransform = (type == 'transform');
            var style = obj.style;
            
            
            var properties = [type, 'Moz' + capType, 'Webkit' + capType, 'O' + capType];
            
            if ((isTransform && !CSSHelpers.isMemberOfClass(document.body, 'cssSandpaper-noMSTransform')) || !isTransform) {
            	properties.push('ms' + capType);
            } 
            properties.push('filter');
           
            for (var i = 0; i < properties.length; i++) {
                if (style[properties[i]] != null) {
                    r = properties[i];
                    break;
                }
            }
            
            if (r == 'filter' && document.body.filters == undefined) {
                r = null;
            }
            cache[type] = r;
        }
        return r;
    }
    
    /*
     * "A point is a pair of space-separated values. The syntax supports numbers,
     *  percentages or the keywords top, bottom, left and right for point values."
     *  This keywords and percentages into pixel equivalents
     */
    me.parseCoordinate = function(value, max){
        //Convert keywords
        switch (value) {
            case 'top':
            case 'left':
                return 0;
            case 'bottom':
            case 'right':
                return max;
            case 'center':
                return max / 2;
        }
        
        //Convert percentage
        if (value.indexOf('%') != -1) 
            value = parseFloat(value.substr(0, value.length - 1)) / 100 * max;
        //Convert bare number (a pixel value)
        else 
            value = parseFloat(value);
        if (isNaN(value)) 
            throw Error("Unable to parse coordinate: " + value);
        return value;
    }
    
    me.applyCanvasGradient = function(el, gradient){
    
        var canvas = me.getCanvas();
        var computedStyle = document.defaultView.getComputedStyle(el, null);
        
        canvas.width = parseInt(computedStyle.width) + parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight) + 1; // inserted by Zoltan
        canvas.height = parseInt(computedStyle.height) + parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom) + 2; // 1 inserted by Zoltan
        var ctx = canvas.getContext('2d');
        
        //Iterate over the gradients and build them up
        
        var canvasGradient;
        // Linear gradient
        if (gradient.type == 'linear') {
        
        
            canvasGradient = ctx.createLinearGradient(me.parseCoordinate(gradient.x0, canvas.width), me.parseCoordinate(gradient.y0, canvas.height), me.parseCoordinate(gradient.x1, canvas.width), me.parseCoordinate(gradient.y1, canvas.height));
        } // Radial gradient
 else /*if(gradient.type == 'radial')*/ {
            canvasGradient = ctx.createRadialGradient(me.parseCoordinate(gradient.x0, canvas.width), me.parseCoordinate(gradient.y0, canvas.height), gradient.r0, me.parseCoordinate(gradient.x1, canvas.width), me.parseCoordinate(gradient.y1, canvas.height), gradient.r1);
        }
        
        //Add each of the color stops to the gradient
        for (var i = 0; i < gradient.colorStops.length; i++) {
            var cs = gradient.colorStops[i];
            
            canvasGradient.addColorStop(cs.stop, cs.color);
        };
        
        //Paint the gradient
        ctx.fillStyle = canvasGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        
        //Apply the gradient to the selectedElement
        el.style.backgroundImage = "url('" + canvas.toDataURL() + "')";
        
    }
    
}





var implementation = new function(){
    this.NONE = 0;
    
    // Native Support.
    this.NATIVE = 1;
    
    // Vendor specific prefix implementations
    this.MOZILLA = 2;
    this.WEBKIT = 3;
    this.IE = 4;
    this.OPERA = 5;
    
    // Non CSS3 Workarounds 
    this.CANVAS_WORKAROUND = 6;
    this.FILTER_WORKAROUND = 7;
    this.HEX_WORKAROUND = 8;
}

var colorType = new function () {
	this.BACKGROUND = 0;
	this.FOREGROUND = 1;
}

/*
 * Extra helper routines
 */
if (!window.StringHelpers) {
StringHelpers = new function(){
    var me = this;
    
    // used by the String.prototype.trim()			
    me.initWhitespaceRe = /^\s\s*/;
    me.endWhitespaceRe = /\s\s*$/;
    me.whitespaceRe = /\s/;
    
    /*******************************************************************************
     * Function sprintf(format_string,arguments...) Javascript emulation of the C
     * printf function (modifiers and argument types "p" and "n" are not supported
     * due to language restrictions)
     *
     * Copyright 2003 K&L Productions. All rights reserved
     * http://www.klproductions.com
     *
     * Terms of use: This function can be used free of charge IF this header is not
     * modified and remains with the function code.
     *
     * Legal: Use this code at your own risk. K&L Productions assumes NO
     * resposibility for anything.
     ******************************************************************************/
    me.sprintf = function(fstring){
        var pad = function(str, ch, len){
            var ps = '';
            for (var i = 0; i < Math.abs(len); i++) 
                ps += ch;
            return len > 0 ? str + ps : ps + str;
        }
        var processFlags = function(flags, width, rs, arg){
            var pn = function(flags, arg, rs){
                if (arg >= 0) {
                    if (flags.indexOf(' ') >= 0) 
                        rs = ' ' + rs;
                    else if (flags.indexOf('+') >= 0) 
                        rs = '+' + rs;
                } else 
                    rs = '-' + rs;
                return rs;
            }
            var iWidth = parseInt(width, 10);
            if (width.charAt(0) == '0') {
                var ec = 0;
                if (flags.indexOf(' ') >= 0 || flags.indexOf('+') >= 0) 
                    ec++;
                if (rs.length < (iWidth - ec)) 
                    rs = pad(rs, '0', rs.length - (iWidth - ec));
                return pn(flags, arg, rs);
            }
            rs = pn(flags, arg, rs);
            if (rs.length < iWidth) {
                if (flags.indexOf('-') < 0) 
                    rs = pad(rs, ' ', rs.length - iWidth);
                else 
                    rs = pad(rs, ' ', iWidth - rs.length);
            }
            return rs;
        }
        var converters = new Array();
        converters['c'] = function(flags, width, precision, arg){
            if (typeof(arg) == 'number') 
                return String.fromCharCode(arg);
            if (typeof(arg) == 'string') 
                return arg.charAt(0);
            return '';
        }
        converters['d'] = function(flags, width, precision, arg){
            return converters['i'](flags, width, precision, arg);
        }
        converters['u'] = function(flags, width, precision, arg){
            return converters['i'](flags, width, precision, Math.abs(arg));
        }
        converters['i'] = function(flags, width, precision, arg){
            var iPrecision = parseInt(precision);
            var rs = ((Math.abs(arg)).toString().split('.'))[0];
            if (rs.length < iPrecision) 
                rs = pad(rs, ' ', iPrecision - rs.length);
            return processFlags(flags, width, rs, arg);
        }
        converters['E'] = function(flags, width, precision, arg){
            return (converters['e'](flags, width, precision, arg)).toUpperCase();
        }
        converters['e'] = function(flags, width, precision, arg){
            iPrecision = parseInt(precision);
            if (isNaN(iPrecision)) 
                iPrecision = 6;
            rs = (Math.abs(arg)).toExponential(iPrecision);
            if (rs.indexOf('.') < 0 && flags.indexOf('#') >= 0) 
                rs = rs.replace(/^(.*)(e.*)$/, '$1.$2');
            return processFlags(flags, width, rs, arg);
        }
        converters['f'] = function(flags, width, precision, arg){
            iPrecision = parseInt(precision);
            if (isNaN(iPrecision)) 
                iPrecision = 6;
            rs = (Math.abs(arg)).toFixed(iPrecision);
            if (rs.indexOf('.') < 0 && flags.indexOf('#') >= 0) 
                rs = rs + '.';
            return processFlags(flags, width, rs, arg);
        }
        converters['G'] = function(flags, width, precision, arg){
            return (converters['g'](flags, width, precision, arg)).toUpperCase();
        }
        converters['g'] = function(flags, width, precision, arg){
            iPrecision = parseInt(precision);
            absArg = Math.abs(arg);
            rse = absArg.toExponential();
            rsf = absArg.toFixed(6);
            if (!isNaN(iPrecision)) {
                rsep = absArg.toExponential(iPrecision);
                rse = rsep.length < rse.length ? rsep : rse;
                rsfp = absArg.toFixed(iPrecision);
                rsf = rsfp.length < rsf.length ? rsfp : rsf;
            }
            if (rse.indexOf('.') < 0 && flags.indexOf('#') >= 0) 
                rse = rse.replace(/^(.*)(e.*)$/, '$1.$2');
            if (rsf.indexOf('.') < 0 && flags.indexOf('#') >= 0) 
                rsf = rsf + '.';
            rs = rse.length < rsf.length ? rse : rsf;
            return processFlags(flags, width, rs, arg);
        }
        converters['o'] = function(flags, width, precision, arg){
            var iPrecision = parseInt(precision);
            var rs = Math.round(Math.abs(arg)).toString(8);
            if (rs.length < iPrecision) 
                rs = pad(rs, ' ', iPrecision - rs.length);
            if (flags.indexOf('#') >= 0) 
                rs = '0' + rs;
            return processFlags(flags, width, rs, arg);
        }
        converters['X'] = function(flags, width, precision, arg){
            return (converters['x'](flags, width, precision, arg)).toUpperCase();
        }
        converters['x'] = function(flags, width, precision, arg){
            var iPrecision = parseInt(precision);
            arg = Math.abs(arg);
            var rs = Math.round(arg).toString(16);
            if (rs.length < iPrecision) 
                rs = pad(rs, ' ', iPrecision - rs.length);
            if (flags.indexOf('#') >= 0) 
                rs = '0x' + rs;
            return processFlags(flags, width, rs, arg);
        }
        converters['s'] = function(flags, width, precision, arg){
            var iPrecision = parseInt(precision);
            var rs = arg;
            if (rs.length > iPrecision) 
                rs = rs.substring(0, iPrecision);
            return processFlags(flags, width, rs, 0);
        }
        farr = fstring.split('%');
        retstr = farr[0];
        fpRE = /^([-+ #]*)(\d*)\.?(\d*)([cdieEfFgGosuxX])(.*)$/;
        for (var i = 1; i < farr.length; i++) {
            fps = fpRE.exec(farr[i]);
            if (!fps) 
                continue;
            if (arguments[i] != null) 
                retstr += converters[fps[4]](fps[1], fps[2], fps[3], arguments[i]);
            retstr += fps[5];
        }
        return retstr;
    }
    
    /**
     * Take out the first comment inside a block of HTML
     *
     * @param {String} s - an HTML block
     * @return {String} s - the HTML block uncommented.
     */
    me.uncommentHTML = function(s){
        if (s.indexOf('-->') != -1 && s.indexOf('<!--') != -1) {
            return s.replace("<!--", "").replace("-->", "");
        } else {
            return s;
        }
    }
}
}

if (!window.XMLHelpers) {

XMLHelpers = new function(){

    var me = this;
    
    /**
     * Wrapper for XMLHttpRequest Object.  Grabbing data (XML and/or text) from a URL.
     * Grabbing data from a URL. Input is one parameter, url. It returns a request
     * object. Based on code from
     * http://www.xml.com/pub/a/2005/02/09/xml-http-request.html.  IE caching problem
     * fix from Wikipedia article http://en.wikipedia.org/wiki/XMLHttpRequest
     *
     * @param {String} url - the URL to retrieve
     * @param {Function} processReqChange - the function/method to call at key events of the URL retrieval.
     * @param {String} method - (optional) "GET" or "POST" (default "GET")
     * @param {String} data - (optional) the CGI data to pass.  Default null.
     * @param {boolean} isAsync - (optional) is this call asyncronous.  Default true.
     *
     * @return {Object} a XML request object.
     */
    me.getXMLHttpRequest = function(url, processReqChange) //, method, data, isAsync)
    {
        var argv = me.getXMLHttpRequest.arguments;
        var argc = me.getXMLHttpRequest.arguments.length;
        var httpMethod = (argc > 2) ? argv[2] : 'GET';
        var data = (argc > 3) ? argv[3] : "";
        var isAsync = (argc > 4) ? argv[4] : true;
        
        var req;
        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
            // branch for IE/Windows ActiveX version
        } else if (window.ActiveXObject) {
            try {
                req = new ActiveXObject('Msxml2.XMLHTTP');
            } 
            catch (ex) {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            }
            // the browser doesn't support XML HttpRequest. Return null;
        } else {
            return null;
        }
        
        if (isAsync) {
            req.onreadystatechange = processReqChange;
        }
        
        if (httpMethod == "GET" && data != "") {
            url += "?" + data;
        }
        
        req.open(httpMethod, url, isAsync);
        
        //Fixes IE Caching problem
        req.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
        req.send(data);
        
        return req;
    }
}
}


if (!window.CSSHelpers) {
CSSHelpers = new function(){
    var me = this;
    
    var blankRe = new RegExp('\\s');
    
	/*
	 * getComputedStyle: code from http://blog.stchur.com/2006/06/21/css-computed-style/
	 */
	me.getComputedStyle = function(elem, style)
	{
	  var computedStyle;
	  if (typeof elem.currentStyle != 'undefined')
	    { computedStyle = elem.currentStyle; }
	  else
	    { computedStyle = document.defaultView.getComputedStyle(elem, null); }
	
	  return computedStyle[style];
	}
	
	
    /**
     * Determines if an HTML object is a member of a specific class.
     * @param {Object} obj - an HTML object.
     * @param {Object} className - the CSS class name.
     */
    me.isMemberOfClass = function(obj, className){
    
        if (blankRe.test(className)) 
            return false;
        
        var re = new RegExp(getClassReString(className), "g");
        
        return (re.test(obj.className));
        
        
    }
    
    /**
     * Make an HTML object be a member of a certain class.
     *
     * @param {Object} obj - an HTML object
     * @param {String} className - a CSS class name.
     */
    me.addClass = function(obj, className){
        if (blankRe.test(className)) {
            return;
        }
        
        // only add class if the object is not a member of it yet.
        if (!me.isMemberOfClass(obj, className)) {
            obj.className += " " + className;
        }
    }
    
    /**
     * Make an HTML object *not* be a member of a certain class.
     *
     * @param {Object} obj - an HTML object
     * @param {Object} className - a CSS class name.
     */
    me.removeClass = function(obj, className){
    
        if (blankRe.test(className)) {
            return;
        }
        
        
        var re = new RegExp(getClassReString(className), "g");
        
        var oldClassName = obj.className;
        
        
        if (obj.className) {
            obj.className = oldClassName.replace(re, '');
        }
        
        
    }
	
	function getClassReString(className) {
		return '\\s'+className+'\\s|^' + className + '\\s|\\s' + className + '$|' + '^' + className +'$';
	}
	
	/**
	 * Given an HTML element, find all child nodes of a specific class.
	 * 
	 * With ideas from Jonathan Snook 
	 * (http://snook.ca/archives/javascript/your_favourite_1/)
	 * Since this was presented within a post on this site, it is for the 
	 * public domain according to the site's copyright statement.
	 * 
	 * @param {Object} obj - an HTML element.  If you want to search a whole document, set
	 * 		this to the document object.
	 * @param {String} className - the class name of the objects to return
	 * @return {Array} - the list of objects of class cls. 
	 */
	me.getElementsByClassName = function (obj, className)
	{
		if (obj.getElementsByClassName) {
			return DOMHelpers.nodeListToArray(obj.getElementsByClassName(className))
		}
		else {
			var a = [];
			var re = new RegExp(getClassReString(className));
			var els = DOMHelpers.getAllDescendants(obj);
			for (var i = 0, j = els.length; i < j; i++) {
				if (re.test(els[i].className)) {
					a.push(els[i]);
					
				}
			}
			return a;
		}
	}
    
    /**
     * Generates a regular expression string that can be used to detect a class name
     * in a tag's class attribute.  It is used by a few methods, so I
     * centralized it.
     *
     * @param {String} className - a name of a CSS class.
     */
    function getClassReString(className){
        return '\\s' + className + '\\s|^' + className + '\\s|\\s' + className + '$|' + '^' + className + '$';
    }
    
    
}
}


/* 
 * Adding trim method to String Object.  Ideas from
 * http://www.faqts.com/knowledge_base/view.phtml/aid/1678/fid/1 and
 * http://blog.stevenlevithan.com/archives/faster-trim-javascript
 */
String.prototype.trim = function(){
    var str = this;
    
    // The first method is faster on long strings than the second and 
    // vice-versa.
    if (this.length > 6000) {
        str = this.replace(StringHelpers.initWhitespaceRe, '');
        var i = str.length;
        while (StringHelpers.whitespaceRe.test(str.charAt(--i))) 
            ;
        return str.slice(0, i + 1);
    } else {
        return this.replace(StringHelpers.initWhitespaceRe, '').replace(StringHelpers.endWhitespaceRe, '');
    }
    
    
};

if (!window.DOMHelpers) {

	DOMHelpers = new function () {
		var me = this;
		
		/**
		 * Returns all children of an element. Needed if it is necessary to do
		 * the equivalent of getElementsByTagName('*') for IE5 for Windows.
		 * 
		 * @param {Object} e - an HTML object.
		 */
		me.getAllDescendants = function(obj) {
			return obj.all ? obj.all : obj.getElementsByTagName('*');
		}
		
		/******
		* Converts a DOM live node list to a static/dead array.  Good when you don't
		* want the thing you are iterating in a for loop changing as the DOM changes.
		* 
		* @param {Object} nodeList - a node list (like one returned by document.getElementsByTagName)
		* @return {Array} - an array of nodes.
		* 
		*******/
		me.nodeListToArray = function (nodeList) 
		{ 
		    var ary = []; 
		    for(var i=0, len = nodeList.length; i < len; i++) 
		    { 
		        ary.push(nodeList[i]); 
		    } 
		    return ary; 
		}
		
		me.getDefinedAttributes = function (obj) {
		
			var attrs = obj.attributes;
			var r = new Array();
			
			for (var i=0; i<attrs.length; i++) {
				attr = attrs[i];
				if (attr.specified) {
					r[attr.name] = attr.value;
					
				}
			}
		
			return r;
		}
		
		/**
		 * Given an HTML or XML object, find the an attribute by name.
		 * 
		 * @param {Object} obj - a DOM object.
		 * @param {String} attrName - the name of an attribute inside the DOM object.
		 * @return {Object} - the attribute object or null if there isn't one.
		 */
		me.getAttributeByName = function (obj, attrName) {
	
			var attributes = obj.attributes;
			
			try {
				return attributes.getNamedItem(attrName);
				
			} 
			catch (ex) {
				var i;
				
				for (i = 0; i < attributes.length; i++) {
					var attr = attributes[i]
					if (attr.nodeName == attrName && attr.specified) {
						return attr;
					}
				}
				return null;
			}
			
		}
		
		/**
		 * Given an HTML or XML object, find the value of an attribute.
		 * 
		 * @param {Object} obj - a DOM object.
		 * @param {String} attrName - the name of an attribute inside the DOM object.
		 * @return {String} - the value of the attribute.
		 */
		me.getAttributeValue = function (obj, attrName) {
			var attr = me.getAttributeByName(obj, attrName);
			
			if (attr != null) {
				return attr.nodeValue;
			} else {
				return obj[attrName];
			}
		}
		
		/**
		 * Given an HTML or XML object, set the value of an attribute.
		 * 
		 * @param {Object} obj - a DOM object.
		 * @param {String} attrName - the name of an attribute inside the DOM object.
		 * @param {String} attrValue - the value of the attribute.
		 */
		me.setAttributeValue = function (obj, attrName, attrValue) {
			var attr = me.getAttributeByName(obj, attrName);
			
			if (attr != null) {
				attr.nodeValue = attrValue;
			} else {
				attr = document.createAttribute(attrName);
				attr.value = attrValue;
				obj.setAttributeNode(attr)
				//obj[attrName] = attrValue;
			}
		}
		
		/*
		 * HTML5 dataset
		 */	
		me.getDataset = function (obj) {
			var r = new Array();
			
			var attributes = DOMHelpers.getDefinedAttributes(obj);
			//jslog.debug('entered')
			for (var i in attributes) {
				//var attr = attributes[i];
				
				if (i.indexOf('data-') == 0) {
					//jslog.debug('adding ' + name)
					var name = i.substring(5);
					//jslog.debug('adding ' + name)
					r[name] = attributes[i];
				}
			}
			
			//jslog.debug('dataset = ' + DebugHelpers.getProperties(r))
			return r;
		}
		
		me.getDatasetItem = function (obj, name) {
			var dataName = 'data-' + name.toLowerCase();
			var r = DOMHelpers.getAttributeValue(obj, dataName);
			
			
			if (!r) {
				r = obj[dataName];
			}
			return r;
		}
		
		me.setDatasetItem = function (obj, name, value) {
			var attrName = 'data-' + name.toLowerCase();
			
			var val = DOMHelpers.setAttributeValue(obj, attrName, value);
			
			if (DOMHelpers.getAttributeValue(obj, attrName) == null) {
				obj[attrName] = value;
				
			}
		}
	}
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/string/capitalize [v1.0]

String.prototype.capitalize = function(){ //v1.0
    return this.charAt(0).toUpperCase() + this.substr(1);
    
};


/*
 *  stringBuffer.js - ideas from
 *  http://www.multitask.com.au/people/dion/archives/000354.html
 */
function StringBuffer(){
    var me = this;
    
    var buffer = [];
    
    
    me.append = function(string){
        buffer.push(string);
        return me;
    }
    
    me.appendBuffer = function(bufferToAppend){
        buffer = buffer.concat(bufferToAppend);
    }
    
    me.toString = function(){
        return buffer.join("");
    }
    
    me.getLength = function(){
        return buffer.length;
    }
    
    me.flush = function(){
        buffer.length = 0;
    }
    
}

/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com> (with modifications)
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
function RGBColor(color_string){

    var me = this;
    
    
    
    me.ok = false;
    
    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1, 6);
    }
    
    color_string = color_string.replace(/ /g, '');
    color_string = color_string.toLowerCase();
    
    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred: 'cd5c5c',
        indigo: '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        metle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors
    
    // array of color definition objects
    var color_defs = [{
        re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
        example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
        process: function(bits){
            return [parseInt(bits[1]), parseInt(bits[2]), parseInt(bits[3])];
        }
    }, {
        re: /^(\w{2})(\w{2})(\w{2})$/,
        example: ['#00ff00', '336699'],
        process: function(bits){
            return [parseInt(bits[1], 16), parseInt(bits[2], 16), parseInt(bits[3], 16)];
        }
    }, {
        re: /^(\w{1})(\w{1})(\w{1})$/,
        example: ['#fb0', 'f0f'],
        process: function(bits){
            return [parseInt(bits[1] + bits[1], 16), parseInt(bits[2] + bits[2], 16), parseInt(bits[3] + bits[3], 16)];
        }
    }, {
        re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0{0,1}\.\d{1,}|0\.{0,}0*|1\.{0,}0*)\)$/,
        example: ['rgba(123, 234, 45, 22)', 'rgba(255, 234,245, 34)'],
        process: function(bits){
            return [parseInt(bits[1]), parseInt(bits[2]), parseInt(bits[3]), parseFloat(bits[4])];
        }
    }, {
        re: /^hsla\((\d{1,3}),\s*(\d{1,3}%),\s*(\d{1,3}%),\s*(0{0,1}\.\d{1,}|0\.{0,}0*|1\.{0,}0*)\)$/,
        example: ['hsla(0,100%,50%,0.2)'],
        process: function(bits){
        	var result = hsl2rgb(parseInt(bits[1]), parseInt(bits[2]), parseInt(bits[3]), parseFloat(bits[4]));
        	
        	return [result.r, result.g, result.b, parseFloat(bits[4])];
            
        }
    }, {
        re: /^hsl\((\d{1,3}),\s*(\d{1,3}%),\s*(\d{1,3}%)\)$/,
        example: ['hsl(0,100%,50%)'],
        process: function(bits){
        	var result = hsl2rgb(parseInt(bits[1]), parseInt(bits[2]), parseInt(bits[3]), 1);
        	
        	return [result.r, result.g, result.b, 1];
            
        }
    }];
    
    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            me.r = channels[0];
            me.g = channels[1];
            me.b = channels[2];
            me.a = channels[3];
            me.ok = true;
        }
        
    }
    
    // validate/cleanup values
    me.r = (me.r < 0 || isNaN(me.r)) ? 0 : ((me.r > 255) ? 255 : me.r);
    me.g = (me.g < 0 || isNaN(me.g)) ? 0 : ((me.g > 255) ? 255 : me.g);
    me.b = (me.b < 0 || isNaN(me.b)) ? 0 : ((me.b > 255) ? 255 : me.b);
    
    
    
    me.a = (isNaN(me.a)) ? 1 : ((me.a > 255) ? 255 : (me.a < 0) ? 0 : me.a);
    
    
    
    // some getters
    me.toRGB = function(){
        return 'rgb(' + me.r + ', ' + me.g + ', ' + me.b + ')';
    }
    
    // some getters
    me.toRGBA = function(){
        return 'rgba(' + me.r + ', ' + me.g + ', ' + me.b + ', ' + me.a + ')';
    }
    
    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and v in the set [0, 1].
     *
     * This routine by Michael Jackson (not *that* one),
     * from http://www.mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSV representation
     */
    me.toHSV = function(){
        var r = me.r / 255, g = me.g / 255, b = me.b / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;
        
        var d = max - min;
        s = max == 0 ? 0 : d / max;
        
        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        
        return {
            h: h,
            s: s,
            v: v
        };
    }
    
    /*
     * hsl2rgb from http://codingforums.com/showthread.php?t=11156 
     * code by Jason Karl Davis (http://www.jasonkarldavis.com)
     */
    function hsl2rgb(h, s, l) {
		var m1, m2, hue;
		var r, g, b
		s /=100;
		l /= 100;
		if (s == 0)
			r = g = b = (l * 255);
		else {
			if (l <= 0.5)
				m2 = l * (s + 1);
			else
				m2 = l + s - l * s;
			m1 = l * 2 - m2;
			hue = h / 360;
			r = HueToRgb(m1, m2, hue + 1/3);
			g = HueToRgb(m1, m2, hue);
			b = HueToRgb(m1, m2, hue - 1/3);
		}
		return {r: Math.round(r), g: Math.round(g), b: Math.round(b)}; 
	}
	
	function HueToRgb(m1, m2, hue) {
		var v;
		if (hue < 0)
			hue += 1;
		else if (hue > 1)
			hue -= 1;
	
		if (6 * hue < 1)
			v = m1 + (m2 - m1) * hue * 6;
		else if (2 * hue < 1)
			v = m2;
		else if (3 * hue < 2)
			v = m1 + (m2 - m1) * (2/3 - hue) * 6;
		else
			v = m1;
	
		return 255 * v;
	}
    
    
    
    me.toHex = function(){
        var r = me.r.toString(16);
        var g = me.g.toString(16);
        var b = me.b.toString(16);
        
        var a = Math.floor((me.a * 255)).toString(16);
        
        if (r.length == 1) 
            r = '0' + r;
        if (g.length == 1) 
            g = '0' + g;
        if (b.length == 1) 
            b = '0' + b;
        
        
        if (a == 'ff') {
            a = '';
        } else if (a.length == 1) {
            a = '0' + a;
        }
        return '#' + a + r + g + b;
    }
    
    
    
}

document.write('<style type="text/css">.cssSandpaper-initiallyHidden { visibility: hidden;} </style>');



EventHelpers.addPageLoadEvent('cssSandpaper.init')


        window.cssSandpaper = cssSandpaper
        window.MatrixGenerator = MatrixGenerator
        /* jshint ignore:end */
    }
    function patchWebPerformance(window) {
/* eslint-env browser,amd,node */
//
// usertiming.js
//
// A polyfill for UserTiming (http://www.w3.org/TR/user-timing/)
//
// Copyright 2013 Nic Jansma
// http://nicj.net
//
// https://github.com/nicjansma/usertiming.js
//
// Licensed under the MIT license
//
(function(window) {
    "use strict";

    // allow running in Node.js environment
    if (typeof window === "undefined") {
        window = {};
    }

    // prepare base perf object
    if (typeof window.performance === "undefined") {
        window.performance = {};
    }

    // We need to keep a global reference to the window.performance object to
    // prevent any added properties from being garbage-collected in Safari 8.
    // https://bugs.webkit.org/show_bug.cgi?id=137407
    window._perfRefForUserTimingPolyfill = window.performance;

    //
    // Note what we shimmed
    //
    window.performance.userTimingJsNow = false;
    window.performance.userTimingJsNowPrefixed = false;
    window.performance.userTimingJsUserTiming = false;
    window.performance.userTimingJsUserTimingPrefixed = false;
    window.performance.userTimingJsPerformanceTimeline = false;
    window.performance.userTimingJsPerformanceTimelinePrefixed = false;

    // for prefixed support
    var prefixes = [];
    var methods = [];
    var methodTest = null;
    var i, j;

    //
    // window.performance.now() shim
    //  http://www.w3.org/TR/hr-time/
    //
    if (typeof window.performance.now !== "function") {
        window.performance.userTimingJsNow = true;

        // copy prefixed version over if it exists
        methods = ["webkitNow", "msNow", "mozNow"];

        for (i = 0; i < methods.length; i++) {
            if (typeof window.performance[methods[i]] === "function") {
                window.performance.now = window.performance[methods[i]];

                window.performance.userTimingJsNowPrefixed = true;

                break;
            }
        }

        //
        // now() should be a DOMHighResTimeStamp, which is defined as being a time relative
        // to navigationStart of the PerformanceTiming (PT) interface.  If this browser supports
        // PT, use that as our relative start.  Otherwise, use "now" as the start and all other
        // now() calls will be relative to our initialization.
        //

        var nowOffset = +(new Date());
        if (window.performance.timing && window.performance.timing.navigationStart) {
            nowOffset = window.performance.timing.navigationStart;
        } else if (typeof process !== "undefined" && typeof process.hrtime === "function") {
            nowOffset = process.hrtime();
            window.performance.now = function() {
                var time = process.hrtime(nowOffset);
                return time[0] * 1e3 + time[1] * 1e-6;
            };
        }

        if (typeof window.performance.now !== "function") {
            // No browser support, fall back to Date.now
            if (Date.now) {
                window.performance.now = function() {
                    return Date.now() - nowOffset;
                };
            } else {
                // no Date.now support, get the time from new Date()
                window.performance.now = function() {
                    return +(new Date()) - nowOffset;
                };
            }
        }
    }

    //
    // PerformanceTimeline (PT) shims
    //  http://www.w3.org/TR/performance-timeline/
    //

    /**
     * Adds an object to our internal Performance Timeline array.
     *
     * Will be blank if the environment supports PT.
     */
    var addToPerformanceTimeline = function() {
        // NOP
    };

    /**
     * Clears the specified entry types from our timeline array.
     *
     * Will be blank if the environment supports PT.
     */
    var clearEntriesFromPerformanceTimeline = function() {
        // NOP
    };

    // performance timeline array
    var performanceTimeline = [];

    // whether or not the timeline will require sort on getEntries()
    var performanceTimelineRequiresSort = false;

    // whether or not ResourceTiming is natively supported but UserTiming is
    // not (eg Firefox 35)
    var hasNativeGetEntriesButNotUserTiming = false;

    //
    // If getEntries() and mark() aren't defined, we'll assume
    // we have to shim at least some PT functions.
    //
    if (typeof window.performance.getEntries !== "function" ||
        typeof window.performance.mark !== "function") {

        if (typeof window.performance.getEntries === "function" &&
            typeof window.performance.mark !== "function") {
            hasNativeGetEntriesButNotUserTiming = true;
        }

        window.performance.userTimingJsPerformanceTimeline = true;

        // copy prefixed version over if it exists
        prefixes = ["webkit", "moz"];
        methods = ["getEntries", "getEntriesByName", "getEntriesByType"];

        for (i = 0; i < methods.length; i++) {
            for (j = 0; j < prefixes.length; j++) {
                // prefixed method will likely have an upper-case first letter
                methodTest = prefixes[j] + methods[i].substr(0, 1).toUpperCase() + methods[i].substr(1);

                if (typeof window.performance[methodTest] === "function") {
                    window.performance[methods[i]] = window.performance[methodTest];

                    window.performance.userTimingJsPerformanceTimelinePrefixed = true;
                }
            }
        }

        /**
         * Adds an object to our internal Performance Timeline array.
         *
         * @param {Object} obj PerformanceEntry
         */
        addToPerformanceTimeline = function(obj) {
            performanceTimeline.push(obj);

            //
            // If we insert a measure, its startTime may be out of order
            // from the rest of the entries because the use can use any
            // mark as the start time.  If so, note we have to sort it before
            // returning getEntries();
            //
            if (obj.entryType === "measure") {
                performanceTimelineRequiresSort = true;
            }
        };

        /**
         * Ensures our PT array is in the correct sorted order (by startTime)
         */
        var ensurePerformanceTimelineOrder = function() {
            if (!performanceTimelineRequiresSort) {
                return;
            }

            //
            // Measures, which may be in this list, may enter the list in
            // an unsorted order. For example:
            //
            //  1. measure("a")
            //  2. mark("start_mark")
            //  3. measure("b", "start_mark")
            //  4. measure("c")
            //  5. getEntries()
            //
            // When calling #5, we should return [a,c,b] because technically the start time
            // of c is "0" (navigationStart), which will occur before b's start time due to the mark.
            //
            performanceTimeline.sort(function(a, b) {
                return a.startTime - b.startTime;
            });

            performanceTimelineRequiresSort = false;
        };

        /**
         * Clears the specified entry types from our timeline array.
         *
         * @param {string} entryType Entry type (eg "mark" or "measure")
         * @param {string} [name] Entry name (optional)
         */
        clearEntriesFromPerformanceTimeline = function(entryType, name) {
            // clear all entries from the perf timeline
            i = 0;
            while (i < performanceTimeline.length) {
                if (performanceTimeline[i].entryType !== entryType) {
                    // unmatched entry type
                    i++;
                    continue;
                }

                if (typeof name !== "undefined" && performanceTimeline[i].name !== name) {
                    // unmatched name
                    i++;
                    continue;
                }

                // this entry matches our criteria, remove just it
                performanceTimeline.splice(i, 1);
            }
        };

        if (typeof window.performance.getEntries !== "function" || hasNativeGetEntriesButNotUserTiming) {
            var origGetEntries = window.performance.getEntries;

            /**
             * Gets all entries from the Performance Timeline.
             * http://www.w3.org/TR/performance-timeline/#dom-performance-getentries
             *
             * NOTE: This will only ever return marks and measures.
             *
             * @returns {PerformanceEntry[]} Array of PerformanceEntrys
             */
            window.performance.getEntries = function() {
                ensurePerformanceTimelineOrder();

                // get a copy of all of our entries
                var entries = performanceTimeline.slice(0);

                // if there was a native version of getEntries, add that
                if (hasNativeGetEntriesButNotUserTiming && origGetEntries) {
                    // merge in native
                    Array.prototype.push.apply(entries, origGetEntries.call(window.performance));

                    // sort by startTime
                    entries.sort(function(a, b) {
                        return a.startTime - b.startTime;
                    });
                }

                return entries;
            };
        }

        if (typeof window.performance.getEntriesByType !== "function" || hasNativeGetEntriesButNotUserTiming) {
            var origGetEntriesByType = window.performance.getEntriesByType;

            /**
             * Gets all entries from the Performance Timeline of the specified type.
             * http://www.w3.org/TR/performance-timeline/#dom-performance-getentriesbytype
             *
             * NOTE: This will only work for marks and measures.
             *
             * @param {string} entryType Entry type (eg "mark" or "measure")
             *
             * @returns {PerformanceEntry[]} Array of PerformanceEntrys
             */
            window.performance.getEntriesByType = function(entryType) {
                // we only support marks/measures
                if (typeof entryType === "undefined" ||
                    (entryType !== "mark" && entryType !== "measure")) {

                    if (hasNativeGetEntriesButNotUserTiming && origGetEntriesByType) {
                        // native version exists, forward
                        return origGetEntriesByType.call(window.performance, entryType);
                    }

                    return [];
                }

                // see note in ensurePerformanceTimelineOrder() on why this is required
                if (entryType === "measure") {
                    ensurePerformanceTimelineOrder();
                }

                // find all entries of entryType
                var entries = [];
                for (i = 0; i < performanceTimeline.length; i++) {
                    if (performanceTimeline[i].entryType === entryType) {
                        entries.push(performanceTimeline[i]);
                    }
                }

                return entries;
            };
        }

        if (typeof window.performance.getEntriesByName !== "function" || hasNativeGetEntriesButNotUserTiming) {
            var origGetEntriesByName = window.performance.getEntriesByName;

            /**
             * Gets all entries from the Performance Timeline of the specified
             * name, and optionally, type.
             * http://www.w3.org/TR/performance-timeline/#dom-performance-getentriesbyname
             *
             * NOTE: This will only work for marks and measures.
             *
             * @param {string} name Entry name
             * @param {string} [entryType] Entry type (eg "mark" or "measure")
             *
             * @returns {PerformanceEntry[]} Array of PerformanceEntrys
             */
            window.performance.getEntriesByName = function(name, entryType) {
                if (entryType && entryType !== "mark" && entryType !== "measure") {
                    if (hasNativeGetEntriesButNotUserTiming && origGetEntriesByName) {
                        // native version exists, forward
                        return origGetEntriesByName.call(window.performance, name, entryType);
                    }

                    return [];
                }

                // see note in ensurePerformanceTimelineOrder() on why this is required
                if (typeof entryType !== "undefined" && entryType === "measure") {
                    ensurePerformanceTimelineOrder();
                }

                // find all entries of the name and (optionally) type
                var entries = [];
                for (i = 0; i < performanceTimeline.length; i++) {
                    if (typeof entryType !== "undefined" &&
                        performanceTimeline[i].entryType !== entryType) {
                        continue;
                    }

                    if (performanceTimeline[i].name === name) {
                        entries.push(performanceTimeline[i]);
                    }
                }

                if (hasNativeGetEntriesButNotUserTiming && origGetEntriesByName) {
                    // merge in native
                    Array.prototype.push.apply(entries, origGetEntriesByName.call(window.performance, name, entryType));

                    // sort by startTime
                    entries.sort(function(a, b) {
                        return a.startTime - b.startTime;
                    });
                }

                return entries;
            };
        }
    }

    //
    // UserTiming support
    //
    if (typeof window.performance.mark !== "function") {
        window.performance.userTimingJsUserTiming = true;

        // copy prefixed version over if it exists
        prefixes = ["webkit", "moz", "ms"];
        methods = ["mark", "measure", "clearMarks", "clearMeasures"];

        for (i = 0; i < methods.length; i++) {
            for (j = 0; j < prefixes.length; j++) {
                // prefixed method will likely have an upper-case first letter
                methodTest = prefixes[j] + methods[i].substr(0, 1).toUpperCase() + methods[i].substr(1);

                if (typeof window.performance[methodTest] === "function") {
                    window.performance[methods[i]] = window.performance[methodTest];

                    window.performance.userTimingJsUserTimingPrefixed = true;
                }
            }
        }

        // only used for measure(), to quickly see the latest timestamp of a mark
        var marks = {};

        if (typeof window.performance.mark !== "function") {
            /**
             * UserTiming mark
             * http://www.w3.org/TR/user-timing/#dom-performance-mark
             *
             * @param {string} markName Mark name
             */
            window.performance.mark = function(markName) {
                var now = window.performance.now();

                // mark name is required
                if (typeof markName === "undefined") {
                    throw new SyntaxError("Mark name must be specified");
                }

                // mark name can't be a NT timestamp
                if (window.performance.timing && markName in window.performance.timing) {
                    throw new SyntaxError("Mark name is not allowed");
                }

                if (!marks[markName]) {
                    marks[markName] = [];
                }

                marks[markName].push(now);

                // add to perf timeline as well
                addToPerformanceTimeline({
                    entryType: "mark",
                    name: markName,
                    startTime: now,
                    duration: 0
                });
            };
        }

        if (typeof window.performance.clearMarks !== "function") {
            /**
             * UserTiming clear marks
             * http://www.w3.org/TR/user-timing/#dom-performance-clearmarks
             *
             * @param {string} markName Mark name
             */
            window.performance.clearMarks = function(markName) {
                if (!markName) {
                    // clear all marks
                    marks = {};
                } else {
                    marks[markName] = [];
                }

                clearEntriesFromPerformanceTimeline("mark", markName);
            };
        }

        if (typeof window.performance.measure !== "function") {
            /**
             * UserTiming measure
             * http://www.w3.org/TR/user-timing/#dom-performance-measure
             *
             * @param {string} measureName Measure name
             * @param {string} [startMark] Start mark name
             * @param {string} [endMark] End mark name
             */
            window.performance.measure = function(measureName, startMark, endMark) {
                var now = window.performance.now();

                if (typeof measureName === "undefined") {
                    throw new SyntaxError("Measure must be specified");
                }

                // if there isn't a startMark, we measure from navigationStart to now
                if (!startMark) {
                    // add to perf timeline as well
                    addToPerformanceTimeline({
                        entryType: "measure",
                        name: measureName,
                        startTime: 0,
                        duration: now
                    });

                    return;
                }

                //
                // If there is a startMark, check for it first in the NavigationTiming interface,
                // then check our own marks.
                //
                var startMarkTime = 0;
                if (window.performance.timing && startMark in window.performance.timing) {
                    // mark cannot have a timing of 0
                    if (startMark !== "navigationStart" && window.performance.timing[startMark] === 0) {
                        throw new Error(startMark + " has a timing of 0");
                    }

                    // time is the offset of this mark to navigationStart's time
                    startMarkTime = window.performance.timing[startMark] - window.performance.timing.navigationStart;
                } else if (startMark in marks) {
                    startMarkTime = marks[startMark][marks[startMark].length - 1];
                } else {
                    throw new Error(startMark + " mark not found");
                }

                //
                // If there is a endMark, check for it first in the NavigationTiming interface,
                // then check our own marks.
                //
                var endMarkTime = now;

                if (endMark) {
                    endMarkTime = 0;

                    if (window.performance.timing && endMark in window.performance.timing) {
                        // mark cannot have a timing of 0
                        if (endMark !== "navigationStart" && window.performance.timing[endMark] === 0) {
                            throw new Error(endMark + " has a timing of 0");
                        }

                        // time is the offset of this mark to navigationStart's time
                        endMarkTime = window.performance.timing[endMark] - window.performance.timing.navigationStart;
                    } else if (endMark in marks) {
                        endMarkTime = marks[endMark][marks[endMark].length - 1];
                    } else {
                        throw new Error(endMark + " mark not found");
                    }
                }

                // add to our measure array
                var duration = endMarkTime - startMarkTime;

                // add to perf timeline as well
                addToPerformanceTimeline({
                    entryType: "measure",
                    name: measureName,
                    startTime: startMarkTime,
                    duration: duration
                });
            };
        }

        if (typeof window.performance.clearMeasures !== "function") {
            /**
             * UserTiming clear measures
             * http://www.w3.org/TR/user-timing/#dom-performance-clearmeasures
             *
             * @param {string} measureName Measure name
             */
            window.performance.clearMeasures = function(measureName) {
                clearEntriesFromPerformanceTimeline("measure", measureName);
            };
        }
    }

    //
    // Export UserTiming to the appropriate location.
    //
    // When included directly via a script tag in the browser, we're good as we've been
    // updating the window.performance object.
    //
    if (typeof define === "function" && define.amd) {
        //
        // AMD / RequireJS
        //
        define([], function() {
            return window.performance;
        });
    } else if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        //
        // Node.js
        //
        module.exports = window.performance;
    }
}(typeof window !== "undefined" ? window : undefined));

    }
    function patchPlaceholder() {
/*!
 * The MIT License
 *
 * Copyright (c) 2012 James Allardice
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

( function ( global ) {

  'use strict';

  //
  // Test for support. We do this as early as possible to optimise for browsers
  // that have native support for the attribute.
  //

  var test = document.createElement('input');
  var nativeSupport = test.placeholder !== void 0;

  global.Placeholders = {
    nativeSupport: nativeSupport,
    disable: nativeSupport ? noop : disablePlaceholders,
    enable: nativeSupport ? noop : enablePlaceholders
  };

  if ( nativeSupport ) {
    return;
  }

  //
  // If we reach this point then the browser does not have native support for
  // the attribute.
  //

  // The list of input element types that support the placeholder attribute.
  var validTypes = [
    'text',
    'search',
    'url',
    'tel',
    'email',
    'password',
    'number',
    'textarea'
  ];

  // The list of keycodes that are not allowed when the polyfill is configured
  // to hide-on-input.
  var badKeys = [

    // The following keys all cause the caret to jump to the end of the input
    // value.

    27, // Escape
    33, // Page up
    34, // Page down
    35, // End
    36, // Home

    // Arrow keys allow you to move the caret manually, which should be
    // prevented when the placeholder is visible.

    37, // Left
    38, // Up
    39, // Right
    40, // Down

    // The following keys allow you to modify the placeholder text by removing
    // characters, which should be prevented when the placeholder is visible.

    8, // Backspace
    46 // Delete
  ];

  // Styling variables.
  var placeholderStyleColor = '#ccc';
  var placeholderClassName = 'placeholdersjs';
  var classNameRegExp = new RegExp('(?:^|\\s)' + placeholderClassName + '(?!\\S)');

  // The various data-* attributes used by the polyfill.
  var ATTR_CURRENT_VAL = 'data-placeholder-value';
  var ATTR_ACTIVE = 'data-placeholder-active';
  var ATTR_INPUT_TYPE = 'data-placeholder-type';
  var ATTR_FORM_HANDLED = 'data-placeholder-submit';
  var ATTR_EVENTS_BOUND = 'data-placeholder-bound';
  var ATTR_OPTION_FOCUS = 'data-placeholder-focus';
  var ATTR_OPTION_LIVE = 'data-placeholder-live';
  var ATTR_MAXLENGTH = 'data-placeholder-maxlength';

  // Various other variables used throughout the rest of the script.
  var UPDATE_INTERVAL = 100;
  var head = document.getElementsByTagName('head')[ 0 ];
  var root = document.documentElement;
  var Placeholders = global.Placeholders;
  var keydownVal;

  // Get references to all the input and textarea elements currently in the DOM
  // (live NodeList objects to we only need to do this once).
  var inputs = document.getElementsByTagName('input');
  var textareas = document.getElementsByTagName('textarea');

  // Get any settings declared as data-* attributes on the root element.
  // Currently the only options are whether to hide the placeholder on focus
  // or input and whether to auto-update.
  var hideOnInput = root.getAttribute(ATTR_OPTION_FOCUS) === 'false';
  var liveUpdates = root.getAttribute(ATTR_OPTION_LIVE) !== 'false';

  // Create style element for placeholder styles (instead of directly setting
  // style properties on elements - allows for better flexibility alongside
  // user-defined styles).
  var styleElem = document.createElement('style');
  styleElem.type = 'text/css';

  // Create style rules as text node.
  var styleRules = document.createTextNode(
    '.' + placeholderClassName + ' {' +
      'color:' + placeholderStyleColor + ';' +
    '}'
  );

  // Append style rules to newly created stylesheet.
  if ( styleElem.styleSheet ) {
    styleElem.styleSheet.cssText = styleRules.nodeValue;
  } else {
    styleElem.appendChild(styleRules);
  }

  // Prepend new style element to the head (before any existing stylesheets,
  // so user-defined rules take precedence).
  head.insertBefore(styleElem, head.firstChild);

  // Set up the placeholders.
  var placeholder;
  var elem;

  for ( var i = 0, len = inputs.length + textareas.length; i < len; i++ ) {

    // Find the next element. If we've already done all the inputs we move on
    // to the textareas.
    elem = i < inputs.length ? inputs[ i ] : textareas[ i - inputs.length ];

    // Get the value of the placeholder attribute, if any. IE10 emulating IE7
    // fails with getAttribute, hence the use of the attributes node.
    placeholder = elem.attributes.placeholder;

    // If the element has a placeholder attribute we need to modify it.
    if ( placeholder ) {

      // IE returns an empty object instead of undefined if the attribute is
      // not present.
      placeholder = placeholder.nodeValue;

      // Only apply the polyfill if this element is of a type that supports
      // placeholders and has a placeholder attribute with a non-empty value.
      if ( placeholder && inArray(validTypes, elem.type) ) {
        newElement(elem);
      }
    }
  }

  // If enabled, the polyfill will repeatedly check for changed/added elements
  // and apply to those as well.
  var timer = setInterval(function () {
    for ( var i = 0, len = inputs.length + textareas.length; i < len; i++ ) {
      elem = i < inputs.length ? inputs[ i ] : textareas[ i - inputs.length ];

      // Only apply the polyfill if this element is of a type that supports
      // placeholders, and has a placeholder attribute with a non-empty value.
      placeholder = elem.attributes.placeholder;

      if ( placeholder ) {

        placeholder = placeholder.nodeValue;

        if ( placeholder && inArray(validTypes, elem.type) ) {

          // If the element hasn't had event handlers bound to it then add
          // them.
          if ( !elem.getAttribute(ATTR_EVENTS_BOUND) ) {
            newElement(elem);
          }

          // If the placeholder value has changed or not been initialised yet
          // we need to update the display.
          if (
            placeholder !== elem.getAttribute(ATTR_CURRENT_VAL) ||
            ( elem.type === 'password' && !elem.getAttribute(ATTR_INPUT_TYPE) )
          ) {

            // Attempt to change the type of password inputs (fails in IE < 9).
            if (
              elem.type === 'password' &&
              !elem.getAttribute(ATTR_INPUT_TYPE) &&
              changeType(elem, 'text')
            ) {
              elem.setAttribute(ATTR_INPUT_TYPE, 'password');
            }

            // If the placeholder value has changed and the placeholder is
            // currently on display we need to change it.
            if ( elem.value === elem.getAttribute(ATTR_CURRENT_VAL) ) {
              elem.value = placeholder;
            }

            // Keep a reference to the current placeholder value in case it
            // changes via another script.
            elem.setAttribute(ATTR_CURRENT_VAL, placeholder);
          }
        }
      } else if ( elem.getAttribute(ATTR_ACTIVE) ) {
        hidePlaceholder(elem);
        elem.removeAttribute(ATTR_CURRENT_VAL);
      }
    }

    // If live updates are not enabled cancel the timer.
    if ( !liveUpdates ) {
      clearInterval(timer);
    }
  }, UPDATE_INTERVAL);

  // Disabling placeholders before unloading the page prevents flash of
  // unstyled placeholders on load if the page was refreshed.
  addEventListener(global, 'beforeunload', function () {
    Placeholders.disable();
  });

  //
  // Utility functions
  //

  // No-op (used in place of public methods when native support is detected).
  function noop() {}

  // Avoid IE9 activeElement of death when an iframe is used.
  //
  // More info:
  //  - http://bugs.jquery.com/ticket/13393
  //  - https://github.com/jquery/jquery/commit/85fc5878b3c6af73f42d61eedf73013e7faae408
  function safeActiveElement() {
    try {
      return document.activeElement;
    } catch ( err ) {}
  }

  // Check whether an item is in an array. We don't use Array.prototype.indexOf
  // so we don't clobber any existing polyfills. This is a really simple
  // alternative.
  function inArray( arr, item ) {
    for ( var i = 0, len = arr.length; i < len; i++ ) {
      if ( arr[ i ] === item ) {
        return true;
      }
    }
    return false;
  }

  // Cross-browser DOM event binding
  function addEventListener( elem, event, fn ) {
    if ( elem.addEventListener ) {
      return elem.addEventListener(event, fn, false);
    }
    if ( elem.attachEvent ) {
      return elem.attachEvent('on' + event, fn);
    }
  }

  // Move the caret to the index position specified. Assumes that the element
  // has focus.
  function moveCaret( elem, index ) {
    var range;
    if ( elem.createTextRange ) {
      range = elem.createTextRange();
      range.move('character', index);
      range.select();
    } else if ( elem.selectionStart ) {
      elem.focus();
      elem.setSelectionRange(index, index);
    }
  }

  // Attempt to change the type property of an input element.
  function changeType( elem, type ) {
    try {
      elem.type = type;
      return true;
    } catch ( e ) {
      // You can't change input type in IE8 and below.
      return false;
    }
  }

  function handleElem( node, callback ) {

    // Check if the passed in node is an input/textarea (in which case it can't
    // have any affected descendants).
    if ( node && node.getAttribute(ATTR_CURRENT_VAL) ) {
      callback(node);
    } else {

      // If an element was passed in, get all affected descendants. Otherwise,
      // get all affected elements in document.
      var handleInputs = node ? node.getElementsByTagName('input') : inputs;
      var handleTextareas = node ? node.getElementsByTagName('textarea') : textareas;

      var handleInputsLength = handleInputs ? handleInputs.length : 0;
      var handleTextareasLength = handleTextareas ? handleTextareas.length : 0;

      // Run the callback for each element.
      var len = handleInputsLength + handleTextareasLength;
      var elem;
      for ( var i = 0; i < len; i++ ) {

        elem = i < handleInputsLength ?
          handleInputs[ i ] :
          handleTextareas[ i - handleInputsLength ];

        callback(elem);
      }
    }
  }

  // Return all affected elements to their normal state (remove placeholder
  // value if present).
  function disablePlaceholders( node ) {
    handleElem(node, hidePlaceholder);
  }

  // Show the placeholder value on all appropriate elements.
  function enablePlaceholders( node ) {
    handleElem(node, showPlaceholder);
  }

  // Hide the placeholder value on a single element. Returns true if the
  // placeholder was hidden and false if it was not (because it wasn't visible
  // in the first place).
  function hidePlaceholder( elem, keydownValue ) {

    var valueChanged = !!keydownValue && elem.value !== keydownValue;
    var isPlaceholderValue = elem.value === elem.getAttribute(ATTR_CURRENT_VAL);

    if (
      ( valueChanged || isPlaceholderValue ) &&
      elem.getAttribute(ATTR_ACTIVE) === 'true'
    ) {

      elem.removeAttribute(ATTR_ACTIVE);
      elem.value = elem.value.replace(elem.getAttribute(ATTR_CURRENT_VAL), '');
      elem.className = elem.className.replace(classNameRegExp, '');

      // Restore the maxlength value. Old FF returns -1 if attribute not set.
      // See GH-56.
      var maxLength = elem.getAttribute(ATTR_MAXLENGTH);
      if ( parseInt(maxLength, 10) >= 0 ) {
        elem.setAttribute('maxLength', maxLength);
        elem.removeAttribute(ATTR_MAXLENGTH);
      }

      // If the polyfill has changed the type of the element we need to change
      // it back.
      var type = elem.getAttribute(ATTR_INPUT_TYPE);
      if ( type ) {
        elem.type = type;
      }

      return true;
    }

    return false;
  }

  // Show the placeholder value on a single element. Returns true if the
  // placeholder was shown and false if it was not (because it was already
  // visible).
  function showPlaceholder( elem ) {

    var val = elem.getAttribute(ATTR_CURRENT_VAL);

    if ( elem.value === '' && val ) {

      elem.setAttribute(ATTR_ACTIVE, 'true');
      elem.value = val;
      elem.className += ' ' + placeholderClassName;

      // Store and remove the maxlength value.
      var maxLength = elem.getAttribute(ATTR_MAXLENGTH);
      if ( !maxLength ) {
        elem.setAttribute(ATTR_MAXLENGTH, elem.maxLength);
        elem.removeAttribute('maxLength');
      }

      // If the type of element needs to change, change it (e.g. password
      // inputs).
      var type = elem.getAttribute(ATTR_INPUT_TYPE);
      if ( type ) {
        elem.type = 'text';
      } else if ( elem.type === 'password' && changeType(elem, 'text') ) {
        elem.setAttribute(ATTR_INPUT_TYPE, 'password');
      }

      return true;
    }

    return false;
  }

  // Returns a function that is used as a focus event handler.
  function makeFocusHandler( elem ) {
    return function () {

      // Only hide the placeholder value if the (default) hide-on-focus
      // behaviour is enabled.
      if (
        hideOnInput &&
        elem.value === elem.getAttribute(ATTR_CURRENT_VAL) &&
        elem.getAttribute(ATTR_ACTIVE) === 'true'
      ) {

        // Move the caret to the start of the input (this mimics the behaviour
        // of all browsers that do not hide the placeholder on focus).
        moveCaret(elem, 0);
      } else {

        // Remove the placeholder.
        hidePlaceholder(elem);
      }
    };
  }

  // Returns a function that is used as a blur event handler.
  function makeBlurHandler( elem ) {
    return function () {
      showPlaceholder(elem);
    };
  }

  // Returns a function that is used as a submit event handler on form elements
  // that have children affected by this polyfill.
  function makeSubmitHandler( form ) {
    return function () {

        // Turn off placeholders on all appropriate descendant elements.
        disablePlaceholders(form);
    };
  }

  // Functions that are used as a event handlers when the hide-on-input
  // behaviour has been activated - very basic implementation of the 'input'
  // event.
  function makeKeydownHandler( elem ) {
    return function ( e ) {
      keydownVal = elem.value;

      // Prevent the use of the arrow keys (try to keep the cursor before the
      // placeholder).
      if (
        elem.getAttribute(ATTR_ACTIVE) === 'true' &&
        keydownVal === elem.getAttribute(ATTR_CURRENT_VAL) &&
        inArray(badKeys, e.keyCode)
      ) {
        if ( e.preventDefault ) {
            e.preventDefault();
        }
        return false;
      }
    };
  }

  function makeKeyupHandler(elem) {
    return function () {
      hidePlaceholder(elem, keydownVal);

      // If the element is now empty we need to show the placeholder
      if ( elem.value === '' ) {
        elem.blur();
        moveCaret(elem, 0);
      }
    };
  }

  function makeClickHandler(elem) {
    return function () {
      if (
        elem === safeActiveElement() &&
        elem.value === elem.getAttribute(ATTR_CURRENT_VAL) &&
        elem.getAttribute(ATTR_ACTIVE) === 'true'
      ) {
        moveCaret(elem, 0);
      }
    };
  }

  // Bind event handlers to an element that we need to affect with the
  // polyfill.
  function newElement( elem ) {

    // If the element is part of a form, make sure the placeholder string is
    // not submitted as a value.
    var form = elem.form;
    if ( form && typeof form === 'string' ) {

      // Get the real form.
      form = document.getElementById(form);

      // Set a flag on the form so we know it's been handled (forms can contain
      // multiple inputs).
      if ( !form.getAttribute(ATTR_FORM_HANDLED) ) {
        addEventListener(form, 'submit', makeSubmitHandler(form));
        form.setAttribute(ATTR_FORM_HANDLED, 'true');
      }
    }

    // Bind event handlers to the element so we can hide/show the placeholder
    // as appropriate.
    addEventListener(elem, 'focus', makeFocusHandler(elem));
    addEventListener(elem, 'blur', makeBlurHandler(elem));

    // If the placeholder should hide on input rather than on focus we need
    // additional event handlers
    if (hideOnInput) {
      addEventListener(elem, 'keydown', makeKeydownHandler(elem));
      addEventListener(elem, 'keyup', makeKeyupHandler(elem));
      addEventListener(elem, 'click', makeClickHandler(elem));
    }

    // Remember that we've bound event handlers to this element.
    elem.setAttribute(ATTR_EVENTS_BOUND, 'true');
    elem.setAttribute(ATTR_CURRENT_VAL, placeholder);

    // If the element doesn't have a value and is not focussed, set it to the
    // placeholder string.
    if ( hideOnInput || elem !== safeActiveElement() ) {
      showPlaceholder(elem);
    }
  }

}(this) );

    }
    if(window.browser){
        var patches =  {
            'patchWebSockets':patchWebSockets,
            'patchHistory':patchHistory,
            'patchWebPerformance':patchWebPerformance,
            'patchTransform':patchTransform,
            'patchPlaceholder':patchPlaceholder,
            'patchConsole':patchConsole}
        if(window.browser.version === 9){
           patches.patchCSS3 = patchCSS3
        }
        window.browser.addPatches(patches)
    }
})(this)