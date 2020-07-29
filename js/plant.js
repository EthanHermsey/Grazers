
class Plant {

	constructor( x, y, len ) {

		this.base = createVector( x, y );
		this.length = len;

		this.stem = new Stem( this.base, createVector( 0, - 1 ), len );

		this.hasFlower = true;
		this.flowerOffset = createVector();

	}

	update() {

		this.showStem();
		this.showFlower();

	}


	getEndpoint() {

		return this.stem.getEndpoint();

	}

	removeFlower() {

		this.hasFlower = false;

		setTimeout( ()=>{

			this.hasFlower = true;

		}, floor( random( 2000, 6000 ) ) );

	}


	showStem() {

		stroke( 'lightgreen' );
		this.stem.idle();
		this.stem.show();

	}

	showFlower() {

		stroke( 'orange' );

		( this.hasFlower ) ? fill( 'orange' ) : noFill();

		this.flowerOffset.set(
			this.stem.segments[ this.stem.segments.length - 1 ].direction.x,
			this.stem.segments[ this.stem.segments.length - 1 ].direction.y
		).setMag( 2.5 );

		circle(
			this.stem.segments[ this.stem.segments.length - 1 ].pointB.x + this.flowerOffset.x,
			this.stem.segments[ this.stem.segments.length - 1 ].pointB.y + this.flowerOffset.y,
			5
		);

		noFill();

	}

}
