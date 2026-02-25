import p5 from "p5";
import { Line } from "./line";
import { Particle } from "./particle";
import { Vec2 } from "./utils";

const sketch = (p: p5) => {
    let WIDTH = 800;
    let HEIGHT = 600;

    let p1 = new Particle(400, 100, 10, WIDTH, HEIGHT);
    p1.locked = false;
    let p2 = new Particle(100, 200, 40, WIDTH, HEIGHT);
    let p3 = new Particle(100, 500, 80, WIDTH, HEIGHT);

    // let k = 0.01;
    // let restLength = 200;
    // let s1 = new Spring(k, restLength, p1, p2);
    // let s2 = new Spring(k, restLength, p2, p3);

    // @ts-ignore
    let l1 = new Line(150, 400, 400, 100);

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

        if (p.mouseIsPressed) {
            p3.pos = new Vec2(p.mouseX, p.mouseY);
            p3.vel = new Vec2(0, 0);
        }

        // p1.addForce(0, 0.1);
        // p2.addForce(0, 0.1);
        p1.update(dt);
        p2.update(dt);
        p3.update(dt);
        p1.particleCollision_Impulse(p2);
        p1.particleCollision_Impulse(p3);
        p2.particleCollision_Impulse(p3);
        // p2.particleCollision(p1, p);

        p1.show(p);
        p2.show(p);
        p3.show(p);
    };
};

new p5(sketch);
