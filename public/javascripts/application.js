/* 
	Create main UI
*/

var mainUI = uki(
{
	view: 'HSplitPane'
	, rect: '1000 600'
	, anchors: 'left top right bottom'
	, handlePosition: 300
	, leftMin: 300
	, rightMin: 500
	, leftChildViews: [
			{ view: 'VSplitPane'
				, rect: '300 600'
				, anchors: 'left top right bottom'
				, vertical: true
				, handlePosition: 400
				, topMin: 400
				, bottomMin: 100
				, topChildViews: [
					{ view: 'ScrollPane'
						, rect: '300 400'
						, anchors: 'top left right bottom'
						, id: 'ListViewPane'
					}
				]
			}
		]
	,	rightChildViews: {  }
}).attachTo( $("#application").get(0), '1000 600' );

$("#ListViewPane").ListView();
