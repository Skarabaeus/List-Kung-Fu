/*
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
				, topChildViews: {  }
				, bottomChildViews: {  }
			}
		]
	,	rightChildViews: {  }
}).attachTo( $("#application").get(0), '1000 600' );
*/

