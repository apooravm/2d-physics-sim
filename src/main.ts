import p5 from "p5";
import { Line } from "./line";
import { Particle } from "./particle";
import { Spring } from "./spring";

const sketch = (p: p5) => {
    let WIDTH = 800;
    let HEIGHT = 600;

    let p1 = new Particle(400, 100, 10, WIDTH, HEIGHT);
    p1.locked = false;
    let p2 = new Particle(100, 100, 10, WIDTH, HEIGHT);

    let p3 = new Particle(300, 300, 10, WIDTH, HEIGHT);

    let k = 0.1;
    let restLength = 50;
    let s1 = new Spring(k, restLength, p1, p2);
    let s2 = new Spring(k, restLength, p2, p3);
    let s3 = new Spring(k, restLength, p3, p1);
    // let s2 = new Spring(k, restLength, p2, p3);

    let mesh = createTriMesh(
        2, // columns
        2, // rows
        50, // spacing
        200, // originX
        150, // originY
        WIDTH,
        HEIGHT,
    );

    // @ts-ignore
    let l_h = 500;
    let l_space = 300;
    let l1 = new Line(0, l_h, l_space, l_h);
    let l2 = new Line(WIDTH - l_space, l_h, WIDTH, l_h);

    let speed = 0.05;
    let dt;
    // let rel_ms = new Vec2(0, 0);
    p.setup = () => {
        p.createCanvas(WIDTH, HEIGHT);
        p.frameRate(60);
    };

    p.draw = () => {
        p.background(51);
        dt = speed * p.deltaTime;

        p.noFill();
        p.strokeWeight(1);

        // gravity
        p1.addForce(0, 0.2);
        p2.addForce(0, 0.2);

        if (p.mouseIsPressed) {
            p2.pos.x = p.mouseX;
            p2.pos.y = p.mouseY;
            // p2.vel.mult_scaler(0);
            // mesh.particles[0].pos.x = p.mouseX;
            // mesh.particles[0].pos.y = p.mouseY;
            // mesh.particles[0].vel.mult_scaler(0);
        }

        for (let i = 0; i < mesh.particles.length; i++) {
            // for (let j = i; j < mesh.particles.slice(i, mesh.particles.length).length; j++) {
            //     mesh.particles[i].particleCollision_Impulse(mesh.particles[j]);
            // }
            l1.particle_collide(mesh.particles[i], p);
            l2.particle_collide(mesh.particles[i], p);
            mesh.particles[i].addForce(0, 0.2);
            mesh.particles[i].update(dt);
        }

        for (const s of mesh.springs) {
            s.xpbd_constraint(dt);
        }

        for (const pr of mesh.particles) {
            pr.show(p);
        }

        for (const s of mesh.springs) {
            s.show(p);
        }

        l1.particle_collide(p1, p);
        l1.particle_collide(p2, p);
        l1.particle_collide(p3, p);
        l2.particle_collide(p1, p);
        l2.particle_collide(p2, p);
        l2.particle_collide(p3, p);

        p1.update(dt);
        p2.update(dt);
        p3.update(dt);
        // p1.particleCollision_Impulse(p2);
        // p2.particleCollision_Impulse(p1);
        // p3.particleCollision_Impulse(p2);
        // p2.particleCollision(p1, p);

        s1.xpbd_constraint(dt);
        s2.xpbd_constraint(dt);
        s3.xpbd_constraint(dt);
        // s1.update_old();
        // s2.update_old();
        // s3.update_old();

        p1.show(p);
        p2.show(p);
        p3.show(p);

        l1.show(p);
        l2.show(p);

        s1.show(p);
        s2.show(p);
        s3.show(p);
    };
};

new p5(sketch);

function createTriMesh(
    nx: number,
    ny: number,
    spacing: number,
    originX: number,
    originY: number,
    WIDTH: number,
    HEIGHT: number,
) {
    let particles: Particle[] = [];
    let springs: Spring[] = [];

    let index = (x: number, y: number) => x + y * nx;

    // Create particles
    for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
            let px = originX + x * spacing;
            let py = originY + y * spacing;

            particles.push(new Particle(px, py, 10, WIDTH, HEIGHT));
        }
    }

    let k = 0.01;

    // Create springs
    for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
            let i = index(x, y);
            let p = particles[i];

            // Structural
            if (x < nx - 1) springs.push(new Spring(k, spacing, p, particles[index(x + 1, y)]));

            if (y < ny - 1) springs.push(new Spring(k, spacing, p, particles[index(x, y + 1)]));

            // Diagonal (triangles)
            if (x < nx - 1 && y < ny - 1)
                springs.push(
                    new Spring(k, Math.sqrt(2) * spacing, p, particles[index(x + 1, y + 1)]),
                );

            // Optional second diagonal (more stable)
            if (x > 0 && y < ny - 1)
                springs.push(
                    new Spring(k, Math.sqrt(2) * spacing, p, particles[index(x - 1, y + 1)]),
                );
        }
    }

    return { particles, springs };
}
