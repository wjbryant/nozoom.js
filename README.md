# nozoom.js

Disables zooming in browsers that do not support the viewport meta tag.

## nozoom.useFullscreen

Set this to `true` to use properties based on the full screen size to calculate
the zoom factor. The default value is `false`.

## nozoom.getZoomFactor(useFullscreen)

Returns the current zoom factor. Pass a boolean value to override
`nozoom.useFullscreen`.

## nozoom.adjustCoords(x, y, useFullscreen)

Returns an object with `x` and `y` properties that contain the adjusted x and y
values for the current zoom factor. The third argument can be used to override
`nozoom.useFullscreen`.

## nozoom.init(opts)

Initialize nozoom with the following options:

- useFullscreen
  `boolean` - Sets `nozoom.useFullscreen`.

- disableTextSelection
  `boolean` - Whether to disable text selection and only allow scrollbars to
  scroll. This disables touch gestures in some browsers. The default value is
  `false`.

- extendMouseEvent
  `boolean` - Whether to extend mouse event objects to include additional
  coordinate properties that account for the zoom level. Ex: `clientXZoom`. The
  default value is `false`.

- interceptEvents
  `boolean` - Whether to intercept all mouse events and adjust coordinate
  values for the zoom factor. The default value is `true`.
