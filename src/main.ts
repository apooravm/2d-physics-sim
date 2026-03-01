import p5 from "p5";
import { Line } from "./line";
import { Particle } from "./particle";
import { Spring } from "./spring";

const sketch = (p: p5) => {
    let WIDTH = 800;
    let HEIGHT = 600;

    let p1 = new Particle(400, 100, 10, WIDTH, HEIGHT);
    p1.locked = false;
    let p2 = new Particle(100, 200, 10, WIDTH, HEIGHT);

    let k = 0.01;
    let restLength = 50;
    let s1 = new Spring(k, restLength, p1, p2);
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

        // gravity
        p1.addForce(0, 0.2);
        p2.addForce(0, 0.2);

        if (p.mouseIsPressed) {
            p2.pos.x = p.mouseX;
            p2.pos.y = p.mouseY;
            p2.vel.mult_scaler(0);
        }

        p1.update(dt);
        p2.update(dt);
        p1.particleCollision_Impulse(p2);
        p2.particleCollision_Impulse(p1);
        // p2.particleCollision(p1, p);

        s1.xkbd_constraint(dt);

        p1.show(p);
        p2.show(p);
        s1.show(p);
    };
};

new p5(sketch);
