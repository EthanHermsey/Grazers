
//background
let backgroundBubbles;

//create creatures
let creatures = [];
let creature_color_pallet = [

	[ 52, 9, 28 ],
	[ 32, 46, 15 ],
	[ 7, 43, 57 ],
	[ 6, 18, 9 ],
	[ 9, 18, 47 ],
	[ 42, 51, 7 ],
	[ 6, 58, 12 ]

];
let colorPallet = Math.floor( Math.random() * creature_color_pallet.length );

//plants
let plant_distance = 8;
let num_plants = 0;
let plants = [];

//time
let time = 0;





function setup() {

	//p5 stuff
	createCanvas( windowWidth, windowHeight );
	noFill();
	colorMode( HSB, 100 );


	if ( width > height * 1.2 ) {

		//wide screen, multiple creatures

		creatures.push( new Creature(
			width * 0.30,
			height * random( 0.25, 0.48 ),
			height * random( 0.08, 0.1 ),
			- 1,
			creature_color_pallet[ colorPallet ][ 0 ]
		) );

		creatures.push( new Creature(
			width * 0.55,
			height * random( 0.25, 0.48 ),
			height * random( 0.08, 0.1 ),
			1,
			creature_color_pallet[ colorPallet ][ 1 ]
		) );

		creatures.push( new Creature(
			width * 0.80,
			height * random( 0.25, 0.48 ),
			height * random( 0.08, 0.1 ),
			1,
			creature_color_pallet[ colorPallet ][ 2 ]
		) );

	} else {

		//narrow screen, one creature

		creatures.push( new Creature(
			width / 2,
			height * random( 0.25, 0.48 ),
			height * 0.08,
			- 1,
			creature_color_pallet[ colorPallet ][ 0 ]
		) );

		plant_distance = 12;

	}


	//create plants
	num_plants = windowWidth / plant_distance;
	for ( let i = 0; i < num_plants; i ++ ) {

		let n1 = height * ( 0.05 + ( noise( i * 0.08 ) * 0.8 ) );
		let n2 = height * noise( i * 0.8 ) * 0.2;
		let r1 = ( random() > 0.85 ) ? random( 0.4, 0.7 ) : 1.0;

		plants.push( new Plant(
			i * plant_distance + random( - 5, 5 ),
			height,
			( n1 + n2 ) * 0.5 * r1
		) );

	}


	//create background
	backgroundBubbles = new BackgroundBubbles();

}




function draw() {

	background( 10 );

	//update background bubbles
	backgroundBubbles.update();

	//update plants
	plants.forEach( plant => {

		plant.update();

	} );

	//update creatures
	creatures.forEach( creature => {

		creature.update();

	} );

	//time
	time += frameRate() / 60 * 0.6;

}
