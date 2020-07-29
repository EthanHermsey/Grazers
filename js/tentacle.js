



// ooooo
// `888'
//  888  ooo. .oo.   oooo    ooo  .ooooo.  oooo d8b  .oooo.o  .ooooo.
//  888  `888P"Y88b   `88.  .8'  d88' `88b `888""8P d88(  "8 d88' `88b
//  888   888   888    `88..8'   888ooo888  888     `"Y88b.  888ooo888
//  888   888   888     `888'    888    .o  888     o.  )88b 888    .o
// o888o o888o o888o     `8'     `Y8bod8P' d888b    8""888P' `Y8bod8P'



// oooo         o8o                                                        .    o8o
// `888         `"'                                                      .o8    `"'
//  888  oooo  oooo  ooo. .oo.    .ooooo.  ooo. .oo.  .oo.    .oooo.   .o888oo oooo   .ooooo.   .oooo.o
//  888 .8P'   `888  `888P"Y88b  d88' `88b `888P"Y88bP"Y88b  `P  )88b    888   `888  d88' `"Y8 d88(  "8
//  888888.     888   888   888  888ooo888  888   888   888   .oP"888    888    888  888       `"Y88b.
//  888 `88b.   888   888   888  888    .o  888   888   888  d8(  888    888 .  888  888   .o8 o.  )88b
// o888o o888o o888o o888o o888o `Y8bod8P' o888o o888o o888o `Y888""8o   "888" o888o `Y8bod8P' 8""888P'




class IK {

	constructor( base, dir, len, segments ) {

		this.rnd = random( 0.2, 999 );
		this.base = base;
		this.direction = dir;
		this.length = len;
		this.num_segments = segments;
		this.segmentLength = this.length / this.num_segments;
		this.segments = [];

		this.initSegments();

	}

	initSegments() {

		this.segments[ 0 ] = new Segment( this.base, this.direction, this.segmentLength );

		for ( let i = 1; i < this.num_segments; i ++ ) {

			this.segments[ i ] = new Segment(
				this.segments[ i - 1 ].pointB,
				this.direction,
				this.segmentLength
			);

		}

	}

	pointSegments( target ) {

		this.segments[ this.segments.length - 1 ].follow( target.x, target.y );

		for ( let i = this.segments.length - 2; i >= 0; i -- ) {

			this.segments[ i ].follow( this.segments[ i + 1 ].pointA.x, this.segments[ i + 1 ].pointA.y );

		}

	}

	translateToBase() {

		this.segments[ 0 ].setA( this.base );

		for ( let i = 1; i < this.segments.length; i ++ ) {

			this.segments[ i ].setA( this.segments[ i - 1 ].pointB );

		}

	}

	getEndpoint() {

		return createVector(
			this.segments[ this.segments.length - 1 ].pointB.x,
			this.segments[ this.segments.length - 1 ].pointB.y
		);

	}

	isInRange( target ) {

		return ( dist( target.x, target.y, this.base.x, this.base.y ) < this.length * 1.5 );

	}

	distanceToPoint( target ) {

		return dist( target.x, target.y, this.base.x, this.base.y );

	}

	show() {

		this.segments.forEach( segment => {

			segment.show();

		} );

	}

}






// ooooo oooo    oooo       .oooooo..o                                                                  .
// `888' `888   .8P'       d8P'    `Y8                                                                .o8
//  888   888  d8'         Y88bo.       .ooooo.   .oooooooo ooo. .oo.  .oo.    .ooooo.  ooo. .oo.   .o888oo
//  888   88888[            `"Y8888o.  d88' `88b 888' `88b  `888P"Y88bP"Y88b  d88' `88b `888P"Y88b    888
//  888   888`88b.              `"Y88b 888ooo888 888   888   888   888   888  888ooo888  888   888    888
//  888   888  `88b.       oo     .d8P 888    .o `88bod8P'   888   888   888  888    .o  888   888    888 .
// o888o o888o  o888o      8""88888P'  `Y8bod8P' `8oooooo.  o888o o888o o888o `Y8bod8P' o888o o888o   "888"
//                                               d"     YD
//                                               "Y88888P'



class Segment {

	constructor( base, dir, len ) {

		this.length = len;
		this.direction = dir.copy();
		this.direction.setMag( this.length );

		this.target = createVector();
		this.pointA = base.copy();

		this.pointB = createVector();
		this.pointB.set( this.pointA.x, this.pointA.y );
		this.pointB.add( this.direction );


	}

	follow( tX, tY ) {

		this.target.set( tX, tY );

		this.pointB.lerp( this.target, 0.7 );


		this.direction.set( this.pointB.x, this.pointB.y );
		this.direction.sub( this.pointA );
		this.direction.setMag( this.length );


		this.pointA = p5.Vector.sub( this.pointB, this.direction );


	}

	calculateB() {

		this.pointB.set( this.pointA.x, this.pointA.y );
		this.pointB.add( this.direction );

	}

	setA( base ) {

		this.pointA.set( base.x, base.y );
		this.calculateB();

	}

	show() {

		line(
			this.pointA.x, this.pointA.y,
			this.pointB.x, this.pointB.y
		);

	}

}





//  .oooooo..o     .
// d8P'    `Y8   .o8
// Y88bo.      .o888oo  .ooooo.  ooo. .oo.  .oo.
//  `"Y8888o.    888   d88' `88b `888P"Y88bP"Y88b
//      `"Y88b   888   888ooo888  888   888   888
// oo     .d8P   888 . 888    .o  888   888   888
// 8""88888P'    "888" `Y8bod8P' o888o o888o o888o




class Stem extends IK {

	constructor( base, dir, len ) {

		super( base, dir, len, 8 );

		this.targetVector = createVector();

	}

	idle() {

		this.targetVector.set(
			this.segments[ this.segments.length - 1 ].pointB.x,
			this.segments[ this.segments.length - 1 ].pointB.y
		);

		this.targetVector.add( this.direction );

		this.targetVector.x += ( 0.5 - sin( ( time + this.rnd * 0.4 ) * 0.05 ) );
		this.targetVector.y += sin( ( time + this.rnd * 2.2 ) * 0.26 );

		this.pointSegments( this.targetVector );

		//wiggle!
		for ( let i = 0; i < this.segments.length; i ++ ) {

			this.segments[ i ].direction.rotate( sin( ( ( i + time * 0.5 ) * 0.65 ) + this.rnd ) * 0.002 );
			this.segments[ i ].calculateB();

		}

		this.translateToBase();

	}

}







// ooooooooooooo                           .                       oooo
// 8'   888   `8                         .o8                       `888
//      888       .ooooo.  ooo. .oo.   .o888oo  .oooo.    .ooooo.   888   .ooooo.
//      888      d88' `88b `888P"Y88b    888   `P  )88b  d88' `"Y8  888  d88' `88b
//      888      888ooo888  888   888    888    .oP"888  888        888  888ooo888
//      888      888    .o  888   888    888 . d8(  888  888   .o8  888  888    .o
//     o888o     `Y8bod8P' o888o o888o   "888" `Y888""8o `Y8bod8P' o888o `Y8bod8P'





class Tentacle extends IK {

	constructor( base, dir, len ) {

		super( base, dir, len, 16 );

		this.hasFlower = false;

		this.outwardVector = dir.copy();
		this.outwardVector.setMag( 40 );

		this.creatureVelocity = createVector();

	}

	update( base, target, creatureVelocity ) {

		this.base.set( base.x, base.y );


		if ( target && this.isInRange( target ) ) {

			//if target in reach, seek the target
			this.seek( target );

		} else {

			//if target NOT in reach and no flower in hand, idle animation
			this.idle( creatureVelocity );

		}

	}

	show() {

		strokeWeight( 1.4 );

		super.show();

		strokeWeight( 1 );

	}


	seek( target ) {

		this.pointSegments( target );
		this.translateToBase();

	}

	idle( creatureVector ) {

		if ( ! this.hasFlower ) {


			//point segments
			let target = this.getEndpoint();

			//revers creature velocity Vector and add to target
			this.creatureVelocity.set( creatureVector.x, creatureVector.y );
			this.creatureVelocity.mult( - 20 );
			target.add( this.creatureVelocity );

			//direction outwards
			target.add( this.outwardVector );

			// //random wandering around
			target.x += 15 * sin( ( time + this.rnd ) * 0.4 );
			target.y += 15 * sin( ( time + this.rnd ) * 0.5 );

			this.pointSegments( target );

			//wiggle!
			for ( let i = 0; i < this.segments.length; i ++ ) {

				this.segments[ i ].direction.rotate( sin( ( time + this.rnd - i ) ) * - 0.04 );
				this.segments[ i ].calculateB();

			}


		}

		this.translateToBase();

	}

	initSegments() {

		this.segments[ 0 ] = new Segment( this.base, this.direction, this.segmentLength );

		for ( let i = 1; i < this.num_segments; i ++ ) {

			this.segments[ i ] = new Segment(
				this.segments[ i - 1 ].pointB,
				this.direction.rotate( random( - 0.2, 0.2 ) ),
				this.segmentLength
			);

		}

	}

}
