/*! nozoom.js v0.0.5 | (c) 2014 Bill Bryant | http://opensource.org/licenses/mit */

/*jslint browser: true, white: true */
/*global MouseEvent */

// the "nozoom" "namespace"
var nozoom = window.nozoom || (function (window, document) {
    'use strict';

    var documentElement = document.documentElement,
        textSelectionDisabled = false,
        mouseEventExtended = false,
        interceptingEvents = false;

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
        if (!textSelectionDisabled) {
            // do not allow text selection (only allow scrollbars to scroll)
            // this disables touch gestures in some browsers
            documentElement.addEventListener('selectstart', function (e) {
                e.preventDefault();
            }, false);

            textSelectionDisabled = true;
        }
    }

    function extendMouseEvent() {
        if (!mouseEventExtended) {
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
    }

    function interceptEvents() {
        if (!interceptingEvents) {
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
    }

    function init(opts) {
        if (typeof opts !== 'object') {
            opts = {};
        }

        if (opts.hasOwnProperty('useFullscreen')) {
            nozoom.useFullscreen = opts.useFullscreen;
        }

        if (opts.disableTextSelection) {
            disableTextSelection();
        }

        if (opts.extendMouseEvent) {
            extendMouseEvent();
        }

        if (!opts.hasOwnProperty('interceptEvents') || opts.interceptEvents) {
            interceptEvents();
        }
    }

    // always display the full page even if zoom is applied
    documentElement.style.zoom = 'reset';

    // some zoom factor calculations depend on the html element width being
    // 100% - explicitly setting it shouldn't hurt, since the width of this
    // element is not normally changed
    documentElement.style.cssText += 'width: 100% !important;';

    // the nozoom namespace object
    return {
        useFullscreen: false,
        getZoomFactor: getZoomFactor,
        adjustCoords: adjustCoords,
        init: init
    };
}(window, document));
