

class Creature {

	constructor( x, y, radius, startDirection, color ) {

		//positions / velocity system
		this.startPosition = createVector( x, y );
		this.position = createVector( x, y );
		this.velocity = createVector();
		this.acc = createVector();

		//creature variables
		this.color = color;
		this.rnd = floor( random( 111, 999 ) );
		this.startDirection = startDirection;
		this.radius = radius;
		this.layers = 5;
		this.numNodes = 40;
		this.highLevel = height * 0.2;
		this.lowLevel = height * 0.55;
		this.handHoldingRange = this.radius * 0.2;

		//strength weights
		this.seekStrength = 20;
		this.steerTowardPlantStrength = 0.00032;
		this.repelFromPlantStrength = 0.0028;
		this.moveStrength = 0.09;

		//flower particles inside creature
		this.flowerParticles = [];
		this.flowerParticleSpeed = 1.8;

		//buffer for plants in vicinity
		this.plants = [];
		this.maxPlantTimer = 20;
		this.plantTimer = this.maxPlantTimer;

		//init tentacles
		this.tentacles = [];
		this.tentacleBasePositions = [];
		this.num_testicles = this.numNodes / 2;
		this.initTentacles();

		//init organs
		this.num_organs = floor( random( 3, 6 ) );
		this.organSize = 25;
		this.organIncrement = this.num_organs * 3;
		this.organDecrement = this.organIncrement * 0.012;
		this.organMaxCapacity = 60;
		this.organHalfCapacity = this.organMaxCapacity * 0.5;
		this.prevBuoyancy = this.organHalfCapacity;
		this.organPositions = [];
		this.calculatedOrganPositions = [];
		this.organCapacity = [];
		this.initOrgans();

		//init gas bubbles
		this.gasBubbleAmount = 0;
		this.gasBubbleActualAmount = 0;
		this.gasBubbleMaxAmount = 10;
		this.gasBubbles = [];
		this.gasBubblePositions = [];
		this.initGasbubbles();

		//fart bubbles
		this.fartBubbles = [];



	}






	//  o8o               o8o      .
	//  `"'               `"'    .o8
	// oooo  ooo. .oo.   oooo  .o888oo
	// `888  `888P"Y88b  `888    888
	//  888   888   888   888    888
	//  888   888   888   888    888 .
	// o888o o888o o888o o888o   "888"




	initTentacles() {

		let angleIncrement = TWO_PI / this.num_testicles;
		for ( let i = 0; i < this.num_testicles; i ++ ) {


			let a = i * angleIncrement;
			let x = this.radius * cos( a );
			let y = this.radius * sin( a );
			this.tentacles.push( new Tentacle(

				createVector( this.position.x + x, this.position.y + y ),
				createVector( x, y ).normalize(),
				this.radius * 1.2

			) );

			this.tentacleBasePositions[ i ] = createVector();

		}

	}


	initOrgans() {

		for ( let i = 0; i < this.num_organs; i ++ ) {

			let a = random( TWO_PI );
			let x = random( this.radius * 0.05, this.radius * 0.25 ) * cos( a );
			let y = random( this.radius * 0.05, this.radius * 0.25 ) * sin( a );

			this.organPositions.push( createVector( x, y ) );

			this.calculatedOrganPositions.push( createVector( x, y ) );

			this.organCapacity.push( random( 10, 20 ) );

		}

	}


	initGasbubbles() {

		for ( let i = 0; i < this.gasBubbleMaxAmount; i ++ ) {

			let placed = false;
			do {

				placed = false;

				let angle = random( TWO_PI );
				let amp = random( this.radius * 0.1, this.radius * 0.5 );
				let x = amp * cos( angle );
				let y = amp * sin( angle );
				let v = createVector( x, y );

				let found = false;
				for ( let i = 0; i < this.num_organs; i ++ ) {

					//check if too close to organ
					if ( this.organPositions[ i ].dist( v ) < this.organSize ) {

						found = true;
						break;

					}

				}

				if ( ! found ) {

					this.gasBubblePositions.push( v );
					placed = true;

				}



			} while ( placed != true );


		}

	}







	//                              .o8                .
	//                             "888              .o8
	// oooo  oooo  oo.ooooo.   .oooo888   .oooo.   .o888oo  .ooooo.
	// `888  `888   888' `88b d88' `888  `P  )88b    888   d88' `88b
	//  888   888   888   888 888   888   .oP"888    888   888ooo888
	//  888   888   888   888 888   888  d8(  888    888 . 888    .o
	//  `V88V"V8P'  888bod8P' `Y8bod88P" `Y888""8o   "888" `Y8bod8P'
	//              888
	//             o888o



	update() {

		//creature's color.
		stroke( this.color, 100, 100 );

		rotate( 0.01 );

		//check for plants in vicinity
		if ( ( this.plantTimer += 0.1 ) >= this.maxPlantTimer ) {

			this.plantTimer = 0;
			this.getPlants();

		}

		//display all parts of the creature
		this.updateHull();

		this.updateOrgans();

		//this also adds tentacle attraction to this.acc
		this.updateTentacles();

		this.updateFlowerParticles();

		this.updateGasBubbles();

		this.updateFarts();

		//move creature
		this.move();

	}









	//                                          o8o
	//                                          `"'
	// ooo. .oo.  .oo.    .ooooo.  oooo    ooo oooo  ooo. .oo.    .oooooooo
	// `888P"Y88bP"Y88b  d88' `88b  `88.  .8'  `888  `888P"Y88b  888' `88b
	//  888   888   888  888   888   `88..8'    888   888   888  888   888
	//  888   888   888  888   888    `888'     888   888   888  `88bod8P'
	// o888o o888o o888o `Y8bod8P'     `8'     o888o o888o o888o `8oooooo.
	//                                                           d"     YD
	//                                                           "Y88888P'


	move() {

		// tentacle attraction already added to this.acc, in updateTentacles()

		this.acc.add( this.repelFromCreatures() );

		//make creature float and sink from how much he has eaten
		this.acc.add( this.sinkFloat() );

		//add acc to vel to position;
		this.velocity.add( this.acc );
		this.position.add( this.velocity );

		//deminish values
		this.velocity.mult( 0.96 );
		this.acc.mult( 0 );

	}


	repelFromCreatures() {

		for ( let i = 0; i < creatures.length; i ++ ) {

			if ( this.position.dist( creatures[ i ].position ) < this.radius * 3 ) {

				return p5.Vector.sub( this.position, creatures[ i ].position ).setMag( 0.25 );

			}

		}

	}


	sinkFloat() {

		let boiancy = this.getBuoyancy();

		if ( this.prevBuoyancy > this.organHalfCapacity &&
			boiancy < this.organHalfCapacity &&
			this.position.y < height * 0.45 ) {

			setTimeout( ()=>{

				this.fart();

			}, 250 );

		}

		this.prevBuoyancy = boiancy;

		//calculate target (up/down, left/right)
		let x = this.startPosition.x + ( width * 0.06 ) * sin( this.rnd + time * 0.02 ) * this.startDirection;
		let y = this.getCenterPlantHeight() - ( this.radius * 3 );
		if ( boiancy > this.organHalfCapacity ) y = this.highLevel;
		let target = createVector( x, y );

		//direction to target
		let direction = p5.Vector.sub( target, this.position );
		let distance = this.position.dist( target ) * 0.005;
		direction.setMag( this.moveStrength * distance );

		return direction;

	}


	getBuoyancy() {

		let acc = 0;
		this.organCapacity.forEach( capacity =>{

			acc += capacity;

		} );

		return acc /= this.organCapacity.length;

	}









	//            oooo                            .
	//            `888                          .o8
	// oo.ooooo.   888   .oooo.   ooo. .oo.   .o888oo  .oooo.o
	//  888' `88b  888  `P  )88b  `888P"Y88b    888   d88(  "8
	//  888   888  888   .oP"888   888   888    888   `"Y88b.
	//  888   888  888  d8(  888   888   888    888 . o.  )88b
	//  888bod8P' o888o `Y888""8o o888o o888o   "888" 8""888P'
	//  888
	// o888o


	getPlants() {

		this.plants.length = 0;

		let xStart = max( 0, floor( map( this.position.x, 0, width, 0, num_plants ) - 32 ) );
		let xEnd = min( xStart + 64, num_plants );

		for ( let i = xStart; i < xEnd; i ++ ) {

			this.plants.push( plants[ i ] );

		}

	}

	getCenterPlantHeight() {

		let plantHeight = 0; //this.lowLevel;

		if ( this.plants ) {

			this.plants.forEach( plant =>{

				// let pHeight = height - plant.length;
				// if ( pHeight > plantHeight ) plantHeight = pHeight;
				plantHeight += plant.length;

			} );

			plantHeight /= this.plants.length;
			plantHeight *= 0.75;
			plantHeight = height - plantHeight;

		}

		return plantHeight;

	}









	//                                     .o8                    .o8        .o8       oooo
	//                                    "888                   "888       "888       `888
	//  .oooooooo  .oooo.    .oooo.o       888oooo.  oooo  oooo   888oooo.   888oooo.   888   .ooooo.   .oooo.o
	// 888' `88b  `P  )88b  d88(  "8       d88' `88b `888  `888   d88' `88b  d88' `88b  888  d88' `88b d88(  "8
	// 888   888   .oP"888  `"Y88b.        888   888  888   888   888   888  888   888  888  888ooo888 `"Y88b.
	// `88bod8P'  d8(  888  o.  )88b       888   888  888   888   888   888  888   888  888  888    .o o.  )88b
	// `8oooooo.  `Y888""8o 8""888P'       `Y8bod8P'  `V88V"V8P'  `Y8bod8P'  `Y8bod8P' o888o `Y8bod8P' 8""888P'
	// d"     YD
	// "Y88888P'

	//                             .o8        .o88o.                        .
	//                            "888        888 `"                      .o8
	//  .oooo.   ooo. .oo.    .oooo888       o888oo   .oooo.   oooo d8b .o888oo  .oooo.o
	// `P  )88b  `888P"Y88b  d88' `888        888    `P  )88b  `888""8P   888   d88(  "8
	//  .oP"888   888   888  888   888        888     .oP"888   888       888   `"Y88b.
	// d8(  888   888   888  888   888        888    d8(  888   888       888 . o.  )88b
	// `Y888""8o o888o o888o `Y8bod88P"      o888o   `Y888""8o d888b      "888" 8""888P'




	updateGasBubbles() {

		for ( let i = 0; i < this.gasBubbleActualAmount; i ++ ) {

			//wandering positions
			let nX = this.radius * 0.08 * sin( ( i * 5 ) + ( time * 0.5 ) * 0.3 );
			let nY = this.radius * 0.08 * sin( ( i * 8 ) + ( time * 0.5 ) * 0.4 );

			nX -= this.velocity.x;
			nY -= this.velocity.y;

			circle(
				this.position.x + this.gasBubblePositions[ i ].x + nX,
				this.position.y + this.gasBubblePositions[ i ].y + nY,
				5
			);

		}

		if ( this.gasBubbleAmount < this.gasBubbleActualAmount ) {

			this.gasBubbleActualAmount --;

		} else if ( this.gasBubbleAmount > this.gasBubbleActualAmount ) {

			this.gasBubbleActualAmount ++;

		}

	}

	fart() {

		if ( this.gasBubbleAmount <= 3 ) {

			this.gasBubbleAmount = 0;

		} else {

			this.gasBubbleAmount = floor( random( 1, 4 ) );

		}

		let num_bubbles = this.organPositions.length * 2;

		for ( let i = 0; i < num_bubbles; i ++ ) {

			let fart = {
				size: random( 2, 3 ),
				position: { x: this.position.x, y: this.position.y },
				time: 0,
				timeInc: random( 0.05, 0.1 ),
				rnd: random( 99 )
			};

			fart.position.y -= this.radius * 1.4;
			fart.position.y += random( 30, - 30 );

			this.fartBubbles.push( fart );

		}

	}

	updateFarts() {

		for ( let i = this.fartBubbles.length - 1; i >= 0; i -- ) {

			let bubble = this.fartBubbles[ i ];
			bubble.position.y -= bubble.timeInc * 40;
			bubble.position.x += bubble.timeInc * 15;
			bubble.size += bubble.timeInc * 2;
			bubble.time += bubble.timeInc;
			circle(

				bubble.position.x + ( width * 0.005 ) * sin( bubble.time + bubble.rnd * 2 ),
				bubble.position.y,
				bubble.size

			);

			if ( bubble.position.y < - 100 ) this.fartBubbles.splice( i, 1 );

		}

	}












	//       .o8                                       o8o
	//      "888                                       `"'
	//  .oooo888  oooo d8b  .oooo.   oooo oooo    ooo oooo  ooo. .oo.    .oooooooo
	// d88' `888  `888""8P `P  )88b   `88. `88.  .8'  `888  `888P"Y88b  888' `88b
	// 888   888   888      .oP"888    `88..]88..8'    888   888   888  888   888
	// 888   888   888     d8(  888     `888'`888'     888   888   888  `88bod8P'
	// `Y8bod88P" d888b    `Y888""8o     `8'  `8'     o888o o888o o888o `8oooooo.
	//                                                                  d"     YD
	//                                                                  "Y88888P'

	// oooo                    oooo  oooo
	// `888                    `888  `888
	//  888 .oo.   oooo  oooo   888   888
	//  888P"Y88b  `888  `888   888   888
	//  888   888   888   888   888   888
	//  888   888   888   888   888   888
	// o888o o888o  `V88V"V8P' o888o o888o




	updateHull() {

		let scale = 1;
		let scaleIncrement = 0.025;
		let angleIncrement = TWO_PI / this.numNodes;
		let halfTime = time * 0.5;
		let prevLayer = [];


		for ( let j = 0; j < this.layers; j ++ ) {

			if ( j == this.layers - 1 ) {

				fill( 10 );

			}

			this.drawHullLayer( j, angleIncrement, halfTime, scale, prevLayer );

			//change scale between layers
			scale -= scaleIncrement;
			scaleIncrement *= 1.618;

		}

	}

	drawHullLayer( j, angleIncrement, halfTime, scale, prevLayer ) {

		beginShape();
		let dir = createVector();
		let dotVector = createVector();

		for ( let i = 0; i < this.numNodes; i ++ ) {

			//draw the body outline
			let a = i * angleIncrement;
			let x = this.radius * cos( a );
			let y = this.radius * sin( a );

			//get noise value
			let n = noise(
				( x * 0.7 + time * 1.5 + this.rnd ) * 0.02,
				( y * 0.8 + time * 1.5 + this.rnd ) * 0.025
			);
			n -= 0.5; // [ -0.5, 0.5 ]
			n = 1 + ( n * 0.5 ); // [ 0.775, 1.125 ]

			//get dot value
			dir.set(
				( x * n * scale ),
				( y * n * scale )
			).normalize();

			dotVector.set( this.velocity.x, this.velocity.y ).normalize();
			let d = dotVector.dot( dir ) * this.velocity.mag() * 0.065;
			d = 1.0 - d;

			//get new position
			let newPosition = createVector(
				this.position.x + ( x * n * scale * d ),
				this.position.y + ( y * n * scale * d )
			);

			//draw vertex
			curveVertex(
				newPosition.x,
				newPosition.y
			);


			//draw lines inside between previous layer and this layer
			if ( j > 2 && j < this.layers - 1 ) {

				line(

					prevLayer[ i ].x,
					prevLayer[ i ].y,
					newPosition.x,
					newPosition.y

				);

			}

			//save previous layer for drawing lines to the next layer
			prevLayer[ i ] = newPosition;


			//save the tentacle base positions for the outermost layer
			if ( j == 0 && i % 2 == 0 ) {

				this.tentacleBasePositions[ i / 2 ].set(
					newPosition.x,
					newPosition.y
				);

			}

		}

		endShape( CLOSE );

	}








	//       .o8                                       o8o
	//      "888                                       `"'
	//  .oooo888  oooo d8b  .oooo.   oooo oooo    ooo oooo  ooo. .oo.    .oooooooo
	// d88' `888  `888""8P `P  )88b   `88. `88.  .8'  `888  `888P"Y88b  888' `88b
	// 888   888   888      .oP"888    `88..]88..8'    888   888   888  888   888
	// 888   888   888     d8(  888     `888'`888'     888   888   888  `88bod8P'
	// `Y8bod88P" d888b    `Y888""8o     `8'  `8'     o888o o888o o888o `8oooooo.
	//                                                                  d"     YD
	//                                                                  "Y88888P'

	//  .o88o. oooo                                                                                       .    o8o            oooo
	//  888 `" `888                                                                                     .o8    `"'            `888
	// o888oo   888   .ooooo.  oooo oooo    ooo  .ooooo.  oooo d8b      oo.ooooo.   .oooo.   oooo d8b .o888oo oooo   .ooooo.   888   .ooooo.   .oooo.o
	//  888     888  d88' `88b  `88. `88.  .8'  d88' `88b `888""8P       888' `88b `P  )88b  `888""8P   888   `888  d88' `"Y8  888  d88' `88b d88(  "8
	//  888     888  888   888   `88..]88..8'   888ooo888  888           888   888  .oP"888   888       888    888  888        888  888ooo888 `"Y88b.
	//  888     888  888   888    `888'`888'    888    .o  888           888   888 d8(  888   888       888 .  888  888   .o8  888  888    .o o.  )88b
	// o888o   o888o `Y8bod8P'     `8'  `8'     `Y8bod8P' d888b          888bod8P' `Y888""8o d888b      "888" o888o `Y8bod8P' o888o `Y8bod8P' 8""888P'
	//                                                                   888
	//                                                                  o888o


	updateFlowerParticles() {

		push();

		noStroke();
		fill( 'yellow' );

		this.flowerParticles.forEach( ( flower, i ) => {

			//make particle attract to center
			let organPosition = this.calculatedOrganPositions[ flower.organ ];
			let direction = p5.Vector.sub( organPosition, flower.position );
			direction.setMag( this.flowerParticleSpeed );

			flower.position.add( direction.add( this.velocity ) );

			if ( flower.position.dist( organPosition ) <= this.organSize * 0.4 ) {

				//add gas bubble
				if ( this.gasBubbleAmount < this.gasBubbleMaxAmount ) {

					this.gasBubbleAmount ++;

				}

				//remove particle
				this.flowerParticles.splice( i, 1 );

				//add point / color
				let d = this.organIncrement * 0.9 + random( this.organIncrement * 0.1 );
				this.organCapacity[ flower.organ ] += d;
				this.organCapacity[ flower.organ ] = min( this.organMaxCapacity, this.organCapacity[ flower.organ ] );

			}

			circle( flower.position.x, flower.position.y, 5 );

		} );

		pop();

	}










	//       .o8                                       o8o
	//      "888                                       `"'
	//  .oooo888  oooo d8b  .oooo.   oooo oooo    ooo oooo  ooo. .oo.    .oooooooo
	// d88' `888  `888""8P `P  )88b   `88. `88.  .8'  `888  `888P"Y88b  888' `88b
	// 888   888   888      .oP"888    `88..]88..8'    888   888   888  888   888
	// 888   888   888     d8(  888     `888'`888'     888   888   888  `88bod8P'
	// `Y8bod88P" d888b    `Y888""8o     `8'  `8'     o888o o888o o888o `8oooooo.
	//                                                                  d"     YD
	//                                                                  "Y88888P'



	//  .ooooo.  oooo d8b  .oooooooo  .oooo.   ooo. .oo.    .oooo.o
	// d88' `88b `888""8P 888' `88b  `P  )88b  `888P"Y88b  d88(  "8
	// 888   888  888     888   888   .oP"888   888   888  `"Y88b.
	// 888   888  888     `88bod8P'  d8(  888   888   888  o.  )88b
	// `Y8bod8P' d888b    `8oooooo.  `Y888""8o o888o o888o 8""888P'
	//                    d"     YD
	//                    "Y88888P'


	updateOrgans() {

		//draw a wobbly circle for each 'organ'
		let angleIncrement = TWO_PI / 10;

		for ( let i = 0; i < this.organPositions.length; i ++ ) {

			//wandering positions
			let nX = this.organSize * sin( ( i * 5 ) + ( time * 0.5 ) * 0.015 );
			let nY = this.organSize * sin( ( i * 8 ) + ( time * 0.5 ) * 0.05 );

			//calculate organCapacity
			this.organCapacity[ i ] -= random( this.organDecrement );
			this.organCapacity[ i ] = max( 0, this.organCapacity[ i ] );

			//fill organ with yellow color, organCapacity as aplha
			// fill(14, 100, 100, this.organCapacity[i]);
			fill( this.color, 100, 100, this.organCapacity[ i ] );

			beginShape();

			for ( let j = 0; j < 10; j ++ ) {

				let a = j * angleIncrement;
				let x = ( this.radius * 0.1 ) * cos( a );
				let y = ( this.radius * 0.1 ) * sin( a );

				let n = noise(
					( x + time + ( i * 50 ) ) * 0.04,
					( y + time + ( i * 50 ) ) * 0.04
				);
				n -= 0.5;
				n = 1 + ( n * 1 );

				curveVertex(
					( this.position.x + this.organPositions[ i ].x + nX ) + ( x * n ),
					( this.position.y + this.organPositions[ i ].y + nY ) + ( y * n )
				);

			}

			this.calculatedOrganPositions[ i ].set(
				( this.position.x + this.organPositions[ i ].x + nX ),
				( this.position.y + this.organPositions[ i ].y + nY )
			);

			endShape( CLOSE );

		}

	}

	getOrganWithLowestCapacity() {

		let recIndex = undefined;
		let recCap = 999999;

		this.organCapacity.forEach( ( capacity, index ) =>{

			if ( capacity < recCap ) {

				recIndex = index;
				recCap = capacity;

			}

		} );

		return recIndex;

	}










	//       .o8                                       o8o
	//      "888                                       `"'
	//  .oooo888  oooo d8b  .oooo.   oooo oooo    ooo oooo  ooo. .oo.    .oooooooo
	// d88' `888  `888""8P `P  )88b   `88. `88.  .8'  `888  `888P"Y88b  888' `88b
	// 888   888   888      .oP"888    `88..]88..8'    888   888   888  888   888
	// 888   888   888     d8(  888     `888'`888'     888   888   888  `88bod8P'
	// `Y8bod88P" d888b    `Y888""8o     `8'  `8'     o888o o888o o888o `8oooooo.
	//                                                                  d"     YD
	//                                                                  "Y88888P'

	//     .                             .                       oooo
	//   .o8                           .o8                       `888
	// .o888oo  .ooooo.  ooo. .oo.   .o888oo  .oooo.    .ooooo.   888   .ooooo.   .oooo.o
	//   888   d88' `88b `888P"Y88b    888   `P  )88b  d88' `"Y8  888  d88' `88b d88(  "8
	//   888   888ooo888  888   888    888    .oP"888  888        888  888ooo888 `"Y88b.
	//   888 . 888    .o  888   888    888 . d8(  888  888   .o8  888  888    .o o.  )88b
	//   "888" `Y8bod8P' o888o o888o   "888" `Y888""8o `Y8bod8P' o888o `Y8bod8P' 8""888P'




	updateTentacles() {

		let target = null;
		let ballOffset = createVector();

		for ( let i = 0; i < this.tentacles.length; i ++ ) {


			let tentacleEndpoint = this.tentacles[ i ].getEndpoint();



			if ( this.tentacles[ i ].hasFlower ) {

				//moveflower towards creature
				target = this.eatFlowerParticle( this.tentacles[ i ], tentacleEndpoint );

			} else {

				//find attraction to first plant in range
				target = this.reachFlowers( this.tentacles[ i ], tentacleEndpoint );

				if ( ! target ) {

					//when no flower is found:
					//check closeby creature tentacles.
					target = this.reachOtherTentacles( tentacleEndpoint );

				}

			}


			//display the tentacle
			this.tentacles[ i ].update( this.tentacleBasePositions[ i ], target, this.velocity );
			this.tentacles[ i ].show();


			//draw circles on the end
			if ( this.tentacles[ i ].hasFlower ) {

				fill( 'yellow' );
				ballOffset.set(
					this.tentacles[ i ].segments[ this.tentacles[ i ].segments.length - 1 ].direction.x,
					this.tentacles[ i ].segments[ this.tentacles[ i ].segments.length - 1 ].direction.y
				);
				ballOffset.setMag( 2.5 );
				circle( tentacleEndpoint.x + ballOffset.x, tentacleEndpoint.y + ballOffset.y, 5 );

			}

			noFill();

		}


	}

	eatFlowerParticle( tentacle, tentacleEndpoint ) {

		let dir = p5.Vector.sub( this.position, tentacleEndpoint );
		dir.setMag( 100 );

		let distTargetToCenter = tentacleEndpoint.dist( this.position );

		if ( distTargetToCenter < this.radius * 0.9 ) {

			//remove flower from tentacle
			tentacle.hasFlower = false;

			//add flower particle to creature
			this.flowerParticles.push( {
				position: tentacleEndpoint.copy(),
				organ: this.getOrganWithLowestCapacity()
			} );

		}

		return dir.add( tentacleEndpoint );

	}

	getCloseByTentacle( tentacleEndpoint ) {

		for ( let i = 0; i < this.tentacles.length; i ++ ) {

			let otherEndPoint = this.tentacles[ i ].getEndpoint();

			if ( tentacleEndpoint.dist( otherEndPoint ) < this.handHoldingRange ) {

				return otherEndPoint;

			}

		}

	}

	reachOtherTentacles( tentacleEndpoint ) {

		for ( let c = 0; c < creatures.length; c ++ ) {

			//don't check own tentacles
			if ( c == creatures.indexOf( this ) ) continue;

			let target = creatures[ c ].getCloseByTentacle( tentacleEndpoint );
			if ( target ) return target;

		}

	}

	reachFlowers( tentacle, tentacleEndpoint ) {

		let target = null;
		let targetPlant = null;
		let recDistance = 9999999;
		let distanceBetweenEndpoints = 999999;

		for ( let x = 0; x < this.plants.length; x ++ ) {

			if ( this.plants[ x ].hasFlower == false ) continue;

			let plantEndpoint = this.plants[ x ].getEndpoint();
			let distance = tentacle.distanceToPoint( plantEndpoint );

			if ( tentacle.isInRange( plantEndpoint ) && distance < recDistance ) {

				target = tentacleEndpoint.copy().add(
					p5.Vector.sub( plantEndpoint, tentacleEndpoint ).setMag( this.seekStrength )
				);

				targetPlant = this.plants[ x ];
				recDistance = distance;
				distanceBetweenEndpoints = tentacleEndpoint.dist( plantEndpoint );

			}


			if ( distanceBetweenEndpoints < 8 && targetPlant.hasFlower ) {

				//to remove the flower from the plant and add flower to tentacle
				tentacle.hasFlower = true;
				targetPlant.removeFlower();



			} else if ( target && recDistance > this.radius * 1.25 ) {

				//add direction to acc, reach for closest flower if too far away
				let dir = p5.Vector.sub( target, tentacle.getEndpoint() );
				dir.setMag( this.steerTowardPlantStrength );

				this.acc.add( dir );

			}

			//remux target to dist from tentacleEndpoint
			if ( target ) {

				//target too close, back off
				if ( target.y - this.position.y < this.radius ) {

					let dir = p5.Vector.sub( target, tentacle.getEndpoint() );
					dir.setMag( - this.steerTowardPlantStrength );
					dir.y = - this.repelFromPlantStrength;

					this.acc.add( dir );

				}

				target = tentacleEndpoint.copy().add(
					p5.Vector.sub( target, tentacleEndpoint ).setMag( this.seekStrength )
				);

			}

		}

		return target;

	}

}
