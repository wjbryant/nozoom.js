/*! nozoom.js v0.1.1 | https://github.com/wjbryant/nozoom.js
(c) 2014 Bill Bryant | http://opensource.org/licenses/mit */

/*jslint browser: true, devel: true */
/*global MouseEvent */

// the "nozoom" "namespace"
var nozoom = window.nozoom || (function (window, document) {
    'use strict';

    var documentElement = document.documentElement,
        documentElementStyle = documentElement.style,
        textSelectionDisabled = false,
        mouseEventExtended = false,
        interceptingEvents = false,
        pStyle = document.createElement('p').style,
        zoomSupported = (typeof pStyle.zoom === 'string'),
        zoomResetSupported = false,
        initialized = false;

    function getZoomFactor(useFullscreen) {
        if (!arguments.length) {
            useFullscreen = nozoom.useFullscreen;
        }

        // fullscreen is the most reliable method of calculating zoom, since
        // these properties do not account for the scrollbar and are not
        // affected by CSS
        return useFullscreen ?
                window.screen.availWidth / window.innerWidth :
                documentElement.offsetWidth / documentElement.clientWidth;
    }

    function adjustCoords(x, y, useFullscreen) {
        var zoomFactor = getZoomFactor(useFullscreen);

        return {
            x: x * zoomFactor,
            y: y * zoomFactor
        };
    }

    function disableTextSelection() {
        if (textSelectionDisabled) {
            return;
        }

        // do not allow text selection (only allow scrollbars to scroll)
        // this disables touch gestures in some browsers
        documentElement.addEventListener('selectstart', function (e) {
            e.preventDefault();
        }, false);

        textSelectionDisabled = true;
    }

    function extendMouseEvent() {
        if (mouseEventExtended) {
            return;
        }

        // extend MouseEvent to include additional coordinate properties
        // that account for the zoom level
        [
            'screenX', 'screenY', 'clientX', 'clientY', 'pageX', 'pageY'
        ].forEach(function (prop) {
            Object.defineProperty(MouseEvent.prototype, prop + 'Zoom', {
                get: function () {
                    return this[prop] * getZoomFactor();
                }
            });
        });

        mouseEventExtended = true;
    }

    function interceptEvents() {
        if (interceptingEvents) {
            return;
        }

        // intercept all mouse events and adjust coordinate values for zoom
        [
            'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter',
            'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup',
            'show'
        ].forEach(function (type) {
            window.addEventListener(type, function (e) {
                var zoomFactor,
                    me;

                // only intercept native events
                if (e.synthetic) {
                    return;
                }

                zoomFactor = getZoomFactor();

                // only dispatch a new event when the page is zoomed
                if (zoomFactor === 1) {
                    return;
                }

                // use the old method of creating events to support older
                // browsers
                me = document.createEvent('MouseEvents');

                // create a new event with all the same property values,
                // but multiply the coordinate properties by the zoom factor
                me.initMouseEvent(e.type, true, true, window, e.detail,
                    e.screenX * zoomFactor, e.screenY * zoomFactor,
                    e.clientX * zoomFactor, e.clientY * zoomFactor,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button,
                    e.relatedTarget);

                // mark this event as synthetic so it can be filtered later
                me.synthetic = true;

                e.target.dispatchEvent(me);

                // allow the default action or scrolling will be disabled
                // do not allow other event listeners to be executed
                e.stopImmediatePropagation();
            }, true);
        });

        interceptingEvents = true;
    }

    function setUp() {
        // always display the full page even if zoom is applied
        if (!initialized && zoomSupported) {
            if (zoomResetSupported) {
                documentElementStyle.zoom = 'reset';
            } else {
                // zoom reset is not supported, listen for the window resize
                // event - documentElement.offsetWidth and clientWidth will
                // always be the same before resetting the CSS zoom - need to
                // base calculations on fullscreen instead
                console.warn('nozoom.js :: falling back to fullscreen ' +
                    'calculations for resizing');

                window.addEventListener('resize', function () {
                    // apply the inverse zoom whenever the screen size is
                    // changed
                    documentElementStyle.zoom = 1 / getZoomFactor(true);
                }, false);
            }

            // some zoom factor calculations depend on the html element width
            // being 100% - explicitly setting it shouldn't hurt, since the
            // width of this element is not normally changed
            documentElementStyle.cssText += 'width: 100% !important;';

            initialized = true;
        }
    }

    function init(opts) {
        if (typeof opts !== 'object') {
            opts = {};
        }

        if (opts.hasOwnProperty('useFullscreen')) {
            nozoom.useFullscreen = opts.useFullscreen;
        }

        // set up CSS zoom to counteract/prevent zooming
        setUp();

        if (opts.disableTextSelection) {
            disableTextSelection();
        }

        if (opts.extendMouseEvent) {
            extendMouseEvent();
        }

        if (zoomSupported && (!opts.hasOwnProperty('interceptEvents') ||
            opts.interceptEvents)) {

            interceptEvents();
        }
    }

    if (zoomSupported) {
        // test for zoom reset support
        pStyle.cssText = 'zoom: reset;';
        zoomResetSupported = (pStyle.zoom !== '');
    } else {
        console.warn('nozoom.js :: CSS zoom is not supported. The ' +
            'interceptEvents option is disabled.');
    }

    // no longer need pStyle for testing
    pStyle = null;

    // the nozoom namespace object
    return {
        support: {
            cssZoom: zoomSupported,
            cssZoomReset: zoomResetSupported
        },
        useFullscreen: false,
        getZoomFactor: getZoomFactor,
        adjustCoords: adjustCoords,
        init: init
    };
}(window, document));
