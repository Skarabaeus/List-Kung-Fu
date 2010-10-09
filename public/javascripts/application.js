/* 
	Create main UI
*/

uki(
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
						, childViews: { view: 'Box'
							, rect: '0 0 300 400'
							, anchors: 'top left right'
							, background: '#CCC'
							, id: 'ListViewBox'
							, childViews: { view: 'List'
								, rect: '0 0 300 400'
								, anchors: 'top left right'
								, rowHeight: 30
								, id: 'ListViewList'
								, throttle: 0
								, multiselect: true
								, textSelectable: true 
							}
						}
					}
				]
			}
		]
	,	rightChildViews: {  }
}).attachTo( $("#application").get(0), '1000 600' );



$("#ListViewPane").ListView();
