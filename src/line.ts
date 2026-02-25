import p5 from "p5";
import { Vec2 } from "./utils";
import { Particle } from "./particle";

export class Line {
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
