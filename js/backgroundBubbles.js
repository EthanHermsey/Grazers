
class BackgroundBubbles {

	constructor() {

		this.vectorField = [];
		this.scl = 50;
		this.xRes = floor( width / this.scl );
		this.yRes = floor( height / this.scl );
		this.initVectorField();

		this.num_particles = 50;
		this.particles = [];
		this.addParticleMaxTimer = 15;
		this.addParticleTimer = this.addParticleMaxTimer;
		this.initParticles();

	}

	initVectorField() {

		for ( let y = 0; y < this.yRes; y ++ ) {

			this.vectorField[ y ] = [];

			for ( let x = 0; x < this.xRes; x ++ ) {

				this.vectorField[ y ][ x ] = createVector( 1, 0 ).rotate(
					noise( x * 10.8, y * 10.8 ) * 2.4 - 1.2
				);

			}

		}

	}

	initParticles() {

		for ( let i = 0; i < this.num_particles * 0.6; i ++ ) {

			this.particles.push( this.newParticle( random( width ), random( height * 0.9 ) ) );

		}

	}

	newParticle( x, y ) {

		return {
			position: createVector(
				x || random( - width * 0.1 ),
				y || random( height * 0.9 ),
			),
			radius: random( 10, 34 ),
			speed: random( 1, 2 )
		};

	}


	update() {

		stroke( 43, 100, 100, 30 );

		this.addParticle();

		this.moveAndDisplayParticles();

	}

	addParticle( x, y ) {

		this.addParticleTimer ++;

		if ( ( this.addParticleTimer > this.addParticleMaxTimer &&
			   this.particles.length < this.num_particles ) ) {

			this.particles.push( this.newParticle() );

			this.addParticleTimer = 0;

		}

	}

	moveAndDisplayParticles() {

		for ( let i = this.particles.length - 1; i >= 0; i -- ) {

			if ( this.particles[ i ].position.x > width || this.particles[ i ].position.y < 0 ) {

				this.particles.splice( i, 1 );
				continue;

			}

			let x = floor( map( this.particles[ i ].position.x, 0, width, 0, this.xRes - 1, true ) );
			let y = floor( map( this.particles[ i ].position.y, 0, height, 0, this.yRes - 1, true ) );

			let v = this.vectorField[ y ][ x ].copy();
			v.mult( this.particles[ i ].speed );

			this.particles[ i ].position.add( v );

			circle( this.particles[ i ].position.x, this.particles[ i ].position.y, this.particles[ i ].radius );

		}

	}

}
