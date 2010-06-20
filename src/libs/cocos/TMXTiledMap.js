var sys = require('sys'),
	Node = require('./Node').Node,
	TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
	TMXOrientationHex   = require('./TMXOrientation').TMXOrientationHex,
	TMXOrientationIso   = require('./TMXOrientation').TMXOrientationIso,
	TMXLayer   = require('./TMXLayer').TMXLayer,
	TMXMapInfo = require('./TMXXMLParser').TMXMapInfo;

var TMXTiledMap = Node.extend({
	mapSize: null,
	tileSize: null,
	mapOrientation: 0,
	objectGroups: null,
	properties: null,
	tileProperties: null,

	init: function(tmxFile) {
		@super;

		var mapInfo = TMXMapInfo.create(tmxFile);

		this.mapSize        = mapInfo.get('mapSize');
		this.tileSize       = mapInfo.get('tileSize');
		this.mapOrientation = mapInfo.get('orientation');
		this.objectGroups   = mapInfo.get('objectGroups');
		this.properties     = mapInfo.get('properties');
		this.tileProperties = mapInfo.get('tileProperties');

		// Add layers to map
		var idx = 0;
		sys.each(mapInfo.layers, sys.callback(this, function(layerInfo) {
			if (layerInfo.get('visible')) {
				var child = this.parseLayer({layerInfo: layerInfo, mapInfo: mapInfo});
				this.addChild({child:child, z:idx, tag:idx});

				var childSize   = child.get('contentSize');
				var currentSize = this.get('contentSize');
				currentSize.width  = Math.max(currentSize.width,  childSize.width);
				currentSize.height = Math.max(currentSize.height, childSize.height);
				this.set('contentSize', currentSize);

				idx++;
			}
		}));
	},
	
	parseLayer: function(opts) {
		var tileset = this.tilesetForLayer(opts);
		var layer = TMXLayer.create({tileset: tileset, layerInfo: opts['layerInfo'], mapInfo: opts['mapInfo']});

		layer.setupTiles();

		return layer;
	},

	tilesetForLayer: function(opts) {
		var layerInfo = opts['layerInfo'],
			mapInfo = opts['mapInfo'],
			size = layerInfo.get('layerSize');

		// Reverse loop
		for (var i = mapInfo.tilesets.length -1; i >= 0; i--) {
			var tileset = mapInfo.tilesets[i];

			for (var y=0; y < size.height; y++ ) {
				for (var x=0; x < size.width; x++ ) {
					var pos = x + size.width * y, 
						gid = layerInfo.tiles[pos];

					if (gid != 0 && gid >= tileset.firstGID) {
						return tileset;
					}
				} // for (var x
			} // for (var y
		} // for (var i

		console.warn("cocos2d: Warning: TMX Layer '%s' has no tiles", layerInfo.name)
		return tileset;
	}
});

exports.TMXTiledMap = TMXTiledMap;
