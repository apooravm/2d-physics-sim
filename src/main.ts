import p5 from "p5";
import { Particle } from "./particle";
import { Spring } from "./spring";
import { Vec2 } from "./utils";

type Mesh = {
    points: Particle[];
    springs: Spring[];
};

class Line {
    A: Vec2;
    B: Vec2;
    normal: Vec2;
    dir: Vec2;
    constructor(Ax: number, Ay: number, Bx: number, By: number) {
        this.A = new Vec2(Ax, Ay);
        this.B = new Vec2(Bx, By);

        // deriving normal: normal of a line in 2D, you rotate its direction vector by 90°.
        // direction = (dx, dy)
        this.dir = this.B.clone().sub(this.A);
        // (-dy, dx)   // 90° counter-clockwise
        // (dy, -dx)   // 90° clockwise
        this.normal = new Vec2(-this.dir.y, this.dir.x);

        // normalize to unit length
        this.normal.normalize();
    }

    particle_collide(pr: Particle, p: p5) {
        const A = this.A.clone();
        const B = this.B.clone();
        const P = pr.pos.clone();

        const AB = B.clone().sub(A);
        const AP = P.clone().sub(A);

        const abLenSq = AB.dot(AB);
        if (abLenSq === 0) return;

        let t = AP.dot(AB) / abLenSq;
        t = Math.max(0, Math.min(1, t));

        const closest = A.clone().add(AB.clone().mult_scaler(t));

        const diff = P.clone().sub(closest);
        const dist = diff.mag();

        if (dist < pr.radius) {
            // penetration depth
            const penetration = pr.radius - dist;

            // collision normal
            diff.normalize();

            // push circle out of line
            pr.pos.add(diff.clone().mult_scaler(penetration));
            // pr.ve0l.mult_scaler(-1);
            const vn = pr.vel.dot(diff); // velocity along normal

            if (vn < 0) {
                // only reflect if moving INTO surface
                const restitution = 1.0; // 1 = perfect bounce, 0 = no bounce

                const impulse = diff.clone().mult_scaler(-(1 + restitution) * vn);
                pr.vel.add(impulse);
            }
        }

        p.stroke("red");
        p.strokeWeight(10);
        p.point(closest.x, closest.y);
    }

    show(p: p5) {
        p.strokeWeight(5);
        p.stroke(255);
        p.line(this.A.x, this.A.y, this.B.x, this.B.y);
    }
}

const sketch = (p: p5) => {
    let WIDTH = 800;
    let HEIGHT = 600;

    let k = 0.01;
    let restLength = 400;

    // nw -> sw -> se -> ne
    let sq_width = 20;
    let sq_x = 20;
    let sq_y = 20;
    let a = new Particle(sq_x, sq_y, 5, WIDTH, HEIGHT);
    let b = new Particle(sq_x, sq_y + sq_width, 5, WIDTH, HEIGHT);
    let c = new Particle(sq_x + sq_width, sq_y + sq_width, 5, WIDTH, HEIGHT);
    let d = new Particle(sq_x + sq_width, sq_y, 5, WIDTH, HEIGHT);

    // a.locked = true;
    let s_ab = new Spring(k, restLength, a, b);
    let s_bc = new Spring(k, restLength, b, c);
    let s_cd = new Spring(k, restLength, c, d);
    let s_da = new Spring(k, restLength, d, a);

    let p1 = new Particle(100, 100, 10, WIDTH, HEIGHT);
    let p2 = new Particle(100, 300, 10, WIDTH, HEIGHT);
    let s1 = new Spring(k, restLength, p1, p2);
    // @ts-ignore
    let l1 = new Line(150, 400, 400, 100);

    let mesh: Mesh = {
        points: [a, b, c, d],
        springs: [s_ab, s_bc, s_cd, s_da],
    };

    let speed = 0.9;
    let dt;
    // let rel_ms = new Vec2(0, 0);
    p.setup = () => {
        p.createCanvas(WIDTH, HEIGHT);
        p.frameRate(60);
    };

    p.draw = () => {
        p.background(51);
        dt = speed * p.deltaTime;

        // p2.pos.x = p.mouseX;
        // p2.pos.y = p.mouseY;

        p.mousePressed = () => {
            p2.pos.x = p.mouseX;
            p2.pos.y = p.mouseY;
        };

        p1.update(dt);
        p2.update(dt);
        // p1.particleCollision(p2, p);
        // p2.particleCollision(p1, p);

        s1.update();
        p1.show(p);
        p2.show(p);
        s1.show(p);

        p.stroke("black");
        p.strokeWeight(1);
        p.line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
        // l1.show(p);
        // l1.particle_collide(p1, p);
        // l1.particle_collide(p2, p);

        return;

        p.mouseReleased = () => {
            alert(
                `Mouse${p.mouseX}, ${p.mouseY}, ${Math.abs(p.mouseX - b.pos.x)}, ${Math.abs(p.mouseX - b.pos.x)}`,
            );
        };

        p.noFill();
        p.strokeWeight(1);
        p.circle(p.mouseX, p.mouseY, 80);

        const fDist = 40;
        const scaler = 0.05;
        for (const pr of mesh.points) {
            const mouse = new Vec2(p.mouseX, p.mouseY);
            const dir = mouse.sub(pr.pos);
            if (dir.mag() <= fDist) {
                pr.vel.mult_scaler(-1);
            }
            if (dir.mag() <= fDist) {
                dir.mult_scaler(scaler);
                pr.addForce(-dir.x, -dir.y);
            }
        }

        for (const pr of mesh.points) {
            pr.addForce(0, 0.1);
            pr.update(dt);
        }

        for (const sp of mesh.springs) {
            sp.update();
        }

        for (let i = 0; i < mesh.points.length; i++) {
            mesh.points[i].show(p);
            mesh.springs[i].show(p);
        }
    };
};

new p5(sketch);
