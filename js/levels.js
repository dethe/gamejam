var current_level;

var levels = [
	{
		shapes: [
			['rpolygon', -150, -150, 25, 20],
			['rpolygon', -150, -75, 25, 4],
			['asterisk', -150, 0, 25, 5],
			['asterisk', -150, 75, 25, 6],
			['asterisk', -150, 150, 25, 8],

			['rpolygon', -75, -150, 25, 3],
			['rpolygon', -75, -75, 25, 4],
			['rpolygon', -75, 0, 25, 5],
			['rpolygon', -75, 75, 25, 6],
			['star', -75, 150, 25, 5],

			['star', 0, -150, 25, 7],
			['spiral', 0, -75, 25, 500, 3],
			['spiral', 0, 0, 25, 20, .75],
            ['coffin', 0, 75, 25],

			['line', 75, -150, 27, 27],
			['line', 75, -75, 27, 0],
			['line', 75, 0, 27, -27],
			['line', 75, 75, 0, 27],

		]
	},
	{
		shapes: [
			['asterisk', -75, 0, 25, 8],
			['line', -25, 0, 100, 0]
		]
	},
]
